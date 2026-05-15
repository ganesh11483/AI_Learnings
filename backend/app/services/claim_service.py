from sqlalchemy.orm import Session
from app.models.claim import Claim, ClaimStatus, ClaimItem, ClaimValidation
from app.models.medical_code import MedicalCode, CodeStatus
from app.schemas.claim import ClaimCreate, ClaimUpdate, ClaimItemCreate
from app.services.llm_service import llm_service
from typing import List, Optional
import json


def create_claim(db: Session, claim: ClaimCreate, created_by: int) -> Claim:
    """Create a new claim."""
    # Check if claim number already exists
    if db.query(Claim).filter(Claim.claim_number == claim.claim_number).first():
        raise ValueError("Claim number already exists")
    
    db_claim = Claim(
        patient_id=claim.patient_id,
        claim_number=claim.claim_number,
        insurance_provider=claim.insurance_provider,
        policy_number=claim.policy_number,
        status=ClaimStatus.DRAFT,
        created_by=created_by
    )
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim


def add_claim_item(db: Session, claim_item: ClaimItemCreate) -> ClaimItem:
    """Add an item to a claim."""
    claim = db.query(Claim).filter(Claim.id == claim_item.claim_id).first()
    if not claim:
        raise ValueError("Claim not found")
    
    db_claim_item = ClaimItem(
        claim_id=claim_item.claim_id,
        code_id=claim_item.code_id,
        service_date=claim_item.service_date,
        amount=claim_item.amount,
        quantity=claim_item.quantity,
        description=claim_item.description
    )
    db.add(db_claim_item)
    
    # Update claim total
    claim.total_amount += claim_item.amount * claim_item.quantity
    
    db.commit()
    db.refresh(db_claim_item)
    return db_claim_item


def validate_claim(db: Session, claim_id: int) -> Claim:
    """Validate a claim using LLM."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise ValueError("Claim not found")
    
    # Gather claim data for validation
    claim_data = {
        "claim_number": claim.claim_number,
        "patient_id": claim.patient_id,
        "insurance_provider": claim.insurance_provider,
        "policy_number": claim.policy_number,
        "items": []
    }
    
    for item in claim.claim_items:
        item_data = {
            "amount": item.amount,
            "quantity": item.quantity,
            "description": item.description
        }
        if item.medical_code:
            item_data["code"] = item.medical_code.code
            item_data["code_system"] = item.medical_code.code_system.value
            item_data["code_description"] = item.medical_code.description
        claim_data["items"].append(item_data)
    
    # Validate using LLM
    validation_result = llm_service.validate_claim(claim_data)
    
    # Clear existing validations
    db.query(ClaimValidation).filter(ClaimValidation.claim_id == claim_id).delete()
    
    # Add new validations
    for error in validation_result.get("errors", []):
        validation = ClaimValidation(
            claim_id=claim.id,
            validation_type=error["type"],
            is_valid=error.get("severity") != "error",
            error_message=error["message"],
            severity=error.get("severity", "error")
        )
        db.add(validation)
    
    db.commit()
    db.refresh(claim)
    return claim


def submit_claim(db: Session, claim_id: int) -> Claim:
    """Submit a claim for processing."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise ValueError("Claim not found")
    
    if claim.status != ClaimStatus.DRAFT:
        raise ValueError("Claim must be in draft status to submit")
    
    # Validate before submission
    validate_claim(db, claim_id)
    
    # Check for critical errors
    critical_errors = db.query(ClaimValidation).filter(
        ClaimValidation.claim_id == claim_id,
        ClaimValidation.severity == "error"
    ).all()
    
    if critical_errors:
        raise ValueError("Cannot submit claim with critical errors")
    
    claim.status = ClaimStatus.SUBMITTED
    claim.submission_date = func.now()
    db.commit()
    db.refresh(claim)
    return claim


def get_claim(db: Session, claim_id: int) -> Optional[Claim]:
    """Get claim by ID."""
    return db.query(Claim).filter(Claim.id == claim_id).first()


def get_claims_by_patient(db: Session, patient_id: int) -> List[Claim]:
    """Get all claims for a patient."""
    return db.query(Claim).filter(Claim.patient_id == patient_id).all()


def update_claim(db: Session, claim_id: int, claim_update: ClaimUpdate) -> Claim:
    """Update claim information."""
    claim = get_claim(db, claim_id)
    if not claim:
        raise ValueError("Claim not found")
    
    update_data = claim_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(claim, field, value)
    
    db.commit()
    db.refresh(claim)
    return claim


def approve_code(db: Session, code_id: int, approved_by: int, notes: Optional[str] = None) -> MedicalCode:
    """Approve a suggested medical code."""
    code = db.query(MedicalCode).filter(MedicalCode.id == code_id).first()
    if not code:
        raise ValueError("Code not found")
    
    code.status = CodeStatus.APPROVED
    code.approved_by = approved_by
    code.notes = notes
    db.commit()
    db.refresh(code)
    return code


def reject_code(db: Session, code_id: int, approved_by: int, notes: Optional[str] = None) -> MedicalCode:
    """Reject a suggested medical code."""
    code = db.query(MedicalCode).filter(MedicalCode.id == code_id).first()
    if not code:
        raise ValueError("Code not found")
    
    code.status = CodeStatus.REJECTED
    code.approved_by = approved_by
    code.notes = notes
    db.commit()
    db.refresh(code)
    return code
