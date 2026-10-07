# backend/app/services/vector_store.py
import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import settings

logger = logging.getLogger("medisure.vector_store")

COLLECTION_NAME = "medisure_policy_chunks"

class VectorStoreService:
    """
    Manages local persistent vector storage using ChromaDB.
    Enforces policy_id scoping on all embeddings and retrieval queries.
    """

    def __init__(self, persist_directory: Optional[str] = None):
        self.persist_directory = persist_directory or settings.CHROMA_PERSIST_DIRECTORY
        os.makedirs(self.persist_directory, exist_ok=True)
        self._client = None
        self._collection = None

    @property
    def client(self):
        if self._client is None:
            self._client = chromadb.PersistentClient(
                path=self.persist_directory,
                settings=ChromaSettings(anonymized_telemetry=False)
            )
        return self._client

    @property
    def collection(self):
        if self._collection is None:
            # Using cosine distance for normalized embedding similarity
            self._collection = self.client.get_or_create_collection(
                name=COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"}
            )
        return self._collection

    def add_chunks(
        self,
        policy_id: str,
        chunk_ids: List[str],
        embeddings: List[List[float]],
        documents: List[str],
        metadatas: List[Dict[str, Any]]
    ) -> None:
        """
        Store chunk vectors, text, and metadata in ChromaDB.
        Guarantees that policy_id is stamped into each metadata dict.
        """
        if not chunk_ids:
            return

        # Ensure policy_id is set in every metadata entry
        for meta in metadatas:
            meta["policy_id"] = policy_id

        self.collection.upsert(
            ids=chunk_ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
        logger.info(f"Upserted {len(chunk_ids)} chunk vectors for policy {policy_id} into ChromaDB")

    def query_similar_chunks(
        self,
        policy_id: str,
        query_embedding: List[float],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Query ChromaDB strictly scoped to the specified policy_id.
        A query for Policy A will NEVER retrieve chunks from Policy B.
        """
        # Strict policy_id isolation filter
        where_filter = {"policy_id": {"$eq": policy_id}}

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where_filter,
            include=["documents", "metadatas", "distances"]
        )

        formatted_results: List[Dict[str, Any]] = []

        ids = results.get("ids", [[]])[0]
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        for i in range(len(ids)):
            dist = distances[i] if i < len(distances) else 1.0
            # For cosine distance: distance is in [0, 2], similarity is 1.0 - distance
            similarity = max(0.0, min(1.0, 1.0 - dist))

            meta = metadatas[i] if i < len(metadatas) else {}
            doc = documents[i] if i < len(documents) else ""

            formatted_results.append({
                "chunk_id": ids[i],
                "policy_id": meta.get("policy_id", policy_id),
                "clause_id": meta.get("clause_id"),
                "page_number": int(meta.get("page_number", 1)),
                "section_title": meta.get("section_title", "General"),
                "chunk_index": int(meta.get("chunk_index", 0)),
                "content": doc,
                "distance": dist,
                "similarity": similarity,
            })

        return formatted_results

    def delete_policy_vectors(self, policy_id: str) -> None:
        """
        Delete all vectors associated with a policy.
        """
        try:
            self.collection.delete(where={"policy_id": {"$eq": policy_id}})
            logger.info(f"Deleted all ChromaDB vectors for policy {policy_id}")
        except Exception as e:
            logger.warning(f"Error deleting vectors for policy {policy_id}: {e}")

    def count_policy_chunks(self, policy_id: str) -> int:
        """
        Count stored vectors for a policy.
        """
        try:
            res = self.collection.get(
                where={"policy_id": {"$eq": policy_id}},
                include=[]
            )
            return len(res.get("ids", []))
        except Exception:
            return 0

vector_store_service = VectorStoreService()
