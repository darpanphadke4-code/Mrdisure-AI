# backend/app/utils/security.py
import re
import os

def sanitize_filename(filename: str) -> str:
    """
    Sanitize an uploaded filename to prevent directory traversal and special character exploits.
    """
    clean_name = os.path.basename(filename)
    # Remove null bytes and non-printable or path navigation tokens
    clean_name = clean_name.replace("..", "").replace("/", "").replace("\\", "")
    # Allow alphanumeric, dashes, underscores, dots, spaces
    clean_name = re.sub(r"[^a-zA-Z0-9_\-\. ]", "", clean_name)
    clean_name = clean_name.strip()
    return clean_name or "document.pdf"
