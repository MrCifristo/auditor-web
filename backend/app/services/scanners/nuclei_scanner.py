"""
Scanner de Nuclei
"""
import json
import docker
import signal
import threading
from typing import List, Dict, Any
from app.models.finding import FindingSeverity
from app.config import settings


class NucleiScanner:
    """Scanner para Nuclei"""
    
    def __init__(self, docker_client):
        self.docker_client = docker_client
        self.image = "projectdiscovery/nuclei:latest"
        self.timeout = settings.nuclei_timeout
    
    def _normalize_severity(self, nuclei_severity: str) -> FindingSeverity:
        """Normalizar severidad de Nuclei a nuestro modelo"""
        mapping = {
            "info": FindingSeverity.INFO,
            "low": FindingSeverity.LOW,
            "medium": FindingSeverity.MEDIUM,
            "high": FindingSeverity.HIGH,
            "critical": FindingSeverity.CRITICAL,
        }
        return mapping.get(nuclei_severity.lower(), FindingSeverity.INFO)
    
    def scan(self, target_url: str) -> List[Dict[str, Any]]:
        """
        Ejecutar escaneo Nuclei
        
        Args:
            target_url: URL objetivo
        
        Returns:
            Lista de findings normalizados
        """
        findings = []
        
        try:
            print(f"[NucleiScanner] Iniciando escaneo de {target_url} con timeout de {self.timeout}s")
            
            # Ejecutar Nuclei con detach=True para poder controlar el timeout
            container = self.docker_client.containers.run(
                self.image,
                command=f"-u {target_url} -json -rate-limit {settings.nuclei_rate_limit}",
                detach=True,
                remove=False,  # No remover automáticamente para poder obtener logs si falla
                network_mode="host",
                mem_limit="1g"
            )
            
            try:
                # Esperar a que termine con timeout
                container.wait(timeout=self.timeout)
                print(f"[NucleiScanner] Contenedor terminado exitosamente")
                
                # Obtener logs del contenedor
                logs = container.logs(stdout=True, stderr=True)
                container.remove()  # Remover después de obtener logs
                
                # Parsear salida JSON línea por línea
                if logs:
                    output_lines = logs.decode('utf-8').strip().split('\n')
                    for line in output_lines:
                        if line.strip():
                            try:
                                result = json.loads(line)
                                severity = self._normalize_severity(result.get("info", {}).get("severity", "info"))
                                
                                findings.append({
                                    "severity": severity,
                                    "title": result.get("info", {}).get("name", "Nuclei Finding"),
                                    "description": result.get("info", {}).get("description", ""),
                                    "evidence": json.dumps(result.get("matched-at", "")),
                                    "recommendation": f"Review and remediate: {result.get('info', {}).get('reference', 'No reference available')}"
                                })
                            except json.JSONDecodeError:
                                continue
                
                # Si no hay findings, crear uno genérico
                if not findings:
                    findings.append({
                        "severity": FindingSeverity.INFO,
                        "title": "Nuclei Scan Completed",
                        "description": f"Nuclei scan completed for {target_url}",
                        "evidence": "No vulnerabilities found or scan completed without findings.",
                        "recommendation": "Continue regular security scanning."
                    })
                    
            except Exception as wait_error:
                print(f"[NucleiScanner] Error esperando contenedor: {str(wait_error)}")
                # Si el contenedor no termina en el timeout, detenerlo
                try:
                    container.stop(timeout=5)
                    container.remove()
                except:
                    pass
                raise Exception(f"Timeout o error ejecutando Nuclei: {str(wait_error)}")
            
        except Exception as e:
            findings.append({
                "severity": FindingSeverity.INFO,
                "title": "Nuclei Scan Error",
                "description": f"Error executing Nuclei scan: {str(e)}",
                "evidence": str(e),
                "recommendation": "Check Nuclei configuration and target accessibility."
            })
        
        return findings

