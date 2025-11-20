"""
Schemas Pydantic para Jobs
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.job import JobStatus


class JobCreate(BaseModel):
    """Schema para crear un job"""
    target_id: UUID = Field(..., description="ID del target a escanear")
    tools_used: List[str] = Field(..., description="Lista de herramientas a usar", min_items=1)


class JobResponse(BaseModel):
    """Schema para respuesta de job"""
    id: UUID
    user_id: UUID
    target_id: UUID
    status: JobStatus
    tools_used: Optional[List[str]] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class JobUpdate(BaseModel):
    """Schema para actualizar job"""
    status: Optional[JobStatus] = None
