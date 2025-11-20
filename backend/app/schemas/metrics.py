"""
Schemas Pydantic para Métricas
"""
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime


class SeverityCount(BaseModel):
    """Conteo por severidad"""
    severity: str
    count: int


class ToolCount(BaseModel):
    """Conteo por herramienta"""
    tool: str
    count: int


class TargetCount(BaseModel):
    """Conteo por target"""
    target_id: str
    target_url: str
    count: int


class TimelinePoint(BaseModel):
    """Punto en la línea de tiempo"""
    date: str  # ISO format date
    jobs: int
    findings: int


class MetricsSummary(BaseModel):
    """Resumen general de métricas"""
    total_jobs: int
    total_findings: int
    findings_by_severity: Dict[str, int]
    findings_by_tool: Dict[str, int]


class MetricsBySeverityResponse(BaseModel):
    """Respuesta de métricas por severidad"""
    data: List[SeverityCount]


class MetricsByToolResponse(BaseModel):
    """Respuesta de métricas por herramienta"""
    data: List[ToolCount]


class MetricsTimelineResponse(BaseModel):
    """Respuesta de timeline de métricas"""
    data: List[TimelinePoint]


class MetricsTopTargetsResponse(BaseModel):
    """Respuesta de top targets"""
    data: List[TargetCount]

