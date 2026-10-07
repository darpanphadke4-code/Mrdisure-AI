# backend/app/services/pdf_service.py
import fitz  # PyMuPDF
import logging
from typing import List, Dict, Any
from app.services.ocr_service import ocr_service

logger = logging.getLogger("medisure.pdf")

class PDFService:
    MIN_TEXT_THRESHOLD = 40  # Minimum character count to consider text selectable

    def extract_document(self, file_path: str) -> Dict[str, Any]:
        """
        Extract text from a PDF file preserving page boundaries and detecting scanned pages.
        """
        doc = fitz.open(file_path)
        total_pages = len(doc)
        pages_result: List[Dict[str, Any]] = []
        
        methods_used = set()
        ocr_missing_count = 0

        for page_idx in range(total_pages):
            page_num = page_idx + 1
            page = doc[page_idx]
            
            # 1. Direct text extraction using PyMuPDF layout analysis
            extracted_text = page.get_text("text")
            image_list = page.get_images(full=True)
            has_images = len(image_list) > 0
            
            cleaned_length = len(extracted_text.strip())
            is_scanned = cleaned_length < self.MIN_TEXT_THRESHOLD and (has_images or cleaned_length == 0)

            page_method = "TEXT"
            page_text = extracted_text

            # 2. Scanned page OCR fallback
            if is_scanned:
                logger.info(f"Page {page_num} detected as scanned image (text len: {cleaned_length}, images: {len(image_list)})")
                if ocr_service.is_available:
                    try:
                        # Render page at 200 DPI for reliable OCR resolution
                        pix = page.get_pixmap(dpi=200)
                        ocr_text = ocr_service.ocr_pixmap(pix)
                        if ocr_text.strip():
                            page_text = ocr_text
                            page_method = "OCR"
                            methods_used.add("OCR")
                            logger.info(f"Page {page_num} successfully processed with OCR ({len(ocr_text)} chars)")
                        else:
                            page_method = "OCR_EMPTY"
                            methods_used.add("OCR")
                    except Exception as err:
                        logger.error(f"OCR failed on page {page_num}: {err}")
                        page_method = "OCR_FAILED"
                        methods_used.add("OCR")
                else:
                    page_method = "OCR_REQUIRED_UNAVAILABLE"
                    ocr_missing_count += 1
                    page_text = f"[Scanned Page {page_num}: OCR engine is not installed or configured on the server. Selectable text could not be extracted.]"
                    logger.warning(f"Page {page_num} requires OCR, but Tesseract binary is unavailable.")
            else:
                methods_used.add("TEXT")

            pages_result.append({
                "page_number": page_num,
                "raw_text": page_text,
                "extraction_method": page_method,
                "is_scanned": is_scanned,
                "has_images": has_images,
                "character_count": len(page_text.strip())
            })

        doc.close()

        # Determine overall document extraction method
        if "OCR" in methods_used and "TEXT" in methods_used:
            overall_method = "MIXED"
        elif "OCR" in methods_used:
            overall_method = "OCR"
        else:
            overall_method = "TEXT"

        return {
            "total_pages": total_pages,
            "extraction_method": overall_method,
            "pages": pages_result,
            "ocr_missing_count": ocr_missing_count
        }

pdf_service = PDFService()
