"""
Auditor Web de Seguridad - Backend API
FastAPI application entry point
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings

app = FastAPI(
    title="Auditor Web API",
    description="API para auditorías de seguridad web",
    version="0.1.0",
)

# CORS middleware (configurar según necesidades)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "Auditor Web API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint (público)"""
    return {"status": "healthy"}


@app.get("/health/db")
async def health_check_db(db: Session = Depends(get_db)):
    """
    Health check de base de datos
    
    Verifica que la conexión a la base de datos funciona correctamente.
    """
    try:
        # Ejecutar una query simple para verificar conexión
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db.commit()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


# TODO: Integrar router de autenticación cuando esté implementado
# from app.routers import auth
# app.include_router(auth.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

