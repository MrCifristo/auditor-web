"""
Helpers para validar URLs de targets.
"""
from urllib.parse import urlparse
import ipaddress
from typing import List

from fastapi import HTTPException, status

from app.config import settings


def _allowed_domains() -> List[str]:
    return [
        domain.strip().lower()
        for domain in settings.allowed_scan_domains.split(",")
        if domain.strip()
    ]


def normalize_url(url: str) -> str:
    """Quita la barra final redundante, mantiene el esquema original."""
    return url.rstrip("/")


def validate_target_url(url: str) -> None:
    """
    Reglas:
    - Solo dominios permitidos (si hay whitelist configurada)
    - No permite localhost, loopback ni IPs privadas/reservadas
    """
    parsed = urlparse(url)
    host = parsed.hostname
    if not host:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="URL inválida."
        )

    # Bloquear hosts explícitos
    blocked_hosts = {"localhost"}
    if host.lower() in blocked_hosts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se permiten escaneos a localhost.",
        )

    try:
        ip = ipaddress.ip_address(host)
        if ip.is_private or ip.is_loopback or ip.is_reserved:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se permiten direcciones IP privadas o localhost.",
            )
    except ValueError:
        # No es IP, validar dominio
        allowed = _allowed_domains()
        if allowed:
            if not any(host.lower().endswith(dom) for dom in allowed):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Dominio no autorizado para escaneo.",
                )

