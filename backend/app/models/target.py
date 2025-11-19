"""
Modelo de Target
Representa una URL objetivo para escaneo de seguridad
"""
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Target(Base):
    """
    Modelo de target (URL objetivo)
    
    Campos:
    - id: UUID único del target
    - user_id: UUID del usuario propietario (FK a users)
    - url: URL objetivo para escaneo
    - created_at: Fecha de creación
    
    Relaciones:
    - user: Usuario propietario del target
    - jobs: Lista de jobs asociados a este target
    """
    __tablename__ = "targets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(2048), nullable=False)  # URLs pueden ser largas
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relaciones
    user = relationship("User", back_populates="targets")
    jobs = relationship("Job", back_populates="target", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Target(id={self.id}, url={self.url}, user_id={self.user_id})>"

