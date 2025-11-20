"""
Schemas Pydantic para Targets
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, HttpUrl, Field


class TargetCreate(BaseModel):
    """Schema para crear un target"""
    url: str = Field(..., description="URL objetivo para escaneo")


class TargetResponse(BaseModel):
    """Schema para respuesta de target"""
    id: UUID
    user_id: UUID
    url: HttpUrl
    created_at: datetime
    
    class Config:
        from_attributes = True


class TargetUpdate(BaseModel):
    """Schema para actualizar target"""
    url: Optional[str] = None
