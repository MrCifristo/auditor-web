"""
Router de Autenticación
========================

TODO: Implementar endpoints de autenticación

Este router debe contener:
- POST /auth/register: Registrar nuevo usuario
- POST /auth/login: Iniciar sesión y obtener token
- GET /auth/me: Obtener usuario actual

Ejemplo de estructura esperada:
    from fastapi import APIRouter, Depends, HTTPException
    from app.schemas.user import UserCreate, UserLogin, UserResponse
    from app.schemas.token import Token
    from app.security.dependencies import get_current_user
    from app.models.user import User
    
    router = APIRouter(prefix="/auth", tags=["auth"])
    
    @router.post("/register", response_model=UserResponse)
    async def register(user_data: UserCreate, db: Session = Depends(get_db)):
        # Implementar registro
        pass
    
    @router.post("/login", response_model=Token)
    async def login(user_data: UserLogin, db: Session = Depends(get_db)):
        # Implementar login
        pass
    
    @router.get("/me", response_model=UserResponse)
    async def get_me(current_user: User = Depends(get_current_user)):
        # Retornar usuario actual
        pass

Dependencias necesarias:
- fastapi (ya está en requirements.txt)
- app.schemas.user (debe implementarse primero)
- app.schemas.token (debe implementarse primero)
- app.security.hashing (debe implementarse primero)
- app.security.jwt (debe implementarse primero)
- app.security.dependencies (debe implementarse primero)

Referencias:
- Documentación del proyecto: docs/ROLE_A_BACKEND_SECURITY.md
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/
"""

from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.token import Token
from app.security.hashing import hash_password, verify_password
from app.security.jwt import create_access_token
from app.security.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registrar un nuevo usuario.
    """
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )

    try:
        hashed_pw = hash_password(user_data.password)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    new_user = User(
        email=user_data.email,
        password_hash=hashed_pw,
        role=user_data.role or UserRole.USER,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Iniciar sesión y obtener un token JWT.
    """
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Obtener la información del usuario autenticado.
    """
    return current_user

