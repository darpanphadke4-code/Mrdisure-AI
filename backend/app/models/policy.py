# backend/app/models/policy.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Policy(Base):
    __tablename__ = "policies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(64), default="application/pdf", nullable=False)
    file_size = Column(Integer, nullable=False)
    processing_status = Column(String(32), default="UPLOADED", nullable=False, index=True)  # UPLOADED, PROCESSING, COMPLETED, FAILED
    processing_error = Column(Text, nullable=True)
    total_pages = Column(Integer, default=0, nullable=False)
    extraction_method = Column(String(32), default="TEXT", nullable=False)  # TEXT, OCR, MIXED
    
    # Metadata extracted or identified
    provider_name = Column(String(180), nullable=True)
    policy_name = Column(String(255), nullable=True)
    policy_number = Column(String(120), nullable=True)
    policy_type = Column(String(120), nullable=True)
    
    # Structured cache for page texts and viewer integration
    pages_data = Column(JSON, nullable=True)
    
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    processed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="policies")
    clauses = relationship("PolicyClause", back_populates="policy", cascade="all, delete-orphan", order_by="PolicyClause.page_number")
    terms = relationship("PolicyTerm", back_populates="policy", cascade="all, delete-orphan")
    chunks = relationship("PolicyChunk", back_populates="policy", cascade="all, delete-orphan", order_by="PolicyChunk.chunk_index")
    chat_sessions = relationship("ChatSession", back_populates="policy", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="policy")

