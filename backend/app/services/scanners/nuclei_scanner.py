"""
Scanner de Nuclei
"""
import json
import docker
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
            # Ejecutar Nuclei con salida JSON
            container = self.docker_client.containers.run(
                self.image,
                command=f"-u {target_url} -json -rate-limit {settings.nuclei_rate_limit}",
                detach=False,
                remove=True,
                network_mode="host",
                timeout=self.timeout,
                mem_limit="1g"
            )
            
            # Parsear salida JSON línea por línea
            if container:
                output_lines = container.decode('utf-8').strip().split('\n')
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
            
        except Exception as e:
            findings.append({
                "severity": FindingSeverity.INFO,
                "title": "Nuclei Scan Error",
                "description": f"Error executing Nuclei scan: {str(e)}",
                "evidence": str(e),
                "recommendation": "Check Nuclei configuration and target accessibility."
            })
        
        return findings

