"""
Módulo de JWT (JSON Web Tokens)
================================

Funciones utilitarias para crear y verificar tokens JWT firmados.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from jose import JWTError, jwt

from app.config import settings


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Crea un token JWT firmado con expiración.

    Args:
        data: Payload base del token (ej: {"sub": user_id})
        expires_delta: Tiempo opcional de expiración

    Returns:
        Token JWT codificado como string
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.jwt_access_token_expire_minutes)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifica y decodifica un token JWT.

    Args:
        token: Token JWT a verificar

    Returns:
        Payload decodificado si es válido, None si es inválido o expiró
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        return None


def get_user_from_token(token: str) -> Optional[str]:
    """
    Obtiene el identificador de usuario ("sub") desde un token JWT.

    Args:
        token: Token JWT

    Returns:
        ID de usuario como string, o None si el token es inválido
    """
    payload = verify_token(token)
    if not payload:
        return None
    return payload.get("sub")
