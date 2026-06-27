from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from app.db.database import get_db
from app.services.metrics_service import metrics_service
from app.core.deps import get_current_active_user
from app.models.user import User as UserModel

router = APIRouter()


@router.post("/calculate/all")
async def calculate_all_metrics(
    date: Optional[str] = Query(None, description="Date in ISO format (YYYY-MM-DD). Defaults to today."),
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Calculate all metrics for a given date."""
    try:
        target_date = None
        if date:
            target_date = datetime.fromisoformat(date)
        
        # Calculate all metrics
        claim_metrics = metrics_service.calculate_claim_processing_metrics(db, target_date)
        ai_metrics = metrics_service.calculate_ai_automation_metrics(db, target_date)
        revenue_metrics = metrics_service.calculate_revenue_financial_metrics(db, target_date)
        compliance_metrics = metrics_service.calculate_compliance_audit_metrics(db, target_date)
        efficiency_metrics = metrics_service.calculate_operational_efficiency_metrics(db, target_date)
        
        return {
            "message": "All metrics calculated successfully",
            "date": target_date.isoformat() if target_date else datetime.now().isoformat(),
            "metrics": {
                "claims_processing": {
                    "id": claim_metrics.id,
                    "total_claims_processed": claim_metrics.total_claims_processed,
                    "claims_approved": claim_metrics.claims_approved,
                    "claims_denied": claim_metrics.claims_denied,
                    "claims_pending": claim_metrics.claims_pending,
                    "avg_turnaround_time_hours": claim_metrics.avg_turnaround_time_hours,
                    "total_claims_value": claim_metrics.total_claims_value,
                    "approved_claims_value": claim_metrics.approved_claims_value,
                    "denied_claims_value": claim_metrics.denied_claims_value,
                    "payer_performance": claim_metrics.payer_performance
                },
                "ai_automation": {
                    "id": ai_metrics.id,
                    "total_claims_processed": ai_metrics.total_claims_processed,
                    "auto_coded_claims": ai_metrics.auto_coded_claims,
                    "manual_review_claims": ai_metrics.manual_review_claims,
                    "auto_coded_percentage": ai_metrics.auto_coded_percentage,
                    "ai_accuracy_score": ai_metrics.ai_accuracy_score,
                    "human_accuracy_score": ai_metrics.human_accuracy_score,
                    "avg_confidence_score": ai_metrics.avg_confidence_score,
                    "rejection_reasons": ai_metrics.rejection_reasons,
                    "confidence_distribution": ai_metrics.confidence_distribution
                },
                "revenue_financial": {
                    "id": revenue_metrics.id,
                    "total_revenue": revenue_metrics.total_revenue,
                    "claims_submitted_value": revenue_metrics.claims_submitted_value,
                    "claims_paid_value": revenue_metrics.claims_paid_value,
                    "claims_denied_value": revenue_metrics.claims_denied_value,
                    "pending_claims_value": revenue_metrics.pending_claims_value,
                    "net_revenue": revenue_metrics.net_revenue,
                    "collection_rate": revenue_metrics.collection_rate,
                    "denial_rate": revenue_metrics.denial_rate,
                    "average_claim_value": revenue_metrics.average_claim_value,
                    "revenue_by_payer": revenue_metrics.revenue_by_payer,
                    "revenue_by_code": revenue_metrics.revenue_by_code
                },
                "compliance_audit": {
                    "id": compliance_metrics.id,
                    "coding_compliance_score": compliance_metrics.coding_compliance_score,
                    "total_audits_performed": compliance_metrics.total_audits_performed,
                    "audits_passed": compliance_metrics.audits_passed,
                    "audits_failed": compliance_metrics.audits_failed,
                    "hipaa_violations": compliance_metrics.hipaa_violations,
                    "coding_errors": compliance_metrics.coding_errors,
                    "documentation_errors": compliance_metrics.documentation_errors,
                    "high_risk_claims": compliance_metrics.high_risk_claims,
                    "medium_risk_claims": compliance_metrics.medium_risk_claims,
                    "low_risk_claims": compliance_metrics.low_risk_claims,
                    "audit_findings": compliance_metrics.audit_findings,
                    "violation_types": compliance_metrics.violation_types
                },
                "operational_efficiency": {
                    "id": efficiency_metrics.id,
                    "avg_processing_time_hours": efficiency_metrics.avg_processing_time_hours,
                    "queue_backlog": efficiency_metrics.queue_backlog,
                    "total_claims_in_queue": efficiency_metrics.total_claims_in_queue,
                    "claims_processed_per_day": efficiency_metrics.claims_processed_per_day,
                    "productivity_per_coder": efficiency_metrics.productivity_per_coder,
                    "sla_adherence_rate": efficiency_metrics.sla_adherence_rate,
                    "sla_breaches": efficiency_metrics.sla_breaches,
                    "avg_review_time_hours": efficiency_metrics.avg_review_time_hours,
                    "coder_utilization": efficiency_metrics.coder_utilization,
                    "system_uptime_percentage": efficiency_metrics.system_uptime_percentage
                }
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate metrics: {str(e)}"
        )


@router.get("/claims-processing")
async def get_claims_processing_metrics(
    days: int = Query(30, description="Number of days of history to retrieve"),
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get claims processing metrics history."""
    try:
        history = metrics_service.get_metrics_history(db, "claims_processing", days)
        return {
            "metric_type": "claims_processing",
            "days": days,
            "history": history
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve metrics: {str(e)}"
        )


@router.get("/ai-automation")
async def get_ai_automation_metrics(
    days: int = Query(30, description="Number of days of history to retrieve"),
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI automation metrics history."""
    try:
        history = metrics_service.get_metrics_history(db, "ai_automation", days)
        return {
            "metric_type": "ai_automation",
            "days": days,
            "history": history
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve metrics: {str(e)}"
        )


@router.get("/revenue-financial")
async def get_revenue_financial_metrics(
    days: int = Query(30, description="Number of days of history to retrieve"),
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get revenue and financial metrics history."""
    try:
        history = metrics_service.get_metrics_history(db, "revenue_financial", days)
        return {
            "metric_type": "revenue_financial",
            "days": days,
            "history": history
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve metrics: {str(e)}"
        )


@router.get("/compliance-audit")
async def get_compliance_audit_metrics(
    days: int = Query(30, description="Number of days of history to retrieve"),
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get compliance and audit metrics history."""
    try:
        history = metrics_service.get_metrics_history(db, "compliance_audit", days)
        return {
            "metric_type": "compliance_audit",
            "days": days,
            "history": history
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve metrics: {str(e)}"
        )


@router.get("/operational-efficiency")
async def get_operational_efficiency_metrics(
    days: int = Query(30, description="Number of days of history to retrieve"),
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get operational efficiency metrics history."""
    try:
        history = metrics_service.get_metrics_history(db, "operational_efficiency", days)
        return {
            "metric_type": "operational_efficiency",
            "days": days,
            "history": history
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve metrics: {str(e)}"
        )


@router.get("/aggregate")
async def get_aggregate_metrics(
    start_date: str = Query(..., description="Start date in ISO format (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date in ISO format (YYYY-MM-DD)"),
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get aggregate metrics across all types for a date range."""
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        
        aggregate = metrics_service.get_aggregate_metrics(db, start, end)
        
        return {
            "start_date": start_date,
            "end_date": end_date,
            "aggregate_metrics": aggregate
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date format: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve aggregate metrics: {str(e)}"
        )


@router.get("/dashboard-summary")
async def get_dashboard_summary(
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a summary of all metrics for the dashboard."""
    try:
        # Get today's date
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Get metrics for the last 7 days
        start_date = today - timedelta(days=7)
        
        aggregate = metrics_service.get_aggregate_metrics(db, start_date, today + timedelta(days=1))
        
        # Get latest metrics for each type
        from app.models.metrics import (
            ClaimProcessingMetrics, AIAutomationMetrics, RevenueFinancialMetrics,
            ComplianceAuditMetrics, OperationalEfficiencyMetrics
        )
        
        latest_claim = db.query(ClaimProcessingMetrics).order_by(ClaimProcessingMetrics.date.desc()).first()
        latest_ai = db.query(AIAutomationMetrics).order_by(AIAutomationMetrics.date.desc()).first()
        latest_revenue = db.query(RevenueFinancialMetrics).order_by(RevenueFinancialMetrics.date.desc()).first()
        latest_compliance = db.query(ComplianceAuditMetrics).order_by(ComplianceAuditMetrics.date.desc()).first()
        latest_efficiency = db.query(OperationalEfficiencyMetrics).order_by(OperationalEfficiencyMetrics.date.desc()).first()
        
        return {
            "summary_date": today.isoformat(),
            "aggregate_7_days": aggregate,
            "latest_metrics": {
                "claims_processing": {
                    "date": latest_claim.date.isoformat() if latest_claim else None,
                    "total_claims_processed": latest_claim.total_claims_processed if latest_claim else 0,
                    "claims_approved": latest_claim.claims_approved if latest_claim else 0,
                    "claims_denied": latest_claim.claims_denied if latest_claim else 0,
                    "avg_turnaround_time_hours": latest_claim.avg_turnaround_time_hours if latest_claim else 0,
                    "total_claims_value": latest_claim.total_claims_value if latest_claim else 0
                } if latest_claim else None,
                "ai_automation": {
                    "date": latest_ai.date.isoformat() if latest_ai else None,
                    "auto_coded_percentage": latest_ai.auto_coded_percentage if latest_ai else 0,
                    "ai_accuracy_score": latest_ai.ai_accuracy_score if latest_ai else 0,
                    "avg_confidence_score": latest_ai.avg_confidence_score if latest_ai else 0
                } if latest_ai else None,
                "revenue_financial": {
                    "date": latest_revenue.date.isoformat() if latest_revenue else None,
                    "total_revenue": latest_revenue.total_revenue if latest_revenue else 0,
                    "collection_rate": latest_revenue.collection_rate if latest_revenue else 0,
                    "denial_rate": latest_revenue.denial_rate if latest_revenue else 0
                } if latest_revenue else None,
                "compliance_audit": {
                    "date": latest_compliance.date.isoformat() if latest_compliance else None,
                    "coding_compliance_score": latest_compliance.coding_compliance_score if latest_compliance else 0,
                    "total_audits_performed": latest_compliance.total_audits_performed if latest_compliance else 0,
                    "total_violations": (latest_compliance.hipaa_violations + latest_compliance.coding_errors) if latest_compliance else 0
                } if latest_compliance else None,
                "operational_efficiency": {
                    "date": latest_efficiency.date.isoformat() if latest_efficiency else None,
                    "avg_processing_time_hours": latest_efficiency.avg_processing_time_hours if latest_efficiency else 0,
                    "queue_backlog": latest_efficiency.queue_backlog if latest_efficiency else 0,
                    "sla_adherence_rate": latest_efficiency.sla_adherence_rate if latest_efficiency else 0
                } if latest_efficiency else None
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dashboard summary: {str(e)}"
        )
