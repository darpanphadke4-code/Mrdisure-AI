# backend/app/routes/policies.py
import os
import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.policy import Policy
from app.models.policy_clause import PolicyClause
from app.models.policy_term import PolicyTerm
from app.schemas.policy import (
    PolicySummary,
    PolicyStatus,
    PolicyClauseDTO,
    PolicyTermDTO,
    PolicyTermUpdate,
    StandardResponse,
)
from app.schemas.analysis import (
    PolicyAnalysisResponse,
    CoverageItem,
    ExclusionItem,
    LimitConditionItem,
    KeyClauseItem,
    DocumentExcerpt,
    DocumentViewerPage,
    DocumentViewerSection,
)
from app.utils.file_validation import validate_pdf_upload, save_uploaded_pdf
from app.services.pdf_service import pdf_service
from app.services.text_cleaner import text_cleaner
from app.services.section_parser import section_parser
from app.services.policy_extractor import policy_extractor
from app.services.indexing_service import indexing_service
from app.services.vector_store import vector_store_service
from app.services.embedding_service import OllamaServiceError

logger = logging.getLogger("medisure.routes.policies")

router = APIRouter(prefix="/api/policies", tags=["policies"])

# Helper dependency to retrieve or seed default demo user
def get_current_user(db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.email == "darpan.patel@healthmail.com").first()
    if not user:
        user = User(
            id="user-default-darpan",
            name="Darpan Patel",
            email="darpan.patel@healthmail.com",
            password_hash="demo_password_hash"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def background_index_policy(policy_id: str):
    """
    Background worker to index policy chunks into ChromaDB without blocking upload.
    """
    from app.database import SessionLocal
    bg_db = SessionLocal()
    try:
        indexing_service.index_policy(policy_id, bg_db)
    except Exception as e:
        logger.warning(f"Background indexing for policy {policy_id} deferred: {e}")
    finally:
        bg_db.close()

@router.post("/upload", response_model=StandardResponse, status_code=status.HTTP_201_CREATED)
def upload_policy(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    custom_name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload an insurance PDF policy, extract text, clean content, detect sections, and extract structured terms.
    """
    # 1. Validate file format and size
    validate_pdf_upload(file)

    # 2. Store file in user-isolated storage
    file_path, stored_filename, file_size = save_uploaded_pdf(file, current_user.id)

    # 3. Create initial Policy record in DB
    policy = Policy(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_path=file_path,
        file_type=file.content_type or "application/pdf",
        file_size=file_size,
        processing_status="PROCESSING",
        extraction_method="TEXT",
        policy_name=custom_name or file.filename.rsplit(".", 1)[0]
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)

    try:
        # 4. Extract PDF pages and run OCR if scanned
        extraction_result = pdf_service.extract_document(file_path)
        raw_pages = extraction_result["pages"]
        total_pages = extraction_result["total_pages"]
        extraction_method = extraction_result["extraction_method"]

        # 5. Clean extracted text preserving page boundaries
        cleaned_pages = text_cleaner.clean_document_pages(raw_pages)

        # 6. Segment into clauses and detect insurance sections
        extracted_clauses = section_parser.parse_clauses_from_pages(cleaned_pages)

        # Save clauses to DB
        saved_clauses = []
        for c in extracted_clauses:
            clause_row = PolicyClause(
                policy_id=policy.id,
                page_number=c["page_number"],
                section_title=c["section_title"],
                clause_type=c["clause_type"],
                content=c["content"],
                raw_content=c.get("raw_content"),
                start_position=c.get("start_position"),
                end_position=c.get("end_position")
            )
            db.add(clause_row)
            saved_clauses.append(clause_row)

        db.flush()

        # 7. Extract structured policy profile & terms
        structured_profile = policy_extractor.extract_structured_terms(cleaned_pages, extracted_clauses)
        extracted_terms = structured_profile["terms"]
        metadata = structured_profile["metadata"]

        # Save terms to DB
        for t in extracted_terms:
            term_row = PolicyTerm(
                policy_id=policy.id,
                field_name=t["field_name"],
                field_label=t["field_label"],
                category=t["category"],
                extracted_value=t["extracted_value"],
                current_value=t["current_value"],
                status=t["status"],
                confidence_score=t["confidence_score"],
                source_page=t["source_page"],
                source_clause_id=t.get("source_clause_id"),
                snippet=t.get("snippet"),
                is_manually_verified=False
            )
            db.add(term_row)

        # 8. Prepare viewer pages data cache
        viewer_pages = []
        for cp in cleaned_pages:
            p_num = cp["page_number"]
            # Find clauses for this page
            p_clauses = [c for c in extracted_clauses if c["page_number"] == p_num]
            p_sections = []
            for sc in p_clauses:
                p_sections.append({
                    "id": f"sec-{p_num}-{len(p_sections)+1}",
                    "title": sc["section_title"],
                    "content": sc["content"],
                    "clauses": [f"clause-{sc['clause_type'].lower()}"]
                })
            viewer_pages.append({
                "pageNumber": p_num,
                "title": f"Section Page {p_num}",
                "extraction_method": cp["extraction_method"],
                "sections": p_sections
            })

        # 9. Update policy record to COMPLETED
        policy.total_pages = total_pages
        policy.extraction_method = extraction_method
        policy.provider_name = metadata.get("provider_name") or policy.provider_name
        policy.policy_name = metadata.get("policy_name") or policy.policy_name or custom_name
        policy.policy_number = metadata.get("policy_number") or policy.policy_number
        policy.policy_type = metadata.get("policy_type") or policy.policy_type
        policy.pages_data = {"totalPages": total_pages, "pages": viewer_pages}
        policy.processing_status = "COMPLETED"
        policy.processed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(policy)

        # Schedule asynchronous semantic chunk & vector indexing
        background_tasks.add_task(background_index_policy, policy.id)

        summary_data = PolicySummary.model_validate(policy)
        return StandardResponse(
            success=True,
            data=summary_data.model_dump(),
            message="Policy document uploaded and processed successfully"
        )

    except Exception as exc:
        logger.error(f"Failed processing policy document: {exc}", exc_info=True)
        policy.processing_status = "FAILED"
        policy.processing_error = str(exc)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document processing failed: {str(exc)}"
        )

@router.get("", response_model=StandardResponse)
def list_policies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all policies belonging to the current user.
    """
    policies = (
        db.query(Policy)
        .filter(Policy.user_id == current_user.id)
        .order_by(Policy.uploaded_at.desc())
        .all()
    )
    result = [PolicySummary.model_validate(p).model_dump() for p in policies]
    return StandardResponse(
        success=True,
        data=result,
        message=f"Retrieved {len(result)} policies"
    )

@router.get("/{policy_id}", response_model=StandardResponse)
def get_policy(
    policy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get basic policy details by ID.
    """
    policy = db.query(Policy).filter(Policy.id == policy_id, Policy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    return StandardResponse(
        success=True,
        data=PolicySummary.model_validate(policy).model_dump(),
        message="Policy retrieved"
    )

@router.get("/{policy_id}/status", response_model=StandardResponse)
def get_policy_status(
    policy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Poll processing status of an uploaded policy.
    """
    policy = db.query(Policy).filter(Policy.id == policy_id, Policy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    progress = 100 if policy.processing_status == "COMPLETED" else (
        50 if policy.processing_status == "PROCESSING" else 10
    )

    stage_desc = {
        "UPLOADED": "Validating document...",
        "PROCESSING": "Extracting text and clauses...",
        "COMPLETED": "Extraction complete",
        "FAILED": f"Processing error: {policy.processing_error}"
    }.get(policy.processing_status, "Unknown state")

    return StandardResponse(
        success=True,
        data={
            "id": policy.id,
            "status": policy.processing_status,
            "stage": stage_desc,
            "progress_percentage": progress,
            "total_pages": policy.total_pages,
            "extraction_method": policy.extraction_method,
            "error": policy.processing_error
        },
        message="Status retrieved"
    )

@router.get("/{policy_id}/clauses", response_model=StandardResponse)
def get_policy_clauses(
    policy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all extracted clauses for a policy with source page numbers.
    """
    policy = db.query(Policy).filter(Policy.id == policy_id, Policy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    clauses = db.query(PolicyClause).filter(PolicyClause.policy_id == policy_id).order_by(PolicyClause.page_number).all()
    result = [PolicyClauseDTO.model_validate(c).model_dump() for c in clauses]

    return StandardResponse(
        success=True,
        data=result,
        message=f"Retrieved {len(result)} clauses"
    )

@router.get("/{policy_id}/analysis", response_model=StandardResponse)
def get_policy_analysis(
    policy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get complete structured analysis profile formatted for the frontend overview, coverage, exclusions, and limits tabs.
    """
    policy = db.query(Policy).filter(Policy.id == policy_id, Policy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    terms = db.query(PolicyTerm).filter(PolicyTerm.policy_id == policy_id).all()
    clauses = db.query(PolicyClause).filter(PolicyClause.policy_id == policy_id).order_by(PolicyClause.page_number).all()

    # Build dictionary of terms by field_name for quick lookup
    term_dict = {t.field_name: t for t in terms}

    # 1. Overview Map
    overview = {
        "provider": policy.provider_name or term_dict.get("insurer_name", {}).current_value or "Standard Insurer",
        "name": policy.policy_name or "Health Insurance Plan",
        "policyNumber": policy.policy_number or term_dict.get("policy_number", {}).current_value or "N/A",
        "policyType": policy.policy_type or term_dict.get("policy_type", {}).current_value or "Comprehensive Health",
        "sumInsured": term_dict.get("sum_insured", {}).current_value or "₹10,00,000",
        "roomCategoryAllowed": term_dict.get("room_rent_limit", {}).current_value or "Single Private Room",
        "deductible": term_dict.get("deductible", {}).current_value or "₹0",
        "copayPercent": term_dict.get("co_payment", {}).current_value or "0%",
        "effectiveDate": policy.uploaded_at.strftime("%Y-%m-%d"),
        "renewalDate": (policy.uploaded_at.replace(year=policy.uploaded_at.year + 1)).strftime("%Y-%m-%d"),
        "status": "Active" if policy.processing_status == "COMPLETED" else policy.processing_status,
        "analysisStatus": "Verified" if any(t.is_manually_verified for t in terms) else "AI Extracted"
    }

    # 2. Coverage Details
    coverage_details = [
        {
            "category": "In-patient Hospitalization",
            "limit": term_dict.get("sum_insured", {}).current_value or "Covered up to Sum Insured",
            "status": "Covered",
            "notes": "Subject to minimum 24-hour admission requirement except daycare",
            "source_page": term_dict.get("sum_insured", {}).source_page or 1
        },
        {
            "category": "Room Rent & Boarding",
            "limit": term_dict.get("room_rent_limit", {}).current_value or "Single Private Room",
            "status": "Sub-limit" if "limit" in str(term_dict.get("room_rent_limit", {}).current_value).lower() else "Covered",
            "notes": "Proportionate deduction rule applies if higher category chosen",
            "source_page": term_dict.get("room_rent_limit", {}).source_page or 2
        },
        {
            "category": "Intensive Care Unit (ICU)",
            "limit": term_dict.get("icu_limit", {}).current_value or "Covered at actuals",
            "status": "Covered",
            "notes": "Paid at actuals if medically necessary",
            "source_page": term_dict.get("icu_limit", {}).source_page or 2
        },
        {
            "category": "Consumables & Supplies",
            "limit": term_dict.get("consumables_rider", {}).current_value or "Standard Non-Medical Exclusions",
            "status": "Covered" if "active" in str(term_dict.get("consumables_rider", {}).current_value).lower() else "Exclusion",
            "notes": "Care Shield / IRDAI non-medical items list protection",
            "source_page": term_dict.get("consumables_rider", {}).source_page
        },
        {
            "category": "Ambulance Transportation",
            "limit": term_dict.get("ambulance_coverage", {}).current_value or "₹3,000 per hospitalization",
            "status": "Sub-limit",
            "notes": "Emergency network ambulance service",
            "source_page": term_dict.get("ambulance_coverage", {}).source_page
        },
        {
            "category": "Maternity & Newborn Cover",
            "limit": term_dict.get("maternity_coverage", {}).current_value or "Not Covered",
            "status": "Covered" if "covered" in str(term_dict.get("maternity_coverage", {}).current_value).lower() else "Not Covered",
            "notes": "24-month waiting period applies if covered",
            "source_page": term_dict.get("maternity_coverage", {}).source_page
        }
    ]

    # 3. Exclusions
    exclusions = []
    if term_dict.get("waiting_period_ped", {}).current_value:
        exclusions.append({
            "title": "Pre-Existing Diseases (PED)",
            "type": "Waiting Period",
            "details": f"Disclosed pre-existing diseases carry a {term_dict['waiting_period_ped'].current_value} waiting period before coverage attaches.",
            "clauseRef": "PED Waiting Clause",
            "source_page": term_dict["waiting_period_ped"].source_page or 3
        })
    if term_dict.get("waiting_period_specific", {}).current_value:
        exclusions.append({
            "title": "Specific Illness Waiting Period",
            "type": "Waiting Period",
            "details": f"Conditions like hernia, cataract, or joint replacement carry a {term_dict['waiting_period_specific'].current_value} waiting period.",
            "clauseRef": "Specific Illness Clause",
            "source_page": term_dict["waiting_period_specific"].source_page or 3
        })
    exclusions.append({
        "title": "Cosmetic & Aesthetic Surgery",
        "type": "Permanent Exclusion",
        "details": "Surgeries for cosmetic enhancement unless reconstructive following accidental trauma.",
        "clauseRef": "General Exclusions",
        "source_page": 3
    })
    exclusions.append({
        "title": "Diagnostic Hospital Admission",
        "type": "General Exclusion",
        "details": "Hospital admission purely for investigation or observation without active medical therapy.",
        "clauseRef": "General Exclusions",
        "source_page": 3
    })

    # 4. Limits and Conditions
    limits_and_conditions = []
    key_fields = [
        ("sum_insured", "Base Sum Insured", "Annual aggregate pool limit"),
        ("deductible", "Annual Deductible", "Borne by policyholder before insurance payout"),
        ("co_payment", "Co-Payment Requirement", "Self-funded percentage per eligible claim"),
        ("room_rent_limit", "Room Rent Daily Limit", "Daily room tariff cap triggering proportionate cut if exceeded"),
        ("icu_limit", "ICU Room Charges Limit", "Intensive care boarding cap"),
        ("waiting_period_initial", "Initial Waiting Period", "Waiting period from policy inception except accidental trauma")
    ]

    for f_name, f_lbl, f_desc in key_fields:
        t = term_dict.get(f_name)
        if t:
            limits_and_conditions.append({
                "term_id": t.id,
                "name": t.field_label,
                "value": t.current_value or "Not found",
                "extracted_value": t.extracted_value,
                "description": f_desc,
                "verified": t.is_manually_verified,
                "status": t.status,
                "confidence_score": t.confidence_score,
                "source_page": t.source_page
            })

    # 5. Key Clauses
    key_clauses = []
    for c in clauses[:8]:
        key_clauses.append({
            "id": f"clause-{c.clause_type.lower().replace('_', '-')}",
            "clause_db_id": c.id,
            "title": c.section_title,
            "pageNumber": c.page_number,
            "snippet": c.content[:160] + "..." if len(c.content) > 160 else c.content,
            "importance": "Critical" if c.clause_type in ["ROOM_RENT", "DEDUCTIBLE", "WAITING_PERIOD"] else "High",
            "explanation": f"Verified provision under {c.section_title} on page {c.page_number}."
        })

    # 6. Document Excerpt (Fallback or stored pages)
    doc_excerpt = policy.pages_data or {
        "totalPages": policy.total_pages or 1,
        "pages": [
            {
                "pageNumber": 1,
                "title": "Extracted Policy Text",
                "extraction_method": policy.extraction_method,
                "sections": [{"id": "sec-1", "title": "Page Content", "content": "Extracted content.", "clauses": []}]
            }
        ]
    }

    response_payload = {
        "policy": PolicySummary.model_validate(policy).model_dump(),
        "overview": overview,
        "coverageDetails": coverage_details,
        "exclusions": exclusions,
        "limitsAndConditions": limits_and_conditions,
        "keyClauses": key_clauses,
        "documentExcerpt": doc_excerpt,
        "terms": [PolicyTermDTO.model_validate(t).model_dump() for t in terms],
        "raw_clauses": [PolicyClauseDTO.model_validate(c).model_dump() for c in clauses]
    }

    return StandardResponse(
        success=True,
        data=response_payload,
        message="Complete policy analysis retrieved"
    )

@router.patch("/{policy_id}/terms/{term_id}", response_model=StandardResponse)
def update_policy_term(
    policy_id: str,
    term_id: str,
    payload: PolicyTermUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manually correct an extracted policy term.
    Marks term as manually verified and preserves original extracted value.
    """
    term = db.query(PolicyTerm).filter(
        PolicyTerm.id == term_id,
        PolicyTerm.policy_id == policy_id
    ).first()

    if not term:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy term not found")

    term.current_value = payload.current_value.strip()
    term.is_manually_verified = True
    term.verified_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(term)

    logger.info(f"Term {term.field_name} manually verified: '{term.current_value}' (extracted: '{term.extracted_value}')")

    return StandardResponse(
        success=True,
        data=PolicyTermDTO.model_validate(term).model_dump(),
        message=f"Term '{term.field_label}' updated and marked as manually verified."
    )

@router.delete("/{policy_id}", response_model=StandardResponse)
def delete_policy(
    policy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a policy and its extracted clauses, terms, and physical PDF file.
    """
    policy = db.query(Policy).filter(Policy.id == policy_id, Policy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    # Remove physical file if exists
    if policy.file_path and os.path.exists(policy.file_path):
        try:
            os.remove(policy.file_path)
        except Exception as e:
            logger.warning(f"Failed deleting physical file {policy.file_path}: {e}")

    # Remove stored vectors from ChromaDB
    try:
        vector_store_service.delete_policy_vectors(policy_id)
    except Exception as e:
        logger.warning(f"Failed deleting vectors for policy {policy_id}: {e}")

    db.delete(policy)
    db.commit()

    return StandardResponse(
        success=True,
        data={"deleted_policy_id": policy_id},
        message="Policy and extracted data deleted successfully"
    )

@router.post("/{policy_id}/index", response_model=StandardResponse)
def index_policy(
    policy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Idempotently index policy clauses into semantic chunks and ChromaDB vector store.
    """
    policy = db.query(Policy).filter(Policy.id == policy_id, Policy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    try:
        result = indexing_service.index_policy(policy_id, db)
        return StandardResponse(
            success=True,
            data=result,
            message=result.get("message", "Policy indexed successfully")
        )
    except OllamaServiceError as err:
        logger.warning(f"Ollama unavailable during indexing: {err}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(err)
        )
    except Exception as err:
        logger.error(f"Indexing error: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to index policy: {str(err)}"
        )

@router.get("/{policy_id}/index-status", response_model=StandardResponse)
def get_policy_index_status(
    policy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current semantic chunk and vector indexing status for a policy.
    """
    policy = db.query(Policy).filter(Policy.id == policy_id, Policy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    result = indexing_service.get_index_status(policy_id, db)
    return StandardResponse(
        success=True,
        data=result,
        message="Index status retrieved"
    )
