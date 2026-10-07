# backend/app/models/policy_clause.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class PolicyClause(Base):
    __tablename__ = "policy_clauses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    policy_id = Column(String(36), ForeignKey("policies.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False, index=True)
    section_title = Column(String(255), nullable=False)
    clause_type = Column(String(64), default="STANDARD", nullable=False)  # e.g., COVERAGE, EXCLUSION, WAITING_PERIOD, LIMIT, CONDITION
    content = Column(Text, nullable=False)
    raw_content = Column(Text, nullable=True)
    start_position = Column(Integer, nullable=True)
    end_position = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    policy = relationship("Policy", back_populates="clauses")
