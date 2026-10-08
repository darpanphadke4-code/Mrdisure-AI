# backend/app/services/llm_service.py
import re
import json
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
        Generate completion using local Qwen3 model with progressive streaming.
        """
        system_text = system_prompt.strip() if system_prompt else (
            "You are MediSure AI, a professional medical insurance policy assistant. "
            "Keep internal thinking under 2 sentences. "
            "Immediately output the grounded answer with exact page citations [Page X]."
        )
        messages: List[Dict[str, str]] = [
            {"role": "system", "content": system_text},
            {"role": "user", "content": prompt.strip()}
        ]

        try:
            with httpx.Client(timeout=timeout) as client:
                payload = {
                    "model": self.model_name,
                    "messages": messages,
                    "stream": True,
                    "options": {
                        "temperature": 0.1,  # Low temperature for factual grounded answers
                        "top_p": 0.9,
                        "num_predict": 800,
                    }
                }
                
                content_parts = []
                think_parts = []
                with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
                    if response.status_code != 200:
                        raise OllamaServiceError(
                            f"Ollama chat error (HTTP {response.status_code})"
                        )
                    for line in response.iter_lines():
                        if not line:
                            continue
                        data = json.loads(line)
                        msg_obj = data.get("message", {})
                        if msg_obj.get("thinking"):
                            think_parts.append(msg_obj.get("thinking"))
                        if msg_obj.get("content"):
                            content_parts.append(msg_obj.get("content"))
                        if data.get("done"):
                            break

                raw_content = "".join(content_parts).strip()
                thinking = "".join(think_parts).strip()

                # If content is empty but thinking exists (Ollama 0.40+ reasoning channel),
                # extract the grounded concluding answer
                if not raw_content and thinking:
                    think_clean = re.sub(r'<think>.*?</think>', '', thinking, flags=re.DOTALL).strip()
                    lines = [l.strip() for l in think_clean.split("\n") if l.strip()]
                    for line in reversed(lines):
                        if any(k in line.lower() for k in ["[page", "limit", "covered", "waiting period", "sum insured", "excluded", "cover", "hospital"]):
                            raw_content = line
                            break
                    if not raw_content:
                        raw_content = lines[-1] if lines else thinking.strip()

                # Clean any thinking tags (<think>...</think>) if present in model output
                cleaned = re.sub(r'<think>.*?</think>', '', raw_content, flags=re.DOTALL).strip()
                cleaned = re.sub(r'</think>', '', cleaned).strip()
                cleaned = re.sub(r'<think>.*', '', cleaned, flags=re.DOTALL).strip()
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
