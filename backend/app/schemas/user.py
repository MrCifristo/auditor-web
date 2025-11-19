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
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole

# TODO: Implementar UserCreate
# class UserCreate(BaseModel):
#     """Schema para crear un usuario"""
#     email: EmailStr
#     password: str = Field(..., min_length=8, description="Password mínimo 8 caracteres")
#     role: Optional[UserRole] = UserRole.USER

# TODO: Implementar UserLogin
# class UserLogin(BaseModel):
#     """Schema para login"""
#     email: EmailStr
#     password: str

# TODO: Implementar UserResponse
# class UserResponse(BaseModel):
#     """Schema para respuesta de usuario (sin password_hash)"""
#     id: str
#     email: str
#     role: UserRole
#     created_at: datetime
#     updated_at: datetime
#     
#     class Config:
#         from_attributes = True

# TODO: Implementar UserUpdate (opcional)
# class UserUpdate(BaseModel):
#     """Schema para actualizar usuario"""
#     email: Optional[EmailStr] = None
#     password: Optional[str] = Field(None, min_length=8)
#     role: Optional[UserRole] = None

