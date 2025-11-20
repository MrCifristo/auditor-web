"""
Configuración de la aplicación
Lee variables de entorno y provee settings centralizados
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuración de la aplicación desde variables de entorno"""
    
    # Base de datos
    database_url: str
    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgres_port: int = 5432
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_log_level: str = "info"
    
    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # Seguridad
    allowed_scan_domains: str = "localhost,127.0.0.1"
    scan_timeout_seconds: int = 300
    
    # Herramientas
    zap_baseline_timeout: int = 300
    nuclei_timeout: int = 300
    nuclei_rate_limit: int = 150
    sslyze_timeout: int = 120
    
    # Docker
    docker_base_url: Optional[str] = "unix:///var/run/docker.sock"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Instancia global de settings
settings = Settings()
