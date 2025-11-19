"""
Modelo de Finding
Representa un hallazgo de seguridad encontrado por una herramienta
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base


class FindingSeverity(str, enum.Enum):
    """Niveles de severidad de un hallazgo"""
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Finding(Base):
    """
    Modelo de finding (hallazgo de seguridad)
    
    Campos:
    - id: UUID único del finding
    - job_id: UUID del job asociado (FK a jobs)
    - severity: Severidad del hallazgo (info, low, medium, high, critical)
    - title: Título del hallazgo
    - description: Descripción detallada
    - evidence: Evidencia del hallazgo (logs, datos técnicos)
    - recommendation: Recomendación para remediar
    - tool: Herramienta que detectó el hallazgo (ZAP, Nuclei, SSLyze, etc.)
    - created_at: Fecha de creación
    
    Relaciones:
    - job: Job asociado al finding
    """
    __tablename__ = "findings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    severity = Column(Enum(FindingSeverity), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    evidence = Column(Text, nullable=True)  # JSON o texto con evidencia técnica
    recommendation = Column(Text, nullable=True)
    tool = Column(String(100), nullable=False, index=True)  # ZAP, Nuclei, SSLyze, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relaciones
    job = relationship("Job", back_populates="findings")

    def __repr__(self):
        return f"<Finding(id={self.id}, severity={self.severity}, tool={self.tool})>"

