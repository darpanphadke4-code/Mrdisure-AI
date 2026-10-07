# backend/app/services/section_parser.py
import re
from typing import List, Dict, Any

SECTION_TAXONOMY = [
    {
        "type": "ROOM_RENT",
        "patterns": [
            r"(?i)\broom\s*rent\b",
            r"(?i)\bboarding\s*(?:and|&)?\s*nursing\b",
            r"(?i)\broom\s*category\b",
            r"(?i)\bdaily\s*room\b"
        ],
        "default_title": "Room Rent & Boarding Expenses"
    },
    {
        "type": "ICU",
        "patterns": [
            r"(?i)\bintensive\s*care\s*unit\b",
            r"(?i)\bicu\b",
            r"(?i)\biccu\b",
            r"(?i)\bcritical\s*care\s*unit\b"
        ],
        "default_title": "Intensive Care Unit (ICU) Coverage"
    },
    {
        "type": "WAITING_PERIOD",
        "patterns": [
            r"(?i)\bwaiting\s*period(?:s)?\b",
            r"(?i)\bpre-?existing\s*(?:disease|condition|ailment)(?:s)?\b",
            r"(?i)\bped\s*waiting\b",
            r"(?i)\btime\s*bound\s*exclusion(?:s)?\b",
            r"(?i)\b30\s*days?\s*waiting\b",
            r"(?i)\bspecific\s*illness(?:es)?\s*waiting\b"
        ],
        "default_title": "Waiting Periods & Pre-Existing Disease Rules"
    },
    {
        "type": "EXCLUSION",
        "patterns": [
            r"(?i)\bexclusion(?:s)?\b",
            r"(?i)\bwhat\s*is\s*not\s*covered\b",
            r"(?i)\bpermanent\s*exclusion(?:s)?\b",
            r"(?i)\bnon-?payable\s*(?:items|expenses)\b",
            r"(?i)\bunproven\s*(?:treatment|surgeries)\b"
        ],
        "default_title": "Policy Exclusions & Non-Covered Items"
    },
    {
        "type": "DEDUCTIBLE",
        "patterns": [
            r"(?i)\bdeductible(?:s)?\b",
            r"(?i)\bannual\s*deductible\b",
            r"(?i)\baggregate\s*deductible\b",
            r"(?i)\bvoluntary\s*deductible\b"
        ],
        "default_title": "Annual Deductible Clause"
    },
    {
        "type": "COPAY",
        "patterns": [
            r"(?i)\bco-?payment(?:s)?\b",
            r"(?i)\bco-?pay\b",
            r"(?i)\bcost\s*sharing\b"
        ],
        "default_title": "Co-Payment Provision"
    },
    {
        "type": "SUBLIMIT",
        "patterns": [
            r"(?i)\bsub-?limit(?:s)?\b",
            r"(?i)\bmodern\s*treatment(?:s)?\b",
            r"(?i)\brobotic\s*surger(?:y|ies)\b",
            r"(?i)\bcapping\s*on\b"
        ],
        "default_title": "Sub-Limits & Modern Procedures"
    },
    {
        "type": "DAYCARE",
        "patterns": [
            r"(?i)\bday\s*care\s*(?:procedure|treatment|surger)(?:s|ies)?\b",
            r"(?i)\bless\s*than\s*24\s*hours?\b"
        ],
        "default_title": "Day Care Procedures"
    },
    {
        "type": "MATERNITY",
        "patterns": [
            r"(?i)\bmaternity\b",
            r"(?i)\bnew-?born\s*baby\b",
            r"(?i)\bpregnancy\b",
            r"(?i)\bcaesarean\b"
        ],
        "default_title": "Maternity & Newborn Benefit"
    },
    {
        "type": "CONSUMABLES_RIDER",
        "patterns": [
            r"(?i)\bconsumables?\b",
            r"(?i)\bcare\s*shield\b",
            r"(?i)\bnon-?medical\s*item\b",
            r"(?i)\bannexure\s*(?:i|1)\b"
        ],
        "default_title": "Consumables & Care Shield Rider"
    },
    {
        "type": "COVERAGE",
        "patterns": [
            r"(?i)\bin-?patient\s*hospitali[sz]ation\b",
            r"(?i)\bscope\s*of\s*cover\b",
            r"(?i)\bbenefits?\s*covered\b",
            r"(?i)\bschedule\s*of\s*insurance\b",
            r"(?i)\bsum\s*insured\b",
            r"(?i)\bpre-?hospitali[sz]ation\b",
            r"(?i)\bpost-?hospitali[sz]ation\b"
        ],
        "default_title": "In-Patient Hospitalization & Benefits"
    }
]

class SectionParser:
    def parse_clauses_from_pages(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Segment cleaned page text into discrete policy clauses with source page tracking.
        """
        extracted_clauses: List[Dict[str, Any]] = []

        for p in pages:
            page_num = p.get("page_number", 1)
            text = p.get("cleaned_text") or p.get("raw_text") or ""
            if not text.strip():
                continue

            # Split text by paragraphs or numbered section headers
            paragraphs = [para.strip() for para in text.split("\n\n") if para.strip()]
            
            current_section_title = f"Section - Page {page_num}"
            current_clause_type = "STANDARD"

            for idx, para in enumerate(paragraphs):
                # Check if paragraph begins with a clear section/clause header
                header_match = re.match(
                    r"^(?:(?:Section|Clause|Article|Schedule|Part)\s+[0-9A-Z\.]+[:\-]?\s*([A-Za-z0-9\s,\-–/&]{3,80})|"
                    r"^([0-9]+(?:\.[0-9]+)*\s+[A-Z][A-Za-z0-9\s,\-–/&]{3,80}))(?:\n|$)",
                    para
                )

                if header_match:
                    found_title = (header_match.group(1) or header_match.group(2) or "").strip()
                    if found_title:
                        current_section_title = found_title

                # Classify clause against insurance taxonomy
                clause_type = "STANDARD"
                for item in SECTION_TAXONOMY:
                    for pat in item["patterns"]:
                        if re.search(pat, para):
                            clause_type = item["type"]
                            if current_section_title.startswith("Section - Page"):
                                current_section_title = item["default_title"]
                            break
                    if clause_type != "STANDARD":
                        break

                # Only create clauses for substantial blocks of text (> 30 chars)
                if len(para) >= 30:
                    extracted_clauses.append({
                        "page_number": page_num,
                        "section_title": current_section_title,
                        "clause_type": clause_type,
                        "content": para,
                        "raw_content": para,
                        "start_position": idx * 100,
                        "end_position": (idx * 100) + len(para)
                    })

        return extracted_clauses

section_parser = SectionParser()
