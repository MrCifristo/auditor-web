"""
Router de Jobs
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.job import Job, JobStatus
from app.models.target import Target
from app.models.user import User
from app.schemas.job import JobCreate, JobResponse
from app.schemas.finding import FindingResponse
from app.security.dependencies import get_current_user
from app.services.scanner_service import ScannerService

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_data: JobCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crear un nuevo job de escaneo
    
    - Validar target_id (debe pertenecer al usuario)
    - Validar herramientas seleccionadas
    - Crear job con status "queued"
    - Iniciar escaneo en background
    """
    # Verificar que el target pertenezca al usuario
    target = db.query(Target).filter(
        Target.id == job_data.target_id,
        Target.user_id == current_user.id
    ).first()
    
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target no encontrado"
        )
    
    # Validar herramientas
    valid_tools = ["ZAP", "Nuclei", "SSLyze"]
    invalid_tools = [tool for tool in job_data.tools_used if tool not in valid_tools]
    if invalid_tools:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Herramientas inválidas: {', '.join(invalid_tools)}. Herramientas válidas: {', '.join(valid_tools)}"
        )
    
    # Crear job
    new_job = Job(
        user_id=current_user.id,
        target_id=target.id,
        status=JobStatus.QUEUED,
        tools_used=job_data.tools_used
    )
    
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    
    # Iniciar escaneo en background
    background_tasks.add_task(
        ScannerService.execute_scan,
        db=db,
        job_id=str(new_job.id),
        target_url=target.url,
        tools=job_data.tools_used
    )
    
    return new_job


@router.get("", response_model=List[JobResponse])
async def list_jobs(
    status_filter: Optional[JobStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Listar jobs del usuario (con filtro opcional por status)
    """
    query = db.query(Job).filter(Job.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Job.status == status_filter)
    
    jobs = query.order_by(Job.created_at.desc()).all()
    return jobs


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener un job específico (solo si pertenece al usuario)
    """
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job no encontrado"
        )
    
    return job


@router.get("/{job_id}/findings", response_model=List[FindingResponse])
async def get_job_findings(
    job_id: str,
    severity_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Listar findings de un job (con filtro opcional por severidad)
    """
    # Verificar que el job pertenezca al usuario
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job no encontrado"
        )
    
    # Obtener findings
    from app.models.finding import Finding
    query = db.query(Finding).filter(Finding.job_id == job_id)
    
    if severity_filter:
        query = query.filter(Finding.severity == severity_filter)
    
    findings = query.order_by(Finding.severity.desc(), Finding.created_at.desc()).all()
    return findings

