# backend/app/utils/file_validation.py
import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException, status
from app.config import settings
from app.utils.security import sanitize_filename

PDF_MAGIC_BYTES = b"%PDF-"

def validate_pdf_upload(file: UploadFile) -> None:
    """
    Validate that the uploaded file is a valid PDF within permitted size limits.
    """
    # 1. Validate file extension
    original_name = file.filename or ""
    if not original_name.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF documents (.pdf) are accepted."
        )

    # 2. Validate MIME type
    if file.content_type and file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported media type: {file.content_type}. Expected 'application/pdf'."
        )

    # 3. Read first chunk to validate magic bytes (%PDF-)
    header_chunk = file.file.read(1024)
    file.file.seek(0)  # Rewind file pointer
    
    if not header_chunk or not header_chunk.startswith(PDF_MAGIC_BYTES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Corrupted or invalid PDF header. File is not a valid PDF document."
        )

def save_uploaded_pdf(file: UploadFile, user_id: str) -> tuple[str, str, int]:
    """
    Save the uploaded file to a user-isolated server directory.
    Returns: (file_path, stored_filename, file_size)
    """
    user_dir = os.path.join(settings.UPLOAD_DIR, f"user_{user_id}")
    os.makedirs(user_dir, exist_ok=True)

    file_id = str(uuid.uuid4())
    stored_filename = f"policy_{file_id}.pdf"
    target_path = os.path.join(user_dir, stored_filename)

    # Write file while tracking size to enforce max upload limit
    max_bytes = settings.max_upload_bytes
    total_bytes = 0

    with open(target_path, "wb") as dest:
        while True:
            chunk = file.file.read(64 * 1024)  # 64 KB chunks
            if not chunk:
                break
            total_bytes += len(chunk)
            if total_bytes > max_bytes:
                # Cleanup partially written file
                dest.close()
                if os.path.exists(target_path):
                    os.remove(target_path)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB} MB."
                )
            dest.write(chunk)

    if total_bytes == 0:
        if os.path.exists(target_path):
            os.remove(target_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty (0 bytes)."
        )

    return target_path, stored_filename, total_bytes
