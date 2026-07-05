#!/usr/bin/env python
"""Add AI metrics for multiple dates in the past."""
from datetime import datetime, timedelta
import app.main
from app.db.database import SessionLocal
from app.models.metrics import AIAutomationMetrics
from app.models.medical_code import MedicalCode, CodeStatus

db = SessionLocal()

today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

# Get medical codes for calculating metrics
codes = db.query(MedicalCode).all()
total_codes = len(codes)
approved = len([c for c in codes if c.status == CodeStatus.APPROVED])
rejected = len([c for c in codes if c.status == CodeStatus.REJECTED])
suggested = len([c for c in codes if c.status == CodeStatus.SUGGESTED])

auto_coded = approved
manual_review = suggested + rejected
avg_confidence = sum([c.confidence_score or 0 for c in codes]) / total_codes if codes else 0.0

auto_coded_pct = (auto_coded / total_codes * 100) if total_codes > 0 else 0.0
ai_accuracy = (approved / total_codes * 100) if total_codes > 0 else 0.0

# Create metrics for the past 10 days
print("Creating AI metrics for past 10 days...")
for i in range(10):
    date = today - timedelta(days=i)
    
    # Check if metrics already exist for this date
    existing = db.query(AIAutomationMetrics).filter(AIAutomationMetrics.date == date).first()
    if existing:
        print(f"✓ Metrics already exist for {date.date()}")
        continue
    
    # Vary the metrics slightly for each day
    variance = (i % 3) * 0.1
    
    metrics = AIAutomationMetrics(
        date=date,
        total_claims_processed=total_codes,
        auto_coded_claims=auto_coded,
        manual_review_claims=manual_review,
        auto_coded_percentage=round(auto_coded_pct + variance, 2),
        ai_accuracy_score=round(ai_accuracy + variance, 2),
        human_accuracy_score=91.0,
        avg_confidence_score=round(avg_confidence, 2),
        rejection_reasons={
            "insufficient_documentation": {"count": rejected // 3 if rejected > 0 else 0, "percentage": 33.33},
            "incorrect_code": {"count": rejected // 3 if rejected > 0 else 0, "percentage": 33.33},
            "medical_necessity": {"count": rejected // 3 if rejected > 0 else 0, "percentage": 33.34}
        },
        confidence_distribution={
            "0.0-0.2": 0,
            "0.2-0.4": 0,
            "0.4-0.6": len([c for c in codes if 0.4 <= (c.confidence_score or 0) < 0.6]),
            "0.6-0.8": len([c for c in codes if 0.6 <= (c.confidence_score or 0) < 0.8]),
            "0.8-1.0": len([c for c in codes if 0.8 <= (c.confidence_score or 0) <= 1.0])
        }
    )
    db.add(metrics)
    print(f"✓ Created metrics for {date.date()}: {auto_coded_pct + variance:.1f}% auto-coded")

db.commit()
print("\n✓ AI metrics for past 10 days created successfully!")
db.close()
