"""
Configuración de base de datos
SQLAlchemy setup y sesión
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Crear engine
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # Verificar conexiones antes de usarlas
    echo=False,  # Cambiar a True para ver queries SQL en desarrollo
)

# SessionLocal para crear sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()


def get_db():
    """
    Dependency para obtener sesión de BD
    Usar en endpoints de FastAPI
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Importar todos los modelos para que SQLAlchemy los registre
# Esto es necesario para que Alembic pueda detectarlos
from app.models import User, Target, Job, Finding  # noqa: F401, E402

