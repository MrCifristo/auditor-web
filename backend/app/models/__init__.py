"""
Models package
Exporta todos los modelos para facilitar imports
"""
from app.models.user import User, UserRole
from app.models.target import Target
from app.models.job import Job, JobStatus
from app.models.finding import Finding, FindingSeverity

# Importar todos los modelos aquí para que Alembic los detecte
__all__ = [
    "User",
    "UserRole",
    "Target",
    "Job",
    "JobStatus",
    "Finding",
    "FindingSeverity",
]
