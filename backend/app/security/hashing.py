"""
Módulo de Hashing de Contraseñas
==================================

Implementa funciones de hash y verificación usando bcrypt (passlib).
"""
from passlib.context import CryptContext

# CryptContext configurado para bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
MAX_BCRYPT_BYTES = 72  # límite impuesto por bcrypt


def hash_password(password: str) -> str:
    """
    Hashea una contraseña usando bcrypt.

    Args:
        password: Contraseña en texto plano.

    Returns:
        Hash bcrypt de la contraseña.
    """
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > MAX_BCRYPT_BYTES:
        raise ValueError(
            "La contraseña no puede exceder los 72 bytes que admite bcrypt. "
            "Elige una contraseña más corta (aprox. 64 caracteres ASCII)."
        )
    try:
        return pwd_context.hash(password)
    except ValueError as exc:
        raise ValueError("No se pudo hashear la contraseña.") from exc


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica una contraseña contra su hash almacenado.

    Args:
        plain_password: Contraseña en texto plano.
        hashed_password: Hash almacenado en la base de datos.

    Returns:
        True si la contraseña coincide, False en caso contrario.
    """
    return pwd_context.verify(plain_password, hashed_password)
