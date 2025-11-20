"""
Dependencias de Seguridad para FastAPI
======================================

TODO: Implementar dependencias para proteger endpoints con JWT

Este módulo debe contener:
- Dependencia get_current_user para obtener el usuario autenticado
- Dependencia get_current_active_user para obtener usuario activo
- Manejo de excepciones HTTP para tokens inválidos

Ejemplo de uso esperado:
    from app.security.dependencies import get_current_user
    from app.models.user import User
    
    @app.get("/protected")
    async def protected_endpoint(current_user: User = Depends(get_current_user)):
        return {"user_id": current_user.id}

Dependencias necesarias:
- fastapi (ya está en requirements.txt)
- app.security.jwt (debe implementarse primero)
- app.database.get_db (ya existe)

Referencias:
- https://fastapi.tiangolo.com/tutorial/dependencies/
- Documentación del proyecto: docs/ROLE_A_BACKEND_SECURITY.md
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.security.jwt import verify_token

# Configurar HTTPBearer para extraer token del header Authorization
security = HTTPBearer(auto_error=False)

INVALID_CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Credenciales inválidas o token expirado",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependencia para obtener el usuario actual desde el token JWT.

    Args:
        credentials: Credenciales HTTP (Authorization: Bearer <token>)
        db: Sesión de base de datos

    Returns:
        Instancia de User autenticado
    """
    if credentials is None:
        raise INVALID_CREDENTIALS_EXCEPTION

    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise INVALID_CREDENTIALS_EXCEPTION

    user_id = payload.get("sub")
    if not user_id:
        raise INVALID_CREDENTIALS_EXCEPTION

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise INVALID_CREDENTIALS_EXCEPTION

    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependencia para obtener el usuario actual y verificar que esté activo.
    (Por ahora, simplemente retorna el usuario. Se puede extender con flag is_active.)
    """
    return current_user

