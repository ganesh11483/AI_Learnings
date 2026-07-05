"""
Add disease codes to all 50 dummy patients
"""
import random
from app.main import app
from app.db.database import SessionLocal
from app.models.patient import Patient

# Disease codes to assign
DISEASE_CODES = [
    "J45.0", "J45.9", "J44.9", "J18.9",  # Respiratory
    "I10", "I21.9", "I50.9", "I25.1",    # Cardiovascular
    "E11.9", "E10.9",                    # Diabetes
    "K35.8", "K21.9", "K25.9",           # Gastrointestinal
    "G43.9", "G93.1", "G35",             # Neurological
    "F32.9", "F41.9",                    # Mental Health
    "A09", "J06.9",                      # Infectious
    "M54.5", "M79.3", "M25.5",           # Musculoskeletal
]

db = SessionLocal()

try:
    # Get all patients
    patients = db.query(Patient).all()
    
    print(f"Found {len(patients)} patients")
    
    # Assign disease codes randomly
    for patient in patients:
        disease_code = random.choice(DISEASE_CODES)
        patient.disease_code = disease_code
        print(f"{patient.patient_id}: {patient.first_name} {patient.last_name} -> {disease_code}")
    
    # Commit all changes
    db.commit()
    print("\n✓ Disease codes assigned to all patients successfully!")
    
except Exception as e:
    db.rollback()
    print(f"Error: {e}")
finally:
    db.close()
