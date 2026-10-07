# backend/tests/test_extraction.py
import os
import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine
from app.services.pdf_service import pdf_service
from app.services.text_cleaner import text_cleaner
from app.services.section_parser import section_parser
from app.services.policy_extractor import policy_extractor

client = TestClient(app)

DEMO_DIR = os.path.join(os.path.dirname(__file__), "..", "demo_policies")
DIGITAL_PDF = os.path.join(DEMO_DIR, "MediSure_Demo_Health_Policy.pdf")
SCANNED_PDF = os.path.join(DEMO_DIR, "MediSure_Scanned_Demo_Policy.pdf")
MISSING_PDF = os.path.join(DEMO_DIR, "MediSure_Missing_Fields_Policy.pdf")

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ocr_available" in data

def test_digital_pdf_extraction():
    """Test 1: Digital PDF with selectable text extracts all pages with extraction_method = TEXT"""
    assert os.path.exists(DIGITAL_PDF), "Digital demo PDF must exist"
    
    extracted = pdf_service.extract_document(DIGITAL_PDF)
    assert extracted["total_pages"] == 4
    assert extracted["extraction_method"] == "TEXT"
    assert len(extracted["pages"]) == 4

    # Text cleaning
    cleaned_pages = text_cleaner.clean_document_pages(extracted["pages"])
    assert len(cleaned_pages) == 4
    assert len(cleaned_pages[0]["cleaned_text"]) > 100

    # Section & clause detection
    clauses = section_parser.parse_clauses_from_pages(cleaned_pages)
    assert len(clauses) >= 4
    for c in clauses:
        assert "page_number" in c
        assert c["page_number"] in [1, 2, 3, 4]
        assert "section_title" in c

    # Structured term extraction
    profile = policy_extractor.extract_structured_terms(cleaned_pages, clauses)
    terms = {t["field_name"]: t for t in profile["terms"]}

    # Verify known values
    assert terms["sum_insured"]["status"] == "FOUND"
    assert "10,00,000" in terms["sum_insured"]["extracted_value"]
    assert terms["sum_insured"]["source_page"] in [1, 2]

    assert terms["deductible"]["status"] == "FOUND"
    assert "20,000" in terms["deductible"]["extracted_value"]

    assert terms["co_payment"]["status"] == "FOUND"
    assert "10%" in terms["co_payment"]["extracted_value"]

    assert terms["room_rent_limit"]["status"] == "FOUND"
    assert "5,000" in terms["room_rent_limit"]["extracted_value"] or "1%" in terms["room_rent_limit"]["extracted_value"]

def test_scanned_pdf_detection():
    """Test 2: Scanned PDF detection accurately flags pages with zero/low selectable text"""
    assert os.path.exists(SCANNED_PDF), "Scanned demo PDF must exist"
    
    extracted = pdf_service.extract_document(SCANNED_PDF)
    assert extracted["total_pages"] == 4
    # All pages should be detected as scanned
    assert all(p["is_scanned"] for p in extracted["pages"])

def test_missing_fields_policy():
    """Test 6: Policy with missing fields returns NOT_FOUND / null without inventing values"""
    assert os.path.exists(MISSING_PDF), "Missing fields demo PDF must exist"
    
    extracted = pdf_service.extract_document(MISSING_PDF)
    cleaned_pages = text_cleaner.clean_document_pages(extracted["pages"])
    clauses = section_parser.parse_clauses_from_pages(cleaned_pages)
    profile = policy_extractor.extract_structured_terms(cleaned_pages, clauses)
    terms = {t["field_name"]: t for t in profile["terms"]}

    # Deductible was intentionally omitted in MISSING_PDF
    assert terms["deductible"]["status"] == "NOT_FOUND"
    assert terms["deductible"]["extracted_value"] is None

    # Co-Payment was intentionally omitted
    assert terms["co_payment"]["status"] == "NOT_FOUND"
    assert terms["co_payment"]["extracted_value"] is None

def test_api_upload_flow():
    """Test 4 & 5 & Integration: Complete upload, analysis retrieval, and manual correction"""
    with open(DIGITAL_PDF, "rb") as f:
        response = client.post(
            "/api/policies/upload",
            files={"file": ("MediSure_Test.pdf", f, "application/pdf")},
            data={"custom_name": "MediSure Live Integration Test"}
        )

    assert response.status_code == 201
    resp_data = response.json()
    assert resp_data["success"] is True
    policy_id = resp_data["data"]["id"]

    # Poll Status
    status_resp = client.get(f"/api/policies/{policy_id}/status")
    assert status_resp.status_code == 200
    assert status_resp.json()["data"]["status"] == "COMPLETED"

    # Get Analysis
    analysis_resp = client.get(f"/api/policies/{policy_id}/analysis")
    assert analysis_resp.status_code == 200
    analysis = analysis_resp.json()["data"]
    assert "overview" in analysis
    assert "limitsAndConditions" in analysis
    assert len(analysis["limitsAndConditions"]) > 0

    # Get Clauses
    clauses_resp = client.get(f"/api/policies/{policy_id}/clauses")
    assert clauses_resp.status_code == 200
    clauses = clauses_resp.json()["data"]
    assert len(clauses) > 0
    assert clauses[0]["page_number"] >= 1

    # Manual Correction Test (Section 14)
    term_to_edit = analysis["limitsAndConditions"][0]
    term_id = term_to_edit["term_id"]
    original_val = term_to_edit["value"]

    patch_resp = client.patch(
        f"/api/policies/{policy_id}/terms/{term_id}",
        json={"current_value": "₹12,00,000 (Adjusted by User)"}
    )
    assert patch_resp.status_code == 200
    patched_term = patch_resp.json()["data"]
    assert patched_term["current_value"] == "₹12,00,000 (Adjusted by User)"
    assert patched_term["is_manually_verified"] is True
    assert patched_term["extracted_value"] is not None  # Preserves original!

    # Delete Test
    del_resp = client.delete(f"/api/policies/{policy_id}")
    assert del_resp.status_code == 200

def test_invalid_file_upload_rejected():
    """Test 4: Invalid file (non-PDF) returns HTTP 400 with helpful message"""
    fake_file = io.BytesIO(b"This is not a PDF file.")
    response = client.post(
        "/api/policies/upload",
        files={"file": ("test.txt", fake_file, "text/plain")}
    )
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]
