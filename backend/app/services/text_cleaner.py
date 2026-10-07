# backend/app/services/text_cleaner.py
import re
from typing import List, Dict, Any

class TextCleaner:
    def clean_page(self, raw_text: str, page_number: int = 1, total_pages: int = 1) -> str:
        """
        Clean raw extracted text while preserving original semantic structure and page fidelity.
        """
        if not raw_text:
            return ""

        text = raw_text

        # 1. Normalize line endings and non-standard spaces
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = text.replace("\xa0", " ").replace("\u200b", "")

        # 2. Remove standard page numbering patterns at top/bottom of pages
        page_pattern = rf"(?i)(?:page\s+{page_number}\s+of\s+{total_pages}|page\s*[-–:]*\s*{page_number}|{page_number}\s*/\s*{total_pages})"
        text = re.sub(page_pattern, "", text)

        # 3. Clean de-hyphenated words across line breaks (e.g., "hos-\npital" -> "hospital")
        # Only merge if lowercase letters are joined and not a bullet or compound phrase
        text = re.sub(r"(\b[a-zA-Z]{3,})-\n\s*([a-zA-Z]{2,}\b)", r"\1\2", text)

        # 4. Standardize quotes and hyphens
        text = text.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
        text = text.replace("–", "-").replace("—", "-")

        # 5. Fix common spacing artifacts (e.g., multiple spaces or tabs on a line)
        lines = text.split("\n")
        cleaned_lines: List[str] = []

        for line in lines:
            line_stripped = re.sub(r"[ \t]+", " ", line).strip()
            # Ignore purely decorative long divider lines
            if re.match(r"^[-=_*~]{4,}$", line_stripped):
                continue
            cleaned_lines.append(line_stripped)

        # 6. Recombine lines into coherent paragraphs:
        # If line does not end with sentence terminator and next line starts with lowercase, merge
        merged_paragraphs: List[str] = []
        current_para: List[str] = []

        for line in cleaned_lines:
            if not line:
                if current_para:
                    merged_paragraphs.append(" ".join(current_para))
                    current_para = []
            else:
                # Check if this line looks like a header, bullet point, or section prefix
                is_bullet_or_header = bool(
                    re.match(r"^(?:[0-9]+[\.\)]|[a-zA-Z][\.\)]|[-•*]|(?:Section|Clause|Article)\s+[0-9A-Z\.]+)", line, re.I)
                )

                if is_bullet_or_header and current_para:
                    merged_paragraphs.append(" ".join(current_para))
                    current_para = [line]
                else:
                    current_para.append(line)

        if current_para:
            merged_paragraphs.append(" ".join(current_para))

        # Join paragraphs with double newlines
        cleaned_text = "\n\n".join(merged_paragraphs).strip()
        return cleaned_text

    def clean_document_pages(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Process each page in the document list and attach cleaned_text.
        """
        total = len(pages)
        cleaned_result = []

        for p in pages:
            raw = p.get("raw_text", "")
            p_num = p.get("page_number", 1)
            cleaned = self.clean_page(raw, page_number=p_num, total_pages=total)
            cleaned_result.append({
                **p,
                "cleaned_text": cleaned
            })

        return cleaned_result

text_cleaner = TextCleaner()
