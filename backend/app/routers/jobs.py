from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.job import Job, JobStatus
from app.models.target import Target
from app.models.finding import Finding
from app.models.user import User
from app.schemas.job import JobCreate, JobResponse
from app.schemas.finding import FindingResponse
from app.security.dependencies import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Job:
    """Crear un job para un target del usuario."""
    target = (
        db.query(Target)
        .filter(Target.id == job_in.target_id, Target.user_id == current_user.id)
        .first()
    )
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target no encontrado.",
        )

    job = Job(
        user_id=current_user.id,
        target_id=target.id,
        status=JobStatus.QUEUED,
        tools_used=job_in.tools,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("", response_model=List[JobResponse])
def list_jobs(
    status_filter: JobStatus | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Job]:
    """Listar jobs del usuario, opcionalmente filtrados por status."""
    query = db.query(Job).filter(Job.user_id == current_user.id)
    if status_filter:
        query = query.filter(Job.status == status_filter)
    jobs = query.order_by(Job.created_at.desc()).all()
    return jobs


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Job:
    job = (
        db.query(Job)
        .filter(Job.id == job_id, Job.user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job no encontrado.")
    return job


@router.get("/{job_id}/findings", response_model=List[FindingResponse])
def list_findings(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Finding]:
    job = (
        db.query(Job)
        .filter(Job.id == job_id, Job.user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job no encontrado.")

    findings = (
        db.query(Finding)
        .filter(Finding.job_id == job.id)
        .order_by(Finding.created_at.desc())
        .all()
    )
    return findings

