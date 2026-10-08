# backend/app/schemas/report.py
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class ReportCreate(BaseModel):
    title: Optional[str] = Field(None, description="Report display title / name")
    reportName: Optional[str] = Field(None, description="Alternative title key from frontend")
    policy_id: Optional[str] = Field(None, description="Associated policy ID")
    policyId: Optional[str] = Field(None, description="Alternative policyId key from frontend")
    report_type: Optional[str] = Field("claim_estimate", description="Category of report")
    content: Optional[Dict[str, Any]] = Field(None, description="Structured report content dictionary")
    
    # Catch any additional dynamic fields sent from frontend
    model_config = {
        "extra": "allow"
    }

class ReportResponseData(BaseModel):
    id: str
    user_id: str
    policy_id: Optional[str] = None
    title: str
    report_type: str
    created_at: datetime
    updated_at: datetime
    content: Dict[str, Any]
