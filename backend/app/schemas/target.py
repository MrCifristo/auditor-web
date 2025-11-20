from datetime import datetime

from pydantic import BaseModel, HttpUrl, UUID4


class TargetBase(BaseModel):
    url: HttpUrl


class TargetCreate(TargetBase):
    """Payload para crear un target."""


class TargetResponse(TargetBase):
    """Respuesta estándar de un target."""

    id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

