from datetime import datetime
from typing import Optional

from pydantic import BaseModel, UUID4

from app.models.finding import FindingSeverity


class FindingResponse(BaseModel):
    id: UUID4
    job_id: UUID4
    severity: FindingSeverity
    title: str
    description: Optional[str] = None
    evidence: Optional[str] = None
    recommendation: Optional[str] = None
    tool: str
    created_at: datetime

    class Config:
        from_attributes = True

