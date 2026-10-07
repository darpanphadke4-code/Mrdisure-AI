# backend/app/services/rag_service.py
import os
import logging
from typing import Dict, Any, List, Optional
from app.services.retrieval_service import retrieval_service
from app.services.llm_service import llm_service
from app.config import settings

logger = logging.getLogger("medisure.rag")

PROMPT_TEMPLATE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "prompts",
    "policy_qa.txt"
)

DEFAULT_FALLBACK_ANSWER = "The available policy information does not establish the answer to your question."

class RAGService:
    """
    Orchestrates policy context retrieval, grounding validation,
    prompt construction, Qwen3 inference, and citation assembly.
    """

    def __init__(self):
        self._prompt_template = None

    @property
    def prompt_template(self) -> str:
        if self._prompt_template is None:
            if os.path.exists(PROMPT_TEMPLATE_PATH):
                with open(PROMPT_TEMPLATE_PATH, "r", encoding="utf-8") as f:
                    self._prompt_template = f.read()
            else:
                self._prompt_template = (
                    "You are MediSure AI, a medical insurance policy assistant.\n"
                    "Answer using ONLY the supplied policy context.\n\n"
                    "POLICY CONTEXT:\n{context}\n\n"
                    "USER QUESTION:\n{question}\n\n"
                    "HELPFUL GROUNDED ANSWER:"
                )
        return self._prompt_template

    def answer_question(
        self,
        policy_id: str,
        question: str,
        top_k: Optional[int] = None,
        min_relevance: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Executes grounded RAG pipeline for a given question and policy.
        """
        # 1. Retrieve policy-isolated relevant chunks
        chunks = retrieval_service.retrieve_relevant_chunks(
            policy_id=policy_id,
            question=question,
            top_k=top_k,
            min_relevance=min_relevance
        )

        # 2. Check if useful context exists
        if not chunks:
            logger.info(f"No relevant chunks found for policy {policy_id} on question: '{question}'")
            return {
                "answer": DEFAULT_FALLBACK_ANSWER,
                "citations": [],
                "retrieval_count": 0,
                "context_found": False
            }

        # 3. Construct context string
        context_parts = []
        for c in chunks:
            part = (
                f"[Source: Page {c.get('page_number')} - {c.get('section_title')}]\n"
                f"{c.get('content')}"
            )
            context_parts.append(part)
        
        full_context = "\n\n".join(context_parts)

        # 4. Construct prompt
        prompt = self.prompt_template.format(
            context=full_context,
            question=question.strip()
        )

        # 5. Call local Qwen3 model
        raw_answer = llm_service.generate(prompt=prompt)
        answer = raw_answer.strip() if raw_answer else DEFAULT_FALLBACK_ANSWER

        # 6. Assemble citations
        citations: List[Dict[str, Any]] = []
        seen = set()
        for c in chunks:
            citation_key = (c.get("page_number"), c.get("section_title"))
            if citation_key not in seen:
                seen.add(citation_key)
                citations.append({
                    "page": c.get("page_number"),
                    "section": c.get("section_title"),
                    "clause_id": c.get("clause_id"),
                    "chunk_id": c.get("chunk_id"),
                    "similarity": round(c.get("similarity", 0.0), 3)
                })

        return {
            "answer": answer,
            "citations": citations,
            "retrieval_count": len(chunks),
            "context_found": True
        }

rag_service = RAGService()
