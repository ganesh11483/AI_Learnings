from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class MetricType(str, enum.Enum):
    CLAIMS_PROCESSING = "claims_processing"
    AI_AUTOMATION = "ai_automation"
    REVENUE_FINANCIAL = "revenue_financial"
    COMPLIANCE_AUDIT = "compliance_audit"
    OPERATIONAL_EFFICIENCY = "operational_efficiency"


class ClaimProcessingMetrics(Base):
    __tablename__ = "claim_processing_metrics"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), nullable=False)
    total_claims_processed = Column(Integer, default=0)
    claims_approved = Column(Integer, default=0)
    claims_denied = Column(Integer, default=0)
    claims_pending = Column(Integer, default=0)
    avg_turnaround_time_hours = Column(Float, default=0.0)
    total_claims_value = Column(Float, default=0.0)
    approved_claims_value = Column(Float, default=0.0)
    denied_claims_value = Column(Float, default=0.0)
    payer_performance = Column(JSON)  # {"payer_name": {"approved": 10, "denied": 2, "total_value": 5000}}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AIAutomationMetrics(Base):
    __tablename__ = "ai_automation_metrics"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), nullable=False)
    total_claims_processed = Column(Integer, default=0)
    auto_coded_claims = Column(Integer, default=0)
    manual_review_claims = Column(Integer, default=0)
    auto_coded_percentage = Column(Float, default=0.0)
    ai_accuracy_score = Column(Float, default=0.0)
    human_accuracy_score = Column(Float, default=0.0)
    avg_confidence_score = Column(Float, default=0.0)
    rejection_reasons = Column(JSON)  # {"reason": {"count": 5, "percentage": 10.5}}
    confidence_distribution = Column(JSON)  # {"0.0-0.2": 10, "0.2-0.4": 20, "0.4-0.6": 30, "0.6-0.8": 25, "0.8-1.0": 15}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class RevenueFinancialMetrics(Base):
    __tablename__ = "revenue_financial_metrics"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), nullable=False)
    revenue_processed = Column(Float, default=0.0)  # Total revenue from processed claims
    claims_submitted_value = Column(Float, default=0.0)
    claims_paid_value = Column(Float, default=0.0)
    claims_denied_value = Column(Float, default=0.0)
    pending_claims_value = Column(Float, default=0.0)
    net_revenue = Column(Float, default=0.0)
    recovery_rate = Column(Float, default=0.0)  # Renamed from collection_rate
    denial_loss_percentage = Column(Float, default=0.0)
    average_claim_value = Column(Float, default=0.0)
    payment_cycle_time_days = Column(Float, default=0.0)  # NEW: Average days from submission to payment
    revenue_by_payer = Column(JSON)  # {"payer_name": {"submitted": 5000, "paid": 4500, "denied": 500}}
    revenue_by_code = Column(JSON)  # {"code": {"count": 10, "value": 5000}}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ComplianceAuditMetrics(Base):
    __tablename__ = "compliance_audit_metrics"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), nullable=False)
    coding_compliance_score = Column(Float, default=0.0)
    total_audits_performed = Column(Integer, default=0)
    audits_passed = Column(Integer, default=0)
    audits_failed = Column(Integer, default=0)
    hipaa_violations = Column(Integer, default=0)
    coding_errors = Column(Integer, default=0)
    documentation_errors = Column(Integer, default=0)
    high_risk_claims = Column(Integer, default=0)
    medium_risk_claims = Column(Integer, default=0)
    low_risk_claims = Column(Integer, default=0)
    audit_findings = Column(JSON)  # [{"category": "coding", "severity": "high", "count": 5}]
    violation_types = Column(JSON)  # {"hipaa": 2, "coding": 10, "documentation": 3}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class OperationalEfficiencyMetrics(Base):
    __tablename__ = "operational_efficiency_metrics"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), nullable=False)
    avg_processing_time_hours = Column(Float, default=0.0)
    queue_backlog = Column(Integer, default=0)
    total_claims_in_queue = Column(Integer, default=0)
    claims_processed_per_day = Column(Integer, default=0)
    productivity_per_coder = Column(JSON)  # {"coder_id": {"claims_processed": 50, "avg_time": 2.5}}
    sla_adherence_rate = Column(Float, default=0.0)
    sla_breaches = Column(Integer, default=0)
    avg_review_time_hours = Column(Float, default=0.0)
    coder_utilization = Column(Float, default=0.0)
    system_uptime_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
