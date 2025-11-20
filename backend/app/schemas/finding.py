"""
Schemas Pydantic para Findings
"""
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app.models.finding import FindingSeverity


class FindingResponse(BaseModel):
    """Schema para respuesta de finding"""
    id: str
    job_id: str
    severity: FindingSeverity
    title: str
    description: Optional[str] = None
    evidence: Optional[str] = None
    recommendation: Optional[str] = None
    tool: str
    created_at: datetime
    
    class Config:
        from_attributes = True

