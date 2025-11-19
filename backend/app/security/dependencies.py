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

# TODO: Importar dependencias necesarias
# from sqlalchemy.orm import Session
# from app.database import get_db
# from app.models.user import User
# from app.security.jwt import verify_token, get_user_from_token

# Configurar HTTPBearer para extraer token del header Authorization
security = HTTPBearer()

# TODO: Implementar get_current_user()
# async def get_current_user(
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     db: Session = Depends(get_db)
# ) -> User:
#     """
#     Dependencia para obtener el usuario actual desde el token JWT
#     
#     Args:
#         credentials: Credenciales HTTP con el token
#         db: Sesión de base de datos
#     
#     Returns:
#         Usuario autenticado
#     
#     Raises:
#         HTTPException: Si el token es inválido o el usuario no existe
#     """
#     pass

# TODO: Implementar get_current_active_user()
# async def get_current_active_user(
#     current_user: User = Depends(get_current_user)
# ) -> User:
#     """
#     Dependencia para obtener el usuario actual y verificar que esté activo
#     
#     Args:
#         current_user: Usuario obtenido de get_current_user
#     
#     Returns:
#         Usuario activo
#     
#     Raises:
#         HTTPException: Si el usuario no está activo
#     """
#     pass

