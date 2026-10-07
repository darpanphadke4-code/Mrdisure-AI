# backend/app/services/retrieval_service.py
import logging
from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store_service

logger = logging.getLogger("medisure.retrieval")

class RetrievalService:
    """
    Coordinates question embedding, policy-scoped vector search,
    and relevance threshold filtering.
    """

    def __init__(self):
        self.default_top_k = settings.RAG_TOP_K
        self.min_relevance = settings.RAG_MIN_RELEVANCE

    def retrieve_relevant_chunks(
        self,
        policy_id: str,
        question: str,
        top_k: Optional[int] = None,
        min_relevance: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top relevant chunks for a specific policy.
        Enforces policy isolation and filters out low-relevance noise.
        """
        k = top_k or self.default_top_k
        threshold = min_relevance if min_relevance is not None else self.min_relevance

        # 1. Embed the search question
        query_embedding = embedding_service.embed_text(question)

        # 2. Query ChromaDB with strict policy_id filter
        candidate_chunks = vector_store_service.query_similar_chunks(
            policy_id=policy_id,
            query_embedding=query_embedding,
            top_k=k
        )

        # 3. Filter by minimum relevance threshold
        relevant_chunks = [
            chunk for chunk in candidate_chunks
            if chunk.get("similarity", 0.0) >= threshold
        ]

        logger.info(
            f"Retrieved {len(relevant_chunks)}/{len(candidate_chunks)} relevant chunks "
            f"for policy {policy_id} (threshold={threshold})"
        )

        return relevant_chunks

retrieval_service = RetrievalService()
