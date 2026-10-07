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

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

settings = Settings()
