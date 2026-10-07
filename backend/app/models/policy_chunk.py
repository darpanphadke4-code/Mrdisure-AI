# backend/app/models/policy_chunk.py
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class PolicyChunk(Base):
    __tablename__ = "policy_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    policy_id = Column(String(36), ForeignKey("policies.id", ondelete="CASCADE"), nullable=False, index=True)
    clause_id = Column(String(36), ForeignKey("policy_clauses.id", ondelete="SET NULL"), nullable=True, index=True)
    page_number = Column(Integer, nullable=False, index=True)
    section_title = Column(String(255), nullable=False)
    chunk_index = Column(Integer, nullable=False, default=0)
    content = Column(Text, nullable=False)
    content_hash = Column(String(64), nullable=False, index=True)
    embedding_id = Column(String(128), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    policy = relationship("Policy", back_populates="chunks")
    clause = relationship("PolicyClause")
