# backend/app/services/ocr_service.py
import io
import os
import shutil
import logging
from PIL import Image
import pytesseract
from app.config import settings

logger = logging.getLogger("medisure.ocr")

class OCRService:
    def __init__(self):
        self._initialized = False
        self._available = False
        self._tesseract_path = None
        self._init_tesseract()

    def _init_tesseract(self):
        # 1. Check custom path from config
        if settings.TESSERACT_CMD and os.path.exists(settings.TESSERACT_CMD):
            self._tesseract_path = settings.TESSERACT_CMD
            pytesseract.pytesseract.tesseract_cmd = self._tesseract_path
        else:
            # 2. Check standard Windows and Unix paths
            common_paths = [
                r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
                "/usr/bin/tesseract",
                "/usr/local/bin/tesseract",
            ]
            for p in common_paths:
                if os.path.exists(p):
                    self._tesseract_path = p
                    pytesseract.pytesseract.tesseract_cmd = p
                    break
            if not self._tesseract_path:
                which_path = shutil.which("tesseract")
                if which_path:
                    self._tesseract_path = which_path
                    pytesseract.pytesseract.tesseract_cmd = which_path

        # 3. Test if tesseract is callable
        try:
            version = pytesseract.get_tesseract_version()
            self._available = True
            logger.info(f"Tesseract OCR is available. Version: {version} at {self._tesseract_path}")
        except Exception as exc:
            self._available = False
            logger.warning(
                f"Tesseract OCR is not available on this system ({exc}). "
                "Digital PDF text extraction will function normally. "
                "Scanned pages will be detected and flagged with an explicit OCR_UNAVAILABLE status."
            )
        self._initialized = True

    @property
    def is_available(self) -> bool:
        if not self._initialized:
            self._init_tesseract()
        return self._available

    def ocr_image_bytes(self, image_bytes: bytes) -> str:
        if not self.is_available:
            raise RuntimeError(
                "OCR is requested for a scanned page, but Tesseract OCR binary is not installed or configured."
            )
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image, lang="eng")
        return text

    def ocr_pixmap(self, pixmap) -> str:
        """
        Accepts a PyMuPDF fitz.Pixmap and extracts OCR text.
        """
        if not self.is_available:
            raise RuntimeError(
                "OCR is requested for a scanned page, but Tesseract OCR binary is not installed or configured."
            )
        img_bytes = pixmap.tobytes("png")
        return self.ocr_image_bytes(img_bytes)

ocr_service = OCRService()
