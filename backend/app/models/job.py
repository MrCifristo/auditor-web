"""
Modelo de Job
Representa una ejecución de escaneo de seguridad
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base


class JobStatus(str, enum.Enum):
    """Estados posibles de un job"""
    QUEUED = "queued"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"


class Job(Base):
    """
    Modelo de job (escaneo de seguridad)
    
    Campos:
    - id: UUID único del job
    - user_id: UUID del usuario propietario (FK a users)
    - target_id: UUID del target a escanear (FK a targets)
    - status: Estado del job (queued, running, done, failed)
    - tools_used: Lista de herramientas utilizadas (JSON array)
    - created_at: Fecha de creación
    - started_at: Fecha de inicio de ejecución
    - finished_at: Fecha de finalización
    
    Relaciones:
    - user: Usuario propietario del job
    - target: Target asociado al job
    - findings: Lista de hallazgos encontrados
    """
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_id = Column(UUID(as_uuid=True), ForeignKey("targets.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(Enum(JobStatus), default=JobStatus.QUEUED, nullable=False, index=True)
    tools_used = Column(JSON, nullable=True)  # Lista de herramientas: ["ZAP", "Nuclei", "SSLyze"]
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)

    # Relaciones
    user = relationship("User", back_populates="jobs")
    target = relationship("Target", back_populates="jobs")
    findings = relationship("Finding", back_populates="job", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Job(id={self.id}, status={self.status}, target_id={self.target_id})>"

