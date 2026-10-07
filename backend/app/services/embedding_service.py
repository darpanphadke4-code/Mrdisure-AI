# backend/app/services/embedding_service.py
import logging
from typing import List, Optional
import httpx
from app.config import settings

logger = logging.getLogger("medisure.embedding")

class OllamaServiceError(Exception):
    """Raised when Ollama is unreachable or model fails to process request."""
    pass

class EmbeddingService:
    """
    Communicates with local Ollama instance to generate vector embeddings
    for policy chunks and search queries using the configured embedding model.
    """

    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip('/')
        self.model_name = settings.OLLAMA_EMBEDDING_MODEL

    def is_available(self) -> bool:
        """
        Check if Ollama server is running and reachable.
        """
        try:
            with httpx.Client(timeout=3.0) as client:
                res = client.get(f"{self.base_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    def embed_text(self, text: str) -> List[float]:
        """
        Generate embedding vector for a single piece of text.
        """
        if not text or not text.strip():
            raise ValueError("Cannot generate embedding for empty text")

        try:
            with httpx.Client(timeout=30.0) as client:
                payload = {
                    "model": self.model_name,
                    "prompt": text.strip()
                }
                res = client.post(f"{self.base_url}/api/embeddings", json=payload)
                if res.status_code != 200:
                    raise OllamaServiceError(
                        f"Ollama embedding request failed with HTTP {res.status_code}: {res.text}"
                    )
                data = res.json()
                embedding = data.get("embedding")
                if not embedding or not isinstance(embedding, list):
                    raise OllamaServiceError("Ollama returned empty or invalid embedding format")
                return embedding
        except httpx.ConnectError as err:
            logger.error(f"Failed to connect to Ollama at {self.base_url}: {err}")
            raise OllamaServiceError(
                f"Local AI service is not running. Start Ollama and try again."
            ) from err
        except httpx.TimeoutException as err:
            logger.error(f"Ollama embedding generation timed out: {err}")
            raise OllamaServiceError(
                "Ollama embedding request timed out. Please check local machine resource usage."
            ) from err
        except OllamaServiceError:
            raise
        except Exception as err:
            logger.error(f"Unexpected error during embedding generation: {err}")
            raise OllamaServiceError(f"Embedding generation error: {str(err)}") from err

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts sequentially or in batches.
        """
        embeddings: List[List[float]] = []
        for text in texts:
            emb = self.embed_text(text)
            embeddings.append(emb)
        return embeddings

embedding_service = EmbeddingService()
