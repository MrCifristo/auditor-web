#!/usr/bin/env bash
# Wrapper para docker-compose que carga automáticamente las variables de entorno
# Uso: ./scripts/docker-compose-wrapper.sh <comando> [args...]
# Ejemplo: ./scripts/docker-compose-wrapper.sh ps
#          ./scripts/docker-compose-wrapper.sh logs -f api

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/env/.env.dev"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: No se encontró $ENV_FILE"
    echo "   Ejecuta primero: cp env/.env.example env/.env.dev"
    exit 1
fi

# Cargar variables de entorno
set -a
source "$ENV_FILE"
set +a

# Ejecutar docker-compose con las variables cargadas
cd "$ROOT_DIR"
if docker compose version &> /dev/null; then
    docker compose -f docker-compose.dev.yml --env-file "$ENV_FILE" "$@"
else
    docker-compose -f docker-compose.dev.yml --env-file "$ENV_FILE" "$@"
fi

