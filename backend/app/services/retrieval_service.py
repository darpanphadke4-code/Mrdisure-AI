# backend/app/services/retrieval_service.py
import re
import logging
from typing import List, Dict, Any, Optional
from app.config import settings
from app.database import SessionLocal
from app.models.policy_chunk import PolicyChunk
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store_service

logger = logging.getLogger("medisure.retrieval")

STOP_WORDS = {
    "what", "is", "the", "under", "this", "policy", "does", "it", "for",
    "of", "my", "how", "much", "remains", "are", "says", "a", "an", "in",
    "to", "and", "or", "tell", "me", "about", "can", "you", "explain"
}

KEY_PHRASES = [
    "room rent", "pre-existing", "sum insured", "waiting period",
    "modern treatment", "day care", "cataract", "organ transplant",
    "ayush", "co-pay", "deductible", "icu"
]

class RetrievalService:
    """
    Coordinates question embedding, policy-scoped hybrid vector/lexical search,
    and relevance threshold filtering. Enforces strict policy isolation.
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

        # 2. Query ChromaDB with strict policy_id filter (candidate pool)
        candidate_pool_size = max(25, k * 3)
        vector_candidates = vector_store_service.query_similar_chunks(
            policy_id=policy_id,
            query_embedding=query_embedding,
            top_k=candidate_pool_size
        )

        # 3. Extract keywords, phrases, and domain concepts from question
        lower_q = question.lower()
        words = re.findall(r'\b[a-zA-Z]{3,}\b', lower_q)
        key_terms = [w for w in words if w not in STOP_WORDS]
        detected_phrases = [p for p in KEY_PHRASES if p in lower_q]

        concept_terms = []
        if any(w in lower_q for w in ["cover", "benefit", "says", "provide"]):
            concept_terms.extend(["benefit", "coverage", "covered", "hospitalization", "in-patient"])
        if any(w in lower_q for w in ["surgery", "surgical", "operation", "procedure"]):
            concept_terms.extend(["surgery", "surgical", "surgeon", "procedure", "operation", "operating theatre", "modern treatment"])
        if any(w in lower_q for w in ["exclu", "not cover", "not payable"]):
            concept_terms.extend(["exclusion", "excluded", "not payable", "not admissible"])
        if any(w in lower_q for w in ["remain", "balance", "left", "exhaust"]):
            concept_terms.extend(["sum insured", "reinstatement", "exhaust"])

        # 4. Integrate lexical matches from SQL database
        candidate_dict: Dict[str, Dict[str, Any]] = {c["chunk_id"]: c for c in vector_candidates}
        search_terms = detected_phrases + key_terms[:3]
        if search_terms:
            try:
                db = SessionLocal()
                try:
                    for term in search_terms:
                        sql_chunks = db.query(PolicyChunk).filter(
                            PolicyChunk.policy_id == policy_id,
                            PolicyChunk.content.ilike(f"%{term}%")
                        ).limit(5).all()

                        for sc in sql_chunks:
                            if sc.id not in candidate_dict:
                                candidate_dict[sc.id] = {
                                    "chunk_id": sc.id,
                                    "policy_id": sc.policy_id,
                                    "clause_id": sc.clause_id,
                                    "page_number": sc.page_number,
                                    "section_title": sc.section_title,
                                    "chunk_index": sc.chunk_index,
                                    "content": sc.content,
                                    "distance": 0.40,
                                    "similarity": 0.60,
                                    "has_sql_kw": True
                                }
                            else:
                                candidate_dict[sc.id]["has_sql_kw"] = True
                finally:
                    db.close()
            except Exception as e:
                logger.warning(f"SQL lexical chunk retrieval fallback: {e}")

        # 5. Hybrid scoring and reranking
        scored = []
        for chunk in candidate_dict.values():
            sim = chunk.get("similarity", 0.0)
            content_lower = chunk.get("content", "").lower()
            sec_lower = chunk.get("section_title", "").lower()

            boost = 0.0
            if chunk.get("has_sql_kw"):
                boost += 0.10

            for phrase in detected_phrases:
                if phrase in content_lower:
                    boost += 0.20
                elif phrase in sec_lower:
                    boost += 0.10

            for term in key_terms:
                if term in content_lower:
                    boost += 0.08
                if term in sec_lower:
                    boost += 0.08

            for term in concept_terms:
                if term in content_lower:
                    boost += 0.05
                if term in sec_lower:
                    boost += 0.05

            final_score = sim + boost

            # Keep if meets minimum relevance threshold or has strong keyword match
            if sim >= threshold or boost >= 0.15:
                scored.append((final_score, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)

        # Apply diversity filter: max 2 chunks per page to avoid context domination by a single page
        diverse_chunks = []
        page_counts = {}
        deferred = []
        for _, chunk in scored:
            p = chunk.get("page_number")
            if page_counts.get(p, 0) < 2:
                page_counts[p] = page_counts.get(p, 0) + 1
                diverse_chunks.append(chunk)
            else:
                deferred.append(chunk)
            if len(diverse_chunks) >= k:
                break

        # If we have fewer than k diverse chunks, backfill from deferred candidates
        if len(diverse_chunks) < k:
            for chunk in deferred:
                diverse_chunks.append(chunk)
                if len(diverse_chunks) >= k:
                    break

        top_chunks = diverse_chunks

        logger.info(
            f"Retrieved {len(top_chunks)}/{len(candidate_dict)} hybrid chunks "
            f"for policy {policy_id} (threshold={threshold})"
        )

        return top_chunks

retrieval_service = RetrievalService()
