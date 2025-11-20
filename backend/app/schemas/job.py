from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, UUID4, field_validator

from app.models.job import JobStatus

ALLOWED_TOOLS = {"zap", "nuclei", "sslyze"}


class JobCreate(BaseModel):
    target_id: UUID4
    tools: List[str]

    @field_validator("tools")
    @classmethod
    def validate_tools(cls, value: List[str]) -> List[str]:
        if not value:
            raise ValueError("Debes seleccionar al menos una herramienta.")
        invalid = [tool for tool in value if tool not in ALLOWED_TOOLS]
        if invalid:
            raise ValueError(
                f"Herramientas inválidas: {', '.join(invalid)}. "
                f"Permitidas: {', '.join(sorted(ALLOWED_TOOLS))}."
            )
        return value


class JobResponse(BaseModel):
    id: UUID4
    target_id: UUID4
    status: JobStatus
    tools_used: Optional[List[str]] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None

    class Config:
        from_attributes = True

