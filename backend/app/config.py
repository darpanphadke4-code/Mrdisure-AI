# backend/app/config.py
import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict
from dotenv import load_dotenv

load_dotenv()

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_URL = f"sqlite:///{(PROJECT_ROOT / 'medisure.db').as_posix()}"
DEFAULT_UPLOAD_DIR = str(PROJECT_ROOT / "uploads")
DEFAULT_CHROMA_DIR = str(PROJECT_ROOT / "data" / "chroma")

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = Field(default=DEFAULT_DB_URL, description="SQLAlchemy Database URL")
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    MAX_UPLOAD_SIZE_MB: int = 25
    UPLOAD_DIR: str = Field(default=DEFAULT_UPLOAD_DIR, description="Directory for uploaded files")
    TESSERACT_CMD: str = ""
    SECRET_KEY: str = "dev_secret_key_medisure_ai"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Step 3: Local RAG & Ollama Configuration
    OLLAMA_BASE_URL: str = Field(default="http://127.0.0.1:11434", description="Base URL for local Ollama server")
    OLLAMA_LLM_MODEL: str = Field(default="qwen3:4b", description="LLM model for Q&A")
    OLLAMA_EMBEDDING_MODEL: str = Field(default="nomic-embed-text", description="Embedding model for chunks")
    CHROMA_PERSIST_DIRECTORY: str = Field(default=DEFAULT_CHROMA_DIR, description="ChromaDB persistent directory")
    RAG_TOP_K: int = Field(default=7, description="Number of top chunks to retrieve")
    RAG_MIN_RELEVANCE: float = Field(default=0.30, description="Minimum similarity/relevance threshold")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    def model_post_init(self, __context):
        if self.DATABASE_URL.startswith("sqlite:///."):
            rel = self.DATABASE_URL.replace("sqlite:///.", "", 1).lstrip("/\\")
            self.DATABASE_URL = f"sqlite:///{(PROJECT_ROOT / rel).as_posix()}"
        p_chroma = Path(self.CHROMA_PERSIST_DIRECTORY)
        if not p_chroma.is_absolute():
            self.CHROMA_PERSIST_DIRECTORY = str((PROJECT_ROOT / p_chroma).resolve())
        p_upload = Path(self.UPLOAD_DIR)
        if not p_upload.is_absolute():
            self.UPLOAD_DIR = str((PROJECT_ROOT / p_upload).resolve())

settings = Settings()
