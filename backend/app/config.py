# backend/app/config.py
import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = Field(default="sqlite:///./medisure.db", description="SQLAlchemy Database URL")
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    MAX_UPLOAD_SIZE_MB: int = 25
    UPLOAD_DIR: str = "./uploads"
    TESSERACT_CMD: str = ""
    SECRET_KEY: str = "dev_secret_key_medisure_ai"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Step 3: Local RAG & Ollama Configuration
    OLLAMA_BASE_URL: str = Field(default="http://127.0.0.1:11434", description="Base URL for local Ollama server")
    OLLAMA_LLM_MODEL: str = Field(default="qwen3:4b", description="LLM model for Q&A")
    OLLAMA_EMBEDDING_MODEL: str = Field(default="nomic-embed-text", description="Embedding model for chunks")
    CHROMA_PERSIST_DIRECTORY: str = Field(default="./data/chroma", description="ChromaDB persistent directory")
    RAG_TOP_K: int = Field(default=5, description="Number of top chunks to retrieve")
    RAG_MIN_RELEVANCE: float = Field(default=0.30, description="Minimum similarity/relevance threshold")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

settings = Settings()
