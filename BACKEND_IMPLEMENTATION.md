# Backend Implementation Summary

Este documento resume la implementación completa del backend del proyecto Auditor Web de Seguridad.

## ✅ Componentes Implementados

### 1. Modelos de Base de Datos
- ✅ **User**: Usuarios con autenticación (email, password_hash, role)
- ✅ **Target**: URLs objetivo para escaneo
- ✅ **Job**: Ejecuciones de escaneo de seguridad
- ✅ **Finding**: Hallazgos de seguridad normalizados

### 2. Schemas Pydantic
- ✅ **User schemas**: UserCreate, UserLogin, UserResponse, UserUpdate
- ✅ **Token schemas**: Token, TokenData
- ✅ **Target schemas**: TargetCreate, TargetResponse, TargetUpdate
- ✅ **Job schemas**: JobCreate, JobResponse, JobUpdate
- ✅ **Finding schemas**: FindingResponse
- ✅ **Metrics schemas**: MetricsSummary, MetricsBySeverityResponse, MetricsByToolResponse, MetricsTimelineResponse, MetricsTopTargetsResponse

### 3. Seguridad
- ✅ **JWT**: Creación, verificación y decodificación de tokens
- ✅ **Hashing**: Hash y verificación de contraseñas con bcrypt
- ✅ **Dependencies**: get_current_user y get_current_active_user para proteger endpoints

### 4. Routers (Endpoints API)

#### Autenticación (`/auth`)
- ✅ `POST /auth/register` - Registrar nuevo usuario
- ✅ `POST /auth/login` - Iniciar sesión y obtener token JWT
- ✅ `GET /auth/me` - Obtener usuario actual

#### Targets (`/targets`)
- ✅ `POST /targets` - Crear nuevo target
- ✅ `GET /targets` - Listar targets del usuario
- ✅ `GET /targets/{id}` - Obtener target específico
- ✅ `DELETE /targets/{id}` - Eliminar target

#### Jobs (`/jobs`)
- ✅ `POST /jobs` - Crear nuevo job de escaneo
- ✅ `GET /jobs` - Listar jobs del usuario (con filtro opcional por status)
- ✅ `GET /jobs/{id}` - Obtener job específico
- ✅ `GET /jobs/{id}/findings` - Listar findings de un job (con filtro opcional por severidad)

#### Métricas (`/metrics`)
- ✅ `GET /metrics/summary` - Resumen general de métricas
- ✅ `GET /metrics/by-severity` - Métricas agrupadas por severidad
- ✅ `GET /metrics/by-tool` - Métricas agrupadas por herramienta
- ✅ `GET /metrics/timeline` - Timeline de métricas (jobs y findings por día)
- ✅ `GET /metrics/top-targets` - Top targets con más findings

### 5. Servicios de Escaneo

#### Scanner Service
- ✅ `ScannerService`: Servicio principal para ejecutar escaneos
- ✅ Ejecución asíncrona en background tasks
- ✅ Manejo de estados de jobs (queued → running → done/failed)
- ✅ Integración con Docker para ejecutar herramientas

#### Scanners Implementados
- ✅ **ZAP Scanner**: Integración con OWASP ZAP baseline
- ✅ **Nuclei Scanner**: Integración con Nuclei
- ✅ **SSLyze Scanner**: Integración con SSLyze

### 6. Configuración
- ✅ `config.py`: Configuración centralizada desde variables de entorno
- ✅ Soporte para todas las variables necesarias (DB, JWT, herramientas, etc.)

### 7. Base de Datos
- ✅ Configuración de SQLAlchemy
- ✅ Migración inicial con Alembic (001_initial_schema.py)
- ✅ Relaciones entre modelos configuradas

## 📋 Variables de Entorno Requeridas

Ver `env/.env.example` para la lista completa. Las principales son:

- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Clave secreta para firmar tokens JWT
- `ALLOWED_SCAN_DOMAINS`: Dominios permitidos para escaneo
- `ZAP_BASELINE_TIMEOUT`, `NUCLEI_TIMEOUT`, `SSLYZE_TIMEOUT`: Timeouts por herramienta

## 🧪 Cómo Probar el Backend

### 1. Levantar el Stack

```bash
# Crear archivo de entorno (si no existe)
cp env/.env.example env/.env.dev
# Editar env/.env.dev con valores apropiados

# Levantar servicios
docker-compose -f docker-compose.dev.yml up -d

# Verificar que los servicios estén corriendo
docker-compose -f docker-compose.dev.yml ps
```

### 2. Ejecutar Migraciones

```bash
# Entrar al contenedor de la API
docker exec -it auditor_api bash

# Ejecutar migraciones
cd /app/backend
alembic upgrade head
```

### 3. Probar Endpoints

#### Health Check
```bash
curl http://localhost:8000/health
curl http://localhost:8000/health/db
```

#### Registrar Usuario
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

Guardar el `access_token` de la respuesta.

#### Obtener Usuario Actual
```bash
TOKEN="tu_token_aqui"
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

#### Crear Target
```bash
curl -X POST http://localhost:8000/targets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'
```

#### Crear Job de Escaneo
```bash
TARGET_ID="id_del_target_creado"
curl -X POST http://localhost:8000/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_id": "'$TARGET_ID'",
    "tools_used": ["ZAP", "Nuclei"]
  }'
```

#### Listar Jobs
```bash
curl http://localhost:8000/jobs \
  -H "Authorization: Bearer $TOKEN"
```

#### Obtener Métricas
```bash
curl http://localhost:8000/metrics/summary \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Documentación Interactiva

FastAPI proporciona documentación automática:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔒 Seguridad Implementada

1. **Autenticación JWT**: Todos los endpoints protegidos requieren token válido
2. **Hash de Contraseñas**: Bcrypt con salt automático
3. **Validación de URLs**: Whitelist de dominios permitidos
4. **Aislamiento de Escaneos**: Ejecución en contenedores Docker aislados
5. **Control de Acceso**: Usuarios solo ven sus propios datos

## 📝 Notas Importantes

1. **Docker Socket**: El contenedor `api` necesita acceso a `/var/run/docker.sock` para ejecutar scanners
2. **Imágenes Docker**: Las herramientas (ZAP, Nuclei, SSLyze) se descargarán automáticamente la primera vez
3. **Timeouts**: Los escaneos tienen timeouts configurados para evitar ejecuciones infinitas
4. **Background Tasks**: Los escaneos se ejecutan en background, el job se actualiza cuando termina

## 🚀 Próximos Pasos

1. **Frontend**: Implementar interfaz de usuario (Rol B)
2. **Mejoras de Parsers**: Mejorar el parsing de resultados de herramientas
3. **Testing**: Agregar tests unitarios y de integración
4. **Optimización**: Optimizar queries de métricas con índices
5. **Reportes**: Implementar generación de reportes PDF/JSON

## 🐛 Troubleshooting

### Error: "No se pudo conectar a Docker"
- Verificar que el contenedor tiene acceso a `/var/run/docker.sock`
- Verificar permisos del socket de Docker

### Error: "Token inválido o expirado"
- Verificar que `JWT_SECRET` está configurado correctamente
- Verificar que el token no ha expirado (default: 30 minutos)

### Error: "URL no permitida para escaneo"
- Verificar que el dominio está en `ALLOWED_SCAN_DOMAINS`
- En desarrollo, usar `*` para permitir cualquier dominio

### Error: "Database connection failed"
- Verificar que PostgreSQL está corriendo
- Verificar `DATABASE_URL` en variables de entorno
- Verificar que las migraciones se ejecutaron

## 📚 Referencias

- Documentación del proyecto: `docs/ROLE_A_BACKEND_SECURITY.md`
- Arquitectura: `docs/ARCHITECTURE.md`
- Roadmap: `docs/ROADMAP.md`

