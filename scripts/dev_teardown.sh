#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="$ROOT_DIR/env/.env.dev"

echo "🛑 Deteniendo servicios del entorno de desarrollo..."
echo "=================================================="

# Detener servicios
if docker compose version &> /dev/null; then
    docker compose -f docker-compose.dev.yml --env-file "$ENV_FILE" down
else
    docker-compose -f docker-compose.dev.yml --env-file "$ENV_FILE" down
fi

if [ $? -eq 0 ]; then
    echo "✅ Servicios detenidos correctamente"
else
    echo "⚠️  Hubo algunos problemas al detener los servicios"
    exit 1
fi

# Preguntar si desea limpiar volúmenes
echo ""
read -p "¿Deseas eliminar los volúmenes? Esto borrará la base de datos (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "🗑️  Eliminando volúmenes..."
    if docker compose version &> /dev/null; then
        docker compose -f docker-compose.dev.yml --env-file "$ENV_FILE" down -v
    else
        docker-compose -f docker-compose.dev.yml --env-file "$ENV_FILE" down -v
    fi
    echo "✅ Volúmenes eliminados"
else
    echo "ℹ️  Volúmenes conservados. Los datos de la base de datos se mantienen."
fi

# Preguntar si desea eliminar imágenes
echo ""
read -p "¿Deseas eliminar las imágenes construidas? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "🗑️  Eliminando imágenes..."
    if docker compose version &> /dev/null; then
        docker compose -f docker-compose.dev.yml --env-file "$ENV_FILE" down --rmi local
    else
        docker-compose -f docker-compose.dev.yml --env-file "$ENV_FILE" down --rmi local
    fi
    echo "✅ Imágenes eliminadas"
else
    echo "ℹ️  Imágenes conservadas."
fi

echo ""
echo "✅ Teardown completado!"
