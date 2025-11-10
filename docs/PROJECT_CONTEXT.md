# 🧭 Contexto del Proyecto — Auditor Web de Seguridad

Este documento describe el **contexto académico**, los objetivos formales e informales y las decisiones de diseño clave del proyecto **Auditor Web de Seguridad**, con énfasis en dos pilares esenciales:

1. **Autenticación completa de usuarios y control de acceso**.  
2. **Dashboard con métricas y gráficas de vulnerabilidades** como parte central del entregable.

Está redactado para que lo entiendan tanto **personas** (profesores, estudiantes, colaboradores) como **agentes de IA** que vayan a asistir en el desarrollo.

---

## 1. Curso y nivel académico

- **Curso:** Seguridad Informática & Encriptación  
- **Carrera:** Ingeniería en Computer Science  
- **Nivel:** Último año (curso avanzado)  
- **Tipo de proyecto:** Proyecto final práctico, con enfoque en integración de conceptos de:
  - Ciberseguridad.
  - Desarrollo de software.
  - Infraestructura.
  - Comunicación de riesgos.

El proyecto busca evaluar la capacidad del estudiante para **aplicar lo aprendido** en un sistema funcional, no solo repetir teoría.

---

## 2. Propósito general del proyecto

El proyecto **no** es solo una demo de UX ni un experimento de laboratorio aislado. Es una **plataforma completa** que debe demostrar:

1. **Capacidades técnicas**:
   - Backend y frontend modernos.
   - Uso de Docker y orquestación básica (docker-compose).
   - Integración de herramientas reales de seguridad (ZAP, Nuclei, SSLyze, etc.).

2. **Aplicación de conceptos de seguridad**:
   - Autenticación de usuarios.
   - Control de acceso y protección de información.
   - Aislamiento de procesos de escaneo.
   - Uso responsable de herramientas de auditoría.

3. **Capacidad de análisis y comunicación**:
   - Interpretar y agrupar hallazgos de seguridad.
   - Mostrar resultados a través de un **dashboard con métricas y gráficas**.
   - Elaborar un reporte que pueda entender un perfil gerencial.

---

## 3. Rol del proyecto dentro del curso

Este proyecto funciona como síntesis de varios ejes del curso:

### 3.1 Eje de Ciberseguridad

- Comprender vulnerabilidades frecuentes de aplicaciones web:
  - Falta de sanitización de entradas.
  - Uso inseguro de cookies.
  - Cabeceras de seguridad ausentes.
  - Configuración débil de TLS/SSL.
- Conocer y manejar herramientas como:
  - **OWASP ZAP** (escáner de aplicaciones web).
  - **Nuclei** (templates de CVEs y misconfiguraciones).
  - **SSLyze** (análisis de seguridad en el canal TLS).

### 3.2 Eje de Seguridad Aplicada a Sistemas

- Implementar:
  - Registro e inicio de sesión.
  - Hash de contraseñas.
  - Emisión y validación de tokens (JWT).
- Aplicar principios:
  - Autenticación.
  - Autorización.
  - Protección de información sensible.

### 3.3 Eje de Comunicación y Gestión de Riesgos

- No basta con tener logs técnicos; se requiere:
  - **Dashboard de métricas**:
    - Gráficas de hallazgos por severidad.
    - Números agregados por herramienta y por sitio.
    - Evolución de hallazgos en el tiempo.
  - Reporte gerencial:
    - Resumen ejecutivo.
    - Impacto de los riesgos.
    - Recomendaciones concretas.

---

## 4. Objetivo general (proyecto)

> Desarrollar una plataforma web segura que permita a usuarios autenticados realizar auditorías automatizadas de seguridad web sobre sitios autorizados, visualizar los resultados en un **dashboard con métricas y gráficas**, y generar reportes comprensibles para perfiles no técnicos.

---

## 5. Objetivos específicos (detallados)

### 5.1 Objetivos técnicos

1. Implementar un **backend** en FastAPI que:
   - Exponga una API REST clara y bien documentada.
   - Se conecte a una base de datos PostgreSQL para persistir información.
   - Orqueste la ejecución de herramientas de seguridad mediante Docker.
   - Normalice los resultados en un modelo de datos coherente.

2. Implementar un **frontend** en Next.js / React que:
   - Permita registrar e iniciar sesión.
   - Provea formularios para crear nuevos escaneos.
   - Muestre los resultados de manera clara y navegable.
   - Implemente un **dashboard con gráficas y KPIs** relevantes.

3. Empaquetar el sistema en **Docker Compose** para:
   - Entorno de desarrollo.
   - Despliegue en producción en una sola VM (por ejemplo, EC2).

### 5.2 Objetivos de seguridad

1. Autenticación y control de acceso:
   - Proveer registro e inicio de sesión mediante email/contraseña.
   - Almacenar contraseñas de forma hasheada (no en texto plano).
   - Proteger endpoints con JWT u otro mecanismo de token seguro.
   - Asegurar que cada usuario vea solo sus propios datos y métricas.

2. Aislamiento y ética en escaneos:
   - Ejecutar herramientas de seguridad en contenedores separados.
   - Limitar tiempo y recursos de ejecución.
   - Respaldar la ejecución solo para **targets autorizados**.

3. Protección de datos:
   - Manejar secretos (passwords, JWT_SECRET, etc.) mediante variables de entorno.
   - Evitar exponer información sensible en logs públicos.
   - Considerar privacidad y manejo adecuado de información recolectada.

### 5.3 Objetivos de visualización y comunicación

1. Proveer un **dashboard con métricas** que incluya:
   - Número total de escaneos por usuario.
   - Distribución de hallazgos por severidad (Info/Low/Medium/High/Critical).
   - Distribución de hallazgos por herramienta.
   - Historial de escaneos y hallazgos en el tiempo.
   - Identificación de targets con más hallazgos.

2. Facilitar **presentaciones gerenciales**:
   - Habilitar exportación de reportes (PDF/JSON).
   - Proveer descripciones en lenguaje entendible.
   - Enfocarse en riesgos y recomendaciones más que en detalles técnicos crudos.

---

## 6. Requerimientos esenciales (no negociables)

Para que el proyecto se considere completo en el contexto del curso, se consideran **esenciales** los siguientes elementos:

1. **Autenticación completa de usuarios**
   - Registro (sign up).
   - Login con credenciales.
   - Gestión segura de contraseñas.
   - Uso de tokens de autenticación (JWT).

2. **Control de acceso**
   - Endpoints protegidos.
   - Jobs y hallazgos asociados a un usuario y/o rol.
   - Acciones restringidas a usuario autenticado.

3. **Ejecución real de escaneos**
   - Integración con al menos:
     - OWASP ZAP (modo baseline).
     - Nuclei.
     - SSLyze.
   - Evidencia de ejecución real (logs, archivos de salida, hallazgos).

4. **Dashboard de métricas y gráficas**
   - No solo tablas: se requieren **visualizaciones gráficas**.
   - KPIs cuidadosamente seleccionados (por usuario).
   - Vistas que ayuden a entender el **panorama general** de riesgos.

5. **Reporte o salida orientada a negocio**
   - Mínimo un reporte consolidado por escaneo o por target.
   - Lenguaje claro, explicando impacto y recomendaciones.

---

## 7. Criterios de evaluación (alineados al curso)

Aunque los porcentajes exactos dependen de la rúbrica oficial, este proyecto opera bajo los siguientes supuestos:

1. **Concepto y caso de uso (≈30%)**
   - Claridad del problema que resuelve el Auditor Web.
   - Relevancia práctica (auditoría de sitios web reales o de laboratorio).

2. **Aplicación de conceptos de seguridad (≈30%)**
   - Implementación correcta de autenticación y autorización.
   - Uso responsable y correcto de las herramientas de escaneo.
   - Buenas prácticas en manejo de datos y secretos.

3. **Funcionamiento del sistema (≈20%)**
   - Sistema levantando y funcionando en demo.
   - Flujo completo: login → nuevo escaneo → resultados → métricas → reporte.

4. **Presentación y comunicación (≈10%)**
   - Calidad del dashboard.
   - Claridad de las gráficas.
   - Capacidad de explicar los hallazgos de forma entendible.

5. **Trabajo en equipo y organización (≈10%)**
   - División real y efectiva de responsabilidades (Rol A / Rol B).
   - Colaboración y sincronización en el diseño técnico y funcional.

---

## 8. Alcance y no-alcance

### 8.1 Alcance

- Auditoría **básica / intermedia** de aplicaciones web sobre HTTP/HTTPS.
- Análisis de:
  - Vulnerabilidades comunes (ZAP).
  - Misconfiguraciones y CVEs frecuentes (Nuclei).
  - Estado de SSL/TLS (SSLyze).
- Gestión de usuarios y escaneos por usuario.
- Visualización de métricas clave por usuario.

### 8.2 Fuera de alcance (para este proyecto)

- Pentesting avanzado:
  - Ataques manuales o altamente intrusivos.
  - Fuzzing intenso, explotación en profundidad, DoS.
- SIEM completo o monitoreo en tiempo real de infraestructura.
- Multi-tenant complejo (organizaciones grandes, multi-cliente sofisticado).

Puede mencionarse como **trabajo futuro**, pero no es obligatorio implementarlo.

---

## 9. Uso ético y legal

El proyecto se enmarca en una lógica de **seguridad defensiva y académica**:

- Solo se deben escanear:
  - Sitios de laboratorio.
  - Recursos propios.
  - Recursos para los que se tenga autorización explícita.
- Las herramientas y el sistema:
  - No deben usarse para atacar sitios de terceros sin permiso.
  - Deben respetar los límites establecidos por el profesor y la institución.

Este componente ético es parte del aprendizaje en seguridad informática.

---

## 10. Implicaciones para el diseño técnico

Este contexto obliga a ciertas decisiones de diseño:

1. **Autenticación obligatoria**
   - No se permite el uso anónimo del sistema más allá de la pantalla de login/registro.
   - Las APIs principales de escaneo y métricas deben requerir un token.

2. **Modelado de datos centrado en usuario**
   - Jobs, findings y métricas se calculan por usuario.
   - El dashboard se construye sobre la actividad del usuario autenticado.

3. **Dashboard como pieza principal de valor**
   - No es un “extra”; es un componente que ayuda a cumplir el objetivo de comunicación y reporte.
   - Debe estar bien diseñado y ser funcional.

4. **Separación de responsabilidades entre roles**
   - Rol A (Backend & Seguridad):
     - Responsable de autenticación, APIs, modelo de datos y lógica de escaneo.
   - Rol B (Frontend & Infraestructura):
     - Responsable del dashboard, gráficas, UX, Docker, proxy y scripts de despliegue.

---

## 11. Uso por agentes de IA

Los agentes de IA que asistan en este proyecto deben:

- Tomar en cuenta que:
  - **Autenticación** y **dashboard de métricas** son **requisitos centrales**, no accesorios.
  - El proyecto está anclado a un contexto académico de seguridad.
- Priorizar soluciones que:
  - Refuercen la seguridad del sistema.
  - Mejoren la claridad y utilidad del dashboard.
- Evitar:
  - Sugerir que se omita la autenticación “para simplificar”.
  - Reemplazar herramientas de seguridad sin una buena razón.
  - Degradar la visualización a simples tablas cuando se necesitan gráficas.

---

## 12. Resumen ejecutivo del contexto

En una frase:

> Este proyecto debe probar que el equipo puede construir una plataforma web **segura**, que ejecute herramientas reales de auditoría, **proteja el acceso mediante autenticación**, y presente los resultados a través de un **dashboard de métricas y gráficas** útil para la toma de decisiones.

Todo diseño, decisión técnica o cambio en el código debe evaluarse contra este contexto.

