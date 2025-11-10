# 🛡️ Auditor Web de Seguridad

Plataforma web para realizar **auditorías de seguridad básicas** sobre sitios web autorizados, diseñada para que el resultado sea:

- **Segura** (autenticación completa, control de acceso, aislamiento de escáneres).
- **Entendible** para personas sin conocimientos técnicos en ciberseguridad.
- **Accionable**, gracias a reportes y un **dashboard con métricas y gráficas** de vulnerabilidades.

Este proyecto forma parte del curso **Seguridad Informática & Encriptación** (último año de Computer Science) y está orientado a demostrar:

- Integración de herramientas reales de auditoría (OWASP ZAP, Nuclei, SSLyze, etc.).
- Aplicación práctica de conceptos de **autenticación, autorización y cifrado**.
- Buenas prácticas de infraestructura (Docker, reverse proxy, DB).
- Capacidad de **comunicar riesgos** mediante dashboards y reportes ejecutivos.

---

## 📚 Índice

1. Resumen del proyecto  
2. Objetivo general y objetivos específicos  
3. Visión funcional para el usuario final  
4. Arquitectura general del sistema  
5. Tecnologías utilizadas  
6. Estructura del repositorio  
7. Variables de entorno  
8. Autenticación y control de acceso  
9. Dashboard de métricas y visualización  
10. Puesta en marcha del entorno de desarrollo  
11. Flujo de un escaneo de seguridad  
12. Roles y responsabilidades del equipo  
13. Guía para contribuyentes y agentes de IA  
14. Despliegue en producción (visión general)  
15. Mejoras futuras sugeridas  

---

## 🧾 Resumen del proyecto

El **Auditor Web de Seguridad** es una aplicación web que permite a usuarios autenticados:

- Registrar una cuenta y acceder a la plataforma mediante **login seguro** (contraseñas hasheadas + JWT).
- Ingresar **URLs objetivo autorizadas** para auditoría.
- Seleccionar un conjunto de **herramientas de seguridad** a ejecutar (ZAP, Nuclei, SSLyze, etc.).
- Lanzar escaneos automatizados desde el backend, ejecutados en **contenedores Docker aislados**.
- Almacenar los resultados normalizados en una base de datos PostgreSQL.
- Visualizar los hallazgos en:
  - Un **listado detallado** por escaneo.
  - Un **dashboard con métricas y gráficas** (hallazgos por severidad, por herramienta, por target, en el tiempo).
- Exportar reportes (PDF/JSON) para uso gerencial o documental.

El énfasis está en:

- Integrar herramientas reales de ciberseguridad.
- Demonstrar **autenticación, autorización y protección de datos**.
- Comunicar los resultados de forma visual, agregada y entendible.

---

## 🎯 Objetivo general y objetivos específicos

### 🎯 Objetivo general

> Construir una plataforma web segura que permita a usuarios autenticados realizar auditorías automatizadas de seguridad web sobre sitios autorizados, visualizar métricas agregadas mediante un dashboard con gráficas y presentar resultados de forma clara y accionable.

### 🎯 Objetivos específicos

1. **Integración técnica**
   - Orquestar herramientas estándar de seguridad (ZAP, Nuclei, SSLyze, etc.) desde un backend FastAPI.
   - Normalizar los resultados de diferentes herramientas en un modelo de datos común.
   - Proveer endpoints REST bien definidos y documentados.

2. **Seguridad y buenas prácticas**
   - Implementar **autenticación completa**:
     - Registro e inicio de sesión.
     - Hash seguro de contraseñas.
     - Emisión y validación de tokens JWT.
   - Aplicar control de acceso:
     - Cada usuario ve únicamente sus propios escaneos y resultados.
     - Roles básicos (ej. `user`, `admin`) para gestión avanzada.
   - Ejecutar escaneos en contenedores Docker aislados, con límites de tiempo y recursos.
   - Manejar secretos y credenciales mediante variables de entorno.

3. **Usabilidad, métricas y comunicación**
   - Diseñar un dashboard con:
     - Gráficas de hallazgos por severidad (pie/bar chart).
     - Gráficas de hallazgos por herramienta.
     - Historial de escaneos a lo largo del tiempo.
     - KPIs como: total de escaneos, promedio de hallazgos por escaneo, top 5 targets más vulnerables.
   - Presentar hallazgos detallados con descripciones claras y recomendaciones.
   - Permitir exportar reportes en formato PDF/JSON para presentaciones gerenciales.

4. **Infraestructura reproducible**
   - Empaquetar el sistema en `docker-compose` para desarrollo y producción.
   - Facilitar despliegue en un solo host (máquina local o instancia EC2).
   - Documentar claramente cómo levantar, apagar y depurar el entorno.

---

## 👤 Visión funcional para el usuario final

Desde el punto de vista de un usuario no técnico:

1. Se registra en la plataforma con un correo y contraseña.
2. Inicia sesión y accede al **dashboard principal**.
3. En el dashboard ve:
   - Un resumen de seguridad de sus proyectos:
     - Gráfica de vulnerabilidades por severidad.
     - Número total de escaneos realizados.
     - Últimos escaneos ejecutados.
4. Desde la sección “Nuevo escaneo”:
   - Ingresa la URL del sitio (dentro del alcance permitido).
   - Selecciona herramientas de análisis (ZAP, Nuclei, SSLyze, etc.).
   - Inicia el escaneo.
5. El sistema:
   - Ejecuta las herramientas seleccionadas en background.
   - Muestra el progreso del job.
6. Al terminar el escaneo:
   - Se actualiza el dashboard, reflejando:
     - Nuevos hallazgos por severidad.
     - Impacto sobre las métricas globales (ej. aumento de vulnerabilidades críticas).
   - El usuario puede:
     - Ver el detalle de cada hallazgo.
     - Descargar un reporte.

---

## 🧱 Arquitectura general del sistema

El sistema se compone de los siguientes bloques:

### Frontend (`frontend/`)

- Aplicación construida con Next.js/React.
- Responsabilidades:
  - Proveer formularios de **registro** e **inicio de sesión**.
  - Mantener el estado de autenticación (tokens JWT en almacenamiento seguro).
  - Proteger páginas internas (dashboard, listado de escaneos, detalle de hallazgos).
  - Consumir la API REST del backend (`/api/...`).
  - Renderizar:
    - Vista de **Nuevo escaneo**.
    - Vista de **Listado de escaneos**.
    - Vista de **Hallazgos por escaneo**.
    - **Dashboard de métricas y gráficas** (usando librerías de charts en el frontend).

### Backend (`backend/`)

- API REST basada en FastAPI.
- Responsabilidades:
  - Autenticación y autorización:
    - Registro de nuevos usuarios.
    - Inicio de sesión.
    - Emisión y validación de JWT.
    - Protección de endpoints sensibles con dependencia de seguridad.
  - Gestión de datos:
    - Usuarios.
    - Targets (URLs autorizadas).
    - Jobs de escaneo.
    - Findings (hallazgos normalizados).
  - Integración con Docker:
    - Lanzar contenedores efímeros de:
      - OWASP ZAP (baseline).
      - Nuclei.
      - SSLyze.
      - Herramientas auxiliares (whatweb/Wappalyzer, Subfinder opcional).
    - Aplicar límites de tiempo y recursos.
  - Normalización de resultados:
    - Parsear salidas JSON/TXT/HTML de cada herramienta.
    - Convertirlas a una estructura estándar de hallazgos.
  - Endpoints de métricas:
    - Devolver resúmenes agregados para el dashboard:
      - Hallazgos por severidad.
      - Hallazgos por herramienta.
      - Hallazgos por target.
      - Evolución temporal de hallazgos/escaneos.
  - Generación de reportes:
    - Construir payloads para PDF/JSON de reportes ejecutivos.

### Base de datos (`db/`)

- Motor: PostgreSQL 16.
- Inicialización:
  - `db/init/001_base_schema.sql` crea el esquema base (`app`) y extensiones necesarias.
- Entidades (conceptual):
  - `users` (id, email, password_hash, rol, timestamps).
  - `targets` (id, url, owner_id, configuraciones adicionales).
  - `jobs` (id, target_id, user_id, estado, timestamps, herramientas utilizadas).
  - `findings` (id, job_id, severidad, título, descripción, evidencia, recomendación, herramienta).
- Relación con autenticación:
  - `users` es la base del sistema de login.
  - Tokens JWT se generan sobre la identidad del usuario.

### Reverse Proxy (`docker/proxy/`)

- Caddy como reverse proxy.
- En desarrollo:
  - Expuesto en `http://localhost:8080`.
  - Rutas:
    - `/api/*` → `api:8000`.
    - `/` (demas rutas) → `frontend:3000`.
- En producción:
  - Manejo de TLS (Let’s Encrypt).
  - Dominios separados si se desea (ej. `auditor.dominio.com` y `api.auditor.dominio.com`).

### Herramientas de seguridad (contenedores efímeros)

- Cada herramienta se ejecuta on-demand dentro de un contenedor Docker.
- Ejemplos:
  - OWASP ZAP (baseline).
  - Nuclei.
  - SSLyze.
- Conceptos clave:
  - **Aislamiento** de escaneos.
  - Control de uso responsable (solo targets autorizados).
  - Normalización de resultados.

---

## 🛠 Tecnologías utilizadas

- **Backend**
  - Python 3.11+
  - FastAPI
  - Uvicorn
  - SQLAlchemy / Alembic (para ORM y migraciones) *(planificado)*
  - PyJWT u otra librería para JWT

- **Frontend**
  - Next.js (sobre React)
  - TypeScript (recomendado)
  - Tailwind CSS (recomendado para estilos)
  - Librería de gráficas (ej. Recharts, Chart.js o similar)

- **Base de datos**
  - PostgreSQL 16 (imagen oficial)

- **Infraestructura**
  - Docker
  - Docker Compose
  - Caddy (reverse proxy + TLS en prod)
  - Scripts Bash en `scripts/` para automatizar tareas comunes

- **Herramientas de seguridad**
  - OWASP ZAP (baseline mode).
  - Nuclei (ProjectDiscovery).
  - SSLyze.
  - whatweb / Wappalyzer CLI.
  - Subfinder (opc.).

---

## 📁 Estructura del repositorio

```text
auditor-web/
├─ backend/                          # FastAPI + lógica de negocio y seguridad (Rol A)
├─ frontend/                         # Next.js / React + UI, dashboards y gráficas (Rol B)
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
│  ├─ .env.example                   # Template de variables de entorno
│  └─ .env.dev                       # Config local de desarrollo (NO en git)
├─ scripts/
│  ├─ dev_bootstrap.sh               # Levanta el stack de desarrollo
│  └─ dev_teardown.sh                # Apaga el stack de desarrollo
├─ docker-compose.dev.yml            # Orquestación completa en desarrollo
├─ docker-compose.prod.yml           # Orquestación para producción (EC2/VM)
├─ reports/                          # Output de escaneos (JSON, HTML, etc.)
└─ docs/
   ├─ PROJECT_CONTEXT.md             # Contexto del curso y del proyecto
   ├─ ARCHITECTURE.md               # Arquitectura técnica detallada
   ├─ AI_AGENTS_GUIDE.md            # Guía para agentes de IA
   ├─ ROLE_A_BACKEND_SECURITY.md    # Instrucciones para Rol A
   └─ ROLE_B_FRONTEND_INFRA.md      # Instrucciones para Rol B
```

---

## ⚙️ Variables de entorno

Las variables de entorno se definen en `env/.env.example` y se copian a:

- `env/.env.dev` (desarrollo local)
- `env/.env.prod` (producción)

### Base de datos

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_PORT`
- `DATABASE_URL`  
  Formato típico:  
  `postgresql://<USER>:<PASSWORD>@db:5432/<DB_NAME>`

### Backend (FastAPI)

- `API_HOST` (ej. `0.0.0.0`)
- `API_PORT` (ej. `8000`)
- `API_LOG_LEVEL` (`info`, `debug`)
- `JWT_SECRET` (clave para firmar tokens)
- `JWT_ALGORITHM` (ej. `HS256`)
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` (ej. 30)

### Frontend (Next.js)

- `NEXT_PUBLIC_API_BASE_URL`  
  - Dev: `http://proxy:8080/api`  
  - Prod: `https://api.auditor.midominio.com` (ejemplo)
- `FRONTEND_PORT` (ej. `3000`)

### Proxy dev

- `DEV_PROXY_HTTP_PORT` (ej. `8080`)

Cada variable debe documentarse en `env/.env.example` para facilitar la comprensión y la configuración.

---

## 🔐 Autenticación y control de acceso

La autenticación es un componente **esencial** del proyecto (no opcional):

- **Registro de usuarios**
  - Endpoint para crear cuentas nuevas.
  - Validación de email y password.
  - Hash de contraseñas (nunca almacenar texto plano).

- **Inicio de sesión**
  - Endpoint que recibe credenciales y, si son válidas, emite un token JWT.
  - El token incluye la identidad del usuario y, opcionalmente, su rol.

- **Protección de endpoints**
  - Endpoints de creación de jobs, listado de resultados, métricas, etc., requieren un JWT válido.
  - El backend verifica el token en cada request protegido.
  - El frontend almacena el token de forma segura (por ejemplo en memoria/HTTP-only cookie según el diseño).

- **Control de acceso**
  - Un usuario solo puede:
    - Crear jobs asociados a su cuenta.
    - Ver sus propios jobs y findings.
  - Roles:
    - Usuario estándar (`user`): accesos normales.
    - Administrador (`admin`): visión global de todos los usuarios / jobs (opcional según alcance).

---

## 📊 Dashboard de métricas y visualización

La plataforma incluye un **dashboard de métricas** para visualizar el estado de seguridad de forma agregada y visual:

### Métricas clave

- Número total de escaneos realizados por el usuario.
- Distribución de hallazgos por severidad (Info, Low, Medium, High, Critical).
- Hallazgos por herramienta (ZAP, Nuclei, SSLyze, etc.).
- Top 5 targets más afectados (más findings).
- Evolución temporal:
  - Número de escaneos en el tiempo.
  - Número de hallazgos en el tiempo.

### Gráficas sugeridas

- **Gráfica de barras**: hallazgos por severidad.
- **Gráfica de dona/pastel**: proporción de severidades.
- **Gráfica de líneas**: hallazgos a lo largo del tiempo.
- **Tablas resumidas**: top targets, top herramientas con más hallazgos.

### Flujo de datos para el dashboard

1. El frontend solicita a la API uno o varios endpoints agregados, como:
   - `/api/metrics/summary`
   - `/api/metrics/by-severity`
   - `/api/metrics/by-tool`
   - `/api/metrics/timeline`
2. El backend consulta la DB:
   - Aplica filtros por `user_id` para mostrar solo datos del usuario autenticado.
3. El frontend transforma los datos en datasets para la librería de gráficas.
4. Las gráficas y KPIs se muestran en la página principal del dashboard.

---

## 🧪 Puesta en marcha del entorno de desarrollo

1. **Clonar el repositorio**

   ```bash
   git clone <URL_DEL_REPO> auditor-web
   cd auditor-web
   ```

2. **Crear archivo de entorno de desarrollo**

   ```bash
   cp env/.env.example env/.env.dev
   # Editar env/.env.dev con contraseñas, secrets y configuración de dev
   ```

3. **Dar permisos a scripts**

   ```bash
   chmod +x scripts/dev_bootstrap.sh scripts/dev_teardown.sh
   ```

4. **Levantar el stack**

   ```bash
   ./scripts/dev_bootstrap.sh
   ```

5. **Verificar contenedores**

   ```bash
   docker compose -f docker-compose.dev.yml ps
   ```

   Deberías ver contenedores para DB, API, frontend y proxy en estado `Up`.

6. **Probar acceso**

   - Frontend (cuando exista UI):  
     `http://localhost:8080`
   - API (ej. endpoint `/health` cuando Rol A lo implemente):  
     `http://localhost:8000/health` o `http://localhost:8080/api/health`

7. **Apagar el entorno**

   ```bash
   ./scripts/dev_teardown.sh
   ```

---

## 🔄 Flujo de un escaneo de seguridad

1. Usuario se registra e inicia sesión.
2. Accede a la vista “Nuevo escaneo”.
3. Ingresa la URL objetivo y selecciona herramientas.
4. El frontend envía `POST /api/jobs` con el token JWT en la cabecera de autorización.
5. El backend:
   - Valida el token y obtiene el usuario.
   - Verifica que la URL esté dentro del alcance permitido.
   - Crea un `job` asociado al `user_id`.
   - Lanza contenedores de las herramientas seleccionadas.
   - Recoge los resultados, los normaliza y los guarda como `findings`.
   - Actualiza el estado del job (running → done/failed).
6. El frontend:
   - Consulta periódicamente `GET /api/jobs/{id}` y `GET /api/jobs/{id}/findings`.
   - Al completarse, actualiza la vista de resultados y refresca el dashboard de métricas.

---

## 👥 Roles y responsabilidades del equipo

### Rol A – Backend & Seguridad

- Construir la API FastAPI en `backend/`.
- Implementar:
  - Registro y login (autenticación).
  - Generación y validación de JWT.
  - Endpoints para jobs, findings y métricas agregadas.
  - Integración con herramientas de seguridad vía Docker.
  - Modelo de datos y migraciones.

Más detalles: `docs/ROLE_A_BACKEND_SECURITY.md`.

### Rol B – Frontend & Infraestructura

- Implementar el dashboard en `frontend/`:
  - Login/registro.
  - Pantallas de escaneos y hallazgos.
  - Vista de métricas con **gráficas**.
- Mantener:
  - `docker-compose.*`
  - Dockerfiles en `docker/`
  - Caddyfiles (`Caddyfile.dev`, `Caddyfile.prod`)
  - Scripts en `scripts/`
- Documentar el flujo de despliegue y el uso del entorno.

Más detalles: `docs/ROLE_B_FRONTEND_INFRA.md`.

---

## 🤖 Guía para contribuyentes

Antes de proponer cambios importantes:

- Leer:
  - `docs/PROJECT_CONTEXT.md`
  - `docs/ARCHITECTURE.md`
  - `docs/AI_AGENTS_GUIDE.md`
- Respetar:
  - Separación de responsabilidades entre roles.
  - Decisión de usar Docker, Caddy y PostgreSQL.
- Evitar:
  - Simplificar quitando autenticación, métricas o herramientas de seguridad.
  - Cambiar tecnologías centrales sin justificación.

---

## 🌐 Despliegue en producción (visión general)

1. Provisionar una VM (por ejemplo, EC2 con Ubuntu 22.04).
2. Instalar Docker y Docker Compose.
3. Clonar el repositorio en la VM.
4. Crear `env/.env.prod` con credenciales seguras.
5. Configurar DNS para:
   - `auditor.tu-dominio.com` → VM (frontend/proxy).
   - `api.auditor.tu-dominio.com` → VM (API).
6. Ejecutar:

   ```bash
   docker compose -f docker-compose.prod.yml build
   docker compose -f docker-compose.prod.yml up -d
   ```

7. Caddy, usando `Caddyfile.prod`, gestionará certificados TLS con Let’s Encrypt.

---

## 🚀 Mejoras futuras planteadas

- Autenticación de dos factores (2FA).
- Integración con sistemas de ticketing (por ejemplo, crear tickets a partir de hallazgos críticos).
- Módulo de “plan de remediación” con seguimiento de tareas.
- Soporte multi-tenant (organizaciones, equipos).
- Integración con colas (Redis + worker) para escalamiento de escaneos intensivos.
- Notificaciones (correo/Slack) cuando finalice un escaneo o aparezcan vulnerabilidades críticas.

---
