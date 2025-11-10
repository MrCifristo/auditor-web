# Rol A — Backend & Seguridad (Guía detallada)

Este documento describe las responsabilidades, el contexto y las pautas de trabajo para la persona (o agente de IA) que asuma el **Rol A: Backend & Seguridad** en el proyecto **Auditor Web de Seguridad**.

Su función principal es construir el “cerebro” del sistema:

- API REST con FastAPI.
- Autenticación y control de acceso.
- Modelo de datos en PostgreSQL.
- Orquestación de herramientas de seguridad vía Docker.
- Normalización de findings y exposición de métricas para el dashboard.

---

## 1. Antes de escribir código

Antes de modificar o crear archivos en `backend/`, debes:

1. Leer:
   - `README.md`
   - `docs/PROJECT_CONTEXT.md`
   - `docs/ARCHITECTURE.md`
   - Este mismo archivo (`docs/ROLE_A_BACKEND_SECURITY.md`)

2. Revisar el estado actual de:
   - Carpeta `backend/` completa.
   - `db/init/001_base_schema.sql`
   - `docker-compose.dev.yml` (sección de `api` y `db`).
   - `docker/api/Dockerfile`

3. Identificar:
   - Qué partes ya existen (modelos, routers, esquemas).
   - Qué está vacío o solo es un stub.
   - Qué falta para cumplir con:
     - Autenticación completa.
     - Gestión de jobs/findings.
     - Endpoints de métricas.

Nunca asumas que el backend ya está listo. Opera siempre sobre el **estado real** del código.

---

## 2. Objetivos técnicos del Rol A

Tu trabajo como Rol A se centra en:

1. **Autenticación y autorización**
   - Registro de usuarios (`/auth/register`).
   - Login y emisión de JWT (`/auth/login`).
   - Endpoints para obtener el usuario actual (`/auth/me`).
   - Middleware/dependencias para extraer y verificar el usuario autenticado en otros endpoints.

2. **Modelo de datos y acceso a BD**
   - Definir modelos para:
     - `User`
     - `Target`
     - `Job`
     - `Finding`
   - Implementar acceso a la base de datos usando SQLAlchemy (u otra librería acordada).
   - Configurar migraciones con Alembic u otra herramienta.

3. **Gestión de escaneos**
   - Endpoints para:
     - Crear un nuevo job (`POST /jobs`).
     - Listar jobs del usuario autenticado (`GET /jobs`).
     - Consultar un job específico (`GET /jobs/{id}`).
     - Listar findings de un job (`GET /jobs/{id}/findings`).
   - Lógica interna para:
     - Validar URLs objetivo.
     - Lanzar contenedores de herramientas de seguridad.
     - Parsear salidas de herramientas (ZAP, Nuclei, SSLyze).
     - Guardar resultados como findings.

4. **Métricas y dashboard**
   - Implementar endpoints agregados, por ejemplo:
     - `/metrics/summary`
     - `/metrics/by-severity`
     - `/metrics/by-tool`
     - `/metrics/timeline`
   - Asegurarte de que estos endpoints:
     - Filtren por usuario autenticado.
     - Devuelvan estructuras fáciles de usar en el frontend para gráficas.

5. **Seguridad del backend**
   - Aplicar buenas prácticas:
     - Hash de contraseñas.
     - Validación estricta de inputs.
     - Manejo cuidadoso del socket de Docker.
     - Logs adecuados sin exponer secretos.
   - Proteger todos los endpoints sensibles mediante JWT.

---

## 3. Estructura sugerida de `backend/`

La estructura exacta puede variar, pero se sugiere algo como:

```text
backend/
├─ app/
│  ├─ main.py               # Punto de entrada de FastAPI
│  ├─ config.py             # Configuración (lectura de env, settings)
│  ├─ database.py           # Sesión de DB, Base de modelos
│  ├─ models/               # Modelos SQLAlchemy
│  ├─ schemas/              # Esquemas Pydantic (request/response)
│  ├─ routers/              # Routers de FastAPI (auth, jobs, metrics, etc.)
│  ├─ services/             # Lógica de negocio (jobs, findings, escaneos)
│  ├─ security/             # JWT, hashing, dependencias de seguridad
│  └─ utils/                # Utilidades varias (parsers, helpers)
└─ requirements.txt
```

Antes de crear archivos, revisa si el proyecto ya tiene una estructura base y **respétala** lo más posible.

---

## 4. Autenticación y control de acceso

### 4.1 Usuarios

- Modelo `User` en la base de datos:
  - `id`, `email`, `password_hash`, `role`, timestamps.
- Reglas:
  - Email único.
  - Contraseñas nunca en texto plano.

### 4.2 Endpoints básicos de auth

- `POST /auth/register`
  - Recibe email y password.
  - Valida y crea usuario.
- `POST /auth/login`
  - Verifica credenciales.
  - Emite JWT.
- `GET /auth/me`
  - Devuelve info del usuario autenticado.

### 4.3 Tokens JWT

- Contenido mínimo (claims):
  - `sub`: ID del usuario.
  - `exp`: expiración.
- Configurable mediante variables de entorno:
  - `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`.

### 4.4 Uso en otros endpoints

- Todos los endpoints de:
  - `/jobs`
  - `/findings`
  - `/metrics`
- Deben:
  - Requerir JWT.
  - Obtener `current_user` mediante dependencia.
  - Filtrar información por `current_user.id`.

---

## 5. Gestión de escaneos y herramientas de seguridad

### 5.1 Concepto de Job

- Representa una ejecución de escaneo.
- Atributos típicos:
  - `id`, `user_id`, `target_id`, `status`, timestamps, `tools_used`.

### 5.2 Flujo de un Job

1. Usuario crea un job vía `POST /jobs`.
2. Backend:
   - Valida target.
   - Crea registro en DB (`status = queued` o `running`).
   - Lanza contenedores de herramientas seleccionadas.
3. Backend espera resultados o maneja asíncronamente (según diseño):
   - Parse outputs.
   - Guarda findings.
   - Actualiza `status` a `done` o `failed`.

### 5.3 Integración con Docker

- El contenedor `api` tiene montado `/var/run/docker.sock`.
- Llamadas típicas (pseudo-código):
  - Ejecutar `docker run` con imagen de ZAP/Nuclei/SSLyze.
- Consideraciones:
  - No permitir parámetros arbitrarios desde el frontend.
  - Mantener lista cerrada de imágenes y comandos.
  - Aplicar límites de tiempo y recursos.

### 5.4 Parsers de herramientas

- Para cada herramienta:
  - Implementar un parser en un módulo de `services/` o `utils/`.
  - Normalizar resultados a:
    - `severity`, `title`, `description`, `evidence`, `recommendation`, `tool`.

---

## 6. Métricas y soporte al dashboard

### 6.1 Endpoints de métricas

Tu objetivo es darle al frontend datos agregados listos para ser graficados.

Ejemplos:

- `/metrics/summary`
  - Retorna:
    - `total_jobs`
    - `total_findings`
    - `findings_by_severity` (conteos resumidos)

- `/metrics/by-severity`
  - Estructura:
    - `[{"severity": "critical", "count": 3}, ...]`

- `/metrics/by-tool`
  - Estructura:
    - `[{"tool": "ZAP", "count": 10}, ...]`

- `/metrics/timeline`
  - Estructura:
    - Lista de puntos con fecha y conteo.

### 6.2 Reglas importantes

- Siempre filtrar por `current_user.id`.
- Mantener las consultas eficientes (índices en DB si es necesario).
- Evitar lógica de presentación; solo enviar datos crudos listos para graficar.

---

## 7. Seguridad del backend

Puntos clave:

1. **Hash de contraseñas**:
   - Usa algoritmos como bcrypt.
   - Nunca guardes la contraseña en claro.

2. **Protección de Docker**:
   - No expongas `/var/run/docker.sock` a usuarios ni a otros servicios.
   - No generes comandos `docker` con strings construidos a partir de inputs sin validar.

3. **Validación de URLs**:
   - Restringe targets a dominios permitidos o entornos de laboratorio.
   - Evita escaneos hacia:
     - `localhost`, `127.0.0.1`
     - IPs privadas, salvo en entorno de laboratorio explícito.

4. **Manejo de errores**:
   - Loguea detalles técnicos (en server).
   - Devuelve mensajes amigables al cliente (sin exponer internals).

---

## 8. Colaboración con Rol B

Como Rol A, debes:

- Comunicar a Rol B:
  - Contratos de endpoints (rutas, métodos, payloads).
  - Formato de los datos de métricas.
- Mantener estable la API o avisar cuando rompas compatibilidad.
- Proporcionar ejemplos de respuestas JSON para que Rol B diseñe la UI.

---

## 9. Trabajo de un agente de IA en Rol A

Si eres un agente de IA actuando como Rol A:

1. Verifica el contenido actual de `backend/` antes de sugerir reestructuras.
2. Si el backend está vacío:
   - Propón una estructura inicial coherente con este documento.
3. Si ya hay código:
   - Respeta la estructura existente.
   - Propón cambios como mejoras incrementales, no como reescrituras totales, salvo que el usuario las pida.
4. Mantén la autenticación y el soporte de métricas como prioridades altas.

---
