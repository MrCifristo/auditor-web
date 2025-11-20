"""
Módulo de JWT (JSON Web Tokens)
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from app.config import settings


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Crea un token JWT de acceso
    
    Args:
        data: Datos a incluir en el token (ej: {"sub": user_id})
        expires_delta: Tiempo de expiración personalizado
    
    Returns:
        Token JWT codificado
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifica y decodifica un token JWT
    
    Args:
        token: Token JWT a verificar
    
    Returns:
        Payload del token si es válido, None en caso contrario
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        return None


def get_user_from_token(token: str) -> Optional[str]:
    """
    Obtiene el ID de usuario desde un token JWT
    
    Args:
        token: Token JWT
    
    Returns:
        ID del usuario (sub claim) si el token es válido, None en caso contrario
    """
    payload = verify_token(token)
    if payload is None:
        return None
    return payload.get("sub")
