"""
Seed disease codes lookup table with sample ICD-10 codes.
Run this script to populate the disease_codes table.
"""
from sqlalchemy.orm import Session
from app.db.database import engine, SessionLocal, Base
from app.models.disease_code import DiseaseCode

# Sample disease codes with categories
DISEASE_CODES = [
    # Respiratory diseases
    {"code": "J45.0", "description": "Asthma, predominantly allergic", "category": "Respiratory"},
    {"code": "J45.9", "description": "Asthma, unspecified", "category": "Respiratory"},
    {"code": "J44.9", "description": "Chronic obstructive pulmonary disease, unspecified", "category": "Respiratory"},
    {"code": "J18.9", "description": "Pneumonia, unspecified", "category": "Respiratory"},
    
    # Cardiovascular diseases
    {"code": "I10", "description": "Essential (primary) hypertension", "category": "Cardiovascular"},
    {"code": "I21.9", "description": "Acute myocardial infarction, unspecified", "category": "Cardiovascular"},
    {"code": "I50.9", "description": "Heart failure, unspecified", "category": "Cardiovascular"},
    {"code": "I25.1", "description": "Atherosclerotic heart disease of native coronary artery", "category": "Cardiovascular"},
    
    # Diabetes
    {"code": "E11.9", "description": "Type 2 diabetes mellitus without complications", "category": "Endocrine"},
    {"code": "E10.9", "description": "Type 1 diabetes mellitus without complications", "category": "Endocrine"},
    
    # Gastrointestinal diseases
    {"code": "K35.8", "description": "Other acute appendicitis", "category": "Gastrointestinal"},
    {"code": "K21.9", "description": "Gastro-esophageal reflux disease without esophagitis", "category": "Gastrointestinal"},
    {"code": "K25.9", "description": "Gastric ulcer, unspecified as acute or chronic, without hemorrhage or perforation", "category": "Gastrointestinal"},
    
    # Neurological diseases
    {"code": "G43.9", "description": "Migraine, unspecified", "category": "Neurological"},
    {"code": "G93.1", "description": "Anoxic brain damage, not elsewhere classified", "category": "Neurological"},
    {"code": "G35", "description": "Multiple sclerosis", "category": "Neurological"},
    
    # Mental health disorders
    {"code": "F32.9", "description": "Major depressive disorder, single episode, unspecified", "category": "Mental Health"},
    {"code": "F41.9", "description": "Anxiety disorder, unspecified", "category": "Mental Health"},
    
    # Infectious diseases
    {"code": "A09", "description": "Infectious gastroenteritis and colitis, unspecified", "category": "Infectious"},
    {"code": "J06.9", "description": "Acute upper respiratory infection, unspecified", "category": "Infectious"},
    
    # Musculoskeletal diseases
    {"code": "M54.5", "description": "Low back pain", "category": "Musculoskeletal"},
    {"code": "M79.3", "description": "Pain in limb, unspecified", "category": "Musculoskeletal"},
    {"code": "M25.5", "description": "Pain in joint", "category": "Musculoskeletal"},
]

def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

def seed_disease_codes():
    """Seed the disease codes table with sample data."""
    db: Session = SessionLocal()
    
    try:
        # Check if disease codes already exist
        existing_codes = db.query(DiseaseCode).count()
        if existing_codes > 0:
            print(f"Found {existing_codes} existing disease codes. Skipping seed.")
            return
        
        # Add disease codes
        for code_data in DISEASE_CODES:
            disease_code = DiseaseCode(**code_data)
            db.add(disease_code)
        
        db.commit()
        print(f"Successfully seeded {len(DISEASE_CODES)} disease codes.")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding disease codes: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()
    seed_disease_codes()

