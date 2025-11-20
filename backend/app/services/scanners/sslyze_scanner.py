"""
Scanner de SSLyze
"""
import json
import docker
from typing import List, Dict, Any
from urllib.parse import urlparse
from app.models.finding import FindingSeverity
from app.config import settings


class SSLyzeScanner:
    """Scanner para SSLyze"""
    
    def __init__(self, docker_client):
        self.docker_client = docker_client
        self.image = "nablac0d3/sslyze:latest"
        self.timeout = settings.sslyze_timeout
    
    def _extract_hostname(self, url: str) -> str:
        """Extraer hostname de una URL"""
        parsed = urlparse(url)
        return parsed.hostname or url
    
    def _normalize_sslyze_findings(self, sslyze_output: str) -> List[Dict[str, Any]]:
        """Normalizar salida de SSLyze a findings"""
        findings = []
        
        # Parsear JSON de SSLyze
        try:
            data = json.loads(sslyze_output)
            
            # Extraer información de certificados y configuración TLS
            for server_info in data.get("server_scan_results", []):
                hostname = server_info.get("server_info", {}).get("hostname", "")
                
                # Verificar certificado
                cert_info = server_info.get("certificate_info", {})
                if cert_info:
                    findings.append({
                        "severity": FindingSeverity.INFO,
                        "title": f"SSL Certificate Information for {hostname}",
                        "description": f"Certificate details: {json.dumps(cert_info, indent=2)}",
                        "evidence": json.dumps(cert_info),
                        "recommendation": "Review certificate validity and configuration."
                    })
                
                # Verificar configuración TLS
                tls_info = server_info.get("scan_commands_results", {})
                if tls_info:
                    findings.append({
                        "severity": FindingSeverity.INFO,
                        "title": f"TLS Configuration for {hostname}",
                        "description": f"TLS configuration details: {json.dumps(tls_info, indent=2)}",
                        "evidence": json.dumps(tls_info),
                        "recommendation": "Review TLS configuration for security best practices."
                    })
        
        except json.JSONDecodeError:
            # Si no es JSON válido, crear un finding genérico
            findings.append({
                "severity": FindingSeverity.INFO,
                "title": "SSLyze Scan Completed",
                "description": f"SSLyze scan completed. Raw output: {sslyze_output[:500]}",
                "evidence": sslyze_output[:1000],
                "recommendation": "Review SSLyze output for detailed TLS/SSL analysis."
            })
        
        return findings
    
    def scan(self, target_url: str) -> List[Dict[str, Any]]:
        """
        Ejecutar escaneo SSLyze
        
        Args:
            target_url: URL objetivo
        
        Returns:
            Lista de findings normalizados
        """
        findings = []
        hostname = self._extract_hostname(target_url)
        
        # SSLyze solo funciona con hostnames, no URLs completas
        if not hostname:
            findings.append({
                "severity": FindingSeverity.INFO,
                "title": "SSLyze Scan Error",
                "description": f"Could not extract hostname from URL: {target_url}",
                "evidence": target_url,
                "recommendation": "Provide a valid hostname or IP address."
            })
            return findings
        
        try:
            # Ejecutar SSLyze con salida JSON
            container = self.docker_client.containers.run(
                self.image,
                command=f"--json_out - {hostname}",
                detach=False,
                remove=True,
                network_mode="host",
                timeout=self.timeout,
                mem_limit="512m"
            )
            
            if container:
                output = container.decode('utf-8')
                findings = self._normalize_sslyze_findings(output)
            else:
                findings.append({
                    "severity": FindingSeverity.INFO,
                    "title": "SSLyze Scan Completed",
                    "description": f"SSLyze scan completed for {hostname}",
                    "evidence": "No detailed output available.",
                    "recommendation": "Review SSLyze configuration."
                })
            
        except Exception as e:
            findings.append({
                "severity": FindingSeverity.INFO,
                "title": "SSLyze Scan Error",
                "description": f"Error executing SSLyze scan: {str(e)}",
                "evidence": str(e),
                "recommendation": "Check SSLyze configuration and target accessibility."
            })
        
        return findings

