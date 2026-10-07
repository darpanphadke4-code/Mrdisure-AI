# backend/app/services/llm_service.py
import re
import logging
from typing import Optional, List, Dict
import httpx
from app.config import settings
from app.services.embedding_service import OllamaServiceError

logger = logging.getLogger("medisure.llm")

class LLMService:
    """
    Communicates with local Ollama instance to generate responses
    using the configured Qwen3 model.
    """

    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip('/')
        self.model_name = settings.OLLAMA_LLM_MODEL

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

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        timeout: float = 120.0
    ) -> str:
        """
        Generate completion using local Qwen3 model.
        """
        messages: List[Dict[str, str]] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt.strip()})
        messages.append({"role": "user", "content": prompt.strip()})

        try:
            with httpx.Client(timeout=timeout) as client:
                payload = {
                    "model": self.model_name,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": 0.1,  # Low temperature for factual grounded answers
                        "top_p": 0.9,
                    }
                }
                res = client.post(f"{self.base_url}/api/chat", json=payload)
                if res.status_code != 200:
                    raise OllamaServiceError(
                        f"Ollama chat error (HTTP {res.status_code}): {res.text}"
                    )
                
                data = res.json()
                raw_content = data.get("message", {}).get("content", "")
                
                # Clean any thinking tags (<think>...</think>) if present in model output
                cleaned = re.sub(r'<think>.*?</think>', '', raw_content, flags=re.DOTALL).strip()
                return cleaned if cleaned else raw_content.strip()

        except httpx.ConnectError as err:
            logger.error(f"Cannot connect to Ollama at {self.base_url}: {err}")
            raise OllamaServiceError(
                "Local AI service is not running. Start Ollama and try again."
            ) from err
        except httpx.TimeoutException as err:
            logger.error(f"Ollama chat generation timed out after {timeout}s: {err}")
            raise OllamaServiceError(
                "AI generation timed out. The local model took too long to respond."
            ) from err
        except OllamaServiceError:
            raise
        except Exception as err:
            logger.error(f"Unexpected error during LLM generation: {err}")
            raise OllamaServiceError(f"AI generation failed: {str(err)}") from err

llm_service = LLMService()
