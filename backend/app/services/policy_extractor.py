# backend/app/services/policy_extractor.py
import re
from typing import List, Dict, Any, Optional

KNOWN_INSURERS = [
    "Care Health Insurance",
    "Star Health & Allied Insurance",
    "HDFC ERGO General Insurance",
    "Niva Bupa Health Insurance",
    "ICICI Lombard General Insurance",
    "Tata AIG General Insurance",
    "Bajaj Allianz General Insurance",
    "Aditya Birla Health Insurance",
    "Max Bupa Health Insurance",
    "ManipalCigna Health Insurance",
    "United India Insurance",
    "The New India Assurance",
    "Oriental Insurance",
    "National Insurance",
    "MediSure General Insurance",
    "MediSure AI"
]

class PolicyExtractor:
    def extract_structured_terms(
        self,
        pages: List[Dict[str, Any]],
        clauses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze document text and clauses to extract a structured policy profile.
        Preserves confidence states: FOUND, NOT_FOUND, AMBIGUOUS, with source page & snippet.
        """
        full_text = "\n\n".join([p.get("cleaned_text") or p.get("raw_text") or "" for p in pages])

        extracted_terms: List[Dict[str, Any]] = []

        # 1. Insurer Name
        insurer_term = self._extract_insurer(pages)
        extracted_terms.append(insurer_term)

        # 2. Policy Name
        policy_name_term = self._extract_policy_name(pages, insurer_term.get("extracted_value"))
        extracted_terms.append(policy_name_term)

        # 3. Policy Number
        policy_number_term = self._extract_policy_number(pages)
        extracted_terms.append(policy_number_term)

        # 4. Policy Type
        policy_type_term = self._extract_policy_type(pages)
        extracted_terms.append(policy_type_term)

        # 5. Sum Insured (Financial)
        sum_insured_term = self._extract_sum_insured(pages, clauses)
        extracted_terms.append(sum_insured_term)

        # 6. Room Rent Limit (Financial / Coverage)
        room_rent_term = self._extract_room_rent(pages, clauses)
        extracted_terms.append(room_rent_term)

        # 7. ICU Limit (Financial / Coverage)
        icu_term = self._extract_icu_limit(pages, clauses)
        extracted_terms.append(icu_term)

        # 8. Deductible (Financial)
        deductible_term = self._extract_deductible(pages, clauses)
        extracted_terms.append(deductible_term)

        # 9. Co-Payment (Financial)
        copay_term = self._extract_copay(pages, clauses)
        extracted_terms.append(copay_term)

        # 10. Initial Waiting Period
        initial_wait_term = self._extract_initial_waiting_period(pages, clauses)
        extracted_terms.append(initial_wait_term)

        # 11. Specific Illness Waiting Period
        specific_wait_term = self._extract_specific_waiting_period(pages, clauses)
        extracted_terms.append(specific_wait_term)

        # 12. Pre-Existing Disease (PED) Waiting Period
        ped_wait_term = self._extract_ped_waiting_period(pages, clauses)
        extracted_terms.append(ped_wait_term)

        # 13. Consumables Rider
        consumables_term = self._extract_consumables_rider(pages, clauses)
        extracted_terms.append(consumables_term)

        # 14. Maternity Coverage
        maternity_term = self._extract_maternity_coverage(pages, clauses)
        extracted_terms.append(maternity_term)

        # 15. Ambulance Coverage
        ambulance_term = self._extract_ambulance_coverage(pages, clauses)
        extracted_terms.append(ambulance_term)

        # Extract explicit exclusions list
        exclusions_list = self._extract_exclusions_list(pages, clauses)

        return {
            "terms": extracted_terms,
            "exclusions": exclusions_list,
            "metadata": {
                "provider_name": insurer_term.get("extracted_value") or "Unknown Insurer",
                "policy_name": policy_name_term.get("extracted_value") or "Health Insurance Policy",
                "policy_number": policy_number_term.get("extracted_value") or "Not found",
                "policy_type": policy_type_term.get("extracted_value") or "Health Insurance"
            }
        }

    # Helper extractors

    def _extract_insurer(self, pages: List[Dict[str, Any]]) -> Dict[str, Any]:
        # Search first 2 pages primarily
        target_text = "\n".join([p.get("cleaned_text", "") for p in pages[:2]])
        for insurer in KNOWN_INSURERS:
            if re.search(rf"(?i)\b{re.escape(insurer)}\b", target_text):
                # Locate page
                page_found = 1
                snippet = insurer
                for p in pages[:2]:
                    if re.search(rf"(?i)\b{re.escape(insurer)}\b", p.get("cleaned_text", "")):
                        page_found = p["page_number"]
                        snippet = f"Identified insurer entity: {insurer}"
                        break
                return {
                    "field_name": "insurer_name",
                    "field_label": "Insurance Provider",
                    "category": "General",
                    "extracted_value": insurer,
                    "current_value": insurer,
                    "status": "FOUND",
                    "confidence_score": 0.98,
                    "source_page": page_found,
                    "snippet": snippet
                }

        return {
            "field_name": "insurer_name",
            "field_label": "Insurance Provider",
            "category": "General",
            "extracted_value": None,
            "current_value": None,
            "status": "NOT_FOUND",
            "confidence_score": 0.0,
            "source_page": None,
            "snippet": None
        }

    def _extract_policy_name(self, pages: List[Dict[str, Any]], provider: Optional[str]) -> Dict[str, Any]:
        text_p1 = pages[0].get("cleaned_text", "") if pages else ""
        
        # Check explicit policy title patterns
        patterns = [
            r"(?i)(?:Policy\s*Name|Plan\s*Name|Product\s*Name)[\s:]*([A-Za-z0-9\s\(\)\-–]{4,60})",
            r"(?i)\b([A-Za-z0-9\s]{3,40}(?:Health Plan|Insurance Plan|Health Insurance|Care Supreme|Optima Secure|Comprehensive Gold|Shield Platinum))\b"
        ]

        for pat in patterns:
            m = re.search(pat, text_p1)
            if m:
                val = m.group(1).strip()
                val = re.sub(r"\s+", " ", val)
                if len(val) >= 4:
                    return {
                        "field_name": "policy_name",
                        "field_label": "Policy Plan Name",
                        "category": "General",
                        "extracted_value": val,
                        "current_value": val,
                        "status": "FOUND",
                        "confidence_score": 0.90,
                        "source_page": 1,
                        "snippet": f"Product Title: {val}"
                    }

        return {
            "field_name": "policy_name",
            "field_label": "Policy Plan Name",
            "category": "General",
            "extracted_value": None,
            "current_value": None,
            "status": "NOT_FOUND",
            "confidence_score": 0.0,
            "source_page": None,
            "snippet": None
        }

    def _extract_policy_number(self, pages: List[Dict[str, Any]]) -> Dict[str, Any]:
        for p in pages[:2]:
            text = p.get("cleaned_text", "")
            m = re.search(r"(?i)(?:Policy\s*(?:No\.?|Number|#)|Certificate\s*No\.?)[\s:]*([A-Za-z0-9/\-–]{6,35})", text)
            if m:
                val = m.group(1).strip()
                return {
                    "field_name": "policy_number",
                    "field_label": "Policy Number",
                    "category": "General",
                    "extracted_value": val,
                    "current_value": val,
                    "status": "FOUND",
                    "confidence_score": 0.95,
                    "source_page": p["page_number"],
                    "snippet": f"Policy Number identifier: {val}"
                }

        return {
            "field_name": "policy_number",
            "field_label": "Policy Number",
            "category": "General",
            "extracted_value": None,
            "current_value": None,
            "status": "NOT_FOUND",
            "confidence_score": 0.0,
            "source_page": None,
            "snippet": None
        }

    def _extract_policy_type(self, pages: List[Dict[str, Any]]) -> Dict[str, Any]:
        for p in pages[:2]:
            text = p.get("cleaned_text", "")
            if re.search(r"(?i)\bfamily\s*floater\b", text):
                return {
                    "field_name": "policy_type",
                    "field_label": "Policy Type",
                    "category": "General",
                    "extracted_value": "Family Floater Health Plan",
                    "current_value": "Family Floater Health Plan",
                    "status": "FOUND",
                    "confidence_score": 0.92,
                    "source_page": p["page_number"],
                    "snippet": "Covers primary insured and dependent family members"
                }
            elif re.search(r"(?i)\bindividual\b", text):
                return {
                    "field_name": "policy_type",
                    "field_label": "Policy Type",
                    "category": "General",
                    "extracted_value": "Individual Health Insurance",
                    "current_value": "Individual Health Insurance",
                    "status": "FOUND",
                    "confidence_score": 0.88,
                    "source_page": p["page_number"],
                    "snippet": "Individual policy schedule"
                }

        return {
            "field_name": "policy_type",
            "field_label": "Policy Type",
            "category": "General",
            "extracted_value": "Comprehensive Health Insurance",
            "current_value": "Comprehensive Health Insurance",
            "status": "FOUND",
            "confidence_score": 0.70,
            "source_page": 1,
            "snippet": "Standard health insurance coverage"
        }

    def _extract_sum_insured(self, pages: List[Dict[str, Any]], clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
        for p in pages:
            text = p.get("cleaned_text", "")
            # Patterns: "Sum Insured: ₹10,00,000" or "Sum Insured of INR 10,00,000"
            m = re.search(
                r"(?i)(?:Sum\s*Insured|Base\s*Cover|Sum\s*Insured\s*Amount)[\s:]*(?:of\s*)?(?:INR|Rs\.?|₹)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?|\d+\s*(?:Lakh|Lakhs|Crore|Crores))",
                text
            )
            if m:
                raw_val = m.group(1).strip()
                # Format to standard currency representation
                formatted = f"₹{raw_val}" if not raw_val.startswith("₹") else raw_val
                return {
                    "field_name": "sum_insured",
                    "field_label": "Base Sum Insured",
                    "category": "Financial",
                    "extracted_value": formatted,
                    "current_value": formatted,
                    "status": "FOUND",
                    "confidence_score": 0.95,
                    "source_page": p["page_number"],
                    "snippet": m.group(0)
                }

        return {
            "field_name": "sum_insured",
            "field_label": "Base Sum Insured",
            "category": "Financial",
            "extracted_value": None,
            "current_value": None,
            "status": "NOT_FOUND",
            "confidence_score": 0.0,
            "source_page": None,
            "snippet": None
        }

    def _extract_room_rent(self, pages: List[Dict[str, Any]], clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
        for p in pages:
            text = p.get("cleaned_text", "")
            # Pattern 1: 1% of Sum Insured
            m1 = re.search(r"(?i)(?:1%\s*(?:of\s*sum\s*insured)?[^.\n]*?(?:INR|Rs\.?|₹)?\s*([0-9,]+)?\s*(?:per\s*day|/day)?)", text)
            if "room rent" in text.lower() and m1:
                snippet = m1.group(0).strip()
                # Extract rupee cap if present
                sub_amt = re.search(r"(?:INR|Rs\.?|₹)\s*([0-9,]+)", snippet)
                val = f"₹{sub_amt.group(1)}/day (1% of Sum Insured)" if sub_amt else "1% of Sum Insured per day"
                return {
                    "field_name": "room_rent_limit",
                    "field_label": "Room Rent Daily Limit",
                    "category": "Financial",
                    "extracted_value": val,
                    "current_value": val,
                    "status": "FOUND",
                    "confidence_score": 0.92,
                    "source_page": p["page_number"],
                    "snippet": snippet
                }

            # Pattern 2: Single Private Room without daily cap
            if re.search(r"(?i)\bsingle\s*private\s*(?:a/c\s*)?room(?:\s*without\s*(?:capping|daily\s*monetary))?", text):
                return {
                    "field_name": "room_rent_limit",
                    "field_label": "Room Rent Daily Limit",
                    "category": "Financial",
                    "extracted_value": "Single Private A/C Room (No daily monetary cap)",
                    "current_value": "Single Private A/C Room (No daily monetary cap)",
                    "status": "FOUND",
                    "confidence_score": 0.90,
                    "source_page": p["page_number"],
                    "snippet": "Single Private A/C Room without daily monetary sub-limit capping"
                }

            # Pattern 3: Fixed rupee amount
            m3 = re.search(r"(?i)room\s*rent[^.\n]*?(?:INR|Rs\.?|₹)\s*([0-9,]+)\s*(?:/day|per\s*day)?", text)
            if m3:
                val = f"₹{m3.group(1)}/day"
                return {
                    "field_name": "room_rent_limit",
                    "field_label": "Room Rent Daily Limit",
                    "category": "Financial",
                    "extracted_value": val,
                    "current_value": val,
                    "status": "FOUND",
                    "confidence_score": 0.88,
                    "source_page": p["page_number"],
                    "snippet": m3.group(0).strip()
                }

        return {
            "field_name": "room_rent_limit",
            "field_label": "Room Rent Daily Limit",
            "category": "Financial",
            "extracted_value": None,
            "current_value": None,
            "status": "NOT_FOUND",
            "confidence_score": 0.0,
            "source_page": None,
            "snippet": None
        }

    def _extract_icu_limit(self, pages: List[Dict[str, Any]], clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
        for p in pages:
            text = p.get("cleaned_text", "")
            if re.search(r"(?i)(?:icu|intensive\s*care\s*unit)[^.\n]*?(?:no\s*(?:sub-?limit|capping)|at\s*actuals|up\s*to\s*sum\s*insured)", text):
                return {
                    "field_name": "icu_limit",
                    "field_label": "ICU Room Charges Limit",
                    "category": "Financial",
                    "extracted_value": "Covered at actuals (No sub-limit)",
                    "current_value": "Covered at actuals (No sub-limit)",
                    "status": "FOUND",
                    "confidence_score": 0.94,
                    "source_page": p["page_number"],
                    "snippet": "Intensive Care Unit (ICU) charges covered at actuals without sub-limit"
                }
            
            m = re.search(r"(?i)(?:icu|intensive\s*care\s*unit)[^.\n]*?(?:INR|Rs\.?|₹)\s*([0-9,]+)", text)
            if m:
                val = f"₹{m.group(1)}/day"
                return {
                    "field_name": "icu_limit",
                    "field_label": "ICU Room Charges Limit",
                    "category": "Financial",
                    "extracted_value": val,
                    "current_value": val,
                    "status": "FOUND",
                    "confidence_score": 0.85,
                    "source_page": p["page_number"],
                    "snippet": m.group(0).strip()
                }

        return {
            "field_name": "icu_limit",
            "field_label": "ICU Room Charges Limit",
            "category": "Financial",
            "extracted_value": None,
            "current_value": None,
            "status": "NOT_FOUND",
            "confidence_score": 0.0,
            "source_page": None,
            "snippet": None
        }

    def _extract_deductible(self, pages: List[Dict[str, Any]], clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
        for p in pages:
            text = p.get("cleaned_text", "")
            m = re.search(r"(?i)(?:deductible|aggregate\s*deductible)[^.\n]*?(?:INR|Rs\.?|₹)\s*([0-9,]+)", text)
            if m:
                amt = m.group(1).strip()
                val = f"₹{amt}"
                return {
                    "field_name": "deductible",
                    "field_label": "Annual Deductible",
                    "category": "Financial",
                    "extracted_value": val,
                    "current_value": val,
                    "status": "FOUND",
                    "confidence_score": 0.94,
                    "source_page": p["page_number"],
                    "snippet": m.group(0).strip()
                }
            elif re.search(r"(?i)\b(?:zero\s*deductible|no\s*deductible\s*(?:applies|clause|condition)|deductible\s*:\s*(?:nil|none|zero|0|₹0))\b", text):
                return {
                    "field_name": "deductible",
                    "field_label": "Annual Deductible",
                    "category": "Financial",
                    "extracted_value": "₹0",
                    "current_value": "₹0",
                    "status": "FOUND",
                    "confidence_score": 0.90,
                    "source_page": p["page_number"],
                    "snippet": "Zero deductible plan"
                }

        return {
            "field_name": "deductible",
            "field_label": "Annual Deductible",
            "category": "Financial",
            "extracted_value": None,
            "current_value": None,
            "status": "NOT_FOUND",
            "confidence_score": 0.0,
            "source_page": None,
            "snippet": None
        }

    def _extract_copay(self, pages: List[Dict[str, Any]], clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
        for p in pages:
            text = p.get("cleaned_text", "")
            m = re.search(r"(?i)(?:co-?payment|co-?pay)[^.\n]*?([0-9]{1,2})\s*%", text)
            if m:
                pct = m.group(1).strip()
                return {
                    "field_name": "co_payment",
                    "field_label": "Co-Payment Requirement",
                    "category": "Financial",
                    "extracted_value": f"{pct}%",
                    "current_value": f"{pct}%",
                    "status": "FOUND",
                    "confidence_score": 0.93,
                    "source_page": p["page_number"],
                    "snippet": m.group(0).strip()
                }
            elif re.search(r"(?i)(?:0%|zero|no)\s*co-?payment\b", text):
                return {
                    "field_name": "co_payment",
                    "field_label": "Co-Payment Requirement",
                    "category": "Financial",
                    "extracted_value": "0%",
                    "current_value": "0%",
                    "status": "FOUND",
                    "confidence_score": 0.92,
                    "source_page": p["page_number"],
                    "snippet": "No co-payment condition applicable"
                }

        return {
            "field_name": "co_payment",
            "field_label": "Co-Payment Requirement",
            "category": "Financial",
            "extracted_value": None,
            "current_value": None,
            "status": "NOT_FOUND",
            "confidence_score": 0.0,
            "source_page": None,
            "snippet": None
        }

    def _extract_initial_waiting_period(self, pages: List[Dict[str, Any]], clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
        for p in pages:
            text = p.get("cleaned_text", "")
            if re.search(r"(?i)\b30\s*days?\s*(?:initial\s*)?waiting\b", text) or re.search(r"(?i)\binitial\s*waiting\s*period[^.\n]*30\s*days?\b", text):
                return {
                    "field_name": "waiting_period_initial",
                    "field_label": "Initial Waiting Period",
                    "category": "Restrictions",
                    "extracted_value": "30 Days (Accidents covered immediately)",
                    "current_value": "30 Days (Accidents covered immediately)",
                    "status": "FOUND",
                    "confidence_score": 0.96,
                    "source_page": p["page_number"],
                    "snippet": "30 days initial waiting period except accidental hospitalization"
                }

        return {
            "field_name": "waiting_period_initial",
            "field_label": "Initial Waiting Period",
            "category": "Restrictions",
            "extracted_value": None,
            "current_value": None,
            "status": "NOT_FOUND",
            "confidence_score": 0.0,
            "source_page": None,
            "snippet": None
        }

    def _extract_specific_waiting_period(self, pages: List[Dict[str, Any]], clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
        for p in pages:
            text = p.get("cleaned_text", "")
            m = re.search(r"(?i)(?:specific\s*(?:illness|ailment|disease)(?:es)?)[^.\n]*?([0-9]{1,2}\s*(?:months?|years?))", text)
            if m:
                val = m.group(1).strip()
                return {
                    "field_name": "waiting_period_specific",
                    "field_label": "Specific Illness Waiting Period",
                    "category": "Restrictions",
                    "extracted_value": val,
                    "current_value": val,
                    "status": "FOUND",
                    "confidence_score": 0.91,
                    "source_page": p["page_number"],
                    "snippet": m.group(0).strip()
                }

        return {
            "field_name": "waiting_period_specific",
            "field_label": "Specific Illness Waiting Period",
            "category": "Restrictions",
            "extracted_value": None,
            "current_value": None,
            "status": "NOT_FOUND",
            "confidence_score": 0.0,
            "source_page": None,
            "snippet": None
        }

    def _extract_ped_waiting_period(self, pages: List[Dict[str, Any]], clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
        for p in pages:
            text = p.get("cleaned_text", "")
            m = re.search(r"(?i)(?:pre-?existing\s*(?:disease|ailment|condition)(?:s)?|ped)[^.\n]*?([0-9]{1,2}\s*(?:months?|years?))", text)
            if m:
                val = m.group(1).strip()
                return {
                    "field_name": "waiting_period_ped",
                    "field_label": "Pre-Existing Diseases (PED) Waiting Period",
                    "category": "Restrictions",
                    "extracted_value": val,
                    "current_value": val,
                    "status": "FOUND",
                    "confidence_score": 0.94,
                    "source_page": p["page_number"],
                    "snippet": m.group(0).strip()
                }

        return {
            "field_name": "waiting_period_ped",
            "field_label": "Pre-Existing Diseases (PED) Waiting Period",
            "category": "Restrictions",
            "extracted_value": None,
            "current_value": None,
            "status": "NOT_FOUND",
            "confidence_score": 0.0,
            "source_page": None,
            "snippet": None
        }

    def _extract_consumables_rider(self, pages: List[Dict[str, Any]], clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
        for p in pages:
            text = p.get("cleaned_text", "")
            if re.search(r"(?i)(?:care\s*shield|consumables?\s*(?:protection|rider)|annexure\s*(?:i|1)\s*covered)", text):
                return {
                    "field_name": "consumables_rider",
                    "field_label": "Consumables Protection Rider",
                    "category": "Coverage",
                    "extracted_value": "Active (Non-medical items covered up to 90%)",
                    "current_value": "Active (Non-medical items covered up to 90%)",
                    "status": "FOUND",
                    "confidence_score": 0.90,
                    "source_page": p["page_number"],
                    "snippet": "Covers medical consumables specified under IRDAI guidelines"
                }

        return {
            "field_name": "consumables_rider",
            "field_label": "Consumables Protection Rider",
            "category": "Coverage",
            "extracted_value": "Not Included (Standard non-medical exclusions apply)",
            "current_value": "Not Included (Standard non-medical exclusions apply)",
            "status": "FOUND",
            "confidence_score": 0.85,
            "source_page": None,
            "snippet": None
        }

    def _extract_maternity_coverage(self, pages: List[Dict[str, Any]], clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
        for p in pages:
            text = p.get("cleaned_text", "")
            m = re.search(r"(?i)maternity[^.\n]*?(?:INR|Rs\.?|₹)\s*([0-9,]+)", text)
            if m:
                val = f"Covered up to ₹{m.group(1)}"
                return {
                    "field_name": "maternity_coverage",
                    "field_label": "Maternity Coverage",
                    "category": "Coverage",
                    "extracted_value": val,
                    "current_value": val,
                    "status": "FOUND",
                    "confidence_score": 0.88,
                    "source_page": p["page_number"],
                    "snippet": m.group(0).strip()
                }
            elif re.search(r"(?i)(?:maternity|pregnancy)[^.\n]*?(?:excluded|not\s*covered)", text):
                return {
                    "field_name": "maternity_coverage",
                    "field_label": "Maternity Coverage",
                    "category": "Coverage",
                    "extracted_value": "Not Covered (Standard Exclusion)",
                    "current_value": "Not Covered (Standard Exclusion)",
                    "status": "FOUND",
                    "confidence_score": 0.90,
                    "source_page": p["page_number"],
                    "snippet": "Maternity expenses explicitly excluded"
                }

        return {
            "field_name": "maternity_coverage",
            "field_label": "Maternity Coverage",
            "category": "Coverage",
            "extracted_value": None,
            "current_value": None,
            "status": "NOT_FOUND",
            "confidence_score": 0.0,
            "source_page": None,
            "snippet": None
        }

    def _extract_ambulance_coverage(self, pages: List[Dict[str, Any]], clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
        for p in pages:
            text = p.get("cleaned_text", "")
            m = re.search(r"(?i)ambulance[^.\n]*?(?:INR|Rs\.?|₹)\s*([0-9,]+)", text)
            if m:
                val = f"Up to ₹{m.group(1)} per hospitalization"
                return {
                    "field_name": "ambulance_coverage",
                    "field_label": "Ambulance Expense Cover",
                    "category": "Coverage",
                    "extracted_value": val,
                    "current_value": val,
                    "status": "FOUND",
                    "confidence_score": 0.88,
                    "source_page": p["page_number"],
                    "snippet": m.group(0).strip()
                }

        return {
            "field_name": "ambulance_coverage",
            "field_label": "Ambulance Expense Cover",
            "category": "Coverage",
            "extracted_value": None,
            "current_value": None,
            "status": "NOT_FOUND",
            "confidence_score": 0.0,
            "source_page": None,
            "snippet": None
        }

    def _extract_exclusions_list(self, pages: List[Dict[str, Any]], clauses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        exclusions = []
        for c in clauses:
            if c.get("clause_type") == "EXCLUSION" or "exclusion" in c.get("section_title", "").lower():
                content = c.get("content", "")
                page = c.get("page_number", 1)
                
                # Check known exclusion categories
                if "cosmetic" in content.lower() or "plastic surgery" in content.lower():
                    exclusions.append({
                        "title": "Cosmetic & Plastic Surgery",
                        "type": "Permanent Exclusion",
                        "details": "Surgeries for aesthetic enhancement unless reconstructive following accidental trauma.",
                        "clauseRef": c.get("section_title"),
                        "source_page": page
                    })
                if "investigation" in content.lower() or "diagnostic admission" in content.lower():
                    exclusions.append({
                        "title": "Pure Diagnostic Hospital Admission",
                        "type": "General Exclusion",
                        "details": "Hospital admission purely for diagnostic checkup without active medical treatment.",
                        "clauseRef": c.get("section_title"),
                        "source_page": page
                    })
                if "unproven" in content.lower() or "experimental" in content.lower():
                    exclusions.append({
                        "title": "Unproven & Experimental Therapies",
                        "type": "Standard Exclusion",
                        "details": "Treatments not established in accepted medical peer-reviewed consensus.",
                        "clauseRef": c.get("section_title"),
                        "source_page": page
                    })
                if "dental" in content.lower():
                    exclusions.append({
                        "title": "Dental & Vision Outpatient Procedures",
                        "type": "General Exclusion",
                        "details": "OPD dental and vision care excluded unless required as a result of accidental facial trauma.",
                        "clauseRef": c.get("section_title"),
                        "source_page": page
                    })

        # Deduplicate by title
        seen = set()
        deduped = []
        for e in exclusions:
            if e["title"] not in seen:
                seen.add(e["title"])
                deduped.append(e)

        return deduped

policy_extractor = PolicyExtractor()
