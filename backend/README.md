# MediSure AI — Backend Engine (Step 2 & Step 3)

MediSure AI is an AI-powered medical insurance policy analyzer and assistant. It extracts, cleans, classifies, and structures complex Indian health insurance policies, indexes them into a local vector database, and enables conversational question answering grounded in policy clauses with page citations.

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
      [ Background Indexing ]
  (Chunk clauses -> nomic-embed-text via Ollama -> ChromaDB)
               │
       [ Local RAG Chat Engine ]
  (Strict policy-isolated retrieval -> Qwen3 LLM -> Citations)
               │
               ▼
[ Interactive UI with Policy Viewer & Grounded AI Assistant ]
```

---

## 2. Technology Stack

* **Framework:** FastAPI (Python 3.14 / 3.11+)
* **Database:** SQLAlchemy 2.0 with PostgreSQL (`psycopg[binary]`) and zero-config SQLite fallback (`sqlite:///./medisure.db`)
* **Local Embeddings:** Ollama `nomic-embed-text` (768 dimensions)
* **Local LLM:** Ollama `qwen3:4b` (temperature=0.1, low latency, reasoning cleanup)
* **Vector Store:** ChromaDB (`PersistentClient` at `./data/chroma`, cosine distance, metadata filtering)
* **PDF Extraction:** PyMuPDF (`pymupdf`/`fitz` 1.28.2)
* **OCR Support:** Tesseract via `pytesseract` and `Pillow` (graceful fallback if Tesseract is not installed)
* **Data Schemas:** Pydantic V2 (`BaseModel`, `ConfigDict`)
* **Test Suite:** `pytest` (19 passing unit & integration tests)

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
│   │   ├── policy_term.py       # Key extracted insurance terms with confidence
│   │   ├── policy_chunk.py      # Semantic RAG chunks with hash & page metadata
│   │   ├── chat_session.py      # Multi-turn conversational chat sessions
│   │   └── chat_message.py      # User and assistant messages with citations JSON
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── policy.py            # Policy summaries, clauses, & terms DTOs
│   │   ├── analysis.py          # Structured analysis response schemas
│   │   └── chat.py              # ChatRequest, ChatResponseData, CitationItem, AIHealthDTO
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── policies.py          # /api/policies upload, list, status, analysis, indexing
│   │   └── chat.py              # /api/chat, /api/chat/sessions, /api/ai/health
│   ├── prompts/
│   │   └── policy_qa.txt        # Grounded system prompt preventing hallucinations
│   ├── services/
│   │   ├── __init__.py
│   │   ├── pdf_service.py       # PyMuPDF page-by-page extraction & scan detection
│   │   ├── ocr_service.py       # Tesseract OCR engine & graceful degradation
│   │   ├── text_cleaner.py      # Artifact stripping, dehyphenation & paragraphing
│   │   ├── section_parser.py    # Clause taxonomy classifier & page attribution
│   │   ├── policy_extractor.py  # Rule-based terms extractor with confidence scoring
│   │   ├── chunking_service.py  # Clause chunking with sentence overlap
│   │   ├── embedding_service.py # Ollama nomic-embed-text client
│   │   ├── vector_store.py      # ChromaDB persistent collection with policy isolation
│   │   ├── retrieval_service.py # Cosine similarity retrieval with min relevance filter
│   │   ├── llm_service.py       # Ollama Qwen3 client with think-tag stripping
│   │   ├── rag_service.py       # Context assembly, grounded QA prompt, citations
│   │   └── indexing_service.py  # Orchestrates clause chunking, embedding, vector upsert
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
│   ├── test_extraction.py       # 6 Step 2 extraction tests
│   └── test_rag.py              # 13 Step 3 RAG tests (isolation, citations, auth)
├── requirements.txt
└── README.md
```

---

## 4. Setup & Running Locally

### Step 1: Ensure Ollama is Running with Required Models

```powershell
ollama pull qwen3:4b
ollama pull nomic-embed-text
ollama serve
```

Verify models are available:
```powershell
ollama list
```

### Step 2: Configure Environment Variables

Create `backend/.env` (or copy from `backend/.env.example`):

```ini
APP_ENV=development
APP_SECRET_KEY=medisure-ai-secret-key-super-secure-change-in-prod
DATABASE_URL=sqlite:///./medisure.db
UPLOAD_DIR=./uploads
CHROMA_PERSIST_DIRECTORY=./data/chroma
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_LLM_MODEL=qwen3:4b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
RAG_TOP_K=5
RAG_MIN_RELEVANCE=0.30
```

### Step 3: Install Python Dependencies

```powershell
backend\venv\Scripts\pip install -r backend/requirements.txt
```

### Step 4: Run FastAPI Server

```powershell
backend\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

Interactive OpenAPI documentation is available at: `http://127.0.0.1:8000/docs`

---

## 5. Running Automated Tests

Run the full automated test suite (19 tests covering extraction, scanned PDF handling, chunking, embeddings, vector indexing, policy isolation, citations, Ollama error handling, and authorization):

```powershell
backend\venv\Scripts\python.exe -m pytest backend/tests -v
```

---

## 6. API Endpoints Reference

### AI & Assistant (Step 3)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/ai/health` | Check local Ollama availability, active models, and base URL |
| `POST` | `/api/chat` | Ask policy-scoped question; returns grounded answer & citations |
| `GET` | `/api/chat/sessions` | List chat sessions for the authenticated user |
| `GET` | `/api/chat/sessions/{id}` | Retrieve chat session with message history and citations |
| `POST` | `/api/policies/{id}/index` | Trigger semantic chunking and ChromaDB vector indexing |
| `GET` | `/api/policies/{id}/index-status` | Check chunk count, vector count, and `INDEXED` status |

### Document Processing & Policies (Step 2)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check (database, OCR availability) |
| `POST` | `/api/policies/upload` | Upload PDF policy schedule; auto-indexes in background |
| `GET` | `/api/policies` | List all processed policies for current user |
| `GET` | `/api/policies/{id}` | Get policy summary metadata |
| `GET` | `/api/policies/{id}/status` | Poll ingestion status (`UPLOADED`, `PROCESSING`, `COMPLETED`, `FAILED`) |
| `GET` | `/api/policies/{id}/clauses` | Retrieve all extracted clauses preserving page boundaries |
| `GET` | `/api/policies/{id}/analysis` | Complete structured analysis profile for frontend tabs |
| `PATCH` | `/api/policies/{id}/terms/{term_id}` | Manually update/verify an extracted term |
| `DELETE` | `/api/policies/{id}` | Delete policy document, ChromaDB vectors, and extracted terms |

---

## 7. Local RAG Security & Grounding Principles

1. **Strict Policy Isolation**: ChromaDB vector retrieval queries strictly filter by `{"policy_id": {"$eq": policy_id}}`. Cross-policy data leakage is impossible.
2. **Citation Accuracy**: Answers include page number and clause section citations (`[Page X · Section]`). Clicking citations in the UI immediately navigates the Document Viewer to the exact page and highlights the clause.
3. **Hallucination Prevention**: If a question cannot be answered from retrieved policy chunks, the system strictly outputs: *"The available policy information does not establish the answer to your question."*
4. **No External Paid APIs**: The entire AI pipeline runs 100% locally on Ollama (`qwen3:4b` + `nomic-embed-text`) with zero API keys or third-party dependencies required.
