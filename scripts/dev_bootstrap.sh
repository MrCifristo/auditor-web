#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🚀 Bootstrap del entorno de desarrollo - Auditor Web"
echo "=================================================="

# Verificar que Docker está instalado y corriendo
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado. Por favor instálalo primero."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Error: Docker no está corriendo. Por favor inicia Docker Desktop o el daemon de Docker."
    exit 1
fi

echo "✅ Docker está instalado y corriendo"

# Verificar que docker-compose está disponible
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: docker-compose no está instalado."
    exit 1
fi

echo "✅ docker-compose está disponible"

# Verificar que existe el archivo de entorno
ENV_FILE="$ROOT_DIR/env/.env.dev"
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Advertencia: No se encontró $ENV_FILE"
    echo "📝 Creando archivo de entorno desde .env.example..."
    
    if [ -f "$ROOT_DIR/env/.env.example" ]; then
        cp "$ROOT_DIR/env/.env.example" "$ENV_FILE"
        echo "✅ Archivo .env.dev creado. Por favor edítalo con tus valores."
        echo "   IMPORTANTE: Cambia las contraseñas y secretos antes de continuar."
        read -p "¿Deseas continuar de todas formas? (s/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            echo "❌ Abortado. Edita $ENV_FILE y vuelve a ejecutar este script."
            exit 1
        fi
    else
        echo "❌ Error: No se encontró env/.env.example"
        echo "   Por favor crea env/.env.dev manualmente con las variables necesarias."
        exit 1
    fi
else
    echo "✅ Archivo de entorno encontrado: $ENV_FILE"
fi

# Verificar estructura de carpetas
echo ""
echo "📁 Verificando estructura de carpetas..."

REQUIRED_DIRS=("backend" "frontend" "db/init" "docker/api" "docker/frontend" "docker/proxy")
MISSING_DIRS=()

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$ROOT_DIR/$dir" ]; then
        MISSING_DIRS+=("$dir")
    fi
done

if [ ${#MISSING_DIRS[@]} -gt 0 ]; then
    echo "⚠️  Advertencia: Faltan las siguientes carpetas:"
    for dir in "${MISSING_DIRS[@]}"; do
        echo "   - $dir"
    done
    echo "   Algunas pueden crearse automáticamente durante el build."
fi

# Cargar variables de entorno al shell
echo ""
echo "📝 Cargando variables de entorno..."
set -a  # Automáticamente exportar todas las variables
source "$ENV_FILE"
set +a  # Desactivar auto-export

# Construir imágenes
echo ""
echo "🔨 Construyendo imágenes Docker..."
if docker compose version &> /dev/null; then
    docker compose -f docker-compose.dev.yml --env-file "$ENV_FILE" build
else
    docker-compose -f docker-compose.dev.yml --env-file "$ENV_FILE" build
fi

if [ $? -ne 0 ]; then
    echo "❌ Error al construir las imágenes"
    exit 1
fi

echo "✅ Imágenes construidas correctamente"

# Levantar servicios
echo ""
echo "🚀 Levantando servicios..."
if docker compose version &> /dev/null; then
    docker compose -f docker-compose.dev.yml --env-file "$ENV_FILE" up -d
else
    docker-compose -f docker-compose.dev.yml --env-file "$ENV_FILE" up -d
fi

if [ $? -ne 0 ]; then
    echo "❌ Error al levantar los servicios"
    exit 1
fi

echo "✅ Servicios levantados"

# Esperar a que los servicios estén saludables
echo ""
echo "⏳ Esperando a que los servicios estén listos..."
sleep 5

# Verificar estado de los servicios
echo ""
echo "📊 Estado de los servicios:"
if docker compose version &> /dev/null; then
    docker compose -f docker-compose.dev.yml --env-file "$ENV_FILE" ps
else
    docker-compose -f docker-compose.dev.yml --env-file "$ENV_FILE" ps
fi

# Ejecutar migraciones de base de datos
echo ""
echo "📦 Ejecutando migraciones de base de datos (alembic upgrade head)..."
MIGRATION_COMMAND='cd /app/backend && ALEMBIC_CONFIG=/app/backend/alembic.ini alembic upgrade head'
if docker compose version &> /dev/null; then
    if ! docker compose -f docker-compose.dev.yml --env-file "$ENV_FILE" exec api bash -lc "$MIGRATION_COMMAND"; then
        echo "❌ Error al ejecutar las migraciones de base de datos"
        exit 1
    fi
else
    if ! docker-compose -f docker-compose.dev.yml --env-file "$ENV_FILE" exec api bash -lc "$MIGRATION_COMMAND"; then
        echo "❌ Error al ejecutar las migraciones de base de datos"
        exit 1
    fi
fi
echo "✅ Migraciones ejecutadas correctamente"

echo ""
echo "✅ Bootstrap completado!"
echo ""
echo "🌐 Accesos:"
echo "   - Frontend (a través del proxy): http://localhost:8080"
echo "   - API directa: http://localhost:8000"
echo "   - API docs: http://localhost:8000/docs"
echo ""
echo "📝 Para ver los logs:"
echo "   docker compose -f docker-compose.dev.yml logs -f"
echo ""
echo "🛑 Para detener los servicios:"
echo "   ./scripts/dev_teardown.sh"

