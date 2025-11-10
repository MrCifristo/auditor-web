# 🧱 Arquitectura Técnica — Auditor Web de Seguridad

Este documento describe la **arquitectura técnica** del proyecto **Auditor Web de Seguridad**, incorporando de forma explícita:

- **Autenticación completa de usuarios y control de acceso.**
- **Dashboard con métricas y gráficas de vulnerabilidades** como componente central.

Está pensado para:

- Desarrolladores (Rol A y Rol B).
- Profesores y revisores técnicos.
- Agentes de IA que asistan en el desarrollo o mantenimiento del sistema.

---

## 1. Visión general de la arquitectura

El sistema se organiza como una aplicación web compuesta por:

1. **Frontend (Next.js/React)** — `frontend/`  
   - UI para:
     - Registro e inicio de sesión.
     - Gestión de escaneos (jobs).
     - Visualización de hallazgos.
     - Dashboard de métricas y gráficas.

2. **Backend (FastAPI)** — `backend/`  
   - API REST que:
     - Implementa autenticación y autorización (JWT).
     - Gestiona usuarios, targets, jobs y findings.
     - Orquesta la ejecución de herramientas de seguridad en contenedores Docker.
     - Expone endpoints para métricas agregadas usadas por el dashboard.
     - Genera datos para reportes PDF/JSON.

3. **Base de datos (PostgreSQL)** — `db/`  
   - Almacena:
     - Usuarios y credenciales (hasheadas).
     - Targets (URLs autorizadas).
     - Jobs de escaneo.
     - Findings normalizados.
   - Inicializada parcialmente con `db/init/001_base_schema.sql`.

4. **Reverse Proxy (Caddy)** — `docker/proxy/`  
   - Punto de entrada único:
     - En dev: HTTP (`localhost:8080`).
     - En prod: HTTPS + dominios personalizados.
   - Enruta:
     - `/api/*` → backend.
     - Resto de rutas → frontend.

5. **Herramientas de seguridad (contenedores efímeros)**  
   - Escáneres que se ejecutan bajo demanda:
     - OWASP ZAP (baseline).
     - Nuclei.
     - SSLyze.
     - whatweb/Wappalyzer CLI.
     - Subfinder (opcional).
   - Accedidas y controladas exclusivamente desde el backend.

---

## 2. Diagrama lógico de alto nivel

Representación conceptual (no exacta en sintaxis, solo para entender flujos):

```text
      Usuario (Navegador)
               │
      HTTP(S)  │
               ▼
        [ Reverse Proxy ]
           (Caddy)
        /              \
       /                \
/api/* → [ Backend API ] ──────────────┐
           (FastAPI)                   │
              │                        │
              │                        │ Docker socket
              ▼                        │
        [ PostgreSQL ]                 │
              ▲                        │
              │                        ▼
           [ Datos ]         [ Contenedores de escáneres ]
                         (ZAP, Nuclei, SSLyze, etc.)
               ▲
               │
         [ Frontend ]
       (Next.js / React)
```

---

## 3. Componentes en detalle

### 3.1 Frontend — `frontend/`

**Rol principal:** interfaz de usuario.

Responsabilidades:

- Formularios de **registro** e **inicio de sesión**.
- Almacenamiento seguro del token de acceso (JWT).
- Protección de rutas internas (dashboard, escaneos) para usuarios autenticados.
- Interacción con la API:
  - `/api/auth/register`
  - `/api/auth/login`
  - `/api/jobs`, `/api/jobs/{id}`, `/api/jobs/{id}/findings`
  - `/api/metrics/*` (dashboard).

- Renderizado del dashboard con:
  - Gráficas de hallazgos por severidad.
  - Gráficas por herramienta.
  - Historial de escaneos/hallazgos.
  - KPIs globales.

Tecnologías esperadas:

- Next.js (App Router o Pages Router).
- React.
- TypeScript (recomendado).
- Tailwind CSS u otro framework de estilos.
- Librería de gráficas (Recharts, Chart.js, etc.).

Puntos de integración importantes:

- Utiliza `NEXT_PUBLIC_API_BASE_URL` para construir URLs de API.
- Incluye el token JWT en cabeceras de autorización (`Authorization: Bearer <token>`).

---

### 3.2 Backend — `backend/`

**Rol principal:** lógica de negocio, seguridad y orquestación de escaneos.

Responsabilidades principales:

1. **Autenticación y autorización**
   - Endpoints (nombres aproximados):
     - `POST /auth/register` → crear usuario.
     - `POST /auth/login` → validar credenciales y emitir JWT.
     - `GET /auth/me` → obtener información del usuario autenticado.
   - Uso de:
     - Hash de contraseñas (por ejemplo, bcrypt).
     - Tokens JWT con:
       - `sub` = ID del usuario.
       - Tiempos de expiración (`exp`).
       - Tal vez `role` (user/admin).

2. **Gestión de usuarios y recursos**
   - CRUD básico de:
     - Users (limitado por rol).
     - Targets (URLs asociadas al usuario).
     - Jobs de escaneo.
     - Findings.

3. **Gestión de escaneos (jobs)**
   - Crear un nuevo job:
     - Validar el token JWT.
     - Validar la URL objetivo (formato y autorización).
     - Registrar el job en la BD con estado inicial `queued` o `running`.
   - Ejecutar escaneos:
     - Lanzar contenedores específicos para cada herramienta seleccionada.
     - Pasar parámetros necesarios (URL objetivo, opciones preconfiguradas).
     - Aplicar timeouts y monitoreo del estado de los contenedores.
   - Recoger resultados:
     - Leer archivos de salida o streams de las herramientas.
     - Parsear outputs a JSON o estructuras intermedias.
   - Guardar hallazgos:
     - Normalizar findings y guardarlos asociados al job.

4. **Endpoints de métricas (dashboard)**
   - Por ejemplo:
     - `GET /metrics/summary`:
       - Totales de escaneos y hallazgos por severidad.
     - `GET /metrics/by-severity`:
       - Conteo de findings `group by severity`.
     - `GET /metrics/by-tool`:
       - Conteo/porcentajes por herramienta.
     - `GET /metrics/timeline`:
       - Número de escaneos y/o findings por periodo de tiempo.
   - Todos los endpoints de métricas:
     - Filtran por `user_id` (obtenido del token) para mostrar solo datos del usuario autenticado.
     - Son usados por el dashboard del frontend.

5. **Generación de reportes**
   - Preparar estructuras de datos aptas para PDF/JSON.
   - Opcionalmente, generar PDFs mediante librerías (WeasyPrint, ReportLab, etc.).
   - Endpoint:
     - `GET /jobs/{id}/report` → retorno PDF/JSON.

6. **Conexión con la base de datos**
   - Usar `DATABASE_URL` definida en variables de entorno.
   - Usar ORM (SQLAlchemy) + Alembic (migraciones) — recomendado.

---

### 3.3 Base de datos — `db/` (PostgreSQL)

**Motor:** PostgreSQL 16 (imagen oficial).

**Inicialización:**

- `db/init/001_base_schema.sql`:
  - Crea el esquema (por ejemplo, `app`).
  - Crea extensiones útiles (`uuid-ossp`, `pgcrypto`, etc.).

**Modelo de datos conceptual:**

> Nota: esto es conceptual. La implementación exacta (nombres de columnas, índices) la define Rol A.

- `users`
  - `id` (UUID o entero autoincremental).
  - `email` (único).
  - `password_hash`.
  - `role` (`user`, `admin`, etc.).
  - `created_at`, `updated_at`.

- `targets`
  - `id`.
  - `user_id` (FK → users).
  - `url`.
  - `created_at`.

- `jobs`
  - `id`.
  - `user_id` (FK → users).
  - `target_id` (FK → targets).
  - `status` (`queued`, `running`, `done`, `failed`).
  - `tools_used` (lista o flags de ZAP, Nuclei, SSLyze, etc.).
  - `created_at`, `started_at`, `finished_at`.

- `findings`
  - `id`.
  - `job_id` (FK → jobs).
  - `severity` (`info`, `low`, `medium`, `high`, `critical`).
  - `title`.
  - `description`.
  - `evidence`.
  - `recommendation`.
  - `tool` (ZAP, Nuclei, SSLyze, etc.).
  - `created_at`.

> Métricas agregadas se calculan con queries `GROUP BY` sobre estas tablas.

---

### 3.4 Reverse Proxy — `docker/proxy/` (Caddy)

- Configuración de desarrollo — `Caddyfile.dev`:
  - Listener en `:8080`.
  - Rutas:
    - `@api` para `/api*` → proxy hacia `api:8000`.
    - Resto de rutas `handle` → proxy hacia `frontend:3000`.
  - Sin TLS, pensado para entorno local.

- Configuración de producción — `Caddyfile.prod`:
  - Hostnames:
    - `auditor.tu-dominio.com` → frontend.
    - `api.auditor.tu-dominio.com` → backend.
  - TLS:
    - Let’s Encrypt gestionado automáticamente por Caddy.
  - Puertos:
    - `80` y `443` expuestos hacia internet.

El reverse proxy sirve como:

- Punto único de entrada en prod.
- Forma de simular la topología real también en dev.

---

### 3.5 Herramientas de seguridad — contenedores efímeros

Cada herramienta (ZAP, Nuclei, SSLyze, etc.) se ejecuta como **contenedor temporal**:

- El backend tiene montado `/var/run/docker.sock`.
- Cuando se crea un job:
  - Backend decide qué contenedores lanzar según herramientas seleccionadas.
- Ejemplos conceptuales:
  - `docker run --rm owasp/zap2docker-stable zap-baseline.py ...`
  - `docker run --rm projectdiscovery/nuclei -u <url> -json ...`
  - `docker run --rm sslyze ...`

Buenas prácticas:

- Limitar CPU y memoria de estos contenedores.
- Imponer timeouts de ejecución.
- No permitir que los contenedores accedan a la red interna de Docker más allá de lo necesario para llegar al target.

---

## 4. Arquitectura de despliegue (Docker Compose)

Se utilizan dos archivos principales:

- `docker-compose.dev.yml` → desarrollo local.
- `docker-compose.prod.yml` → producción (por ejemplo, en EC2).

### 4.1 `docker-compose.dev.yml`

Servicios típicos:

- `db`:
  - Imagen `postgres:16-alpine`.
  - Volumen `db_data` persistente.
  - Scripts de init en `/docker-entrypoint-initdb.d`.

- `api`:
  - Build desde `docker/api/Dockerfile`.
  - Monta `./backend` para hot reload.
  - Monta `/var/run/docker.sock` para lanzar escáneres.
  - Expone puerto `8000` (útil para debug).

- `frontend`:
  - Build desde `docker/frontend/Dockerfile`.
  - Monta `./frontend` para desarrollo (`npm run dev`).
  - Expone puerto `3000`.

- `proxy`:
  - Imagen `caddy:2`.
  - Usa `docker/proxy/Caddyfile.dev`.
  - Expone puerto `8080` al host.

Todos conectados en la red bridge `auditor_net`.

### 4.2 `docker-compose.prod.yml`

Similar, pero:

- Sin hot reload.
- Sin montar código desde el host (solo imágenes construidas).
- No expone puertos 3000/8000, solo 80/443 del `proxy`.
- Usa `Caddyfile.prod` y volúmenes para certificados (`caddy_data`, `caddy_config`).

---

## 5. Autenticación y flujo de seguridad

### 5.1 Flujo de registro e inicio de sesión

1. **Registro**
   - El usuario envía email y password a `POST /auth/register`.
   - El backend:
     - Valida el email.
     - Hashea la contraseña.
     - Crea un `user` en la base de datos.

2. **Login**
   - El usuario envía credenciales a `POST /auth/login`.
   - El backend:
     - Verifica email y password.
     - Genera un JWT con `sub = user_id` y expiración.
     - Devuelve el token al frontend.

3. **Uso del token**
   - El frontend guarda el token y lo manda en `Authorization: Bearer <token>`.
   - El backend:
     - Extrae el token.
     - Lo valida.
     - Inyecta el `current_user` en los endpoints protegidos.

### 5.2 Protección de endpoints

- Endpoints como:
  - `POST /jobs`
  - `GET /jobs`
  - `GET /jobs/{id}`
  - `GET /jobs/{id}/findings`
  - `GET /metrics/*`
- Requieren token:
  - El backend rechaza con `401` si no hay token o es inválido.
  - El backend filtra por `user_id` para limitar el acceso a recursos propios.

---

## 6. Dashboard de métricas — arquitectura de datos

### 6.1 Fuentes de datos para el dashboard

El dashboard se construye con datos agregados desde:

- `jobs` (por usuario).
- `findings` (por job, por severidad, por herramienta).

### 6.2 Endpoints de métricas (propuestos)

Algunos ejemplos de endpoints:

- `GET /metrics/summary`
  - Devuelve:
    - Total de jobs.
    - Total de findings.
    - Conteo de findings por severidad.

- `GET /metrics/by-severity`
  - Devuelve una lista:
    - `[ { severity: "critical", count: N }, ... ]`.

- `GET /metrics/by-tool`
  - Devuelve:
    - `[ { tool: "ZAP", count: N }, ... ]`.

- `GET /metrics/timeline`
  - Devuelve:
    - Serie temporal de escaneos/findings (ej. por día o semana).

El backend implementa estos endpoints filtrando por `user_id` (del token) para que cada usuario vea únicamente sus propias métricas.

### 6.3 Renderizado en el frontend

El frontend:

1. Llama a estos endpoints usando fetch/Axios con el token en la cabecera.
2. Transforma el JSON en estructuras compatibles con la librería de gráficos.
3. Renderiza:
   - Gráficas de barras, pastel, líneas.
   - Tarjetas con KPIs (widgets).

---

## 7. Consideraciones de seguridad de la arquitectura

Algunos puntos clave:

1. **Aislamiento de escáneres**
   - Escáneres dentro de contenedores separados.
   - Sin acceso directo a la base de datos o al frontend.
   - Comunicación controlada (solo hacia el target de escaneo).

2. **Protección del socket de Docker**
   - El contenedor del backend que tiene montado `/var/run/docker.sock` es altamente sensible.
   - La API no debe permitir que el usuario final introduzca comandos arbitrarios.
   - Solo se deben exponer acciones controladas (escaneos predefinidos con herramientas whitelisteadas).

3. **Gestión de secretos**
   - Claves (`JWT_SECRET`, contraseñas de DB, etc.) se definen en archivos `.env` NO versionados.
   - Nunca se hardcodean en el código.

4. **Validación de entradas**
   - URLs objetivo deben validarse con cuidado:
     - Formato correcto.
     - Coincidencia con dominios permitidos o entornos de laboratorio.
   - Inputs de formularios deben sanitizarse para evitar XSS en la UI.

5. **Manejo de errores**
   - Logs detallados en el servidor, pero mensajes controlados hacia el cliente.
   - Evitar exponer trazas internas o información sensible en respuestas de error.

---

## 8. División de responsabilidades técnica (Roles)

### 8.1 Rol A — Backend & Seguridad

Se enfoca en:

- Implementar la API (incluyendo auth y métricas).
- Modelar y migrar la base de datos.
- Integrar y orquestar herramientas de seguridad.
- Asegurar el backend (validaciones, manejo de errores, protección de socket Docker).
- Documentar endpoints y contratos de datos.

Ver también: `docs/ROLE_A_BACKEND_SECURITY.md`.

### 8.2 Rol B — Frontend & Infraestructura

Se enfoca en:

- Implementar el dashboard y las vistas de autenticación/escaneos.
- Diseñar la UX para entender hallazgos y métricas.
- Configurar Docker, docker-compose y Caddy (dev/prod).
- Documentar cómo levantar y desplegar el sistema.

Ver también: `docs/ROLE_B_FRONTEND_INFRA.md`.

---

## 9. Uso de este documento por agentes de IA

Los agentes de IA pueden usar este documento como:

- **Mapa de referencia** para:
  - Saber dónde viven las cosas (backend/frontend/db/proxy).
  - Entender qué decisiones ya están tomadas (no discutirlas sin motivo).
- **Guía para sugerir cambios**:
  - Cualquier propuesta debe indicar:
    - Qué componente afecta.
    - Si impacta autenticación, métricas o seguridad.
- **Contexto para responder preguntas**:
  - Usar la información aquí para mantener coherencia en las respuestas.

---

## 10. Resumen

La arquitectura del **Auditor Web de Seguridad** está diseñada para:

- Ser **modular** (frontend / backend / DB / proxy / escáneres).
- Ser **segura** (autenticación, control de acceso, aislamiento por contenedores).
- Ser **expresiva** (dashboard con métricas y gráficas significativas).
- Ser **reproducible** (Docker Compose en dev y prod).

Cualquier cambio significativo debe evaluarse contra estos objetivos arquitectónicos.
