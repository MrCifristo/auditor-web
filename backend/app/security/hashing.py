"""
Módulo de Hashing de Contraseñas
"""
from passlib.context import CryptContext

# Configurar contexto de bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hashea una contraseña usando bcrypt
    
    Args:
        password: Contraseña en texto plano
    
    Returns:
        Hash de la contraseña
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica una contraseña contra su hash
    
    Args:
        plain_password: Contraseña en texto plano
        hashed_password: Hash almacenado
    
    Returns:
        True si la contraseña es válida, False en caso contrario
    """
    return pwd_context.verify(plain_password, hashed_password)
