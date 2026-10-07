# backend/app/services/chunking_service.py
import hashlib
import re
from typing import List, Dict, Any, Optional

class ChunkingService:
    """
    Converts extracted policy clauses into semantic chunks while preserving
    page numbers, section titles, clause IDs, and document taxonomy.
    """

    def __init__(self, max_chunk_chars: int = 750, chunk_overlap_chars: int = 120):
        self.max_chunk_chars = max_chunk_chars
        self.chunk_overlap_chars = chunk_overlap_chars

    def create_chunks_from_clauses(
        self,
        policy_id: str,
        clauses: List[Any]
    ) -> List[Dict[str, Any]]:
        """
        Convert a list of PolicyClause records into structured chunk dictionaries.
        """
        chunks: List[Dict[str, Any]] = []
        overall_index = 0

        for clause in clauses:
            clause_id = getattr(clause, "id", None)
            page_number = getattr(clause, "page_number", 1)
            section_title = getattr(clause, "section_title", "General Policy Terms")
            clause_type = getattr(clause, "clause_type", "STANDARD")
            raw_content = getattr(clause, "content", "") or ""

            content = raw_content.strip()
            if not content:
                continue

            # If clause is reasonably sized, keep it intact as a single semantic unit
            if len(content) <= self.max_chunk_chars:
                chunk_text = f"[{section_title} (Page {page_number})]: {content}"
                content_hash = hashlib.sha256(chunk_text.encode("utf-8")).hexdigest()
                chunk_id = f"chunk_{policy_id}_{overall_index}"

                chunks.append({
                    "id": chunk_id,
                    "policy_id": policy_id,
                    "clause_id": clause_id,
                    "page_number": page_number,
                    "section_title": section_title,
                    "clause_type": clause_type,
                    "chunk_index": overall_index,
                    "content": chunk_text,
                    "raw_text": content,
                    "content_hash": content_hash,
                })
                overall_index += 1
            else:
                # For long clauses, split along sentence boundaries with overlap
                sub_chunks = self._split_text_with_overlap(content)
                for sub_idx, sub_text in enumerate(sub_chunks):
                    formatted_text = f"[{section_title} (Page {page_number}) - Part {sub_idx + 1}]: {sub_text}"
                    content_hash = hashlib.sha256(formatted_text.encode("utf-8")).hexdigest()
                    chunk_id = f"chunk_{policy_id}_{overall_index}"

                    chunks.append({
                        "id": chunk_id,
                        "policy_id": policy_id,
                        "clause_id": clause_id,
                        "page_number": page_number,
                        "section_title": section_title,
                        "clause_type": clause_type,
                        "chunk_index": overall_index,
                        "content": formatted_text,
                        "raw_text": sub_text,
                        "content_hash": content_hash,
                    })
                    overall_index += 1

        return chunks

    def _split_text_with_overlap(self, text: str) -> List[str]:
        """
        Splits text by sentences/paragraphs respecting maximum character length
        and maintaining overlap.
        """
        # Split by sentence boundaries (. / ? / ! followed by space or newline)
        sentences = re.split(r'(?<=[.?!])\s+', text)
        result: List[str] = []
        current_chunk: List[str] = []
        current_length = 0

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            sentence_len = len(sentence)
            if current_length + sentence_len > self.max_chunk_chars and current_chunk:
                joined = " ".join(current_chunk)
                result.append(joined)

                # Keep overlap sentences
                overlap_chunk: List[str] = []
                overlap_length = 0
                for s in reversed(current_chunk):
                    if overlap_length + len(s) < self.chunk_overlap_chars:
                        overlap_chunk.insert(0, s)
                        overlap_length += len(s) + 1
                    else:
                        break

                current_chunk = overlap_chunk + [sentence]
                current_length = sum(len(s) + 1 for s in current_chunk)
            else:
                current_chunk.append(sentence)
                current_length += sentence_len + 1

        if current_chunk:
            result.append(" ".join(current_chunk))

        return result if result else [text]

chunking_service = ChunkingService()
