#!/usr/bin/env python
"""Calculate metrics for today and past dates with claims."""
from datetime import datetime, timedelta
import app.main
from app.db.database import SessionLocal
from app.services.metrics_service import metrics_service

db = SessionLocal()

# Calculate metrics for today
print("Calculating metrics for today and last 30 days...")
today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

for i in range(31):  # Calculate for last 31 days
    date = today - timedelta(days=i)
    try:
        metrics = metrics_service.calculate_claim_processing_metrics(db, date)
        if metrics.total_claims_processed > 0:
            print(f"✓ Calculated metrics for {date.date()}: {metrics.total_claims_processed} claims, {metrics.claims_approved} approved")
    except Exception as e:
        pass  # Skip if error

db.close()
print("\n✓ Metrics calculation complete!")
