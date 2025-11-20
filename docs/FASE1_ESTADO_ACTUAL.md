# 📋 Fase 1 - Estado Actual y Guía de Continuidad

**Fecha de creación:** 2024-11-19  
**Última actualización:** 2025-11-20  
**Estado:** Fases 0, 1 y 2 completadas (infraestructura + autenticación + targets/jobs)

---

## ✅ Lo que se ha completado

### 1. Modelos de Base de Datos (SQLAlchemy)

Todos los modelos están implementados y listos:

- **`app/models/user.py`**: Modelo `User` con campos:
  - `id` (UUID)
  - `email` (único, indexado)
  - `password_hash` (para almacenar hash de contraseña)
  - `role` (enum: USER, ADMIN)
  - `created_at`, `updated_at` (timestamps automáticos)
  - Relaciones: `targets`, `jobs`

- **`app/models/target.py`**: Modelo `Target` con campos:
  - `id` (UUID)
  - `user_id` (FK a users)
  - `url` (hasta 2048 caracteres)
  - `created_at`
  - Relaciones: `user`, `jobs`

- **`app/models/job.py`**: Modelo `Job` con campos:
  - `id` (UUID)
  - `user_id`, `target_id` (FKs)
  - `status` (enum: QUEUED, RUNNING, DONE, FAILED)
  - `tools_used` (JSON array)
  - `created_at`, `started_at`, `finished_at`
  - Relaciones: `user`, `target`, `findings`

- **`app/models/finding.py`**: Modelo `Finding` con campos:
  - `id` (UUID)
  - `job_id` (FK a jobs)
  - `severity` (enum: INFO, LOW, MEDIUM, HIGH, CRITICAL)
  - `title`, `description`, `evidence`, `recommendation`
  - `tool` (ZAP, Nuclei, SSLyze, etc.)
  - `created_at`
  - Relación: `job`

**Ubicación:** `backend/app/models/`

### 2. Configuración de Alembic

Alembic está completamente configurado:

- **`alembic.ini`**: Configuración principal
- **`alembic/env.py`**: Configurado para usar `settings.database_url` y detectar modelos
- **`alembic/script.py.mako`**: Template para migraciones
- **`alembic/versions/001_initial_schema.py`**: Migración inicial que crea todas las tablas

**Comandos disponibles:**
```bash
# Desde el contenedor del API
docker compose exec api alembic upgrade head
docker compose exec api alembic revision --autogenerate -m "descripción"
docker compose exec api alembic downgrade -1
```

**Ubicación:** `backend/alembic/`

### 3. Seguridad y autenticación completas

- **`app/security/hashing.py`**  
  - `hash_password`: usa Passlib + bcrypt (valida longitud ≤72 bytes).  
  - `verify_password`: compara contraseña vs hash.

- **`app/security/jwt.py`**  
  - `create_access_token`, `verify_token`, `get_user_from_token`.  
  - Firmas con `settings.jwt_secret`, expiración configurable.

- **`app/security/dependencies.py`**  
  - `get_current_user`: valida token, carga usuario, maneja 401.  
  - `get_current_active_user`: placeholder para checks adicionales.

- **`app/schemas/user.py` / `token.py`**  
  - `UserCreate` (con política de contraseñas estricta), `UserLogin`, `UserResponse`.  
  - `Token`, `TokenData`.

- **`app/routers/auth.py`**  
  - `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.  
  - Maneja errores de hash, email duplicado y credenciales inválidas.

- **`app/main.py`**  
  - Incluye router de auth y health checks (`/health`, `/health/db`).

### 4. Targets y Jobs (Fase 2)

- **Schemas**:
  - `app/schemas/target.py`: `TargetCreate`, `TargetResponse`.
  - `app/schemas/job.py`: `JobCreate`, `JobResponse` (enum `JobStatus`).
  - `app/schemas/finding.py`: `FindingResponse`.

- **Validadores de URL** (`app/utils/url_validators.py`):
  - Normaliza URLs y bloquea `localhost`, IPs privadas/reservadas.
  - Verifica whitelist `settings.allowed_scan_domains`.

- **Routers**:
  - `app/routers/targets.py`: CRUD protegido (`POST/GET/GET/{id}/DELETE`).  
    - Normaliza URL antes de guardar.  
    - Solo permite targets del usuario autenticado.
  - `app/routers/jobs.py`: `POST /jobs`, `GET /jobs`, `GET /jobs/{id}`, `GET /jobs/{id}/findings`.
    - Valida que el target sea del usuario y que las herramientas estén en la lista (`zap`, `nuclei`, `sslyze`).

- **`app/main.py`** ahora registra `auth`, `targets` y `jobs`.

---

## ❌ Lo que falta implementar (Autenticación)

### Resumen Fases Completadas

| Fase | Estado | Detalles |
|------|--------|----------|
| Fase 0 | ✅ | Infraestructura Docker, scripts `dev_bootstrap.sh` (con migraciones automáticas), variables de entorno documentadas. |
| Fase 1 | ✅ | Autenticación completa (hash, JWT, `/auth/register-login-me`), frontend básico de registro/login/dashboard, pruebas documentadas. |
| Fase 2 | ✅ | CRUD de Targets y Jobs, validaciones de URL, endpoints `/targets` y `/jobs`, documentación de pruebas. |
| Fase 3 | ⏳ | (próximo) Integración con herramientas de seguridad (ZAP, Nuclei, SSLyze). |

**Archivo:** `backend/app/security/hashing.py`

**Implementar:**
1. Función `hash_password(password: str) -> str`
   - Usar `passlib.hash.bcrypt`
   - Retornar hash de la contraseña

2. Función `verify_password(plain_password: str, hashed_password: str) -> bool`
   - Verificar contraseña contra hash
   - Retornar True/False

**Referencias:**
- https://passlib.readthedocs.io/en/stable/lib/passlib.hash.bcrypt.html
- Ejemplo en el archivo: `backend/app/security/hashing.py`

### Prioridad 2: Módulo de JWT

**Archivo:** `backend/app/security/jwt.py`

**Implementar:**
1. Función `create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str`
   - Usar `python-jose` (jwt.encode)
   - Incluir expiración desde `settings.jwt_access_token_expire_minutes`
   - Retornar token codificado

2. Función `verify_token(token: str) -> Optional[Dict[str, Any]]`
   - Verificar y decodificar token
   - Manejar excepciones JWTError
   - Retornar payload o None

3. Función `get_user_from_token(token: str) -> Optional[str]`
   - Extraer `sub` (user_id) del token
   - Retornar user_id o None

**Referencias:**
- https://python-jose.readthedocs.io/
- Ejemplo en el archivo: `backend/app/security/jwt.py`

### Prioridad 3: Dependencias de Seguridad

**Archivo:** `backend/app/security/dependencies.py`

**Implementar:**
1. Dependencia `get_current_user(credentials: HTTPAuthorizationCredentials, db: Session) -> User`
   - Extraer token del header Authorization
   - Verificar token usando `verify_token`
   - Obtener usuario de BD usando `user_id` del token
   - Lanzar HTTPException si token inválido o usuario no existe

2. Dependencia `get_current_active_user(current_user: User) -> User` (opcional)
   - Verificar que el usuario esté activo
   - Lanzar HTTPException si no está activo

**Referencias:**
- https://fastapi.tiangolo.com/tutorial/dependencies/
- Ejemplo en el archivo: `backend/app/security/dependencies.py`

### Prioridad 4: Schemas Pydantic

**Archivo:** `backend/app/schemas/user.py`

**Implementar:**
1. `UserCreate`: email (EmailStr), password (min 8 chars), role (opcional)
2. `UserLogin`: email, password
3. `UserResponse`: id, email, role, created_at, updated_at (sin password_hash)
4. `UserUpdate` (opcional): campos opcionales para actualizar

**Archivo:** `backend/app/schemas/token.py`

**Implementar:**
1. `Token`: access_token, token_type="bearer"

**Referencias:**
- https://docs.pydantic.dev/
- Ejemplo en los archivos: `backend/app/schemas/user.py` y `backend/app/schemas/token.py`

### Prioridad 5: Router de Autenticación

**Archivo:** `backend/app/routers/auth.py`

**Implementar:**
1. `POST /auth/register`:
   - Recibir `UserCreate`
   - Validar que email no exista
   - Hashear password
   - Crear usuario en BD
   - Retornar `UserResponse`

2. `POST /auth/login`:
   - Recibir `UserLogin`
   - Buscar usuario por email
   - Verificar password
   - Generar token JWT
   - Retornar `Token`

3. `GET /auth/me`:
   - Usar `get_current_user` como dependencia
   - Retornar `UserResponse` del usuario actual

**Referencias:**
- Ejemplo en el archivo: `backend/app/routers/auth.py`
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/

## 📁 Estructura de Archivos Actual

```
backend/
├── alembic/
│   ├── versions/
│   │   ├── 001_initial_schema.py  ✅ Migración inicial
│   │   └── .gitkeep
│   ├── env.py                     ✅ Configurado
│   └── script.py.mako             ✅ Template
├── alembic.ini                    ✅ Configurado
├── app/
│   ├── models/
│   │   ├── __init__.py            ✅ Exporta todos los modelos
│   │   ├── user.py                ✅ Modelo User completo
│   │   ├── target.py              ✅ Modelo Target completo
│   │   ├── job.py                 ✅ Modelo Job completo
│   │   └── finding.py             ✅ Modelo Finding completo
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── token.py
│   │   ├── target.py
│   │   ├── job.py
│   │   └── finding.py
│   ├── security/
│   │   ├── __init__.py
│   │   ├── hashing.py
│   │   ├── jwt.py
│   │   └── dependencies.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── targets.py
│   │   └── jobs.py
│   ├── config.py                  ✅ Configuración completa
│   ├── database.py                ✅ SQLAlchemy configurado
│   └── main.py                    ✅ `/health`, `/health/db`, routers auth/targets/jobs
└── requirements.txt               ✅ Todas las dependencias

✅ = Completado
⚠️  = Placeholder con TODOs (pendiente implementar)
```

---

## 🚀 Próximos pasos (Fase 3 y Frontend)

1. **Integración de herramientas** (Fase 3):
   - `services/scanner_service.py`: ejecutar contenedores Docker (ZAP/Nuclei/SSLyze) con timeouts.
   - `services/scanners/*.py`: parsear outputs y guardar findings normalizados.
   - Actualizar `jobs.status` a `running/done/failed`, guardar logs/resultados.

2. **Frontend Targets/Jobs**:
   - Diseñar pantallas para crear/listar targets y jobs (con filtros y estado).
   - Consumir los nuevos endpoints (`/targets`, `/jobs`).
   - Mostrar hallazgos por job (aunque inicialmente estén vacíos).

3. **Documentación**:
   - Mantener este doc actualizado (Fase 2 completada).
   - Crear guías de prueba para endpoints de targets/jobs (curl + UI).

Antes de implementar autenticación, asegúrate de que las tablas estén creadas:

```bash
# Desde el contenedor del API
docker compose exec api alembic upgrade head

# O desde el directorio backend (si tienes alembic instalado localmente)
cd backend
alembic upgrade head
```

### Recomendaciones para pruebas manuales

```bash
# Obtener token
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"milton@test.com","password":"Milton1234!"}' | jq -r '.access_token')

# Crear target
curl -X POST http://localhost:8000/targets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://demo-target.com"}'

# Listar targets
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/targets

# Crear job
curl -X POST http://localhost:8000/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_id":"<TARGET_ID>","tools":["zap","nuclei"]}'

# Listar jobs
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/jobs

# Hallazgos de un job
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/jobs/<JOB_ID>/findings
```

---

## 📚 Referencias y Documentación

### Documentación del Proyecto
- `docs/ROLE_A_BACKEND_SECURITY.md`: Guía completa para Rol A
- `docs/ARCHITECTURE.md`: Arquitectura técnica del sistema
- `docs/PROJECT_CONTEXT.md`: Contexto y objetivos del proyecto

### Documentación Externa
- **FastAPI**: https://fastapi.tiangolo.com/
- **SQLAlchemy**: https://docs.sqlalchemy.org/
- **Alembic**: https://alembic.sqlalchemy.org/
- **Pydantic**: https://docs.pydantic.dev/
- **python-jose**: https://python-jose.readthedocs.io/
- **passlib**: https://passlib.readthedocs.io/

### Archivos de Referencia en el Proyecto
- Cada archivo placeholder contiene ejemplos y referencias
- Los modelos están completamente implementados como referencia
- `app/config.py` muestra cómo acceder a settings

---

## ⚠️ Notas Importantes

1. **Variables de Entorno**: Asegúrate de que `JWT_SECRET` esté configurado en `.env.dev`
2. **Migraciones**: Siempre crear migraciones con `alembic revision --autogenerate` después de cambios en modelos
3. **Seguridad**: Nunca almacenar contraseñas en texto plano, siempre usar hash
4. **Tokens**: Los tokens JWT deben tener expiración razonable (30 minutos por defecto)
5. **Validación**: Usar Pydantic para validar todos los inputs
6. **Errores**: Usar HTTPException de FastAPI con códigos de estado apropiados

---

## 📝 Checklist para Implementación

- [ ] Implementar `security/hashing.py`
- [ ] Implementar `security/jwt.py`
- [ ] Implementar `schemas/user.py`
- [ ] Implementar `schemas/token.py`
- [ ] Implementar `security/dependencies.py`
- [ ] Implementar `routers/auth.py`
- [ ] Integrar router en `main.py`
- [ ] Ejecutar migración inicial (`alembic upgrade head`)
- [ ] Probar registro de usuario
- [ ] Probar login
- [ ] Probar endpoint protegido (`/auth/me`)

---

## 🧪 Guía de pruebas (actualizado)

### 1. Ejecutar migraciones

```bash
docker compose exec api alembic upgrade head
```

### 2. Registrar usuario

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo12345","role":"user"}'
```

### 3. Iniciar sesión

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo12345"}'
```

La respuesta incluirá `access_token`. Guárdalo en una variable:

```bash
TOKEN=$(curl ... | jq -r '.access_token')
```

### 4. Obtener usuario actual

```bash
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Verificar en la base de datos

```bash
docker compose exec db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT id,email,role FROM users;"
```

> Nota: el `password_hash` está almacenado con bcrypt (nunca texto plano).

### 6. Probar desde el frontend (Next.js)

1. Levanta todo con `./scripts/dev_bootstrap.sh` (reconstruye, levanta contenedores, corre migraciones).
2. Accede a `http://localhost:8080` (proxy) o `http://localhost:3000` (Next.js directo).
3. Flujo visual:
   - Landing con CTA “Iniciar sesión / Crear cuenta”.
   - `/register`: formulario con validaciones (contraseña ≥8 chars, mayúsc/minúsc/número/símbolo).
   - `/login`: guarda token en `localStorage` y redirige a `/dashboard`.
   - `/dashboard`: muestra datos del usuario y botón “Cerrar sesión”.
4. Próximas pantallas (en desarrollo): administración de targets/jobs desde la UI.

### 7. Conectarse vía pgAdmin / DBeaver

Usa los valores de `env/.env.dev`:
```
Host: localhost
Puerto: 5432
Usuario: POSTGRES_USER
Contraseña: POSTGRES_PASSWORD
Base de datos: POSTGRES_DB
```

En DBeaver/pgAdmin crea una conexión PostgreSQL con esos datos (SSL desactivado para entorno local) y podrás consultar las tablas `users`, `targets`, `jobs`, `findings`.

---

**Próximo paso:** Fase 3 (integración de herramientas de escaneo) + frontend de Targets/Jobs.

