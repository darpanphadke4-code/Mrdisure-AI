# MediSure AI — AI Medical Insurance Analyzer (Frontend Prototype)

MediSure AI is a modern healthcare-fintech frontend platform engineered to help policyholders understand complex health insurance terms, extract critical clauses, and accurately estimate out-of-pocket hospital expenses before or after hospital admissions.

---

## 🏥 Design Philosophy & Theme

MediSure AI avoids generic AI dashboards and flashy neon aesthetics in favor of a trustworthy, sophisticated clinical-fintech visual identity:

* **Warm Off-White (`#F7F8F5`)**: Softer than stark white, comfortable for reading long policy documents.
* **Deep Forest Green (`#174C3C`)**: Conveys stability, insurance authority, and security.
* **Muted Sage (`#8AA99A`)**: Soft supportive accents and category highlights.
* **Soft Teal (`#DCEBE4`)**: Calm background fills and active status pills.
* **Dark Charcoal (`#202B27`)**: High-contrast, legible typography for numbers and clinical text.
* **Light Gray (`#E8ECE8`)**: Subtle dividers and border definitions.
* **Typography**: **DM Sans** for headings and **Inter** for clinical data and calculation tables.

---

## 🚀 Key Features Implemented

### 1. Premium Landing Page (`/`)
* **Responsive Navigation**: Logo, navigation links, demo sign-in trigger, and quick app launcher.
* **High-Impact Hero**: Direct product preview showing live policy limits, room rent warnings, and surgery settlement splits.
* **6-Pillar Feature Grid**: AI Policy Analysis, Intelligent Assistant, Out-of-Pocket Estimator, Coverage/Exclusions, Personalized Analysis, Downloadable Reports.
* **Visual 3-Step Workflow**: Upload policy $\to$ Let AI analyze $\to$ Ask questions & estimate.
* **Interactive FAQ Accordion**: Explaining room rent proportionate deductions, IRDAI non-medical consumables, waiting periods, and data safety.
* **Professional Footer**: Trust notices, regulatory insurance advisory disclaimers, and platform links.

### 2. Dashboard (`/app/dashboard`)
* **Personalized Welcome**: Dynamic greeting based on time of day with sample user profile.
* **Summary KPI Cards**: Total Policies, Active Combined Coverage (₹Lakhs), Analyses Completed, Estimated Expenses Analyzed.
* **Policy Overview Cards**: Visual utilization progress bars, renewal dates, sum insured, and direct action buttons.
* **Quick Actions**: One-click shortcuts to upload, ask the assistant, estimate expenses, or view reports.
* **Interactive Visualizations (Recharts)**: Illustrative claim payout vs out-of-pocket patient share across medical categories (Surgery, Room, Consultations, Consumables).
* **Audit Activity Timeline**: Timestamped audit trail of policy extractions, estimates, and inquiries.

### 3. Policy Management (`/app/policies`)
* **Search & Multi-Filters**: Filter by insurance provider (Care Health, Star Health, HDFC ERGO) or status (Active, Pending), and sort by date or sum insured.
* **Grid & List Views**: Flexible display toggles.
* **Policy Upload Modal**:
  * Drag-and-drop PDF dropzone with size validation ($\le 25\text{ MB}$).
  * Realistic multi-stage simulated progress (Uploading $\to$ OCR clause extraction $\to$ Ingestion).
  * Editable demo parameters for instant simulation.
  * LocalStorage persistence.
* **Confirmation Dialogs**: Protection against accidental policy deletion.

### 4. Policy Details & Document Viewer (`/app/policies/:policyId`)
* **Two-Panel Workspace**:
  * **Left Panel**: Document viewer representation with page navigation, zoom controls (75%–160%), in-document search, and clause highlighting.
  * **Right Panel**: Comprehensive 5-tab analysis:
    1. *Overview*: Sum insured, deductibles, co-pays, room categories.
    2. *Coverage*: In-patient, daycare, ICU limits, pre/post hospitalization.
    3. *Exclusions*: Standard exclusions, non-covered treatments, 30-day/24-month/36-month waiting periods.
    4. *Limits & Conditions*: Room rent daily caps, voluntary deductibles, unverified status indicators.
    5. *Key Clauses*: Direct quote snippets with a *"View in Document"* button that automatically jumps to the page and highlights the clause in the left panel.

### 5. AI Insurance Assistant (`/app/assistant`)
* **Research Assistant Layout**:
  * Left session history with new session and clear conversation options.
  * Central message stream with user & assistant bubbles, timestamps, and typing animation.
  * Right-side policy context drawer displaying active policy rules.
* **Grounded Clause Citations**: Assistant answers cite exact policy sections, page numbers, and quote snippets.
* **Expandable Technical Explanations**: Deep dives into why certain deductions apply.
* **One-Click Estimator Transfer**: Assistant responses detect procedure inquiries and offer a button to transfer suggested deduction limits directly into the Cost Estimator.
* **Interactive Prompt Chips**: Quick-start questions ("What does my policy cover?", "Does it cover surgery?", "Explain waiting periods", "Estimate hospital bill").

### 6. Out-of-Pocket Cost Estimator (`/app/calculator`)
* **5-Step Guided Wizard**:
  * *Step 1 (Select Policy)*: Choose policy to auto-load deduction rules.
  * *Step 2 (Patient Information)*: Patient name/age, diagnosis, treating hospital, admission dates, care tier.
  * *Step 3 (Medical Expenses)*: Itemized bill management across 8 clinical categories with quantity/days and unit rate. Includes 3 pre-built hospital templates (*Laparoscopic Gallbladder Surgery*, *Total Knee Replacement*, *Pediatric Dengue HDU*).
  * *Step 4 (Policy Conditions)*: Editable daily room rent caps, actual room charges, deductibles, and co-payment percentages.
  * *Step 5 (Visual Results Dashboard)*:
    * Executive metrics (Gross Billed, Estimated Insurer Payout, Patient Out-of-Pocket).
    * Settlement Waterfall breakdown chart.
    * Itemized deduction audit table with exact reasoning (e.g. non-payable consumables under IRDAI list, room rent proportionate cuts).
    * Applied policy rules accordion.
    * Print / PDF export and report saving.

### 7. Analysis Reports (`/app/reports`)
* **Report Ledger**: Search, filter by status, sort by date or billed amount.
* **Detailed Preview Modal**: Complete patient case review, settlement breakdown, and disclaimer.
* **Client-Side Print / PDF Export**: Clean, printable HTML report formatted for insurance claim audits.

### 8. Settings & Privacy (`/app/settings`)
* **User Profile**: Configurable name, email, avatar, and contact info.
* **Preferences**: Currency switcher (INR ₹ / USD $), date formats, simulated claim reminder toggles.
* **Privacy & Local Storage**: Transparent explanation of browser storage and a **"Reset All Demo Data"** action.
* **About & Roadmap**: Architecture summary and FastAPI/PostgreSQL roadmap.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Framework | **React 19** with **Vite 8** |
| Language | **JavaScript (ES Modules)** |
| Styling | **Tailwind CSS v3** with custom healthcare palette |
| Routing | **React Router v7** |
| Icons | **Lucide React** |
| Visualizations | **Recharts v3** |
| Toast Notifications | **React Hot Toast** |
| Animations | **Framer Motion** |

---

## 📂 Modular Project Structure

```text
src/
├── assets/
├── components/
│   ├── calculator/
│   │   ├── ExpenseEntryStep.jsx
│   │   ├── ResultsStep.jsx
│   │   └── WaterfallChart.jsx
│   ├── chat/
│   │   ├── ChatHistorySidebar.jsx
│   │   ├── ChatInput.jsx
│   │   ├── ChatMessage.jsx
│   │   ├── ChatSuggestions.jsx
│   │   └── PolicyContextPanel.jsx
│   ├── common/
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── EmptyState.jsx
│   │   └── Modal.jsx
│   ├── dashboard/
│   │   ├── ActivityTimeline.jsx
│   │   ├── CoverageChart.jsx
│   │   ├── PolicySummaryCard.jsx
│   │   ├── QuickActions.jsx
│   │   └── StatCard.jsx
│   ├── layout/
│   │   ├── AppHeader.jsx
│   │   ├── AppLayout.jsx
│   │   ├── AppSidebar.jsx
│   │   ├── Footer.jsx
│   │   └── Navbar.jsx
│   ├── policies/
│   │   ├── PolicyCard.jsx
│   │   ├── PolicyClausesTab.jsx
│   │   ├── PolicyCoverageTab.jsx
│   │   ├── PolicyExclusionsTab.jsx
│   │   ├── PolicyLimitsTab.jsx
│   │   ├── PolicyOverviewTab.jsx
│   │   ├── PolicyUploadModal.jsx
│   │   └── PolicyViewer.jsx
│   └── reports/
│       ├── ReportCard.jsx
│       └── ReportModal.jsx
├── context/
│   └── PolicyContext.jsx
├── data/
│   ├── mockChat.js
│   ├── mockExpenses.js
│   ├── mockPolicies.js
│   ├── mockReports.js
│   └── mockUser.js
├── hooks/
│   ├── useLocalStorage.js
│   └── usePolicyContext.js
├── pages/
│   ├── AssistantPage.jsx
│   ├── CostEstimatorPage.jsx
│   ├── DashboardPage.jsx
│   ├── LandingPage.jsx
│   ├── PoliciesPage.jsx
│   ├── PolicyDetailsPage.jsx
│   ├── ReportsPage.jsx
│   └── SettingsPage.jsx
├── services/
│   ├── authService.js
│   ├── calculatorService.js
│   ├── chatService.js
│   ├── policyService.js
│   └── reportService.js
├── utils/
│   ├── calculationEngine.js
│   └── formatters.js
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 3. Production Build
```bash
npm run build
```
Verify the production build preview:
```bash
npm run preview
```

---

## 🔌 Future Backend & AI Integration Plan

The frontend is structured with clear service abstractions (`services/`) so that real APIs can be integrated without modifying UI components:

| Service | Current Mock Implementation | Future Backend Integration |
|---|---|---|
| `policyService.js` | Simulated OCR upload & localStorage | `POST /api/v1/policies/upload` (FastAPI + PyMuPDF / Tesseract OCR / Claude Doc API) |
| `chatService.js` | Keyword template matcher with citations | `POST /api/v1/chat/inquire` (RAG Agent over vector embeddings in pgvector) |
| `calculatorService.js` | Pure JS mathematical underwriting engine | `POST /api/v1/claims/estimate` (FastAPI insurance business rules validator) |
| `reportService.js` | Browser HTML print generation | `POST /api/v1/reports/pdf` (WeasyPrint / ReportLab PDF generation) |
| `authService.js` | Simulated profile in localStorage | `POST /api/v1/auth/login` (JWT / OAuth2 / Supabase Auth) |
