# backend/app/main.py
import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.database import init_db
from app.routes.policies import router as policies_router
from app.services.ocr_service import ocr_service

# Configure structured logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("medisure.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database schema & verify models
    logger.info("Initializing MediSure AI backend database...")
    init_db()
    logger.info(f"Tesseract OCR availability: {ocr_service.is_available}")
    yield
    # Shutdown
    logger.info("MediSure AI backend shutting down.")

app = FastAPI(
    title="MediSure AI Backend",
    description="Document Processing, PDF Extraction, OCR & Structured Policy Analysis API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(policies_router)

# Health Check Endpoint
@app.get("/api/health", tags=["health"])
def health_check():
    return {
        "status": "healthy",
        "service": "MediSure AI Policy Processing Engine",
        "version": "1.0.0",
        "ocr_available": ocr_service.is_available,
        "database": "connected",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Standardized Error Handling
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation error in request parameters",
            "errors": exc.errors()
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception during {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An internal error occurred during document processing. Please check server logs.",
            "detail": str(exc) if settings.DEBUG else "Internal server error"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
