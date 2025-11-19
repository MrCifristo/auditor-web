# 📋 Fase 1 - Estado Actual y Guía de Continuidad

**Fecha de creación:** 2024-11-19  
**Estado:** Estructura base completada, autenticación pendiente

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

### 3. Estructura de Seguridad (Placeholders)

Archivos creados con TODOs y documentación:

- **`app/security/hashing.py`**: Placeholder para hash/verificación de contraseñas
- **`app/security/jwt.py`**: Placeholder para creación/verificación de tokens JWT
- **`app/security/dependencies.py`**: Placeholder para dependencias de FastAPI (`get_current_user`)

**Estado:** Estructura lista, implementación pendiente

**Ubicación:** `backend/app/security/`

### 4. Estructura de Schemas (Placeholders)

Archivos creados con TODOs y documentación:

- **`app/schemas/user.py`**: Placeholder para schemas de usuario (UserCreate, UserLogin, UserResponse)
- **`app/schemas/token.py`**: Placeholder para schemas de token (Token, TokenData)

**Estado:** Estructura lista, implementación pendiente

**Ubicación:** `backend/app/schemas/`

### 5. Estructura de Routers (Placeholders)

Archivos creados con TODOs y documentación:

- **`app/routers/auth.py`**: Placeholder para endpoints de autenticación:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`

**Estado:** Estructura lista, implementación pendiente

**Ubicación:** `backend/app/routers/`

### 6. Mejoras en main.py

- Endpoint `/health/db` agregado para verificar conexión a BD
- Estructura preparada para integrar router de auth (comentado)
- Imports necesarios agregados

**Ubicación:** `backend/app/main.py`

---

## ❌ Lo que falta implementar (Autenticación)

### Prioridad 1: Módulo de Hashing

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

### Prioridad 6: Integración en main.py

**Archivo:** `backend/app/main.py`

**Descomentar y ajustar:**
```python
from app.routers import auth
app.include_router(auth.router)
```

---

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
│   │   ├── __init__.py            ✅ Vacío
│   │   ├── user.py                ⚠️  Placeholder con TODOs
│   │   └── token.py               ⚠️  Placeholder con TODOs
│   ├── security/
│   │   ├── __init__.py            ✅ Vacío
│   │   ├── hashing.py             ⚠️  Placeholder con TODOs
│   │   ├── jwt.py                 ⚠️  Placeholder con TODOs
│   │   └── dependencies.py       ⚠️  Placeholder con TODOs
│   ├── routers/
│   │   ├── __init__.py            ✅ Vacío
│   │   └── auth.py                ⚠️  Placeholder con TODOs
│   ├── config.py                  ✅ Configuración completa
│   ├── database.py                ✅ SQLAlchemy configurado
│   └── main.py                    ✅ Base + /health/db
└── requirements.txt               ✅ Todas las dependencias

✅ = Completado
⚠️  = Placeholder con TODOs (pendiente implementar)
```

---

## 🚀 Cómo continuar con la implementación

### Paso 1: Ejecutar migración inicial

Antes de implementar autenticación, asegúrate de que las tablas estén creadas:

```bash
# Desde el contenedor del API
docker compose exec api alembic upgrade head

# O desde el directorio backend (si tienes alembic instalado localmente)
cd backend
alembic upgrade head
```

### Paso 2: Orden de implementación recomendado

1. **Implementar `security/hashing.py`** (más simple, no depende de nada)
2. **Implementar `security/jwt.py`** (depende de settings, pero no de otros módulos)
3. **Implementar `schemas/user.py` y `schemas/token.py`** (depende de models)
4. **Implementar `security/dependencies.py`** (depende de jwt y database)
5. **Implementar `routers/auth.py`** (depende de todo lo anterior)
6. **Integrar en `main.py`** (descomentar include_router)

### Paso 3: Probar cada componente

Después de implementar cada módulo, probar:

```bash
# Probar hashing
python -c "from app.security.hashing import hash_password, verify_password; h=hash_password('test'); print(verify_password('test', h))"

# Probar JWT
python -c "from app.security.jwt import create_access_token; print(create_access_token({'sub': 'test-user-id'}))"

# Probar endpoints (después de implementar router)
curl -X POST http://localhost:8000/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test1234"}'
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

## 🧪 Testing Recomendado

Una vez implementada la autenticación, probar:

1. **Registro de usuario:**
   - Email válido
   - Email duplicado (debe fallar)
   - Password muy corto (debe fallar)

2. **Login:**
   - Credenciales válidas (debe retornar token)
   - Credenciales inválidas (debe fallar)

3. **Endpoint protegido:**
   - Sin token (debe fallar con 401)
   - Token inválido (debe fallar con 401)
   - Token válido (debe retornar datos)

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

**Última actualización:** 2024-11-19  
**Próximo paso:** Implementar módulo de hashing (`backend/app/security/hashing.py`)

