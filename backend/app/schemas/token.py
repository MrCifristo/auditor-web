"""
Schemas Pydantic para Tokens
=============================

TODO: Implementar schemas para tokens JWT

Este módulo debe contener:
- Token: Schema para respuesta de token
- TokenData: Schema para datos del token (opcional)

Ejemplo de uso esperado:
    from app.schemas.token import Token
    
    @app.post("/auth/login", response_model=Token)
    async def login(user_data: UserLogin):
        # Verificar credenciales y generar token
        return {"access_token": token, "token_type": "bearer"}

Dependencias necesarias:
- pydantic (ya está en requirements.txt)

Referencias:
- https://docs.pydantic.dev/
- Documentación del proyecto: docs/ROLE_A_BACKEND_SECURITY.md
"""

from typing import Optional

from pydantic import BaseModel


class Token(BaseModel):
    """Schema para respuesta de token JWT."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Información contenida en el token JWT."""

    user_id: Optional[str] = None
    email: Optional[str] = None

