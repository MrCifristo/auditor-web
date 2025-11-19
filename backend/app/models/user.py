"""
Modelo de Usuario
Representa un usuario del sistema con autenticación
"""
from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    """Roles de usuario en el sistema"""
    USER = "user"
    ADMIN = "admin"


class User(Base):
    """
    Modelo de usuario
    
    Campos:
    - id: UUID único del usuario
    - email: Email único del usuario (usado para login)
    - password_hash: Hash de la contraseña (nunca texto plano)
    - role: Rol del usuario (user, admin)
    - created_at: Fecha de creación
    - updated_at: Fecha de última actualización
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)  # Hash bcrypt
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    targets = relationship("Target", back_populates="user", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"

