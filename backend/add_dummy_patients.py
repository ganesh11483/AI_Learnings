#!/usr/bin/env python
"""Add 10 dummy patients to the database."""
from datetime import datetime, date, timedelta
from app.db.database import SessionLocal
from app.models.patient import Patient

db = SessionLocal()

# Sample patient data
patients_data = [
    {"patient_id": "PAT-001", "first_name": "John", "last_name": "Doe", "dob": date(1980, 1, 15), "gender": "M", "email": "john.doe@example.com", "phone": "555-0100", "address": "123 Main St, Springfield, IL 62701"},
    {"patient_id": "PAT-002", "first_name": "Jane", "last_name": "Smith", "dob": date(1985, 5, 22), "gender": "F", "email": "jane.smith@example.com", "phone": "555-0101", "address": "456 Oak Ave, Springfield, IL 62702"},
    {"patient_id": "PAT-003", "first_name": "Robert", "last_name": "Johnson", "dob": date(1975, 3, 10), "gender": "M", "email": "robert.j@example.com", "phone": "555-0102", "address": "789 Pine Rd, Springfield, IL 62703"},
    {"patient_id": "PAT-004", "first_name": "Sarah", "last_name": "Williams", "dob": date(1990, 7, 18), "gender": "F", "email": "sarah.w@example.com", "phone": "555-0103", "address": "321 Elm St, Springfield, IL 62704"},
    {"patient_id": "PAT-005", "first_name": "Michael", "last_name": "Brown", "dob": date(1982, 11, 5), "gender": "M", "email": "michael.b@example.com", "phone": "555-0104", "address": "654 Maple Dr, Springfield, IL 62705"},
    {"patient_id": "PAT-006", "first_name": "Emily", "last_name": "Davis", "dob": date(1988, 2, 14), "gender": "F", "email": "emily.d@example.com", "phone": "555-0105", "address": "987 Cedar Ln, Springfield, IL 62706"},
    {"patient_id": "PAT-007", "first_name": "James", "last_name": "Miller", "dob": date(1978, 9, 25), "gender": "M", "email": "james.m@example.com", "phone": "555-0106", "address": "147 Birch Way, Springfield, IL 62707"},
    {"patient_id": "PAT-008", "first_name": "Jessica", "last_name": "Wilson", "dob": date(1992, 6, 8), "gender": "F", "email": "jessica.w@example.com", "phone": "555-0107", "address": "258 Spruce St, Springfield, IL 62708"},
    {"patient_id": "PAT-009", "first_name": "David", "last_name": "Moore", "dob": date(1987, 4, 20), "gender": "M", "email": "david.m@example.com", "phone": "555-0108", "address": "369 Ash Ave, Springfield, IL 62709"},
    {"patient_id": "PAT-010", "first_name": "Amanda", "last_name": "Taylor", "dob": date(1991, 8, 30), "gender": "F", "email": "amanda.t@example.com", "phone": "555-0109", "address": "741 Walnut Rd, Springfield, IL 62710"},
]

count = 0
for p_data in patients_data:
    # Check if patient already exists
    existing = db.query(Patient).filter(Patient.patient_id == p_data["patient_id"]).first()
    if existing:
        print(f"✓ Patient already exists: {p_data['first_name']} {p_data['last_name']} ({p_data['patient_id']})")
        continue
    
    patient = Patient(
        patient_id=p_data["patient_id"],
        first_name=p_data["first_name"],
        last_name=p_data["last_name"],
        date_of_birth=p_data["dob"],
        gender=p_data["gender"],
        email=p_data["email"],
        phone=p_data["phone"],
        address=p_data["address"]
    )
    db.add(patient)
    count += 1
    print(f"✓ Added patient: {p_data['first_name']} {p_data['last_name']} ({p_data['patient_id']})")

db.commit()
print(f"\n✓ Successfully added {count} new patients!")
db.close()
