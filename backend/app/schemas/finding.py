"""
Schemas Pydantic para Findings
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.models.finding import FindingSeverity


class FindingResponse(BaseModel):
    """Schema para respuesta de finding"""
    id: UUID
    job_id: UUID
    severity: FindingSeverity
    title: str
    description: Optional[str] = None
    evidence: Optional[str] = None
    recommendation: Optional[str] = None
    tool: str
    created_at: datetime
    
    class Config:
        from_attributes = True
