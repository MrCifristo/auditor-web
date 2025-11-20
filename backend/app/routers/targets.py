"""
Router de Targets
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.target import Target
from app.models.user import User
from app.schemas.target import TargetCreate, TargetResponse, TargetUpdate
from app.security.dependencies import get_current_user
from app.utils.url_validators import validate_target_url

router = APIRouter(prefix="/targets", tags=["targets"])


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
    # Validar URL usando la función centralizada de validación
    # Esta función lanza HTTPException si la URL no es válida
    validate_target_url(target_data.url)
    
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

