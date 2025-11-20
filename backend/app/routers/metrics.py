"""
Router de Métricas
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import Dict
from app.database import get_db
from app.models.job import Job
from app.models.finding import Finding, FindingSeverity
from app.models.target import Target
from app.models.user import User
from app.schemas.metrics import (
    MetricsSummary,
    MetricsBySeverityResponse,
    SeverityCount,
    MetricsByToolResponse,
    ToolCount,
    MetricsTimelineResponse,
    TimelinePoint,
    MetricsTopTargetsResponse,
    TargetCount
)
from app.security.dependencies import get_current_user

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/summary", response_model=MetricsSummary)
async def get_metrics_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener resumen general de métricas del usuario
    """
    # Total de jobs
    total_jobs = db.query(Job).filter(Job.user_id == current_user.id).count()
    
    # Total de findings
    total_findings = db.query(Finding).join(Job).filter(
        Job.user_id == current_user.id
    ).count()
    
    # Findings por severidad
    findings_by_severity = db.query(
        Finding.severity,
        func.count(Finding.id).label("count")
    ).join(Job).filter(
        Job.user_id == current_user.id
    ).group_by(Finding.severity).all()
    
    severity_dict = {severity.value: 0 for severity in FindingSeverity}
    for severity, count in findings_by_severity:
        severity_dict[severity.value] = count
    
    # Findings por herramienta
    findings_by_tool = db.query(
        Finding.tool,
        func.count(Finding.id).label("count")
    ).join(Job).filter(
        Job.user_id == current_user.id
    ).group_by(Finding.tool).all()
    
    tool_dict = {tool: count for tool, count in findings_by_tool}
    
    return MetricsSummary(
        total_jobs=total_jobs,
        total_findings=total_findings,
        findings_by_severity=severity_dict,
        findings_by_tool=tool_dict
    )


@router.get("/by-severity", response_model=MetricsBySeverityResponse)
async def get_metrics_by_severity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener métricas agrupadas por severidad
    """
    results = db.query(
        Finding.severity,
        func.count(Finding.id).label("count")
    ).join(Job).filter(
        Job.user_id == current_user.id
    ).group_by(Finding.severity).all()
    
    data = [
        SeverityCount(severity=severity.value, count=count)
        for severity, count in results
    ]
    
    # Asegurar que todas las severidades estén presentes
    all_severities = {s.value for s in FindingSeverity}
    present_severities = {item.severity for item in data}
    for severity in all_severities - present_severities:
        data.append(SeverityCount(severity=severity, count=0))
    
    return MetricsBySeverityResponse(data=sorted(data, key=lambda x: x.severity))


@router.get("/by-tool", response_model=MetricsByToolResponse)
async def get_metrics_by_tool(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener métricas agrupadas por herramienta
    """
    results = db.query(
        Finding.tool,
        func.count(Finding.id).label("count")
    ).join(Job).filter(
        Job.user_id == current_user.id
    ).group_by(Finding.tool).all()
    
    data = [
        ToolCount(tool=tool, count=count)
        for tool, count in results
    ]
    
    return MetricsByToolResponse(data=data)


@router.get("/timeline", response_model=MetricsTimelineResponse)
async def get_metrics_timeline(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener timeline de métricas (jobs y findings por día)
    """
    # Calcular fecha de inicio
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Obtener jobs por día
    jobs_by_date = db.query(
        func.date(Job.created_at).label("date"),
        func.count(Job.id).label("count")
    ).filter(
        and_(
            Job.user_id == current_user.id,
            Job.created_at >= start_date
        )
    ).group_by(func.date(Job.created_at)).all()
    
    # Obtener findings por día
    findings_by_date = db.query(
        func.date(Finding.created_at).label("date"),
        func.count(Finding.id).label("count")
    ).join(Job).filter(
        and_(
            Job.user_id == current_user.id,
            Finding.created_at >= start_date
        )
    ).group_by(func.date(Finding.created_at)).all()
    
    # Combinar datos
    jobs_dict = {str(date): count for date, count in jobs_by_date}
    findings_dict = {str(date): count for date, count in findings_by_date}
    
    # Obtener todas las fechas únicas
    all_dates = set(jobs_dict.keys()) | set(findings_dict.keys())
    
    data = [
        TimelinePoint(
            date=date,
            jobs=jobs_dict.get(date, 0),
            findings=findings_dict.get(date, 0)
        )
        for date in sorted(all_dates)
    ]
    
    return MetricsTimelineResponse(data=data)


@router.get("/top-targets", response_model=MetricsTopTargetsResponse)
async def get_top_targets(
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener top targets con más findings
    """
    results = (
        db.query(
            Target.id,
            Target.url,
            func.count(Finding.id).label("count")
        )
        .join(Job, Job.target_id == Target.id)
        .join(Finding, Finding.job_id == Job.id)
        .filter(Job.user_id == current_user.id)
        .group_by(Target.id, Target.url)
        .order_by(func.count(Finding.id).desc())
        .limit(limit)
        .all()
    )
    
    data = [
        TargetCount(
            target_id=str(target_id),
            target_url=url,
            count=count
        )
        for target_id, url, count in results
    ]
    
    return MetricsTopTargetsResponse(data=data)
