"""
Servicio de Escaneo de Seguridad
Integra con Docker para ejecutar herramientas de seguridad
"""
import docker
import json
import os
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.job import Job, JobStatus
from app.models.finding import Finding, FindingSeverity
from app.config import settings


class ScannerService:
    """Servicio para ejecutar escaneos de seguridad"""
    
    def __init__(self):
        """Inicializar cliente de Docker"""
        base_url = settings.docker_base_url or "unix:///var/run/docker.sock"
        self.docker_client = None
        try:
            self.docker_client = docker.DockerClient(base_url=base_url)
        except Exception as e:
            print(f"[ScannerService] No se pudo conectar a Docker ({base_url}). Se usarán resultados simulados. Detalle: {e}")
    
    @staticmethod
    def execute_scan(db: Session, job_id: str, target_url: str, tools: List[str]):
        """
        Ejecutar escaneo de seguridad en background
        
        Args:
            db: Sesión de base de datos
            job_id: ID del job
            target_url: URL objetivo
            tools: Lista de herramientas a ejecutar
        """
        service = ScannerService()
        
        # Actualizar estado del job a running
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return
        
        job.status = JobStatus.RUNNING
        job.started_at = datetime.utcnow()
        db.commit()
        db.refresh(job)
        
        try:
            # Ejecutar cada herramienta
            for tool in tools:
                findings = []
                
                if tool == "ZAP":
                    findings = service._run_zap(target_url)
                elif tool == "Nuclei":
                    findings = service._run_nuclei(target_url)
                elif tool == "SSLyze":
                    findings = service._run_sslyze(target_url)
                
                # Guardar findings en la base de datos
                for finding_data in findings:
                    finding = Finding(
                        job_id=job_id,
                        severity=finding_data["severity"],
                        title=finding_data["title"],
                        description=finding_data.get("description"),
                        evidence=finding_data.get("evidence"),
                        recommendation=finding_data.get("recommendation"),
                        tool=tool
                    )
                    db.add(finding)
            
            # Actualizar estado del job a done
            job.status = JobStatus.DONE
            job.finished_at = datetime.utcnow()
            db.commit()
            
        except Exception as e:
            # Actualizar estado del job a failed
            job.status = JobStatus.FAILED
            job.finished_at = datetime.utcnow()
            db.commit()
            print(f"Error ejecutando escaneo: {str(e)}")
        finally:
            db.close()
    
    def _run_zap(self, target_url: str) -> List[Dict[str, Any]]:
        """Ejecutar OWASP ZAP baseline scan"""
        try:
            if self.docker_client is None:
                raise RuntimeError("Docker client no disponible")
            from app.services.scanners.zap_scanner import ZAPScanner
            scanner = ZAPScanner(self.docker_client)
            return scanner.scan(target_url)
        except Exception as e:
            print(f"Error ejecutando ZAP: {str(e)}")
            return [{
                "severity": FindingSeverity.INFO,
                "title": "ZAP Scan Error",
                "description": f"Error ejecutando ZAP: {str(e)}",
                "recommendation": "Verifica la configuración de Docker/ZAP y vuelve a intentar."
            }]
    
    def _run_nuclei(self, target_url: str) -> List[Dict[str, Any]]:
        """Ejecutar Nuclei scan"""
        try:
            if self.docker_client is None:
                raise RuntimeError("Docker client no disponible")
            from app.services.scanners.nuclei_scanner import NucleiScanner
            scanner = NucleiScanner(self.docker_client)
            return scanner.scan(target_url)
        except Exception as e:
            print(f"Error ejecutando Nuclei: {str(e)}")
            return [{
                "severity": FindingSeverity.INFO,
                "title": "Nuclei Scan Error",
                "description": f"Error ejecutando Nuclei: {str(e)}",
                "recommendation": "Valida que el motor de Nuclei y Docker estén disponibles."
            }]
    
    def _run_sslyze(self, target_url: str) -> List[Dict[str, Any]]:
        """Ejecutar SSLyze scan"""
        try:
            if self.docker_client is None:
                raise RuntimeError("Docker client no disponible")
            from app.services.scanners.sslyze_scanner import SSLyzeScanner
            scanner = SSLyzeScanner(self.docker_client)
            return scanner.scan(target_url)
        except Exception as e:
            print(f"Error ejecutando SSLyze: {str(e)}")
            return [{
                "severity": FindingSeverity.INFO,
                "title": "SSLyze Scan Error",
                "description": f"Error ejecutando SSLyze: {str(e)}",
                "recommendation": "Revisa la conectividad TLS y la configuración del escáner."
            }]
