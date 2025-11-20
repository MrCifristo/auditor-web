from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.target import Target
from app.models.user import User
from app.schemas.target import TargetCreate, TargetResponse
from app.security.dependencies import get_current_user
from app.utils.url_validators import validate_target_url, normalize_url

router = APIRouter(prefix="/targets", tags=["targets"])


@router.get("", response_model=List[TargetResponse])
def list_targets(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> List[Target]:
    """Listar targets pertenecientes al usuario autenticado."""
    targets = (
        db.query(Target)
        .filter(Target.user_id == current_user.id)
        .order_by(Target.created_at.desc())
        .all()
    )
    return targets


@router.post("", response_model=TargetResponse, status_code=status.HTTP_201_CREATED)
def create_target(
    target_in: TargetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Target:
    """Registrar un nuevo target para el usuario actual."""
    url_str = str(target_in.url)
    validate_target_url(url_str)
    normalized_url = normalize_url(url_str)
    existing = (
        db.query(Target)
        .filter(Target.user_id == current_user.id, Target.url == normalized_url)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya tienes registrado ese target.",
        )

    target = Target(user_id=current_user.id, url=normalized_url)
    db.add(target)
    db.commit()
    db.refresh(target)
    return target


@router.get("/{target_id}", response_model=TargetResponse)
def get_target(
    target_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Target:
    """Obtener un target específico (solo si pertenece al usuario)."""
    target = (
        db.query(Target)
        .filter(Target.id == target_id, Target.user_id == current_user.id)
        .first()
    )
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target no encontrado.")
    return target


@router.delete("/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_target(
    target_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Eliminar un target del usuario autenticado."""
    target = (
        db.query(Target)
        .filter(Target.id == target_id, Target.user_id == current_user.id)
        .first()
    )
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target no encontrado.")

    db.delete(target)
    db.commit()

