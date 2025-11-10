# Rol B — Frontend & Infraestructura (Guía detallada)

Este documento describe las responsabilidades, el contexto y las pautas de trabajo para la persona (o agente de IA) que asuma el **Rol B: Frontend & Infraestructura** en el proyecto **Auditor Web de Seguridad**.

Su función principal es construir la **experiencia de usuario** y asegurar que el sistema:

- Sea fácil de levantar (dev).
- Sea desplegable de forma coherente (prod).
- Presente la información de seguridad de forma clara, visual y comprensible.

---

## 1. Antes de escribir código o tocar infra

Antes de cambiar archivos en `frontend/`, `docker/`, `docker-compose*.yml`, `scripts/` o `env/`, debes:

1. Leer:
   - `README.md`
   - `docs/PROJECT_CONTEXT.md`
   - `docs/ARCHITECTURE.md`
   - Este mismo archivo (`docs/ROLE_B_FRONTEND_INFRA.md`)

2. Revisar el estado actual de:
   - Carpeta `frontend/`
   - `docker-compose.dev.yml` y `docker-compose.prod.yml`
   - `docker/api/Dockerfile`, `docker/frontend/Dockerfile`
   - `docker/proxy/Caddyfile.dev`, `docker/proxy/Caddyfile.prod`
   - `scripts/dev_bootstrap.sh`, `scripts/dev_teardown.sh`
   - `env/.env.example`

3. Identificar:
   - Qué pantallas de UI existen ya (si hay algo en `frontend/`).
   - Qué partes del infra están completas y cuáles son placeholders.

Nunca asumas que el frontend o la infra están terminados: **valida siempre el estado real del repo**.

---

## 2. Objetivos técnicos del Rol B

Tu trabajo como Rol B se centra en:

1. **Frontend (Next.js/React)**
   - Implementar:
     - Pantallas de registro e inicio de sesión.
     - Dashboard principal con métricas y gráficas.
     - Vista para crear nuevos escaneos.
     - Vista de listado de escaneos (jobs).
     - Vista de detalle de findings por job.
   - Consumir la API del backend de manera segura:
     - Manejo de tokens JWT (autenticación).
     - Manejo de errores y mensajes al usuario.

2. **Infraestructura (Docker / Caddy / scripts)**
   - Mantener y mejorar:
     - `docker-compose.dev.yml` (entorno de desarrollo).
     - `docker-compose.prod.yml` (entorno de producción).
     - Dockerfiles del backend y frontend.
     - Configuración del proxy Caddy (desarrollo y producción).
   - Facilitar el trabajo tanto:
     - En la misma red local.
     - Como en un entorno remoto (VM/EC2).

3. **DX (Developer Experience)**
   - Proveer scripts y documentación clara para:
     - Levantar el stack localmente.
     - Apagarlo sin dejar residuos.
     - Conectarse a servicios (DB, API) para debug.

---

## 3. Estructura sugerida del frontend

Una estructura posible en `frontend/` (ajústala a lo que ya exista):

```text
frontend/
├─ package.json
├─ next.config.js
├─ src/
│  ├─ pages/ o app/              # Dependiendo del router de Next.js
│  ├─ components/                # Componentes reutilizables
│  ├─ hooks/                     # Hooks para auth, data fetching, etc.
│  ├─ lib/                       # Funciones auxiliares (API client, etc.)
│  ├─ styles/                    # Estilos globales
│  └─ types/                     # Tipos TypeScript compartidos
```

Antes de crear carpetas nuevas, revisa qué convención ya se esté usando y **respétala**.

---

## 4. Flujo de autenticación en el frontend

### 4.1 Pantallas

- **Registro**:
  - Formulario con email y password.
  - Llama al endpoint de backend `/auth/register`.

- **Login**:
  - Formulario con email y password.
  - Llama al endpoint `/auth/login`.
  - Recibe un JWT si las credenciales son correctas.

### 4.2 Manejo del token

Dependiendo de la estrategia acordada (cookies HTTP-only, localStorage, etc.), debes:

- Guardar el token en un lugar apropiado.
- Incluirlo en las llamadas a la API (`Authorization: Bearer <token>`).
- Manejar expiración de sesión:
  - Redirigir a login cuando el backend devuelva 401/403 por token inválido o vencido.

### 4.3 Rutas protegidas

- Dashboard, creación de escaneos, vistas de findings, etc., deben estar protegidas.
- Usuarios no autenticados solo deberían ver:
  - Pantalla de login.
  - Pantalla de registro.
  - Eventualmente una landing pública, si se decide.

---

## 5. Dashboard de métricas y gráficas

### 5.1 Objetivo del dashboard

El dashboard debe ofrecer una **vista de alto nivel** del estado de seguridad para el usuario autenticado, mediante:

- Métricas numéricas (KPIs).
- Gráficas visuales (barras, pastel, líneas).
- Listados resumidos (top targets, últimos escaneos).

### 5.2 Datos que se esperan del backend

El frontend consumirá endpoints como:

- `/metrics/summary`
- `/metrics/by-severity`
- `/metrics/by-tool`
- `/metrics/timeline`

Cada uno devolverá datos **ya agregados**, que el frontend solo debe transformar en datasets para la librería de gráficas.

### 5.3 Recomendaciones de UI/UX

- Mostrar en un “hero” o “cards” principales:
  - Número total de escaneos.
  - Número total de findings.
  - Cantidad de findings críticos/altos.

- Gráficas sugeridas:
  - **Bar chart**: findings por severidad.
  - **Pie/donut**: distribución por severidad.
  - **Line chart**: evolución de findings o escaneos en el tiempo.
  - **Table**: top targets con más riesgos.

- Enfocarse en:
  - Ser visual y limpio.
  - Evitar sobrecargar de información cruda (logs, JSON).

---

## 6. Infraestructura: Docker, docker-compose y Caddy

### 6.1 Entorno de desarrollo (`docker-compose.dev.yml`)

Responsabilidades:

- Asegurar que con:

  ```bash
  ./scripts/dev_bootstrap.sh
  ```

  el stack completo se levante en la máquina del desarrollador.

- Servicios clave:

  - `db` (PostgreSQL).
  - `api` (backend FastAPI).
  - `frontend` (Next.js en modo dev).
  - `proxy` (Caddy usando `Caddyfile.dev`).

- Detalles:
  - Montar código fuente para hot reload (backend y frontend).
  - Exponer puertos adecuados:
    - `8080` (proxy).
    - Opcionalmente `3000` y `8000` para debug directo.

### 6.2 Entorno de producción (`docker-compose.prod.yml`)

Responsabilidades:

- Definir servicios para despliegue en VM/EC2:

  - `db` (Postgres).
  - `api` (backend sin `--reload`).
  - `frontend` (Next.js en modo producción).
  - `proxy` (Caddy con `Caddyfile.prod` y TLS).

- Consideraciones:
  - No usar hot reload.
  - No montar código desde el host (imágenes build).
  - Exponer únicamente puertos 80/443 del `proxy`.

---

## 7. Trabajo en red local vs acceso remoto

### 7.1 Misma red local

Escenarios típicos:

- **Cada desarrollador levanta su stack local**:
  - Todos ejecutan `docker-compose.dev.yml` en su propia máquina.
  - Se comunican solo vía Git y herramientas de colaboración.

- **Un desarrollador levanta el stack y otros solo acceden desde navegador**:
  - Uno levanta la app en su máquina.
  - Obtiene su IP en la LAN (ej. `192.168.x.x`).
  - Otros acceden a `http://IP_DEL_COMPA:8080`.

Al sugerir configuraciones, especifica para cuál de estos casos aplica la instrucción.

### 7.2 Acceso remoto (VM/EC2)

- El stack corre en una VM accesible por IP pública/dominio.
- `docker-compose.prod.yml` se ejecuta en la VM.
- Los desarrolladores:
  - Pueden conectarse por SSH.
  - Pueden acceder a la app vía dominio (ej. `https://auditor.midominio.com`).

Como agente:

- No asumas que siempre es local o siempre es remoto.
- Cuando el usuario pregunte, aclara explícitamente para qué entorno estás dando instrucciones.

---

## 8. Scripts y variables de entorno

### 8.1 Scripts (`scripts/`)

Revisa y mantén:

- `scripts/dev_bootstrap.sh`
  - Debe:
    - Cargar `env/.env.dev`.
    - Ejecutar `docker compose -f docker-compose.dev.yml build`.
    - Ejecutar `docker compose -f docker-compose.dev.yml up -d`.

- `scripts/dev_teardown.sh`
  - Debe:
    - Ejecutar `docker compose -f docker-compose.dev.yml down`.

Si propones modificar estos scripts:

- Explica claramente la razón.
- Mantén su uso simple (uno para levantar, uno para bajar).

### 8.2 Variables de entorno (`env/`)

- `env/.env.example` debe contener todas las variables importantes, documentadas.
- `env/.env.dev` y `env/.env.prod` no deben subirse al repo.

Como Rol B, debes:

- Alinear variables del frontend:
  - `NEXT_PUBLIC_API_BASE_URL`
  - `FRONTEND_PORT`
- Alinear variables de infraestructura que afectan docker-compose:
  - Puertos del proxy (`DEV_PROXY_HTTP_PORT`).
  - Credenciales de la base de datos (compartidas con el backend).

---

## 9. Colaboración con Rol A

Como Rol B, debes coordinar con Rol A para:

- Acordar formatos de respuesta de la API (JSON).
- Conocer qué endpoints están disponibles y qué parámetros aceptan.
- Proponer cambios cuando:
  - El frontend necesite datos agregados adicionales para el dashboard.
  - Los contratos actuales no sean suficientes o sean incómodos.

Siempre documenta los contratos en algún lugar (por ejemplo, en el propio código o en un archivo de referencia).

---

## 10. Trabajo de un agente de IA en Rol B

Si eres un agente de IA actuando como Rol B:

1. Revisa el contenido actual de `frontend/`:
   - No asumas que está vacío o completo.
2. Revisa los `docker-compose` y Caddyfiles:
   - Entiende cómo está montado hoy el stack.
3. Si el frontend está vacío:
   - Propón una estructura inicial alineada a este documento.
4. Si el frontend ya existe:
   - Añade pantallas, componentes y hooks de manera incremental.
5. Al trabajar con infra:
   - Evita cambios radicales sin justificarlos.
   - Mantén el foco en simplificar la vida del equipo de desarrollo.

---

Con estas pautas, Rol B (humano o agente IA) puede trabajar de forma alineada con el contexto general del proyecto y con los objetivos de autenticación, seguridad y visualización de métricas.
