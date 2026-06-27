"""
Metrics calculation service for dashboard analytics.
Calculates various metrics for claims processing, AI automation, revenue, compliance, and operational efficiency.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import json
from app.models.claim import Claim, ClaimItem, ClaimStatus, ClaimValidation
from app.models.medical_code import MedicalCode, CodeStatus
from app.models.audit_log import AuditLog
from app.models.metrics import (
    ClaimProcessingMetrics, AIAutomationMetrics, RevenueFinancialMetrics,
    ComplianceAuditMetrics, OperationalEfficiencyMetrics
)
from app.models.user import User


class MetricsService:
    """Service for calculating and storing dashboard metrics."""
    
    @staticmethod
    def calculate_claim_processing_metrics(db: Session, date: datetime = None) -> ClaimProcessingMetrics:
        """Calculate claims processing metrics for a given date."""
        if date is None:
            date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        # Get all claims for the day
        claims = db.query(Claim).filter(
            Claim.created_at >= start_of_day,
            Claim.created_at < end_of_day
        ).all()
        
        total_claims = len(claims)
        approved = len([c for c in claims if c.status == ClaimStatus.APPROVED])
        denied = len([c for c in claims if c.status == ClaimStatus.DENIED])
        pending = len([c for c in claims if c.status in [ClaimStatus.SUBMITTED, ClaimStatus.PROCESSING]])
        
        # Calculate turnaround time (time from submission to approval/denial)
        tat_claims = [c for c in claims if c.submission_date and (c.processing_date or c.status in [ClaimStatus.APPROVED, ClaimStatus.DENIED])]
        total_tat = 0
        for claim in tat_claims:
            end_time = claim.processing_date if claim.processing_date else claim.updated_at
            if end_time and claim.submission_date:
                tat_hours = (end_time - claim.submission_date).total_seconds() / 3600
                total_tat += tat_hours
        
        avg_tat = total_tat / len(tat_claims) if tat_claims else 0.0
        
        # Calculate claims value
        total_value = sum([c.total_amount or 0 for c in claims])
        approved_value = sum([c.total_amount or 0 for c in claims if c.status == ClaimStatus.APPROVED])
        denied_value = sum([c.total_amount or 0 for c in claims if c.status == ClaimStatus.DENIED])
        
        # Payer-wise performance
        payer_performance = {}
        for claim in claims:
            payer = claim.insurance_provider or "Unknown"
            if payer not in payer_performance:
                payer_performance[payer] = {"approved": 0, "denied": 0, "total_value": 0}
            if claim.status == ClaimStatus.APPROVED:
                payer_performance[payer]["approved"] += 1
            elif claim.status == ClaimStatus.DENIED:
                payer_performance[payer]["denied"] += 1
            payer_performance[payer]["total_value"] += claim.total_amount or 0
        
        metrics = ClaimProcessingMetrics(
            date=date,
            total_claims_processed=total_claims,
            claims_approved=approved,
            claims_denied=denied,
            claims_pending=pending,
            avg_turnaround_time_hours=round(avg_tat, 2),
            total_claims_value=round(total_value, 2),
            approved_claims_value=round(approved_value, 2),
            denied_claims_value=round(denied_value, 2),
            payer_performance=payer_performance
        )
        
        db.add(metrics)
        db.commit()
        db.refresh(metrics)
        return metrics
    
    @staticmethod
    def calculate_ai_automation_metrics(db: Session, date: datetime = None) -> AIAutomationMetrics:
        """Calculate AI automation metrics for a given date."""
        if date is None:
            date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        # Get all medical codes created today
        codes = db.query(MedicalCode).filter(
            MedicalCode.created_at >= start_of_day,
            MedicalCode.created_at < end_of_day
        ).all()
        
        total_codes = len(codes)
        approved_codes = len([c for c in codes if c.status == CodeStatus.APPROVED])
        rejected_codes = len([c for c in codes if c.status == CodeStatus.REJECTED])
        suggested_codes = len([c for c in codes if c.status == CodeStatus.SUGGESTED])
        
        # Calculate auto-coded percentage (codes approved without manual review)
        # Assuming codes approved within 1 hour of creation are auto-approved
        auto_approved = len([
            c for c in codes 
            if c.status == CodeStatus.APPROVED and c.approved_by and 
            ((c.updated_at - c.created_at).total_seconds() < 3600)
        ])
        
        auto_coded_percentage = (auto_approved / total_codes * 100) if total_codes > 0 else 0.0
        manual_review_percentage = 100 - auto_coded_percentage
        
        # AI accuracy (percentage of suggested codes that get approved)
        ai_accuracy = (approved_codes / total_codes * 100) if total_codes > 0 else 0.0
        
        # Average confidence score
        avg_confidence = sum([c.confidence_score or 0 for c in codes]) / total_codes if codes else 0.0
        
        # Rejection reasons (simulated - in real system, track actual rejection reasons)
        rejection_reasons = {
            "insufficient_documentation": {"count": rejected_codes // 3 if rejected_codes > 0 else 0, "percentage": 0},
            "incorrect_code": {"count": rejected_codes // 3 if rejected_codes > 0 else 0, "percentage": 0},
            "medical_necessity": {"count": rejected_codes // 3 if rejected_codes > 0 else 0, "percentage": 0}
        }
        total_rejections = sum([r["count"] for r in rejection_reasons.values()])
        for reason in rejection_reasons:
            if total_rejections > 0:
                rejection_reasons[reason]["percentage"] = round(rejection_reasons[reason]["count"] / total_rejections * 100, 2)
        
        # Confidence score distribution
        confidence_distribution = {
            "0.0-0.2": len([c for c in codes if 0 <= (c.confidence_score or 0) < 0.2]),
            "0.2-0.4": len([c for c in codes if 0.2 <= (c.confidence_score or 0) < 0.4]),
            "0.4-0.6": len([c for c in codes if 0.4 <= (c.confidence_score or 0) < 0.6]),
            "0.6-0.8": len([c for c in codes if 0.6 <= (c.confidence_score or 0) < 0.8]),
            "0.8-1.0": len([c for c in codes if 0.8 <= (c.confidence_score or 0) <= 1.0])
        }
        
        metrics = AIAutomationMetrics(
            date=date,
            total_claims_processed=total_codes,  # Using codes as proxy for claims
            auto_coded_claims=auto_approved,
            manual_review_claims=total_codes - auto_approved,
            auto_coded_percentage=round(auto_coded_percentage, 2),
            ai_accuracy_score=round(ai_accuracy, 2),
            human_accuracy_score=95.0,  # Baseline human accuracy
            avg_confidence_score=round(avg_confidence, 2),
            rejection_reasons=rejection_reasons,
            confidence_distribution=confidence_distribution
        )
        
        db.add(metrics)
        db.commit()
        db.refresh(metrics)
        return metrics
    
    @staticmethod
    def calculate_revenue_financial_metrics(db: Session, date: datetime = None) -> RevenueFinancialMetrics:
        """Calculate revenue and financial metrics for a given date."""
        if date is None:
            date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        # Get all claims for the day
        claims = db.query(Claim).filter(
            Claim.created_at >= start_of_day,
            Claim.created_at < end_of_day
        ).all()
        
        submitted_value = sum([c.total_amount or 0 for c in claims])
        paid_value = sum([c.total_amount or 0 for c in claims if c.status == ClaimStatus.PAID])
        denied_value = sum([c.total_amount or 0 for c in claims if c.status == ClaimStatus.DENIED])
        pending_value = sum([c.total_amount or 0 for c in claims if c.status in [ClaimStatus.SUBMITTED, ClaimStatus.PROCESSING]])
        
        revenue_processed = submitted_value  # Total revenue from processed claims
        net_revenue = paid_value - denied_value
        recovery_rate = (paid_value / submitted_value * 100) if submitted_value > 0 else 0.0
        denial_loss_percentage = (denied_value / submitted_value * 100) if submitted_value > 0 else 0.0
        avg_claim_value = submitted_value / len(claims) if claims else 0.0
        
        # Calculate payment cycle time (average days from submission to payment)
        paid_claims = [c for c in claims if c.status == ClaimStatus.PAID and c.submitted_at and c.paid_at]
        payment_cycle_times = [(c.paid_at - c.submitted_at).days for c in paid_claims if (c.paid_at - c.submitted_at).days > 0]
        payment_cycle_time_days = sum(payment_cycle_times) / len(payment_cycle_times) if payment_cycle_times else 0.0
        
        # Revenue by payer
        revenue_by_payer = {}
        for claim in claims:
            payer = claim.insurance_provider or "Unknown"
            if payer not in revenue_by_payer:
                revenue_by_payer[payer] = {"submitted": 0, "paid": 0, "denied": 0}
            revenue_by_payer[payer]["submitted"] += claim.total_amount or 0
            if claim.status == ClaimStatus.PAID:
                revenue_by_payer[payer]["paid"] += claim.total_amount or 0
            elif claim.status == ClaimStatus.DENIED:
                revenue_by_payer[payer]["denied"] += claim.total_amount or 0
        
        # Revenue by code (using claim items)
        claim_items = db.query(ClaimItem).filter(
            ClaimItem.created_at >= start_of_day,
            ClaimItem.created_at < end_of_day
        ).all()
        
        revenue_by_code = {}
        for item in claim_items:
            code = item.procedure_code or "Unknown"
            if code not in revenue_by_code:
                revenue_by_code[code] = {"count": 0, "value": 0}
            revenue_by_code[code]["count"] += 1
            revenue_by_code[code]["value"] += item.amount or 0
        
        metrics = RevenueFinancialMetrics(
            date=date,
            revenue_processed=round(revenue_processed, 2),
            claims_submitted_value=round(submitted_value, 2),
            claims_paid_value=round(paid_value, 2),
            claims_denied_value=round(denied_value, 2),
            pending_claims_value=round(pending_value, 2),
            net_revenue=round(net_revenue, 2),
            recovery_rate=round(recovery_rate, 2),
            denial_loss_percentage=round(denial_loss_percentage, 2),
            average_claim_value=round(avg_claim_value, 2),
            payment_cycle_time_days=round(payment_cycle_time_days, 2),
            revenue_by_payer=revenue_by_payer,
            revenue_by_code=revenue_by_code
        )
        
        db.add(metrics)
        db.commit()
        db.refresh(metrics)
        return metrics
    
    @staticmethod
    def calculate_compliance_audit_metrics(db: Session, date: datetime = None) -> ComplianceAuditMetrics:
        """Calculate compliance and audit metrics for a given date."""
        if date is None:
            date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        # Get all claim validations for the day
        validations = db.query(ClaimValidation).filter(
            ClaimValidation.created_at >= start_of_day,
            ClaimValidation.created_at < end_of_day
        ).all()
        
        total_audits = len(validations)
        passed_audits = len([v for v in validations if v.is_valid])
        failed_audits = len([v for v in validations if not v.is_valid])
        
        # Calculate compliance score
        compliance_score = (passed_audits / total_audits * 100) if total_audits > 0 else 100.0
        
        # Count violations by type
        hipaa_violations = len([v for v in validations if "hipaa" in (v.error_message or "").lower()])
        coding_errors = len([v for v in validations if "coding" in (v.error_message or "").lower()])
        documentation_errors = len([v for v in validations if "documentation" in (v.error_message or "").lower()])
        
        # Risk categorization based on validation severity
        high_risk = len([v for v in validations if v.severity == "error"])
        medium_risk = len([v for v in validations if v.severity == "warning"])
        low_risk = len([v for v in validations if v.severity == "info"])
        
        # Audit findings summary
        audit_findings = []
        if coding_errors > 0:
            audit_findings.append({"category": "coding", "severity": "high", "count": coding_errors})
        if documentation_errors > 0:
            audit_findings.append({"category": "documentation", "severity": "medium", "count": documentation_errors})
        if hipaa_violations > 0:
            audit_findings.append({"category": "hipaa", "severity": "critical", "count": hipaa_violations})
        
        violation_types = {
            "hipaa": hipaa_violations,
            "coding": coding_errors,
            "documentation": documentation_errors
        }
        
        metrics = ComplianceAuditMetrics(
            date=date,
            coding_compliance_score=round(compliance_score, 2),
            total_audits_performed=total_audits,
            audits_passed=passed_audits,
            audits_failed=failed_audits,
            hipaa_violations=hipaa_violations,
            coding_errors=coding_errors,
            documentation_errors=documentation_errors,
            high_risk_claims=high_risk,
            medium_risk_claims=medium_risk,
            low_risk_claims=low_risk,
            audit_findings=audit_findings,
            violation_types=violation_types
        )
        
        db.add(metrics)
        db.commit()
        db.refresh(metrics)
        return metrics
    
    @staticmethod
    def calculate_operational_efficiency_metrics(db: Session, date: datetime = None) -> OperationalEfficiencyMetrics:
        """Calculate operational efficiency metrics for a given date."""
        if date is None:
            date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        # Get all claims for the day
        claims = db.query(Claim).filter(
            Claim.created_at >= start_of_day,
            Claim.created_at < end_of_day
        ).all()
        
        # Calculate average processing time
        processing_times = []
        for claim in claims:
            if claim.created_at and claim.updated_at:
                processing_time = (claim.updated_at - claim.created_at).total_seconds() / 3600
                processing_times.append(processing_time)
        
        avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0.0
        
        # Queue backlog (claims still in processing/submitted status)
        queue_backlog = db.query(Claim).filter(
            Claim.status.in_([ClaimStatus.SUBMITTED, ClaimStatus.PROCESSING])
        ).count()
        
        # Claims processed per day
        claims_processed = len([c for c in claims if c.status in [ClaimStatus.APPROVED, ClaimStatus.DENIED, ClaimStatus.PAID]])
        
        # Productivity per coder (simulated - group by created_by)
        productivity_per_coder = {}
        for claim in claims:
            if claim.created_by:
                coder_id = str(claim.created_by)
                if coder_id not in productivity_per_coder:
                    productivity_per_coder[coder_id] = {"claims_processed": 0, "avg_time": 0}
                productivity_per_coder[coder_id]["claims_processed"] += 1
        
        # SLA adherence (assuming 24-hour SLA for claim processing)
        sla_breaches = len([
            c for c in claims 
            if c.created_at and c.updated_at and 
            (c.updated_at - c.created_at).total_seconds() > 86400  # 24 hours
        ])
        sla_adherence = ((claims_processed - sla_breaches) / claims_processed * 100) if claims_processed > 0 else 100.0
        
        # Average review time (time from submission to processing)
        review_times = []
        for claim in claims:
            if claim.submission_date and (claim.processing_date or claim.updated_at):
                review_time = ((claim.processing_date or claim.updated_at) - claim.submission_date).total_seconds() / 3600
                review_times.append(review_time)
        
        avg_review_time = sum(review_times) / len(review_times) if review_times else 0.0
        
        # Coder utilization (simulated as percentage of working hours used)
        total_coders = db.query(User).filter(User.role == "coder").count() or 1
        coder_utilization = (claims_processed / (total_coders * 20)) * 100 if total_coders > 0 else 0  # Assuming 20 claims per coder per day
        
        metrics = OperationalEfficiencyMetrics(
            date=date,
            avg_processing_time_hours=round(avg_processing_time, 2),
            queue_backlog=queue_backlog,
            total_claims_in_queue=queue_backlog,
            claims_processed_per_day=claims_processed,
            productivity_per_coder=productivity_per_coder,
            sla_adherence_rate=round(sla_adherence, 2),
            sla_breaches=sla_breaches,
            avg_review_time_hours=round(avg_review_time, 2),
            coder_utilization=round(min(coder_utilization, 100), 2),
            system_uptime_percentage=99.5  # Simulated system uptime
        )
        
        db.add(metrics)
        db.commit()
        db.refresh(metrics)
        return metrics
    
    @staticmethod
    def get_metrics_history(db: Session, metric_type: str, days: int = 30) -> List[Dict]:
        """Get historical metrics for a given type and time range."""
        end_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        start_date = end_date - timedelta(days=days)
        
        model_map = {
            "claims_processing": ClaimProcessingMetrics,
            "ai_automation": AIAutomationMetrics,
            "revenue_financial": RevenueFinancialMetrics,
            "compliance_audit": ComplianceAuditMetrics,
            "operational_efficiency": OperationalEfficiencyMetrics
        }
        
        model = model_map.get(metric_type)
        if not model:
            return []
        
        metrics = db.query(model).filter(
            model.date >= start_date,
            model.date < end_date
        ).order_by(model.date).all()
        
        return [
            {
                "date": m.date.isoformat(),
                **{k: v for k, v in m.__dict__.items() if not k.startswith('_')}
            }
            for m in metrics
        ]
    
    @staticmethod
    def get_aggregate_metrics(db: Session, start_date: datetime, end_date: datetime) -> Dict:
        """Get aggregate metrics across all types for a date range."""
        # Get all metrics in the range
        claim_metrics = db.query(ClaimProcessingMetrics).filter(
            ClaimProcessingMetrics.date >= start_date,
            ClaimProcessingMetrics.date < end_date
        ).all()
        
        ai_metrics = db.query(AIAutomationMetrics).filter(
            AIAutomationMetrics.date >= start_date,
            AIAutomationMetrics.date < end_date
        ).all()
        
        revenue_metrics = db.query(RevenueFinancialMetrics).filter(
            RevenueFinancialMetrics.date >= start_date,
            RevenueFinancialMetrics.date < end_date
        ).all()
        
        compliance_metrics = db.query(ComplianceAuditMetrics).filter(
            ComplianceAuditMetrics.date >= start_date,
            ComplianceAuditMetrics.date < end_date
        ).all()
        
        efficiency_metrics = db.query(OperationalEfficiencyMetrics).filter(
            OperationalEfficiencyMetrics.date >= start_date,
            OperationalEfficiencyMetrics.date < end_date
        ).all()
        
        return {
            "claims_processing": {
                "total_claims_processed": sum([m.total_claims_processed for m in claim_metrics]),
                "total_approved": sum([m.claims_approved for m in claim_metrics]),
                "total_denied": sum([m.claims_denied for m in claim_metrics]),
                "avg_turnaround_time": sum([m.avg_turnaround_time_hours for m in claim_metrics]) / len(claim_metrics) if claim_metrics else 0,
                "total_value": sum([m.total_claims_value for m in claim_metrics])
            },
            "ai_automation": {
                "total_auto_coded": sum([m.auto_coded_claims for m in ai_metrics]),
                "avg_auto_coded_percentage": sum([m.auto_coded_percentage for m in ai_metrics]) / len(ai_metrics) if ai_metrics else 0,
                "avg_ai_accuracy": sum([m.ai_accuracy_score for m in ai_metrics]) / len(ai_metrics) if ai_metrics else 0,
                "avg_confidence_score": sum([m.avg_confidence_score for m in ai_metrics]) / len(ai_metrics) if ai_metrics else 0
            },
            "revenue_financial": {
                "total_revenue": sum([m.total_revenue for m in revenue_metrics]),
                "total_submitted": sum([m.claims_submitted_value for m in revenue_metrics]),
                "collection_rate": sum([m.collection_rate for m in revenue_metrics]) / len(revenue_metrics) if revenue_metrics else 0,
                "denial_rate": sum([m.denial_rate for m in revenue_metrics]) / len(revenue_metrics) if revenue_metrics else 0
            },
            "compliance_audit": {
                "total_audits": sum([m.total_audits_performed for m in compliance_metrics]),
                "avg_compliance_score": sum([m.coding_compliance_score for m in compliance_metrics]) / len(compliance_metrics) if compliance_metrics else 0,
                "total_violations": sum([m.hipaa_violations + m.coding_errors for m in compliance_metrics])
            },
            "operational_efficiency": {
                "avg_processing_time": sum([m.avg_processing_time_hours for m in efficiency_metrics]) / len(efficiency_metrics) if efficiency_metrics else 0,
                "current_backlog": efficiency_metrics[-1].queue_backlog if efficiency_metrics else 0,
                "avg_sla_adherence": sum([m.sla_adherence_rate for m in efficiency_metrics]) / len(efficiency_metrics) if efficiency_metrics else 0
            }
        }


# Global metrics service instance
metrics_service = MetricsService()
