# MediSure AI — Backend Document Processing Engine (Step 2)

MediSure AI's document processing backend extracts, cleans, classifies, and structures complex Indian medical insurance policy schedules and policy wordings into a standardized, reviewable policy profile.

---

## 1. Architecture Overview

```text
User uploads Insurance Policy PDF
               │
               ▼
   [ FastAPI Upload Endpoint ]
               │
         Validate File
  (Magic bytes %PDF-, MIME, size)
               │
      Store User-Isolated
    (uploads/user_{user_id}/)
               │
     [ PDF Service: PyMuPDF ]
  (Detect digital vs scanned pages)
               │
      Scanned Page Detection
         ├─ Scanned: Tesseract OCR (if installed)
         │           Else: OCR_UNAVAILABLE status
         └─ Digital: High-fidelity text & rect bounds
               │
      [ Text Cleaner Service ]
  (Dehyphenate, clean headers/footers,
    reconstruct paragraphs & layout)
               │
     [ Section Parser Service ]
  (Identify IRDAI clauses & page tags:
   COVERAGE, ROOM_RENT, ICU, WAITING_PERIOD,
   EXCLUSION, DEDUCTIBLE, COPAY, etc.)
               │
    [ Policy Extractor Service ]
  (Deterministic rule-based extraction:
   Sum Insured, Deductible, Co-pay, Room Rent,
   Waiting periods, with confidence scores)
               │
       [ PostgreSQL / SQLite ]
  (User, Policy, PolicyClause, PolicyTerm)
               │
               ▼
[ Interactive UI with Manual Verification & Citations ]
```

---

## 2. Technology Stack

* **Framework:** FastAPI (Python 3.14 / 3.11+)
* **Database:** SQLAlchemy 2.0 with PostgreSQL (`psycopg[binary]`) and zero-config SQLite fallback (`sqlite:///./medisure.db`)
* **Data Schemas:** Pydantic V2 (`BaseModel`, `ConfigDict`)
* **PDF Extraction:** PyMuPDF (`fitz`) 1.28.2
* **OCR Support:** Tesseract via `pytesseract` and `Pillow` (graceful fallback if Tesseract binary is not installed)
* **Multipart Handling:** `python-multipart`
* **Test Suite:** `pytest`, `httpx`

---

## 3. Directory Layout

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app entry point & CORS
│   ├── config.py                # Environment configuration (Pydantic Settings)
│   ├── database.py              # Engine, session, SQLite fallback & initial seeding
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py              # User model
│   │   ├── policy.py            # Policy metadata, upload & status tracking
│   │   ├── policy_clause.py     # Extracted sections with page numbers
│   │   └── policy_term.py       # Key extracted insurance terms with confidence
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── policy.py            # Policy summaries, clauses, & terms DTOs
│   │   └── analysis.py          # Structured analysis response schemas
│   ├── routes/
│   │   ├── __init__.py
│   │   └── policies.py          # /api/policies upload, list, status, analysis, patch
│   ├── services/
│   │   ├── __init__.py
│   │   ├── pdf_service.py       # PyMuPDF page-by-page extraction & scan detection
│   │   ├── ocr_service.py       # Tesseract OCR engine & graceful degradation
│   │   ├── text_cleaner.py      # Artifact stripping, dehyphenation & paragraphing
│   │   ├── section_parser.py    # Clause taxonomy classifier & page attribution
│   │   └── policy_extractor.py  # Rule-based terms extractor with confidence scoring
│   └── utils/
│       ├── __init__.py
│       ├── file_validation.py   # PDF magic byte checking & size enforcement
│       └── security.py          # Filename sanitization
├── demo_policies/
│   ├── MediSure_Demo_Health_Policy.pdf
│   ├── MediSure_Scanned_Demo_Policy.pdf
│   └── MediSure_Missing_Fields_Policy.pdf
├── tests/
│   ├── __init__.py
│   └── test_extraction.py       # End-to-end integration test suite
├── uploads/                     # User-isolated PDF storage
├── generate_demo_policy.py      # Synthetic PDF test fixture generator
├── requirements.txt
└── .env.example
```

---

## 4. Environment Variables (`.env`)

Copy `.env.example` to `.env`:

```bash
cp backend/.env.example backend/.env
```

Key configuration options:

```ini
# Application Mode
DEBUG=True
ENVIRONMENT=development

# Database Connection (PostgreSQL or SQLite)
DATABASE_URL=sqlite:///./medisure.db
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medisure_db

# Upload Configuration
MAX_UPLOAD_SIZE_MB=25

# Tesseract OCR Path (Optional on Windows)
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
```

---

## 5. Setup & Running the Backend

### Create and Activate Virtual Environment

```powershell
python -m venv backend/venv
backend\venv\Scripts\activate
```

### Install Dependencies

```powershell
pip install -r backend/requirements.txt
```

### Run Server

```powershell
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

Interactive OpenAPI documentation is available at: `http://127.0.0.1:8000/docs`

---

## 6. Running Tests

Run the automated test suite verifying digital PDF extraction, scanned PDF detection, missing field handling, API upload flow, and manual term corrections:

```powershell
backend\venv\Scripts\python.exe -m pytest backend/tests/test_extraction.py -v
```

---

## 7. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, database connection & OCR availability |
| `POST` | `/api/policies/upload` | Upload PDF policy schedule (`multipart/form-data`) |
| `GET` | `/api/policies` | List all processed policies for current user |
| `GET` | `/api/policies/{id}` | Get policy summary metadata |
| `GET` | `/api/policies/{id}/status` | Poll asynchronous ingestion status (`UPLOADED`, `PROCESSING`, `COMPLETED`, `FAILED`) |
| `GET` | `/api/policies/{id}/clauses` | Retrieve all extracted clauses preserving page boundaries |
| `GET` | `/api/policies/{id}/analysis` | Complete structured analysis profile for frontend tabs |
| `PATCH` | `/api/policies/{id}/terms/{term_id}` | Manually update/verify an extracted term |
| `DELETE` | `/api/policies/{id}` | Delete policy document and all extracted terms/clauses |
