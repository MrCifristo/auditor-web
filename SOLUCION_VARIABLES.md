# 🔧 Solución: Variables de Entorno y Docker Compose

## Problema Identificado

Cuando ejecutas `docker compose` directamente desde la terminal (sin usar el script), las variables de entorno aparecen como vacías porque:

1. **El script `dev_bootstrap.sh` carga las variables** usando `set -a` y `source`, pero esto solo afecta al proceso del script
2. **Tu shell actual no tiene las variables cargadas** cuando ejecutas comandos directamente
3. **Docker Compose necesita las variables** para expandir `${VARIABLE}` en el archivo `docker-compose.dev.yml`

## Soluciones

### Opción 1: Usar el script wrapper (Recomendado)

He creado un script wrapper que carga automáticamente las variables:

```bash
# En lugar de:
docker compose -f docker-compose.dev.yml ps

# Usa:
./scripts/docker-compose-wrapper.sh ps

# Funciona con cualquier comando:
./scripts/docker-compose-wrapper.sh logs -f api
./scripts/docker-compose-wrapper.sh exec api bash
./scripts/docker-compose-wrapper.sh restart frontend
```

### Opción 2: Usar --env-file siempre

Cuando ejecutes comandos de docker-compose directamente, siempre incluye `--env-file`:

```bash
docker compose -f docker-compose.dev.yml --env-file env/.env.dev ps
docker compose -f docker-compose.dev.yml --env-file env/.env.dev logs -f
docker compose -f docker-compose.dev.yml --env-file env/.env.dev exec api bash
```

### Opción 3: Cargar variables manualmente en tu shell

Si quieres trabajar en tu shell actual con las variables cargadas:

```bash
# Cargar variables
set -a
source env/.env.dev
set +a

# Ahora puedes ejecutar docker-compose normalmente
docker compose -f docker-compose.dev.yml ps
```

**Nota:** Esto solo funciona en la sesión actual del shell. Si abres una nueva terminal, necesitas cargar las variables de nuevo.

## Estado Actual de los Contenedores

### ✅ Funcionando Correctamente:
- **auditor_db**: Base de datos PostgreSQL (healthy)
- **auditor_api**: Backend FastAPI (healthy)
- **auditor_proxy**: Caddy reverse proxy (running)

### 🔧 Corregido:
- **auditor_frontend**: El problema era que el volumen montado sobrescribía `node_modules`
  - **Solución**: Agregados volúmenes anónimos para preservar `node_modules` y `.next`
  - **Estado**: Debería estar funcionando ahora

## Verificación

Para verificar que todo funciona:

```bash
# Ver estado (usando el wrapper)
./scripts/docker-compose-wrapper.sh ps

# Ver logs del frontend
./scripts/docker-compose-wrapper.sh logs frontend

# Verificar que el API responde
curl http://localhost:8000/health

# Verificar que el frontend responde
curl http://localhost:8080
```

## Resumen de Cambios

1. ✅ **docker-compose.dev.yml**:
   - Eliminado `version: "3.9"` (obsoleto)
   - Agregados volúmenes anónimos para preservar `node_modules` y `.next` en frontend

2. ✅ **scripts/docker-compose-wrapper.sh**:
   - Nuevo script que carga automáticamente las variables
   - Facilita ejecutar comandos de docker-compose sin preocuparse por las variables

## Recomendación

**Usa siempre el script wrapper** para comandos de docker-compose:

```bash
# ✅ Correcto
./scripts/docker-compose-wrapper.sh ps
./scripts/docker-compose-wrapper.sh logs -f

# ❌ Incorrecto (variables vacías)
docker compose -f docker-compose.dev.yml ps
```

O si prefieres usar docker-compose directamente, **siempre incluye `--env-file`**:

```bash
# ✅ Correcto
docker compose -f docker-compose.dev.yml --env-file env/.env.dev ps

# ❌ Incorrecto
docker compose -f docker-compose.dev.yml ps
```

---

**Fecha:** 2024

