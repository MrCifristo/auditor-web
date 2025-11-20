"""
Schemas Pydantic para Usuarios
==============================

TODO: Implementar schemas para validación de datos de usuarios

Este módulo debe contener:
- UserCreate: Schema para crear un usuario (registro)
- UserLogin: Schema para login
- UserResponse: Schema para respuesta (sin password_hash)
- UserUpdate: Schema para actualizar usuario (opcional)

Ejemplo de uso esperado:
    from app.schemas.user import UserCreate, UserResponse
    
    @app.post("/auth/register", response_model=UserResponse)
    async def register(user_data: UserCreate):
        # Crear usuario
        pass

Dependencias necesarias:
- pydantic (ya está en requirements.txt)

Referencias:
- https://docs.pydantic.dev/
- Documentación del proyecto: docs/ROLE_A_BACKEND_SECURITY.md
"""

from typing import Optional
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator, UUID4

from app.models.user import UserRole


class UserBase(BaseModel):
    """Campos comunes de usuario."""

    email: EmailStr
    role: UserRole = UserRole.USER


class UserCreate(BaseModel):
    """Schema para crear un usuario."""

    email: EmailStr
    password: str = Field(
        ...,
        min_length=8,
        max_length=64,
        description="Contraseña entre 8 y 64 caracteres",
    )
    role: UserRole = UserRole.USER

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        """
        Enforce password complexity:
        - at least 8 chars (already enforced by Field)
        - include uppercase, lowercase, number, and special character
        """
        import re

        if len(value) > 64:
            raise ValueError("La contraseña no puede superar los 64 caracteres.")

        patterns = {
            "una letra minúscula": r"[a-z]",
            "una letra mayúscula": r"[A-Z]",
            "un número": r"\d",
            "un símbolo": r"[!@#$%^&*(),.?\":{}|<>_\-+=~`[\]\\;/]",
        }
        missing = [
            requirement for requirement, pattern in patterns.items() if not re.search(pattern, value)
        ]
        if missing:
            raise ValueError(
                "La contraseña debe incluir al menos " + ", ".join(missing) + "."
            )
        return value


class UserLogin(BaseModel):
    """Schema para login."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class UserResponse(BaseModel):
    """Schema para respuesta de usuario (sin password_hash)."""

    id: UUID4
    email: EmailStr
    role: UserRole
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema opcional para actualizar datos del usuario."""

    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8, max_length=128)
    role: Optional[UserRole] = None

