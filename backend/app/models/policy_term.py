# backend/app/models/policy_term.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class PolicyTerm(Base):
    __tablename__ = "policy_terms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    policy_id = Column(String(36), ForeignKey("policies.id", ondelete="CASCADE"), nullable=False, index=True)
    field_name = Column(String(64), nullable=False, index=True)
    field_label = Column(String(128), nullable=False)
    category = Column(String(64), default="General", nullable=False)  # Financial, Coverage, Restrictions, Exclusions, General
    
    extracted_value = Column(Text, nullable=True)
    current_value = Column(Text, nullable=True)  # After user verification / correction
    
    status = Column(String(32), default="NOT_FOUND", nullable=False)  # FOUND, NOT_FOUND, AMBIGUOUS
    confidence_score = Column(Float, default=0.0, nullable=False)
    
    source_page = Column(Integer, nullable=True)
    source_clause_id = Column(String(36), nullable=True)
    snippet = Column(Text, nullable=True)
    
    is_manually_verified = Column(Boolean, default=False, nullable=False)
    verified_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    policy = relationship("Policy", back_populates="terms")
