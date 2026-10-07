# backend/app/schemas/chat.py
from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict

class CitationItem(BaseModel):
    page: int
    section: str
    clause_id: Optional[str] = None
    chunk_id: Optional[str] = None
    similarity: Optional[float] = None

class ChatRequest(BaseModel):
    policy_id: str = Field(..., description="Target policy ID for query isolation")
    question: str = Field(..., min_length=1, max_length=2000, description="User question about the policy")
    session_id: Optional[str] = Field(None, description="Existing session ID or None for new session")

class ChatResponseData(BaseModel):
    session_id: str
    policy_id: str
    answer: str
    citations: List[CitationItem] = []
    context_found: bool = True

class ChatMessageDTO(BaseModel):
    id: str
    session_id: str
    role: str  # "user" | "assistant"
    content: str
    citations: List[CitationItem] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatSessionDTO(BaseModel):
    id: str
    user_id: str
    policy_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageDTO] = []

    model_config = ConfigDict(from_attributes=True)

class IndexStatusDTO(BaseModel):
    policy_id: str
    indexed: bool
    chunk_count: int
    status: str  # NOT_INDEXED, INDEXING, INDEXED, FAILED
    error: Optional[str] = None
    message: Optional[str] = None

class AIHealthDTO(BaseModel):
    ollama_available: bool
    llm_model: str
    embedding_model: str
    base_url: str
