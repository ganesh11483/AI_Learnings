#!/usr/bin/env python
"""Add dummy claims linked to patients."""
from datetime import datetime, timedelta, date

# Import main app first to register all models
import app.main
from app.db.database import SessionLocal
from app.models.claim import Claim, ClaimStatus
from app.models.patient import Patient
from app.models.user import User

db = SessionLocal()

# Get test user and patients
test_user = db.query(User).filter(User.username == "testuser").first()
if not test_user:
    print("✗ Test user not found. Please run create sample data first.")
    exit(1)

patients = db.query(Patient).all()
if not patients:
    print("✗ No patients found. Please add patients first.")
    exit(1)

# Create sample claims
claim_statuses = [
    ClaimStatus.SUBMITTED,
    ClaimStatus.PROCESSING,
    ClaimStatus.APPROVED,
    ClaimStatus.APPROVED,
    ClaimStatus.DENIED,
    ClaimStatus.APPROVED,
    ClaimStatus.PAID,
    ClaimStatus.REJECTED
]

count = 0
base_date = datetime.now() - timedelta(days=30)

for i, patient in enumerate(patients[:10]):
    for j in range(2):  # Create 2 claims per patient
        claim_num = f"CLM-{patient.patient_id}-{j+1:03d}"
        
        # Check if claim already exists
        existing = db.query(Claim).filter(Claim.claim_number == claim_num).first()
        if existing:
            print(f"✓ Claim already exists: {claim_num}")
            continue
        
        claim = Claim(
            patient_id=patient.id,
            claim_number=claim_num,
            status=claim_statuses[(i + j) % len(claim_statuses)],
            total_amount=round(500 + (i * 100) + (j * 50), 2),
            insurance_provider=["Blue Cross", "Aetna", "UnitedHealth"][i % 3],
            policy_number=f"POL-{i:04d}",
            rendering_provider_npi=f"NPI{i:010d}",
            place_of_service="11",  # Office visit
            submission_date=base_date + timedelta(days=j*5),
            processing_date=base_date + timedelta(days=j*5+2),
            notes=f"Sample claim for {patient.first_name} {patient.last_name}",
            created_by=test_user.id,
            created_at=base_date + timedelta(days=j*5)
        )
        db.add(claim)
        count += 1
        print(f"✓ Added claim: {claim_num} for {patient.first_name} {patient.last_name} - Status: {claim.status}")

db.commit()
print(f"\n✓ Successfully added {count} new claims!")
db.close()
