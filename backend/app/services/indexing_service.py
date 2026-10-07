# backend/app/services/indexing_service.py
import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.policy import Policy
from app.models.policy_clause import PolicyClause
from app.models.policy_chunk import PolicyChunk
from app.services.chunking_service import chunking_service
from app.services.embedding_service import embedding_service, OllamaServiceError
from app.services.vector_store import vector_store_service

logger = logging.getLogger("medisure.indexing")

class IndexingService:
    """
    Handles chunk extraction, embedding generation, ChromaDB vector indexing,
    and SQL chunk metadata persistence with idempotency.
    """

    def index_policy(self, policy_id: str, db: Session) -> Dict[str, Any]:
        """
        Idempotently index a policy's clauses into semantic chunks and vector store.
        """
        policy = db.query(Policy).filter(Policy.id == policy_id).first()
        if not policy:
            raise ValueError(f"Policy '{policy_id}' not found")

        if policy.processing_status != "COMPLETED":
            return {
                "policy_id": policy_id,
                "status": "NOT_INDEXED",
                "indexed": False,
                "chunk_count": 0,
                "message": f"Policy processing status is '{policy.processing_status}'. Must be COMPLETED before indexing."
            }

        # 1. Fetch extracted clauses
        clauses = db.query(PolicyClause).filter(
            PolicyClause.policy_id == policy_id
        ).order_by(PolicyClause.page_number).all()

        if not clauses:
            return {
                "policy_id": policy_id,
                "status": "NOT_INDEXED",
                "indexed": False,
                "chunk_count": 0,
                "message": "No extracted policy clauses found to index."
            }

        # 2. Check Ollama availability before starting
        if not embedding_service.is_available():
            raise OllamaServiceError(
                "Local AI service is not running. Start Ollama and try again."
            )

        # 3. Create semantic chunks
        chunks = chunking_service.create_chunks_from_clauses(policy_id, clauses)
        if not chunks:
            return {
                "policy_id": policy_id,
                "status": "NOT_INDEXED",
                "indexed": False,
                "chunk_count": 0,
                "message": "Clause content was empty; 0 chunks generated."
            }

        # 4. Generate embeddings via Ollama
        chunk_texts = [c["content"] for c in chunks]
        embeddings = embedding_service.embed_texts(chunk_texts)

        # 5. Clear any prior vectors and prior SQL chunks to guarantee idempotency
        vector_store_service.delete_policy_vectors(policy_id)
        db.query(PolicyChunk).filter(PolicyChunk.policy_id == policy_id).delete()
        db.flush()

        # 6. Store vectors in ChromaDB
        metadatas = [
            {
                "clause_id": str(c["clause_id"] or ""),
                "page_number": c["page_number"],
                "section_title": c["section_title"],
                "chunk_index": c["chunk_index"],
                "chunk_id": c["id"],
            }
            for c in chunks
        ]
        chunk_ids = [c["id"] for c in chunks]

        vector_store_service.add_chunks(
            policy_id=policy_id,
            chunk_ids=chunk_ids,
            embeddings=embeddings,
            documents=chunk_texts,
            metadatas=metadatas
        )

        # 7. Store SQL metadata records
        for c in chunks:
            chunk_record = PolicyChunk(
                id=c["id"],
                policy_id=policy_id,
                clause_id=c["clause_id"],
                page_number=c["page_number"],
                section_title=c["section_title"],
                chunk_index=c["chunk_index"],
                content=c["content"],
                content_hash=c["content_hash"],
                embedding_id=c["id"]
            )
            db.add(chunk_record)

        db.commit()
        logger.info(f"Successfully indexed {len(chunks)} chunks for policy {policy_id}")

        return {
            "policy_id": policy_id,
            "status": "INDEXED",
            "indexed": True,
            "chunk_count": len(chunks),
            "message": f"Successfully indexed {len(chunks)} policy chunks."
        }

    def get_index_status(self, policy_id: str, db: Session) -> Dict[str, Any]:
        """
        Check current indexing status for a policy.
        """
        chunk_count = db.query(PolicyChunk).filter(PolicyChunk.policy_id == policy_id).count()
        vector_count = vector_store_service.count_policy_chunks(policy_id)

        is_indexed = chunk_count > 0 and vector_count > 0
        status_str = "INDEXED" if is_indexed else "NOT_INDEXED"

        return {
            "policy_id": policy_id,
            "indexed": is_indexed,
            "chunk_count": chunk_count,
            "vector_count": vector_count,
            "status": status_str
        }

indexing_service = IndexingService()
