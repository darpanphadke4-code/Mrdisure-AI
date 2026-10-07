# backend/app/schemas/policy.py
from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field, ConfigDict

class PolicyBase(BaseModel):
    original_filename: str
    file_type: str
    file_size: int

class PolicySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    original_filename: str
    stored_filename: str
    provider_name: Optional[str] = None
    policy_name: Optional[str] = None
    policy_number: Optional[str] = None
    policy_type: Optional[str] = None
    file_size: int
    total_pages: int
    processing_status: str
    extraction_method: str
    uploaded_at: datetime
    processed_at: Optional[datetime] = None

class PolicyStatus(BaseModel):
    id: str
    status: str
    stage: str
    progress_percentage: int
    total_pages: int
    extraction_method: str
    error: Optional[str] = None

class PolicyClauseDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    policy_id: str
    page_number: int
    section_title: str
    clause_type: str
    content: str
    raw_content: Optional[str] = None
    start_position: Optional[int] = None
    end_position: Optional[int] = None
    created_at: datetime

class PolicyTermDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    policy_id: str
    field_name: str
    field_label: str
    category: str
    extracted_value: Optional[str] = None
    current_value: Optional[str] = None
    status: str  # FOUND, NOT_FOUND, AMBIGUOUS
    confidence_score: float
    source_page: Optional[int] = None
    source_clause_id: Optional[str] = None
    snippet: Optional[str] = None
    is_manually_verified: bool
    verified_at: Optional[datetime] = None

class PolicyTermUpdate(BaseModel):
    current_value: str = Field(..., description="Manually corrected value entered by user")
    notes: Optional[str] = None

class StandardResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: str = "Operation completed"
