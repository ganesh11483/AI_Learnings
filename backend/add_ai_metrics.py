#!/usr/bin/env python
"""Add dummy medical codes and calculate AI automation metrics."""
from datetime import datetime, timedelta
import app.main
from app.db.database import SessionLocal
from app.models.medical_code import MedicalCode, CodeSystem, CodeStatus
from app.models.entity import ExtractedEntity, EntityType
from app.models.user import User
from app.models.document import Document
from app.services.metrics_service import metrics_service

db = SessionLocal()

# Get test user
test_user = db.query(User).filter(User.username == "testuser").first()
if not test_user:
    print("✗ Test user not found.")
    db.close()
    exit(1)

# Get documents
documents = db.query(Document).limit(5).all()
if not documents:
    print("✗ No documents found.")
    db.close()
    exit(1)

print("Adding dummy medical codes...")

# Sample medical codes with various statuses and confidence scores
codes_data = [
    {"code": "I10", "system": CodeSystem.ICD_10, "description": "Essential hypertension", "confidence": 0.95, "status": CodeStatus.APPROVED},
    {"code": "E11.9", "system": CodeSystem.ICD_10, "description": "Type 2 diabetes", "confidence": 0.88, "status": CodeStatus.APPROVED},
    {"code": "J06.9", "system": CodeSystem.ICD_10, "description": "Acute upper respiratory infection", "confidence": 0.92, "status": CodeStatus.APPROVED},
    {"code": "F41.1", "system": CodeSystem.ICD_10, "description": "Generalized anxiety disorder", "confidence": 0.75, "status": CodeStatus.APPROVED},
    {"code": "M79.3", "system": CodeSystem.ICD_10, "description": "Panniculitis, unspecified", "confidence": 0.65, "status": CodeStatus.SUGGESTED},
    {"code": "99213", "system": CodeSystem.CPT, "description": "Office visit - established patient", "confidence": 0.98, "status": CodeStatus.APPROVED},
    {"code": "99214", "system": CodeSystem.CPT, "description": "Office visit - established patient", "confidence": 0.91, "status": CodeStatus.APPROVED},
    {"code": "99215", "system": CodeSystem.CPT, "description": "Office visit - established patient", "confidence": 0.82, "status": CodeStatus.SUGGESTED},
    {"code": "80053", "system": CodeSystem.CPT, "description": "Comprehensive metabolic panel", "confidence": 0.87, "status": CodeStatus.APPROVED},
    {"code": "85025", "system": CodeSystem.CPT, "description": "Complete blood count", "confidence": 0.94, "status": CodeStatus.APPROVED},
    {"code": "H0036", "system": CodeSystem.HCPCS, "description": "Community psychiatric supportive treatment", "confidence": 0.70, "status": CodeStatus.SUGGESTED},
    {"code": "E1390", "system": CodeSystem.HCPCS, "description": "Oxygen concentrator, stationary", "confidence": 0.79, "status": CodeStatus.APPROVED},
    {"code": "K0547", "system": CodeSystem.HCPCS, "description": "Manual wheelchair accessories", "confidence": 0.60, "status": CodeStatus.REJECTED},
    {"code": "J1100", "system": CodeSystem.HCPCS, "description": "Dexamethasone sodium phosphate", "confidence": 0.85, "status": CodeStatus.APPROVED},
    {"code": "L3010", "system": CodeSystem.HCPCS, "description": "Foot orthosis", "confidence": 0.72, "status": CodeStatus.REJECTED},
]

code_count = 0
for i, doc in enumerate(documents):
    for j, code_data in enumerate(codes_data):
        # Create extracted entity first
        entity = ExtractedEntity(
            document_id=doc.id,
            entity_type=EntityType.DIAGNOSIS if "ICD" in code_data["system"] else EntityType.PROCEDURE,
            entity_text=code_data["description"],
            start_position=j * 20,
            end_position=j * 20 + 15,
            confidence_score=code_data["confidence"]
        )
        db.add(entity)
        db.flush()
        
        # Create medical code linked to entity
        medical_code = MedicalCode(
            entity_id=entity.id,
            code_system=code_data["system"],
            code=code_data["code"],
            description=code_data["description"],
            confidence_score=code_data["confidence"],
            status=code_data["status"],
            approved_by=test_user.id if code_data["status"] == CodeStatus.APPROVED else None,
            created_at=datetime.now() - timedelta(days=i)
        )
        db.add(medical_code)
        code_count += 1

db.commit()
print(f"✓ Added {code_count} dummy medical codes")

# Calculate AI automation metrics for last 3 days
print("Calculating AI automation metrics...")
today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

for i in range(3):
    date = today - timedelta(days=i)
    try:
        metrics = metrics_service.calculate_ai_automation_metrics(db, date)
        print(f"✓ AI Metrics for {date.date()}: {metrics.total_claims_processed} codes, {metrics.auto_coded_claims} auto-coded, {metrics.ai_accuracy_score}% accuracy")
    except Exception as e:
        print(f"✗ Error calculating metrics for {date.date()}: {str(e)}")

db.close()
print("\n✓ AI Automation metrics connected to database!")
