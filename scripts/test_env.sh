#!/usr/bin/env bash
# Script de prueba para verificar que las variables de entorno se cargan correctamente

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/env/.env.dev"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Archivo $ENV_FILE no existe"
    exit 1
fi

echo "📝 Cargando variables de entorno desde $ENV_FILE..."
set -a
source "$ENV_FILE"
set +a

echo ""
echo "✅ Variables cargadas. Verificando variables críticas:"
echo ""
echo "POSTGRES_USER=${POSTGRES_USER:-❌ NO DEFINIDA}"
echo "POSTGRES_PASSWORD=${POSTGRES_PASSWORD:+✅ DEFINIDA (oculta)}${POSTGRES_PASSWORD:-❌ NO DEFINIDA}"
echo "POSTGRES_DB=${POSTGRES_DB:-❌ NO DEFINIDA}"
echo "DATABASE_URL=${DATABASE_URL:+✅ DEFINIDA}${DATABASE_URL:-❌ NO DEFINIDA}"
echo "JWT_SECRET=${JWT_SECRET:+✅ DEFINIDA (oculta)}${JWT_SECRET:-❌ NO DEFINIDA}"
echo ""

