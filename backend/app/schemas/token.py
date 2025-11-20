"""
Schemas Pydantic para Tokens
"""
from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    """Schema para respuesta de token JWT"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema para datos del token"""
    user_id: Optional[str] = None
    email: Optional[str] = None
