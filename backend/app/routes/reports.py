# backend/app/routes/reports.py
import uuid
import logging
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.policy import Policy
from app.models.report import Report
from app.routes.policies import get_current_user
from app.schemas.policy import StandardResponse
from app.schemas.report import ReportCreate

logger = logging.getLogger("medisure.reports")

router = APIRouter(prefix="/api/reports", tags=["reports"])

def format_report_dict(report: Report) -> Dict[str, Any]:
    """
    Format Report entity into the structure expected by frontend components.
    Merges custom content attributes while ensuring top-level metadata matches.
    """
    data = dict(report.content) if isinstance(report.content, dict) else {}
    data["id"] = report.id
    data["user_id"] = report.user_id
    data["policyId"] = report.policy_id
    data["policy_id"] = report.policy_id
    data["reportName"] = report.title
    data["report_type"] = report.report_type
    
    # Ensure date fields are formatted nicely
    if "dateCreated" not in data or not data["dateCreated"]:
        data["dateCreated"] = report.created_at.strftime("%Y-%m-%d")
    data["createdAt"] = report.created_at.isoformat()
    data["updatedAt"] = report.updated_at.isoformat()
    return data

@router.post("", response_model=StandardResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Persistently save a generated policy analysis or claim simulation report.
    Scopes report ownership to the authenticated user.
    """
    title = payload.title or payload.reportName or "Medical Insurance Analysis Report"
    policy_id = payload.policy_id or payload.policyId
    report_type = payload.report_type or "claim_estimate"

    # Validate policy if provided
    valid_policy_id = None
    if policy_id:
        policy = db.query(Policy).filter(
            Policy.id == policy_id,
            Policy.user_id == current_user.id
        ).first()
        if policy:
            valid_policy_id = policy.id
        else:
            # Check if policy exists at all for current user
            logger.info(f"Policy '{policy_id}' not found for user {current_user.id}; storing with policy_id=None")

    # Assemble content payload
    raw_dict = payload.model_dump()
    if payload.content and isinstance(payload.content, dict):
        content = dict(payload.content)
    else:
        content = {k: v for k, v in raw_dict.items() if v is not None and k not in ("content", "title", "report_type")}

    report_id = str(uuid.uuid4())
    content["id"] = report_id
    content["reportName"] = title
    content["policyId"] = valid_policy_id

    report = Report(
        id=report_id,
        user_id=current_user.id,
        policy_id=valid_policy_id,
        title=title,
        report_type=report_type,
        content=content
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    logger.info(f"Report '{report.id}' ('{report.title}') saved for user {current_user.id}")

    return StandardResponse(
        success=True,
        data=format_report_dict(report),
        message="Report saved successfully"
    )

@router.get("", response_model=StandardResponse)
def list_reports(
    policy_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all persistent reports belonging to the authenticated user.
    """
    query = db.query(Report).filter(Report.user_id == current_user.id)
    if policy_id:
        query = query.filter(Report.policy_id == policy_id)

    reports = query.order_by(Report.created_at.desc()).all()
    formatted = [format_report_dict(r) for r in reports]

    return StandardResponse(
        success=True,
        data=formatted,
        message=f"Retrieved {len(formatted)} reports"
    )

@router.get("/{report_id}", response_model=StandardResponse)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve single report by ID for the authenticated user.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found."
        )

    if report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this report."
        )

    return StandardResponse(
        success=True,
        data=format_report_dict(report),
        message="Report retrieved successfully"
    )

@router.delete("/{report_id}", response_model=StandardResponse)
def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permanently delete a report.
    Enforces user authorization. Does not affect associated policy or documents.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found."
        )

    if report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this report."
        )

    db.delete(report)
    db.commit()

    logger.info(f"Report '{report_id}' deleted by user {current_user.id}")

    return StandardResponse(
        success=True,
        data={"report_id": report_id},
        message="Report deleted successfully"
    )
