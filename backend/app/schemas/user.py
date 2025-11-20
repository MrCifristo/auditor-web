"""
Schemas Pydantic para Usuarios
"""
from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class UserCreate(BaseModel):
    """Schema para crear un usuario"""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password mínimo 8 caracteres")
    role: Optional[UserRole] = UserRole.USER


class UserLogin(BaseModel):
    """Schema para login"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema para respuesta de usuario (sin password_hash)"""
    id: UUID
    email: EmailStr
    role: UserRole
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema para actualizar usuario"""
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    role: Optional[UserRole] = None
