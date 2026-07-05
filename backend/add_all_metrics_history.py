#!/usr/bin/env python
"""Add operational efficiency, compliance, and revenue metrics for multiple dates."""
from datetime import datetime, timedelta
import app.main
from app.db.database import SessionLocal
from app.models.metrics import OperationalEfficiencyMetrics, ComplianceAuditMetrics, RevenueFinancialMetrics
from app.models.claim import Claim, ClaimStatus

db = SessionLocal()

# Get claims data
claims = db.query(Claim).all()
total_claims = len(claims)
total_value = sum([c.total_amount or 0 for c in claims])
paid_value = sum([c.total_amount or 0 for c in claims if c.status == ClaimStatus.PAID])
denied_value = sum([c.total_amount or 0 for c in claims if c.status == ClaimStatus.DENIED])

today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

print("Creating metrics for past 10 days...")
for i in range(10):
    date = today - timedelta(days=i)
    
    # Operational Efficiency
    existing_eff = db.query(OperationalEfficiencyMetrics).filter(OperationalEfficiencyMetrics.date == date).first()
    if not existing_eff:
        efficiency = OperationalEfficiencyMetrics(
            date=date,
            avg_processing_time_hours=48.5 + (i % 3),
            queue_backlog=15 - (i % 5),
            total_claims_in_queue=15 - (i % 5),
            claims_processed_per_day=25 + (i % 4),
            productivity_per_coder={"coder_1": {"claims_processed": 25 + (i % 3), "avg_time": 2.5}},
            sla_adherence_rate=92.3 + (i % 2),
            sla_breaches=3 - (i % 2),
            avg_review_time_hours=2.25,
            coder_utilization=85.5 + (i % 3),
            system_uptime_percentage=99.8
        )
        db.add(efficiency)
        print(f"✓ Efficiency metrics for {date.date()}")
    
    # Compliance Audit
    existing_comp = db.query(ComplianceAuditMetrics).filter(ComplianceAuditMetrics.date == date).first()
    if not existing_comp:
        compliance = ComplianceAuditMetrics(
            date=date,
            coding_compliance_score=94.2 + (i % 2),
            total_audits_performed=50,
            audits_passed=47 + (i % 2),
            audits_failed=3 - (i % 2),
            hipaa_violations=0,
            coding_errors=3,
            documentation_errors=1,
            high_risk_claims=2,
            medium_risk_claims=8,
            low_risk_claims=65,
            audit_findings={
                "coding_accuracy": 95.0,
                "documentation_completeness": 92.0,
                "compliance_adherence": 94.0
            },
            violation_types={
                "missing_documentation": 1,
                "incorrect_coding": 2,
                "other": 0
            }
        )
        db.add(compliance)
        print(f"✓ Compliance metrics for {date.date()}")
    
    # Revenue Financial
    existing_rev = db.query(RevenueFinancialMetrics).filter(RevenueFinancialMetrics.date == date).first()
    if not existing_rev:
        revenue = RevenueFinancialMetrics(
            date=date,
            revenue_processed=total_value + (i * 100),
            claims_submitted_value=total_value + (i * 100),
            claims_paid_value=paid_value + (i * 50),
            claims_denied_value=denied_value,
            pending_claims_value=(total_value - paid_value - denied_value) + (i * 50),
            net_revenue=(paid_value - denied_value) + (i * 50),
            recovery_rate=(paid_value / total_value * 100) if total_value > 0 else 0,
            denial_loss_percentage=(denied_value / total_value * 100) if total_value > 0 else 0,
            average_claim_value=(total_value / total_claims) if total_claims > 0 else 0,
            payment_cycle_time_days=5.5,
            revenue_by_payer={
                "Blue Cross": (paid_value * 0.35) + (i * 25),
                "Aetna": (paid_value * 0.35) + (i * 25),
                "UnitedHealth": (paid_value * 0.30) + (i * 15)
            },
            revenue_by_code={}
        )
        db.add(revenue)
        print(f"✓ Revenue metrics for {date.date()}")

db.commit()
print("\n✓ All metrics for past 10 days created successfully!")
db.close()
