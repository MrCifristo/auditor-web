"""
Router de Targets
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from urllib.parse import urlparse
from app.database import get_db
from app.models.target import Target
from app.models.user import User
from app.schemas.target import TargetCreate, TargetResponse, TargetUpdate
from app.security.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/targets", tags=["targets"])


def validate_url(url: str) -> bool:
    """
    Valida que la URL esté permitida para escaneo
    
    Args:
        url: URL a validar
    
    Returns:
        True si la URL es válida, False en caso contrario
    """
    try:
        parsed = urlparse(url)
        
        # Verificar que tenga esquema válido
        if parsed.scheme not in ["http", "https"]:
            return False
        
        # Obtener lista de dominios permitidos
        allowed_domains = [d.strip() for d in settings.allowed_scan_domains.split(",")]
        
        # En desarrollo, permitir localhost y 127.0.0.1
        if parsed.hostname in ["localhost", "127.0.0.1"]:
            return True
        
        # Verificar si el dominio está en la lista permitida
        if parsed.hostname in allowed_domains:
            return True
        
        # Si la lista contiene "*", permitir cualquier dominio (solo en dev)
        if "*" in allowed_domains:
            return True
        
        return False
    except Exception:
        return False


@router.post("", response_model=TargetResponse, status_code=status.HTTP_201_CREATED)
async def create_target(
    target_data: TargetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crear un nuevo target
    
    - Validar URL
    - Crear target asociado al usuario
    """
    # Validar URL
    if not validate_url(target_data.url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL no permitida para escaneo. Verifique que esté en la lista de dominios permitidos."
        )
    
    # Crear target
    new_target = Target(
        user_id=current_user.id,
        url=target_data.url
    )
    
    db.add(new_target)
    db.commit()
    db.refresh(new_target)
    
    return new_target


@router.get("", response_model=List[TargetResponse])
async def list_targets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Listar todos los targets del usuario autenticado
    """
    targets = db.query(Target).filter(Target.user_id == current_user.id).all()
    return targets


@router.get("/{target_id}", response_model=TargetResponse)
async def get_target(
    target_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener un target específico (solo si pertenece al usuario)
    """
    target = db.query(Target).filter(
        Target.id == target_id,
        Target.user_id == current_user.id
    ).first()
    
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target no encontrado"
        )
    
    return target


@router.delete("/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_target(
    target_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar un target (solo si pertenece al usuario)
    """
    target = db.query(Target).filter(
        Target.id == target_id,
        Target.user_id == current_user.id
    ).first()
    
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target no encontrado"
        )
    
    db.delete(target)
    db.commit()
    
    return None

