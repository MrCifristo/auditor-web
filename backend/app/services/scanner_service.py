"""
Servicio de Escaneo de Seguridad
Integra con Docker para ejecutar herramientas de seguridad
"""
import docker
import json
import os
import logging
import uuid
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.job import Job, JobStatus
from app.models.finding import Finding, FindingSeverity
from app.config import settings
from app.database import SessionLocal

# Configurar logging
logger = logging.getLogger(__name__)


class ScannerService:
    """Servicio para ejecutar escaneos de seguridad"""
    
    def __init__(self):
        """Inicializar cliente de Docker"""
        original_docker_host = None
        try:
            # Limpiar cualquier variable de entorno DOCKER_HOST que pueda estar mal configurada
            # y que pueda estar interfiriendo con la conexión
            original_docker_host = os.environ.pop('DOCKER_HOST', None)
            if original_docker_host:
                logger.info(f"Variable DOCKER_HOST encontrada (será ignorada): {original_docker_host}")
            
            # Crear cliente usando el socket de Unix directamente
            # La ruta correcta es /var/run/docker.sock (con barra inicial)
            # El formato debe ser unix:///var/run/docker.sock (tres barras después de unix:)
            self.docker_client = docker.DockerClient(
                base_url='unix:///var/run/docker.sock',
                version='auto'
            )
            
            # Verificar que la conexión funciona
            self.docker_client.ping()
            logger.info("Cliente de Docker inicializado correctamente")
            
        except docker.errors.APIError as e:
            logger.error(f"Error de API de Docker: {str(e)}")
            # Restaurar DOCKER_HOST si existía
            if original_docker_host:
                os.environ['DOCKER_HOST'] = original_docker_host
            raise Exception(f"No se pudo conectar a Docker: {str(e)}")
        except Exception as e:
            logger.error(f"No se pudo conectar a Docker: {str(e)}", exc_info=True)
            # Intentar restaurar DOCKER_HOST si existía (aunque probablemente esté mal configurada)
            if original_docker_host:
                os.environ['DOCKER_HOST'] = original_docker_host
            raise Exception(f"No se pudo conectar a Docker: {str(e)}")
    
    @staticmethod
    def execute_scan(job_id: str, target_url: str, tools: List[str]):
        """
        Ejecutar escaneo de seguridad en background
        
        IMPORTANTE: Esta función crea su propia sesión de base de datos
        porque se ejecuta en una background task que puede ejecutarse
        después de que el request HTTP haya terminado.
        
        Args:
            job_id: ID del job
            target_url: URL objetivo
            tools: Lista de herramientas a ejecutar
        """
        # Crear una nueva sesión de base de datos para esta tarea
        db = SessionLocal()
        service = ScannerService()
        
        # Convertir job_id a UUID si es string (fuera del try para que esté disponible en except)
        try:
            job_uuid = uuid.UUID(job_id) if isinstance(job_id, str) else job_id
        except (ValueError, TypeError) as e:
            logger.error(f"job_id inválido: {job_id}, error: {str(e)}")
            db.close()
            return
        
        try:
            logger.info(f"Iniciando escaneo para job {job_id}, target: {target_url}, tools: {tools}")
            
            # Actualizar estado del job a running
            job = db.query(Job).filter(Job.id == job_uuid).first()
            if not job:
                logger.error(f"Job {job_id} no encontrado en la base de datos")
                return
            
            job.status = JobStatus.RUNNING
            job.started_at = datetime.utcnow()
            db.commit()
            db.refresh(job)
            logger.info(f"Job {job_id} actualizado a estado RUNNING")
            
            # Ejecutar cada herramienta
            for tool in tools:
                logger.info(f"Ejecutando herramienta {tool} para job {job_id}")
                findings = []
                
                try:
                    if tool == "ZAP":
                        findings = service._run_zap(target_url)
                    elif tool == "Nuclei":
                        findings = service._run_nuclei(target_url)
                    elif tool == "SSLyze":
                        findings = service._run_sslyze(target_url)
                    
                    logger.info(f"Herramienta {tool} encontró {len(findings)} hallazgos")
                    
                    # Guardar findings en la base de datos
                    for finding_data in findings:
                        finding = Finding(
                            job_id=job_uuid,
                            severity=finding_data["severity"],
                            title=finding_data["title"],
                            description=finding_data.get("description"),
                            evidence=finding_data.get("evidence"),
                            recommendation=finding_data.get("recommendation"),
                            tool=tool
                        )
                        db.add(finding)
                    
                    db.commit()
                    logger.info(f"Hallazgos de {tool} guardados en la base de datos")
                    
                except Exception as tool_error:
                    logger.error(f"Error ejecutando herramienta {tool}: {str(tool_error)}", exc_info=True)
                    # Continuar con la siguiente herramienta aunque esta haya fallado
                    continue
            
            # Actualizar estado del job a done
            job = db.query(Job).filter(Job.id == job_uuid).first()
            if job:
                job.status = JobStatus.DONE
                job.finished_at = datetime.utcnow()
                db.commit()
                logger.info(f"Job {job_id} completado exitosamente")
            
        except Exception as e:
            logger.error(f"Error crítico ejecutando escaneo para job {job_id}: {str(e)}", exc_info=True)
            # Actualizar estado del job a failed
            try:
                job_uuid = uuid.UUID(job_id) if isinstance(job_id, str) else job_id
                job = db.query(Job).filter(Job.id == job_uuid).first()
                if job:
                    job.status = JobStatus.FAILED
                    job.finished_at = datetime.utcnow()
                    db.commit()
                    logger.info(f"Job {job_id} marcado como FAILED")
            except Exception as db_error:
                logger.error(f"Error actualizando estado del job a FAILED: {str(db_error)}")
        finally:
            db.close()
    
    def _run_zap(self, target_url: str) -> List[Dict[str, Any]]:
        """Ejecutar OWASP ZAP baseline scan"""
        try:
            from app.services.scanners.zap_scanner import ZAPScanner
            scanner = ZAPScanner(self.docker_client)
            return scanner.scan(target_url)
        except Exception as e:
            print(f"Error ejecutando ZAP: {str(e)}")
            return []
    
    def _run_nuclei(self, target_url: str) -> List[Dict[str, Any]]:
        """Ejecutar Nuclei scan"""
        try:
            from app.services.scanners.nuclei_scanner import NucleiScanner
            scanner = NucleiScanner(self.docker_client)
            return scanner.scan(target_url)
        except Exception as e:
            print(f"Error ejecutando Nuclei: {str(e)}")
            return []
    
    def _run_sslyze(self, target_url: str) -> List[Dict[str, Any]]:
        """Ejecutar SSLyze scan"""
        try:
            from app.services.scanners.sslyze_scanner import SSLyzeScanner
            scanner = SSLyzeScanner(self.docker_client)
            return scanner.scan(target_url)
        except Exception as e:
            print(f"Error ejecutando SSLyze: {str(e)}")
            return []

