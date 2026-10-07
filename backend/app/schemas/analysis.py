# backend/app/schemas/analysis.py
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.schemas.policy import PolicySummary, PolicyTermDTO, PolicyClauseDTO

class CoverageItem(BaseModel):
    category: str
    limit: str
    status: str
    notes: Optional[str] = None
    source_page: Optional[int] = None
    is_verified: bool = False

class ExclusionItem(BaseModel):
    title: str
    type: str  # Permanent Exclusion, Waiting Period, Standard Exclusion
    details: str
    clauseRef: Optional[str] = None
    source_page: Optional[int] = None

class LimitConditionItem(BaseModel):
    term_id: Optional[str] = None
    name: str
    value: str
    extracted_value: Optional[str] = None
    description: str
    verified: bool
    status: str
    confidence_score: float
    source_page: Optional[int] = None

class KeyClauseItem(BaseModel):
    id: str
    title: str
    pageNumber: int
    snippet: str
    importance: str
    explanation: str

class DocumentViewerSection(BaseModel):
    id: str
    title: str
    content: str
    clauses: List[str] = []

class DocumentViewerPage(BaseModel):
    pageNumber: int
    title: str
    extraction_method: str = "TEXT"
    sections: List[DocumentViewerSection] = []

class DocumentExcerpt(BaseModel):
    totalPages: int
    pages: List[DocumentViewerPage] = []

class PolicyAnalysisResponse(BaseModel):
    policy: PolicySummary
    overview: Dict[str, Any]
    coverageDetails: List[CoverageItem]
    exclusions: List[ExclusionItem]
    limitsAndConditions: List[LimitConditionItem]
    keyClauses: List[KeyClauseItem]
    documentExcerpt: DocumentExcerpt
    terms: List[PolicyTermDTO]
    raw_clauses: List[PolicyClauseDTO]
