"""
Módulo de JWT (JSON Web Tokens)
================================

TODO: Implementar funciones para crear, verificar y decodificar tokens JWT

Este módulo debe contener:
- Función para crear tokens JWT
- Función para verificar tokens JWT
- Función para obtener datos del usuario desde un token

Ejemplo de uso esperado:
    from app.security.jwt import create_access_token, verify_token, get_user_from_token
    
    # Crear un token
    token = create_access_token(data={"sub": str(user_id)})
    
    # Verificar un token
    payload = verify_token(token)
    
    # Obtener usuario del token
    user_id = get_user_from_token(token)

Dependencias necesarias:
- python-jose[cryptography] (ya está en requirements.txt)

Configuración necesaria:
- JWT_SECRET: Clave secreta para firmar tokens (en settings)
- JWT_ALGORITHM: Algoritmo de firma (default: HS256)
- JWT_ACCESS_TOKEN_EXPIRE_MINUTES: Tiempo de expiración (default: 30)

Referencias:
- https://python-jose.readthedocs.io/
- Documentación del proyecto: docs/ROLE_A_BACKEND_SECURITY.md
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# TODO: Importar dependencias necesarias
# from jose import JWTError, jwt
# from app.config import settings

# TODO: Implementar create_access_token()
# def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
#     """
#     Crea un token JWT de acceso
#     
#     Args:
#         data: Datos a incluir en el token (ej: {"sub": user_id})
#         expires_delta: Tiempo de expiración personalizado
#     
#     Returns:
#         Token JWT codificado
#     """
#     pass

# TODO: Implementar verify_token()
# def verify_token(token: str) -> Optional[Dict[str, Any]]:
#     """
#     Verifica y decodifica un token JWT
#     
#     Args:
#         token: Token JWT a verificar
#     
#     Returns:
#         Payload del token si es válido, None en caso contrario
#     """
#     pass

# TODO: Implementar get_user_from_token()
# def get_user_from_token(token: str) -> Optional[str]:
#     """
#     Obtiene el ID de usuario desde un token JWT
#     
#     Args:
#         token: Token JWT
#     
#     Returns:
#         ID del usuario (sub claim) si el token es válido, None en caso contrario
#     """
#     pass

