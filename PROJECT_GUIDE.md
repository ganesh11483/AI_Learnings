# Medical Coding & Claims Automation System - Complete Project Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Data Models](#data-models)
6. [Complete Workflow](#complete-workflow)
7. [Claims Processing Pipeline](#claims-processing-pipeline)
8. [RAG & LLM Integration](#rag--llm-integration)
9. [API Endpoints](#api-endpoints)
10. [Key Features](#key-features)

---

## Project Overview

### What is this system?

This is an **AI-powered Medical Coding and Claims Automation System** designed to:

- **Automate medical coding** of clinical documents using AI/LLM
- **Process insurance claims** with AI validation and fraud detection
- **Extract medical entities** (diagnoses, procedures, medications) from documents
- **Perform semantic search** on medical documents using vector embeddings
- **Calculate compliance metrics** (AI accuracy, human review accuracy, SLA adherence)
- **Provide real-time dashboards** for operational insights

### Key Problems It Solves

| Problem | Solution |
|---------|----------|
| Manual medical coding is slow | AI suggests ICD-10, CPT codes automatically |
| High denial rates | LLM validates claims before submission |
| Inability to find similar cases | Vector embeddings enable semantic search |
| Compliance tracking is manual | Automated metrics & audit trails |
| Claims get lost in processing | Real-time status tracking & dashboards |

---

## Architecture

### High-Level Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  Login → Dashboard → Documents → Claims → Patients → Audit      │
│         (Port 5173)                                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP/JSON
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (Python)                       │
│                     (Port 8000)                                 │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────┐             │
│  │ API Routes  │  │ Services   │  │ Validations  │             │
│  │ /claims     │  │ LLM        │  │ Compliance   │             │
│  │ /documents  │  │ Extraction │  │ Fraud Check  │             │
│  │ /patients   │  │ Document   │  │              │             │
│  │ /metrics    │  │ Claim      │  │              │             │
│  └─────────────┘  └────────────┘  └──────────────┘             │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
               │ SQL ORM                      │ API Calls
               ▼                              ▼
┌──────────────────────────┐      ┌──────────────────────────────┐
│   PostgreSQL Database    │      │   Azure OpenAI (LLM)         │
│   (pgvector extension)   │      │   - GPT-4/3.5 Turbo          │
│                          │      │   - text-embedding-3-small   │
│  Tables:                 │      │   - Code suggestions          │
│  - patients              │      │   - Entity extraction         │
│  - claims                │      │   - Claim validation          │
│  - documents             │      │   - Fraud detection           │
│  - medical_codes         │      └──────────────────────────────┘
│  - embeddings (pgvector) │
│  - metrics               │
│  - users                 │
└──────────────────────────┘
```

### Complete Data Flow: React → FastAPI → PostgreSQL → LLM

#### Flow 1: Document Upload & Medical Coding

```
┌─────────────┐
│ User Uploads│
│  Document   │
│ (PDF/DOCX)  │
└──────┬──────┘
       │ POST /documents/upload
       ▼
┌──────────────────────────────┐
│  FastAPI Document Handler    │
│ - Save file                  │
│ - Extract text (PDF/DOCX)    │
│ - Store in Document table    │
└──────┬───────────────────────┘
       │ document_id, raw_text
       ▼
┌──────────────────────────────┐
│  Extraction Pipeline         │
│ 1. Generate embedding        │ ─────┐
│    (OpenAI API)              │      │
│ 2. Store in pgvector         │      │
│ 3. Extract entities (LLM)    │      │
│    - Diagnoses               │      │
│    - Procedures              │      │
│    - Medications             │      │
│ 4. Store ExtractedEntity     │      │
│    records                   │      │
└──────┬───────────────────────┘      │
       │ entities[], embeddings       │
       ▼                              │
┌──────────────────────────────┐      │
│  Entity-to-Code Mapping      │      │
│ For each entity:             │      │
│ 1. Suggest codes (LLM)       │      │
│    - ICD-10 for diagnoses    │      │
│    - CPT for procedures      │      │
│ 2. Return with confidence    │      │
│ 3. Store MedicalCode records │      │
└──────┬───────────────────────┘      │
       │ suggested_codes[]            │
       ▼                              │
┌──────────────────────────────┐      │
│  AI Automation Metrics       │◄─────┘
│ Track:                       │
│ - Codes suggested: 15        │
│ - Confidence: 0.85           │
│ - Auto-coding rate: 66.7%    │
│ - Store in                   │
│   AIAutomationMetrics table  │
└──────────────────────────────┘
```

#### Flow 2: Claims Processing & Validation

```
┌────────────┐
│   User     │
│   Creates  │
│   Claim    │
└──────┬─────┘
       │ POST /claims
       ▼
┌──────────────────────────────┐
│  Create Claim (DRAFT status) │
│ - Link to patient            │
│ - Set insurance provider     │
│ - Set policy number          │
└──────┬───────────────────────┘
       │ claim_id
       ▼
┌──────────────────────────────┐
│  Add Claim Items             │
│ - Link medical codes         │
│ - Set service dates          │
│ - Set amounts                │
└──────┬───────────────────────┘
       │ claim_items[]
       ▼
┌──────────────────────────────┐
│  LLM Claim Validation        │
│ Validate:                    │
│ 1. Code appropriateness      │ ◄─── Prompt to GPT-4
│ 2. Amount reasonableness     │
│ 3. Policy compliance         │
│ 4. Duplicate detection       │
│ 5. Fraud patterns            │
└──────┬───────────────────────┘
       │ validation_results
       ▼
┌──────────────────────────────┐
│  Store Validations           │
│ - Validation type            │
│ - Is valid (bool)            │
│ - Error message (if any)     │
│ - Severity                   │
└──────┬───────────────────────┘
       │
       ├─ If valid ────────────────┐
       │                            ▼
       │                ┌──────────────────────────┐
       │                │  Approve Claim           │
       │                │ Update status: APPROVED  │
       │                │ Set processing_date      │
       │                │ Track metrics            │
       │                └──────────────────────────┘
       │
       └─ If invalid ──────────────┐
                                   ▼
                     ┌──────────────────────────┐
                     │  Reject Claim            │
                     │ Update status: REJECTED  │
                     │ Store error messages     │
                     │ Alert user               │
                     └──────────────────────────┘
```

#### Flow 3: Semantic Search (RAG Pattern)

```
┌─────────────────────┐
│  User searches for  │
│  "Heart conditions" │
└────────┬────────────┘
         │ GET /documents/search?q=Heart conditions
         ▼
┌───────────────────────────────┐
│  Semantic Search              │
│ 1. Generate query embedding   │ ◄─── OpenAI API
│    (text-embedding-3-small)   │
│ 2. Search pgvector with       │
│    similarity function        │
│ 3. Return top 5 matches       │
│    with similarity scores     │
└────────┬──────────────────────┘
         │ matched_documents[]
         ▼
┌───────────────────────────────┐
│  Return Results               │
│ - Document content            │
│ - Entity matches              │
│ - Similarity (0.0-1.0)        │
│ - Link to patient             │
└───────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18 + Vite (fast build tool)
- **State Management**: TanStack React Query (data fetching, caching)
- **Styling**: Tailwind CSS + PostCSS
- **Testing**: Vitest
- **API Communication**: Axios (custom api.js service)
- **Routing**: React Router v6

### Backend
- **Framework**: FastAPI (Python async web framework)
- **Database ORM**: SQLAlchemy with async support
- **Database**: PostgreSQL (with pgvector extension for embeddings)
- **Migrations**: Alembic
- **Authentication**: JWT (PyJWT)
- **LLM/AI**: Azure OpenAI API (GPT-4, GPT-3.5 Turbo, text-embedding-3-small)
- **Vector Database**: pgvector (PostgreSQL native extension)
- **Document Processing**: PyPDF2, python-docx
- **Validation**: Pydantic v2

### Deployment
- **Frontend**: Docker (Nginx)
- **Backend**: Docker (Python with uvicorn)
- **Database**: PostgreSQL with pgvector
- **Cloud**: Azure (OpenAI, potential App Service/AKS)

---

## Folder Structure

### Backend (`/backend`)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app setup, CORS, routing
│   ├── api/
│   │   ├── api.py              # Main router combining all endpoints
│   │   ├── auth.py             # Login, token generation
│   │   ├── claims.py           # Create, update, validate claims
│   │   ├── documents.py        # Upload, process documents
│   │   ├── patients.py         # Patient CRUD operations
│   │   ├── metrics.py          # Retrieve dashboards metrics
│   │   └── mcp.py              # Claude MCP (Model Context Protocol)
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── user.py             # User account model
│   │   ├── patient.py          # Patient demographics
│   │   ├── claim.py            # Claim + ClaimItem + ClaimValidation
│   │   ├── document.py         # Uploaded medical documents
│   │   ├── medical_code.py     # ICD-10, CPT, HCPCS codes
│   │   ├── entity.py           # Extracted entities (diagnoses, procedures)
│   │   ├── embedding.py        # Vector embeddings (pgvector)
│   │   ├── metrics.py          # Audit, claims, AI, operational, revenue metrics
│   │   └── audit_log.py        # Action audit trail
│   ├── schemas/                # Pydantic request/response models
│   │   ├── user.py
│   │   ├── claim.py
│   │   ├── document.py
│   │   ├── entity.py
│   │   └── patient.py
│   ├── services/               # Business logic layer
│   │   ├── auth_service.py     # User authentication, JWT
│   │   ├── claim_service.py    # Claim operations, status changes
│   │   ├── document_service.py # File upload, text extraction
│   │   ├── llm_service.py      # LLM calls (entity extraction, code suggestion, validation)
│   │   ├── extraction_pipeline.py  # Embedding generation + semantic search
│   │   └── metrics_service.py  # Calculate and store metrics
│   ├── core/
│   │   ├── config.py           # Settings from environment variables
│   │   ├── security.py         # Password hashing, JWT validation
│   │   ├── deps.py             # Dependency injection (get_current_user, get_db)
│   │   └── database.py         # SQLAlchemy session
│   └── db/
│       └── database.py         # PostgreSQL connection
├── alembic/                    # Database migrations
├── tests/                      # Pytest unit tests
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker image for backend
└── app.js / db.js             # Older Node.js files (can be removed)
```

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── App.jsx                 # Main router, protected routes
│   ├── main.jsx                # React entry point
│   ├── components/             # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   └── Layout.jsx          # Header, sidebar, main layout
│   ├── pages/                  # Full page components
│   │   ├── Login.jsx           # Authentication page
│   │   ├── Dashboard.jsx       # Home dashboard
│   │   ├── Documents.jsx       # Upload & manage documents
│   │   ├── Claims.jsx          # List and create claims
│   │   ├── ClaimDetails.jsx    # Claim details, validation status
│   │   ├── Patients.jsx        # Patient management
│   │   ├── Audit.jsx           # Audit log viewer
│   │   ├── Settings.jsx        # User settings
│   │   ├── ClaimsProcessingDashboard.jsx      # Metrics: Claims processed, approval rate
│   │   ├── AIAutomationDashboard.jsx          # Metrics: Auto-coding %, AI accuracy
│   │   ├── OperationalEfficiencyDashboard.jsx # Metrics: SLA, uptime, backlog
│   │   ├── ComplianceAuditDashboard.jsx       # Metrics: Compliance score, violations
│   │   └── RevenueFinancialDashboard.jsx      # Metrics: Revenue, collection rate
│   ├── services/
│   │   └── api.js              # Axios instance with base URL & auth headers
│   ├── hooks/
│   │   └── useAuth.js          # Authentication hook, token management
│   ├── contexts/
│   │   └── ThemeContext.jsx    # Dark/light theme
│   ├── config/
│   │   └── diseaseCodes.js     # ICD-10 code reference list
│   └── utils/                  # Utility functions
├── vite.config.js              # Vite build config
├── vitest.config.js            # Vitest test config
├── tailwind.config.js          # Tailwind CSS config
├── Dockerfile                  # Docker image for frontend
└── nginx.conf                  # Nginx config for production
```

### Key Directories Explained

| Path | Responsibility |
|------|-----------------|
| `backend/app/api/` | HTTP endpoints (REST API) |
| `backend/app/services/` | Business logic (validation, LLM calls, calculations) |
| `backend/app/models/` | Database schema definitions (SQLAlchemy ORM) |
| `backend/app/core/` | Configuration, security, database connection |
| `frontend/pages/` | Full-page components (routes) |
| `frontend/components/` | Reusable UI pieces |
| `frontend/services/api.js` | Centralized API communication |

---

## Data Models

### Core Entities

```
┌──────────────────┐
│      User        │
├──────────────────┤
│ id (PK)          │
│ username         │
│ email            │
│ hashed_password  │
│ is_active        │
└──────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐
│    Patient       │
├──────────────────┤
│ id (PK)          │
│ patient_id (U)   │ ◄─── Unique ID (e.g., PAT-001)
│ first_name       │
│ last_name        │
│ date_of_birth    │
│ gender           │
│ disease_code     │ ◄─── ICD-10 code (e.g., I10)
│ email            │
│ phone            │
├──────────────────┤
│ claims (1:N)     │
│ documents (1:N)  │
└──────────────────┘
         │
         ├─ 1:N ────────────────┬─ 1:N ────────────────┐
         ▼                      ▼                       ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│     Claim        │  │    Document      │  │  ExtractedEntity │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ id (PK)          │  │ id (PK)          │  │ id (PK)          │
│ claim_number     │  │ filename         │  │ entity_text      │
│ status           │  │ document_type    │  │ entity_type      │
│ total_amount     │  │ status           │  │ (diagnosis,      │
│ insurance_prov.  │  │ content_text     │  │  procedure, etc) │
│ policy_number    │  │ file_path        │  │ confidence       │
├──────────────────┤  └──────────────────┘  └──────────────────┘
│ claim_items (1:N)│         │
│ validations(1:N) │         │ 1:1
└──────────────────┘         ▼
         │            ┌──────────────────┐
         │ 1:N        │    Embedding     │
         ▼            ├──────────────────┤
┌──────────────────┐  │ id (PK)          │
│   ClaimItem      │  │ entity_id (FK)   │
├──────────────────┤  │ entity_type      │
│ id (PK)          │  │ content          │
│ claim_id (FK)    │  │ embedding (Vec)  │ ◄─── 1536-dim vector
│ code_id (FK)     │  │ metadata (JSON)  │
│ service_date     │  └──────────────────┘
│ amount           │
│ quantity         │
└──────────────────┘
         │
         │ N:1
         ▼
┌──────────────────┐
│  MedicalCode     │
├──────────────────┤
│ id (PK)          │
│ code_system      │ ◄─── ICD_10, CPT, HCPCS
│ code             │ ◄─── e.g., "I10", "99213"
│ description      │
│ confidence_score │ ◄─── 0.0-1.0 (from LLM)
│ status           │ ◄─── APPROVED, REJECTED, SUGGESTED
└──────────────────┘
```

### Metrics Tables

```
┌────────────────────────────────┐
│  AIAutomationMetrics           │
├────────────────────────────────┤
│ id, date (PK)                  │
│ total_medical_codes            │ ◄─── 75 codes
│ auto_coded_count               │ ◄─── 50 auto
│ manual_review_count            │ ◄─── 25 manual
│ auto_coded_percentage          │ ◄─── 66.7%
│ ai_accuracy_score              │ ◄─── 66.7%
│ human_accuracy_score           │ ◄─── 91.0%
│ avg_confidence_score           │ ◄─── 0.82
│ code_accuracy_by_type          │ ◄─── JSON
│ rejection_reasons_distribution │ ◄─── JSON
└────────────────────────────────┘

┌────────────────────────────────┐
│  ClaimProcessingMetrics        │
├────────────────────────────────┤
│ id, date (PK)                  │
│ total_claims_processed         │ ◄─── 20
│ claims_approved                │ ◄─── 8
│ claims_denied                  │ ◄─── 2
│ avg_turnaround_time_hours      │
│ total_claims_value             │
└────────────────────────────────┘

┌────────────────────────────────┐
│  OperationalEfficiencyMetrics  │
├────────────────────────────────┤
│ id, date (PK)                  │
│ avg_processing_time_hours      │
│ queue_backlog                  │ ◄─── 15 claims
│ sla_adherence_rate             │ ◄─── 92.3%
│ system_uptime_percentage       │ ◄─── 99.8%
└────────────────────────────────┘

┌────────────────────────────────┐
│  ComplianceAuditMetrics        │
├────────────────────────────────┤
│ id, date (PK)                  │
│ coding_compliance_score        │ ◄─── 94.2%
│ total_audits_performed         │ ◄─── 50
│ total_passed_audits            │ ◄─── 47
│ hipaa_violations               │ ◄─── 0
│ coding_errors                  │
└────────────────────────────────┘

┌────────────────────────────────┐
│  RevenueFinancialMetrics       │
├────────────────────────────────┤
│ id, date (PK)                  │
│ revenue_processed              │
│ claims_paid_value              │
│ claims_denied_value            │
│ net_revenue                    │ ◄─── $400
│ recovery_rate                  │ ◄─── 10.9%
│ denial_loss_percentage         │ ◄─── 8.8%
└────────────────────────────────┘
```

---

## Complete Workflow

### End-to-End User Journey

#### Step 1: User Authentication
```
1. User navigates to http://localhost:5173/login
2. Enters: testuser / testpass123
3. Frontend → POST /api/v1/auth/login
4. Backend:
   - Hashes password
   - Validates against User table
   - Returns JWT token
5. Frontend stores token in localStorage
6. All subsequent requests include Authorization header
```

#### Step 2: Upload Medical Document
```
1. User clicks Documents → Upload File
2. Selects PDF/DOCX file
3. Frontend → POST /api/v1/documents/upload
   - File sent as multipart form data
4. Backend Document Handler:
   a) Validates file type
   b) Extracts text using PyPDF2 or python-docx
   c) Creates Document record (status: UPLOADED)
   d) Calls Extraction Pipeline
5. Extraction Pipeline:
   a) Generates embedding via OpenAI API
   b) Stores in pgvector (similarity search)
   c) Calls LLM to extract entities
      - Diagnoses: [Hypertension, Diabetes]
      - Procedures: [EKG, Blood Test]
      - Medications: [Lisinopril, Metformin]
   d) Creates ExtractedEntity records
   e) For each entity, calls LLM to suggest codes
      - Hypertension → ICD-10: I10 (confidence: 0.95)
      - EKG → CPT: 93000 (confidence: 0.92)
   f) Creates MedicalCode records
   g) Updates Document status: PROCESSED
6. Frontend receives list of extracted codes
7. User reviews & approves/rejects codes
```

#### Step 3: Create & Submit Claim
```
1. User clicks Claims → New Claim
2. Fills form:
   - Patient ID
   - Insurance Provider
   - Policy Number
   - Service Dates
   - Amount
3. Frontend → POST /api/v1/claims
4. Backend creates Claim (status: DRAFT)
5. User adds claim items (medical codes from document)
6. Frontend → POST /api/v1/claims/{id}/items
7. Backend adds ClaimItem records
8. User submits claim
9. Frontend → POST /api/v1/claims/{id}/submit
10. Backend Claim Service:
    a) Gathers claim data
    b) Calls LLM validation:
       - Check code appropriateness
       - Check amount reasonableness
       - Detect fraud patterns
       - Check policy compliance
    c) Stores ClaimValidation records
    d) If valid → status: APPROVED
       If invalid → status: REJECTED
11. Frontend displays validation results
12. Metrics are updated:
    - ClaimProcessingMetrics.total_claims_processed++
    - AIAutomationMetrics.auto_coded_count++
```

#### Step 4: View Dashboards & Metrics
```
1. User navigates to Metrics → AI Automation
2. Frontend → GET /api/v1/metrics/ai-automation?days=30
3. Backend metrics service queries:
   - Last 30 days of AIAutomationMetrics
   - Returns: {
       auto_coded_percentage: 66.7,
       ai_accuracy_score: 66.7,
       human_accuracy_score: 91.0,
       avg_confidence_score: 0.82,
       history: [10 daily records]
     }
4. Frontend renders charts:
   - Auto-coded vs Manual Review pie chart
   - AI vs Human Accuracy comparison
   - Confidence score trend
   - Rejection reasons breakdown
```

---

## Claims Processing Pipeline

### Complete Claim Lifecycle

```
                    ┌─────────────────────────────────────┐
                    │  STAGE 1: CLAIM CREATION            │
                    │  (Draft - User inputs data)          │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │  STAGE 2: ADD CLAIM ITEMS           │
                    │  (Link medical codes, amounts)       │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │  STAGE 3: SUBMIT CLAIM              │
                    │  (User clicks Submit)                │
                    │  Status: DRAFT → SUBMITTED          │
                    └──────────────┬──────────────────────┘
                                   │
    ┌──────────────────────────────▼──────────────────────────────────┐
    │               STAGE 4: AI VALIDATION (LLM)                       │
    │  ┌────────────────────────────────────────────────────────────┐ │
    │  │ Check 1: Code Appropriateness                             │ │
    │  │ - Diagnosis code matches symptoms? (I10 for HTN = Yes)    │ │
    │  │ - Procedure code matches services? (EKG for HTN = Yes)    │ │
    │  │ - Medical logic valid?                                    │ │
    │  └────────────────────────────────────────────────────────────┘ │
    │  ┌────────────────────────────────────────────────────────────┐ │
    │  │ Check 2: Amount Reasonableness                             │ │
    │  │ - Is amount within typical range for these codes?          │ │
    │  │ - Flag if suspiciously high                                │ │
    │  └────────────────────────────────────────────────────────────┘ │
    │  ┌────────────────────────────────────────────────────────────┐ │
    │  │ Check 3: Policy Compliance                                 │ │
    │  │ - Is insurance provider valid?                             │ │
    │  │ - Is policy number format correct?                         │ │
    │  │ - Are codes covered by policy?                             │ │
    │  └────────────────────────────────────────────────────────────┘ │
    │  ┌────────────────────────────────────────────────────────────┐ │
    │  │ Check 4: Duplicate Detection                               │ │
    │  │ - Has identical claim been submitted within 30 days?       │ │
    │  │ - Similar patient/amount/codes?                            │ │
    │  └────────────────────────────────────────────────────────────┘ │
    │  ┌────────────────────────────────────────────────────────────┐ │
    │  │ Check 5: Fraud Pattern Detection                           │ │
    │  │ - Unusual billing patterns for provider?                   │ │
    │  │ - Codes commonly billed together inappropriately?          │ │
    │  │ - Amount significantly higher than similar claims?         │ │
    │  └────────────────────────────────────────────────────────────┘ │
    └────────────────┬──────────────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼─────┐          ┌──────▼──────┐
    │ ALL VALID │          │ ERRORS FOUND│
    └────┬─────┘          └──────┬──────┘
         │                       │
         │                       ▼
         │           ┌──────────────────────────┐
         │           │ STAGE 5: ERROR HANDLING  │
         │           │ Store validation errors  │
         │           │ Reasons:                 │
         │           │ - Invalid diagnosis      │
         │           │ - Amount too high        │
         │           │ - Policy mismatch        │
         │           │ - Duplicate detected     │
         │           │ - Fraud indicators       │
         │           └──────────────┬───────────┘
         │                          │
         │                          ▼
         │           ┌──────────────────────────┐
         │           │ Status: REJECTED         │
         │           │ Show errors to user      │
         │           │ User can modify & retry  │
         │           └──────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │  STAGE 6: CLAIM APPROVAL         │
    │  Status: SUBMITTED → PROCESSING  │
    │  Set processing_date             │
    └──────────┬──────────────────────┘
               │
    ┌──────────▼──────────────────────┐
    │  STAGE 7: PAYMENT PROCESSING     │
    │  (Backend/Insurance processing)  │
    │  Status: PROCESSING → PAID/DENIED│
    └──────────┬──────────────────────┘
               │
    ┌──────────▼──────────────────────┐
    │  STAGE 8: METRICS UPDATE         │
    │ - ClaimProcessingMetrics         │
    │   - claims_approved++            │
    │   - avg_turnaround_time          │
    │   - total_claims_value           │
    │ - RevenueFinancialMetrics        │
    │   - revenue_processed            │
    │   - claims_paid_value            │
    │ - AIAutomationMetrics            │
    │   - auto_coded_percentage        │
    │   - ai_accuracy_score            │
    └──────────────────────────────────┘
```

### Example: Real Claim Processing

#### Input Patient
```json
{
  "patient_id": "PAT-001",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1965-03-15",
  "disease_code": "I10"  // Hypertension
}
```

#### Uploaded Document (Clinical Note)
```
CHIEF COMPLAINT: Follow-up for hypertension
HPI: 65-year-old male with HTN, well-controlled on Lisinopril
PHYSICAL EXAM: BP 128/78, HR 72
ASSESSMENT: Essential hypertension, controlled
PLAN: Continue Lisinopril, recheck BP in 3 months
```

#### LLM Entity Extraction
```json
{
  "diagnoses": [
    {"text": "Essential hypertension", "context": "Assessment", "confidence": 0.98},
    {"text": "Controlled HTN", "context": "well-controlled on Lisinopril", "confidence": 0.95}
  ],
  "procedures": [
    {"text": "Blood pressure check", "context": "Physical exam", "confidence": 0.92}
  ],
  "medications": [
    {"text": "Lisinopril", "context": "Continue Lisinopril", "confidence": 0.99}
  ]
}
```

#### LLM Code Suggestions
```json
{
  "suggested_codes": [
    {
      "entity": "Essential hypertension",
      "code": "I10",
      "system": "ICD-10",
      "confidence": 0.98,
      "rationale": "Exact match for essential hypertension"
    },
    {
      "entity": "Blood pressure check",
      "code": "99213",
      "system": "CPT",
      "confidence": 0.88,
      "rationale": "Established patient office visit, low complexity"
    }
  ]
}
```

#### Claim Created & Submitted
```json
{
  "claim_number": "CLM-20260701-001",
  "patient_id": 1,
  "insurance_provider": "Blue Cross",
  "policy_number": "BC123456789",
  "total_amount": 150.00,
  "claim_items": [
    {
      "diagnosis_code": "I10",
      "procedure_code": "99213",
      "service_date": "2026-07-01",
      "amount": 150.00
    }
  ]
}
```

#### LLM Validation Check
```
✓ Code appropriateness: I10 (HTN) + 99213 (office visit) = VALID
✓ Amount reasonableness: $150 for office visit = VALID
✓ Policy compliance: Blue Cross covers both codes = VALID
✓ Duplicate detection: No identical claim in last 30 days = VALID
✓ Fraud patterns: Normal billing for provider = VALID

RESULT: ALL CHECKS PASSED ✓
Status: APPROVED
Processing Date: 2026-07-01 10:30 AM
```

#### Metrics Updated
```python
# AIAutomationMetrics
auto_coded_count = 50  # This claim auto-coded
total_codes = 75
auto_coded_percentage = 66.7%
ai_accuracy_score = 66.7%

# ClaimProcessingMetrics
total_claims_processed = 20
claims_approved = 8
avg_turnaround_time_hours = 2.3

# RevenueFinancialMetrics
revenue_processed = $19800
claims_paid_value = $400
net_revenue = $400
```

---

## RAG & LLM Integration

### What is RAG?

**RAG = Retrieval-Augmented Generation**

RAG combines:
1. **Retrieval**: Finding relevant documents using semantic search
2. **Augmentation**: Adding retrieved context to LLM prompt
3. **Generation**: LLM generates answer based on context

### RAG Flow in This Project

```
                    USER QUERY
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Generate Query Embedding    │
         │  Using OpenAI text-embedding │
         │  -3-small model              │
         │  "heart conditions" → [...]  │
         └──────┬───────────────────────┘
                │ 1536-dim vector
                ▼
        ┌───────────────────────────────┐
        │ Search pgvector Database      │
        │ Using cosine similarity       │
        │ embedding <-> query_vec       │
        └──────┬────────────────────────┘
               │
        ┌──────▼─────────────────────────┐
        │ Retrieved Top 5 Documents:     │
        │ 1. "Heart failure note"        │
        │    (similarity: 0.89)          │
        │ 2. "Hypertension note"         │
        │    (similarity: 0.85)          │
        │ 3. "Cardiology report"         │
        │    (similarity: 0.81)          │
        │ 4. "Medication history"        │
        │    (similarity: 0.78)          │
        │ 5. "Lab results"               │
        │    (similarity: 0.75)          │
        └──────┬────────────────────────┘
               │
        ┌──────▼────────────────────────────────┐
        │ Build LLM Prompt with Context         │
        │                                        │
        │ SYSTEM: You are medical expert        │
        │ USER: "heart conditions"              │
        │                                        │
        │ CONTEXT FROM DOCUMENTS:               │
        │ - "Heart failure: EF 40%"             │
        │ - "Hypertension: BP 150/90"           │
        │ - "Cardiology: CAD suspected"         │
        │ - "Medications: Lisinopril 10mg"      │
        │ - "Labs: Troponin elevated"           │
        │                                        │
        │ QUESTION: Find cardiac conditions     │
        │           with highest risk           │
        └──────┬────────────────────────────────┘
               │
        ┌──────▼────────────────────────────────┐
        │ Call GPT-4 with Augmented Prompt      │
        │ (context makes answer more accurate)  │
        └──────┬────────────────────────────────┘
               │
        ┌──────▼────────────────────────────────┐
        │ LLM Response (with document context): │
        │                                        │
        │ Based on retrieved documents:         │
        │ 1. CAD (Coronary Artery Disease)      │
        │    - Evidence: Cardiology report      │
        │    - Confidence: 0.92                 │
        │                                        │
        │ 2. Heart Failure                      │
        │    - Evidence: EF 40% (reduced)       │
        │    - Confidence: 0.88                 │
        │                                        │
        │ 3. Hypertension Stage 2               │
        │    - Evidence: BP 150/90              │
        │    - Confidence: 0.95                 │
        │                                        │
        │ Suggested Codes:                      │
        │ - CAD: I25.9 (confidence 0.92)        │
        │ - HF: I50.9 (confidence 0.88)         │
        │ - HTN: I10 (confidence 0.95)          │
        └──────────────────────────────────────┘
```

### Where RAG is Used

#### 1. **Document Search** (`/documents/search`)
```python
def semantic_search(db, query, limit=5):
    # Generate embedding for user's search query
    query_embedding = llm_service.generate_embedding(query)
    
    # Find similar documents in pgvector
    results = db.execute("""
        SELECT * FROM embeddings
        WHERE (1 - (embedding <-> query_embedding::vector)) > 0.5
        ORDER BY embedding <-> query_embedding::vector
        LIMIT 5
    """)
    
    return results  # Top 5 similar documents
```

**Use Case**: User searches "heart conditions" → finds all cardiac-related documents without keyword matching

#### 2. **Entity-to-Code Mapping** (in Extraction Pipeline)
```python
def suggest_codes(entity_text, entity_type):
    # Build context from similar entities
    similar_entities = semantic_search(
        db, entity_text, limit=3
    )
    
    context = ""
    for similar in similar_entities:
        context += f"- {similar.content}\n"
    
    # Augment prompt with retrieved context
    prompt = f"""
    Entity: {entity_text}
    Type: {entity_type}
    
    SIMILAR PAST CASES:
    {context}
    
    Suggest appropriate codes...
    """
    
    return llm_service.suggest_codes(prompt)
```

**Use Case**: When coding "Chest pain", LLM retrieves similar cases (MI, angina, GERD) for better suggestions

#### 3. **Fraud Detection** (Claim Validation)
```python
def detect_fraud(claim):
    # Retrieve similar claims from past
    similar_claims = semantic_search(
        db,
        f"{claim.insurance_provider} {claim.total_amount}",
        limit=10
    )
    
    # Check for patterns
    fraud_context = ""
    for similar in similar_claims:
        fraud_context += similar.metadata
    
    # Augment fraud detection prompt
    prompt = f"""
    Current Claim: {claim}
    
    SIMILAR PAST CLAIMS:
    {fraud_context}
    
    Detect fraud patterns...
    """
    
    return llm_service.validate_claim(prompt)
```

**Use Case**: Detect billing patterns by comparing current claim against historical similar claims

### Vector Embeddings in PostgreSQL

#### Embedding Model
- **Model**: OpenAI `text-embedding-3-small`
- **Dimensions**: 1536
- **Stored in**: pgvector extension

#### Storage & Query
```sql
-- Create pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR,
    entity_id INTEGER,
    content TEXT,
    embedding vector(1536),  -- 1536-dim vector
    created_at TIMESTAMP
);

-- Create index for fast similarity search
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Semantic search query
SELECT *, 
       (1 - (embedding <-> query_vec::vector)) as similarity
FROM embeddings
WHERE (1 - (embedding <-> query_vec::vector)) > 0.5
ORDER BY embedding <-> query_vec::vector
LIMIT 5;
```

#### Distance Metric
- **Operator**: `<->` (cosine distance)
- **Lower distance** = higher similarity
- **Range**: 0 (identical) to 2 (opposite)
- **Similarity score**: `1 - distance` → 0 to 1 range

### LLM Functions

| Function | Purpose | When Called |
|----------|---------|-------------|
| `extract_entities()` | Extract diagnoses, procedures, medications from text | After document upload |
| `suggest_codes()` | Suggest ICD-10/CPT codes for entities | During entity extraction |
| `validate_claim()` | Validate claim for compliance & fraud | When claim submitted |
| `generate_embedding()` | Create 1536-dim vector for document | During document processing |

### Current LLM Usage Stats

```
Daily Operations:
- Documents processed: ~5
- Entities extracted per doc: ~10-15
- Codes suggested per claim: ~2-4
- Claims validated per day: ~20

API Calls per Day:
- Embedding generations: ~50-75 (documents + queries)
- LLM completions: ~100-150
- Estimated cost: ~$2-5/day (at current volume)
```

---

## API Endpoints

### Authentication
```
POST /api/v1/auth/login
- Body: {username, password}
- Response: {access_token, token_type}

GET /api/v1/auth/me
- Returns: Current user info
```

### Patients
```
GET /api/v1/patients
- Returns: List of all patients

POST /api/v1/patients
- Body: {first_name, last_name, dob, gender, disease_code}
- Returns: Created patient

GET /api/v1/patients/{patient_id}
- Returns: Single patient details
```

### Documents
```
POST /api/v1/documents/upload
- Body: File upload (PDF/DOCX)
- Returns: Created document + extracted entities

GET /api/v1/documents
- Returns: List of documents

GET /api/v1/documents/search
- Query: ?q=heart+conditions
- Returns: Similar documents (RAG)

GET /api/v1/documents/{doc_id}
- Returns: Document + extracted entities + embeddings
```

### Claims
```
POST /api/v1/claims
- Body: {patient_id, claim_number, insurance_provider, ...}
- Returns: Created claim (DRAFT status)

GET /api/v1/claims
- Returns: List of all claims

GET /api/v1/claims/{claim_id}
- Returns: Claim details + validations

PUT /api/v1/claims/{claim_id}
- Updates claim

POST /api/v1/claims/{claim_id}/submit
- Submits claim for validation
- Returns: Validation results

POST /api/v1/claims/{claim_id}/approve
- Approves claim

POST /api/v1/claims/{claim_id}/reject
- Rejects claim + reason
```

### Metrics
```
GET /api/v1/metrics/ai-automation?days=30
- Returns: 30 days of AI automation metrics

GET /api/v1/metrics/claims-processing?days=30
- Returns: Claim processing metrics

GET /api/v1/metrics/operational-efficiency?days=30
- Returns: SLA, uptime, backlog metrics

GET /api/v1/metrics/compliance-audit?days=30
- Returns: Compliance scores, audit counts

GET /api/v1/metrics/revenue-financial?days=30
- Returns: Revenue, recovery rate, denial rate

GET /api/v1/metrics/dashboard-summary
- Returns: All metrics aggregated (7-day summary)
```

---

## Key Features

### ✅ Implemented Features

| Feature | Status | Details |
|---------|--------|---------|
| User Authentication | ✓ | JWT-based auth with testuser/testpass123 |
| Patient Management | ✓ | CRUD operations, 50 dummy patients |
| Document Upload | ✓ | PDF/DOCX support, text extraction |
| Entity Extraction | ✓ | LLM-based extraction (diagnoses, procedures, meds) |
| Medical Coding | ✓ | AI suggests ICD-10, CPT, HCPCS codes |
| Claims Processing | ✓ | Full workflow: DRAFT → SUBMITTED → APPROVED/REJECTED |
| Claim Validation | ✓ | LLM validates code appropriateness, amounts, compliance |
| Fraud Detection | ✓ | Pattern detection, duplicate checking |
| Vector Embeddings | ✓ | pgvector with text-embedding-3-small (1536 dims) |
| Semantic Search | ✓ | RAG-based document search |
| Dashboards | ✓ | 5 metrics dashboards (AI, Claims, Revenue, Compliance, Efficiency) |
| Real-time Metrics | ✓ | Daily metric tracking, 10-day history |
| Audit Logging | ✓ | Track all user actions |

### 📊 Current System Metrics

```
Database Records:
- Patients: 50
- Claims: 20+
- Documents: 5+
- Medical Codes: 75
- AI Metrics (days): 10
- Embeddings: 10+ (one per document)

Dashboard Data (Latest):
- AI Auto-coded: 66.7%
- AI Accuracy: 66.7%
- Human Accuracy: 91.0%
- Avg Confidence: 0.82
- Claim Processing SLA: 92.3%
- System Uptime: 99.8%
- Compliance Score: 94.2%
- Net Revenue: $400
```

### 🎯 Architecture Summary

```
Frontend (React/Vite)
     ↓
FastAPI Backend
     ├─ Services Layer (Business Logic)
     ├─ LLM Service (Azure OpenAI)
     ├─ Extraction Pipeline (Embeddings + RAG)
     └─ Database Layer (SQLAlchemy ORM)
     ↓
PostgreSQL with pgvector
     ├─ Patient Data
     ├─ Claims + Items + Validations
     ├─ Documents + Extracted Entities
     ├─ Medical Codes
     ├─ Embeddings (1536-dim vectors)
     └─ Metrics & Audit Logs
     ↓
Azure OpenAI API
     ├─ GPT-4 / GPT-3.5 Turbo (LLM)
     └─ text-embedding-3-small (Embeddings)
```

---

## Next Steps / Future Enhancements

1. **Advanced RAG**: Include medical knowledge bases (drug interactions, contraindications)
2. **Real-time Monitoring**: WebSocket dashboards for live claim updates
3. **Mobile App**: React Native for mobile document capture
4. **Batch Processing**: Bulk claim submission & processing
5. **Integration APIs**: HL7/FHIR support for healthcare systems
6. **ML Model**: Train custom models for fraud detection
7. **Multi-language**: Support for international medical coding systems
8. **Audit Reports**: Generate compliance reports for regulators

---

**Last Updated**: 2026-07-02
**Version**: 1.0.0
**Status**: Production-Ready Demo
