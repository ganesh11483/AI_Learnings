#!/usr/bin/env python
"""Add 5 dummy documents to the database."""
from datetime import datetime
import app.main
from app.db.database import SessionLocal
from app.models.document import Document, DocumentType, DocumentStatus
from app.models.patient import Patient
from app.models.user import User

db = SessionLocal()

# Get test user
test_user = db.query(User).filter(User.username == "testuser").first()
if not test_user:
    print("✗ Test user not found. Please run create sample data first.")
    db.close()
    exit(1)

# Get some patients to link documents to
patients = db.query(Patient).limit(10).all()
if not patients:
    print("✗ No patients found. Please add patients first.")
    db.close()
    exit(1)

# Sample documents
documents_data = [
    {
        "patient_id": patients[0].id,
        "filename": "clinical_note_20260601.pdf",
        "document_type": DocumentType.CLINICAL_NOTE,
        "content": "Patient presented with persistent cough and mild fever. Physical examination shows bilateral wheezing. Prescribed antibiotics and advised rest."
    },
    {
        "patient_id": patients[1].id,
        "filename": "discharge_summary_20260615.pdf",
        "document_type": DocumentType.DISCHARGE_SUMMARY,
        "content": "Patient discharged after 3-day hospitalization for acute bronchitis. Condition stable. Follow-up appointment scheduled for next week."
    },
    {
        "patient_id": patients[2].id,
        "filename": "lab_results_20260620.pdf",
        "document_type": DocumentType.LAB_RESULT,
        "content": "Blood tests results: WBC 7.2, RBC 4.5, Hemoglobin 13.2 g/dL. All values within normal range."
    },
    {
        "patient_id": patients[3].id,
        "filename": "radiology_report_20260625.pdf",
        "document_type": DocumentType.RADIOLOGY_REPORT,
        "content": "Chest X-ray performed. No abnormalities detected. Lungs clear, heart size normal. Impression: Normal study."
    },
    {
        "patient_id": patients[4].id,
        "filename": "operative_report_20260628.pdf",
        "document_type": DocumentType.operative_report,
        "content": "Successful appendectomy performed under general anesthesia. No intraoperative complications. Patient stable post-op."
    },
]

count = 0
for doc_data in documents_data:
    # Check if document already exists
    existing = db.query(Document).filter(
        Document.patient_id == doc_data["patient_id"],
        Document.filename == doc_data["filename"]
    ).first()
    if existing:
        print(f"✓ Document already exists: {doc_data['filename']}")
        continue
    
    document = Document(
        patient_id=doc_data["patient_id"],
        filename=doc_data["filename"],
        file_type="pdf",
        file_size=4096,  # Dummy size
        document_type=doc_data["document_type"],
        status=DocumentStatus.PROCESSED,
        content_text=doc_data["content"],
        uploaded_by=test_user.id
    )
    db.add(document)
    count += 1
    print(f"✓ Added document: {doc_data['filename']} (Type: {doc_data['document_type']})")

db.commit()
print(f"\n✓ Successfully added {count} new documents!")
db.close()
