"""
Scanner de OWASP ZAP
"""
import json
import tempfile
import docker
from typing import List, Dict, Any
from app.models.finding import FindingSeverity
from app.config import settings


class ZAPScanner:
    """Scanner para OWASP ZAP"""
    
    def __init__(self, docker_client):
        self.docker_client = docker_client
        self.image = "ghcr.io/zaproxy/zaproxy:stable"
        self.timeout = settings.zap_baseline_timeout
    
    def scan(self, target_url: str) -> List[Dict[str, Any]]:
        """
        Ejecutar escaneo ZAP baseline
        
        Args:
            target_url: URL objetivo
        
        Returns:
            Lista de findings normalizados
        """
        findings = []
        
        try:
            print(f"[ZAPScanner] Iniciando escaneo de {target_url} con timeout de {self.timeout}s")
            
            # Ejecutar ZAP baseline scan con detach=True para controlar timeout
            container = self.docker_client.containers.run(
                self.image,
                command=f"zap-baseline.py -t {target_url} -J -I",
                detach=True,
                remove=False,
                network_mode="host",  # Para acceder a localhost si es necesario
                mem_limit="2g",
                cpu_period=100000,
                cpu_quota=50000
            )
            
            try:
                # Esperar a que termine con timeout
                container.wait(timeout=self.timeout)
                print(f"[ZAPScanner] Contenedor terminado exitosamente")
                
                # Obtener logs del contenedor
                container_output = container.logs(stdout=True, stderr=True)
                container.remove()
                
                # Convertir output a string si es bytes
                if isinstance(container_output, bytes):
                    output_str = container_output.decode('utf-8', errors='ignore')
                else:
                    output_str = str(container_output)
                    
            except Exception as wait_error:
                print(f"[ZAPScanner] Error esperando contenedor: {str(wait_error)}")
                # Si el contenedor no termina en el timeout, detenerlo
                try:
                    container.stop(timeout=5)
                    container.remove()
                except:
                    pass
                raise Exception(f"Timeout o error ejecutando ZAP: {str(wait_error)}")
            
            # Parsear salida JSON (si está disponible)
            # ZAP baseline puede generar JSON, pero también puede fallar
            # Por ahora, creamos un finding genérico si el escaneo se completó
            
            # Nota: En producción, deberías parsear el JSON real de ZAP
            # Por ahora, simulamos un resultado básico
            findings.append({
                "severity": FindingSeverity.INFO,
                "title": "ZAP Baseline Scan Completed",
                "description": f"OWASP ZAP baseline scan completed for {target_url}",
                "evidence": f"Scan executed successfully. Container output: {output_str[:500]}",
                "recommendation": "Review the full ZAP report for detailed findings."
            })
            
        except Exception as e:
            # Si el escaneo falla, crear un finding de error
            findings.append({
                "severity": FindingSeverity.INFO,
                "title": "ZAP Scan Error",
                "description": f"Error executing ZAP scan: {str(e)}",
                "evidence": str(e),
                "recommendation": "Check ZAP configuration and target accessibility."
            })
        
        return findings

