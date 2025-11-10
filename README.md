# 🛡️ Auditor Web de Seguridad

Plataforma web para realizar **auditorías de seguridad básicas** sobre sitios web autorizados, diseñada para que el resultado sea **entendible por personas sin conocimientos técnicos en ciberseguridad**.

Este proyecto forma parte del curso **Seguridad Informática & Encriptación** (último año de Computer Science), y busca demostrar la integración de:

- Herramientas de auditoría reales (OWASP ZAP, Nuclei, SSLyze, etc.).
- Buenas prácticas de desarrollo seguro.
- Infraestructura moderna basada en Docker.
- Presentación gerencial de riesgos.

---

## 📚 Índice

1. [Resumen del proyecto](#-resumen-del-proyecto)  
2. [Objetivo general y objetivos específicos](#-objetivo-general-y-objetivos-específicos)  
3. [Visión funcional para el usuario final](#-visión-funcional-para-el-usuario-final)  
4. [Arquitectura general del sistema](#-arquitectura-general-del-sistema)  
5. [Tecnologías utilizadas](#-tecnologías-utilizadas)  
6. [Estructura del repositorio](#-estructura-del-repositorio)  
7. [Variables de entorno](#-variables-de-entorno)  
8. [Puesta en marcha del entorno de desarrollo](#-puesta-en-marcha-del-entorno-de-desarrollo)  
9. [Flujo de un escaneo de seguridad](#-flujo-de-un-escaneo-de-seguridad)  
10. [Roles y responsabilidades del equipo](#-roles-y-responsabilidades-del-equipo)  
11. [Guía para contribuyentes y agentes de IA](#-guía-para-contribuyentes-y-agentes-de-ia)  
12. [Despliegue en producción (visión general)](#-despliegue-en-producción-visión-general)  
13. [Mejoras futuras sugeridas](#-mejoras-futuras-sugeridas)

---

## 🧾 Resumen del proyecto

El **Auditor Web de Seguridad** es una aplicación que permite:

- Ingresar una **URL objetivo** (de un sitio propio o de laboratorio con consentimiento).
- Seleccionar un conjunto de **herramientas de seguridad** a ejecutar.
- Lanzar escaneos automatizados desde el backend, en contenedores aislados.
- Guardar y normalizar los resultados en una base de datos.
- Mostrar hallazgos en un **dashboard visual**, con severidades y recomendaciones.
- Exportar reportes que puedan ser usados en una **presentación ejecutiva**.

El énfasis está en:

- Integrar herramientas reales (no simuladas).
- Proteger el entorno de ejecución (aislamiento por contenedores).
- Hacer inteligibles los resultados para alguien que no es pentester.

---

## 🎯 Objetivo general y objetivos específicos

### 🎯 Objetivo general

> Construir una plataforma web que permita realizar auditorías automatizadas de seguridad web sobre sitios autorizados y presentar los resultados de forma clara, entendible y accionable.

### 🎯 Objetivos específicos

1. **Integración técnica**
   - Orquestar herramientas estándar de seguridad (ZAP, Nuclei, SSLyze, etc.) desde un backend FastAPI.
   - Normalizar los resultados de diferentes herramientas en un modelo de datos común.

2. **Seguridad y buenas prácticas**
   - Ejecutar escaneos dentro de contenedores aislados (Docker).
   - Restringir el alcance a dominios/URLs autorizadas.
   - Manejar secretos y credenciales a través de variables de entorno.

3. **Usabilidad y comunicación**
   - Diseñar un dashboard orientado a usuarios no técnicos.
   - Clasificar hallazgos por severidad, con descripciones claras y recomendaciones.
   - Permitir exportar reportes (PDF/JSON) para presentaciones gerenciales.

4. **Infraestructura reproducible**
   - Empaquetar el sistema en `docker-compose` para dev y prod.
   - Facilitar la puesta en marcha en una sola máquina (host local o EC2).

---

## 👤 Visión funcional para el usuario final

Desde el punto de vista de un usuario no técnico:

1. Entra al dashboard web.
2. Ingresa la **URL del sitio** que quiere evaluar (dentro del alcance permitido).
3. Selecciona las herramientas de auditoría que desea usar:
   - “Análisis general de vulnerabilidades web” (ZAP).
   - “Chequeo de vulnerabilidades conocidas y configuraciones débiles” (Nuclei).
   - “Revisión de la seguridad del certificado SSL/TLS” (SSLyze).
4. Hace clic en “Iniciar escaneo”.
5. El sistema:
   - Ejecuta los escaneos en background.
   - Muestra el progreso.
   - Al finalizar, presenta una lista de hallazgos con:
     - Nivel de severidad.
     - Descripción entendible.
     - Recomendaciones de mitigación.
6. Puede descargar un **reporte consolidado** para compartir con su equipo o directores.

---

## 🧱 Arquitectura general del sistema

El sistema se compone de:

- **Frontend (`frontend/`)**
  - Aplicación Next.js/React.
  - Se comunica con el backend vía HTTP (`/api/...`).
  - Proporciona las vistas:
    - Crear nuevo escaneo.
    - Listar escaneos (jobs).
    - Ver resultados (findings).
    - Descargar reportes.

- **Backend (`backend/`)**
  - API REST usando FastAPI.
  - Conecta con PostgreSQL.
  - Orquesta:
    - Creación de “jobs” de escaneo.
    - Ejecución de herramientas de seguridad mediante Docker.
    - Parseo y normalización de resultados (findings).
    - Generación de reportes.

- **Base de datos (`db/`)**
  - Motor: PostgreSQL.
  - Inicialización:
    - Script en `db/init/001_base_schema.sql` para crear el esquema y extensiones básicas.
  - Tablas:
    - Usuarios.
    - Targets (URLs autorizadas).
    - Jobs (ejecuciones de escaneo).
    - Findings (hallazgos).

- **Reverse Proxy (`docker/proxy/`)**
  - Caddy como proxy:
    - En desarrollo: escucha en `:8080` (HTTP) y enruta a frontend/backend.
    - En producción: termina TLS (HTTPS) con Let’s Encrypt, enruta dominios a frontend/backend.

- **Herramientas de seguridad (contenedores efímeros)**
  - No están siempre encendidas.
  - Se ejecutan bajo demanda con `docker run` desde el backend:
    - OWASP ZAP (baseline).
    - Nuclei.
    - SSLyze.
    - whatweb/Wappalyzer.
    - Subfinder (opcional).
  - Devuelven resultados en JSON/TXT/HTML que se parsean y guardan.

Para más detalle, ver `docs/ARCHITECTURE.md`.

---

## 🛠 Tecnologías utilizadas

- **Backend**
  - Python 3.11+
  - FastAPI
  - Uvicorn
  - SQLAlchemy / Alembic (para el modelo de datos y migraciones) *(planificado)*

- **Frontend**
  - Next.js (React)
  - TypeScript (recomendado)
  - CSS/Framework (Tailwind CSS recomendado)

- **Base de datos**
  - PostgreSQL 16 (imagen oficial Docker)

- **Infraestructura**
  - Docker
  - Docker Compose
  - Caddy (reverse proxy y TLS en producción)
  - Scripts Bash (`scripts/`) para bootstrap/teardown

- **Herramientas de seguridad**
  - OWASP ZAP (baseline mode).
  - Nuclei (ProjectDiscovery).
  - SSLyze.
  - whatweb / Wappalyzer CLI.
  - Subfinder (opcional, descubrimiento de subdominios).

---

## 📁 Estructura del repositorio

```text
auditor-web/
├─ backend/                          # FastAPI + lógica de negocio (Rol A)
├─ frontend/                         # Next.js / React (Rol B)
├─ db/
│  └─ init/
│     └─ 001_base_schema.sql         # Script SQL inicial (schema y extensiones)
├─ docker/
│  ├─ api/
│  │  └─ Dockerfile                  # Imagen backend
│  ├─ frontend/
│  │  └─ Dockerfile                  # Imagen frontend
│  └─ proxy/
│     ├─ Caddyfile.dev               # Proxy dev (HTTP 8080)
│     └─ Caddyfile.prod              # Proxy prod (HTTPS, Let’s Encrypt)
├─ env/
│  ├─ .env.example                   # Template de variables
│  └─ .env.dev                       # Config local de desarrollo (NO en git)
├─ scripts/
│  ├─ dev_bootstrap.sh               # Levanta el stack de desarrollo
│  └─ dev_teardown.sh                # Derriba el stack de desarrollo
├─ docker-compose.dev.yml            # Orquestación completa en desarrollo
├─ docker-compose.prod.yml           # Orquestación para producción
├─ reports/                          # Output de escaneos (JSON, HTML, etc.)
└─ docs/
   ├─ PROJECT_CONTEXT.md             # Contexto del curso y proyecto
   ├─ ARCHITECTURE.md               # Arquitectura técnica detallada
   ├─ AI_AGENTS_GUIDE.md            # Guía para agentes de IA
   ├─ ROLE_A_BACKEND_SECURITY.md    # Instrucciones para Rol A
   └─ ROLE_B_FRONTEND_INFRA.md      # Instrucciones para Rol B
```

## ⚙️ Variables de entorno

Las variables de entorno se definen en env/.env.example y se copian en:

env/.env.dev → para desarrollo local.

env/.env.prod → para despliegue en producción (no incluida por defecto).

Ejemplo de variables clave (nombres aproximados):

Base de datos

POSTGRES_USER

POSTGRES_PASSWORD

POSTGRES_DB

POSTGRES_PORT

DATABASE_URL

Formato: postgresql://<USER>:<PASS>@db:5432/<DB_NAME>

Backend (FastAPI)

API_HOST (típicamente 0.0.0.0)

API_PORT (típicamente 8000)

API_LOG_LEVEL (info, debug)

JWT_SECRET (clave secreta de tokens)

JWT_ALGORITHM (por ejemplo, HS256)

Frontend

NEXT_PUBLIC_API_BASE_URL

En dev: http://proxy:8080/api (a través de Caddy).

Directo a backend (solo para pruebas): http://localhost:8000.

Proxy (desarrollo)

DEV_PROXY_HTTP_PORT (por defecto 8080).

Cada nueva variable debe describirse en env/.env.example con un comentario para que otros (y agentes IA) entiendan su propósito.

🧪 Puesta en marcha del entorno de desarrollo
Paso 1 – Clonar el repositorio