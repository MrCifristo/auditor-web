#!/bin/bash

# Script para iniciar el backend y la base de datos localmente
# Uso: ./scripts/start_backend_local.sh

# Cambiar al directorio raíz del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

echo "🚀 Iniciando backend y base de datos localmente..."
echo "📁 Directorio del proyecto: $PROJECT_ROOT"

# Verificar si docker está disponible
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado o no está corriendo."
    exit 1
fi

# Iniciar solo los servicios de backend y base de datos con build
echo "📦 Iniciando servicios con build..."
docker compose --env-file env/.env.dev -f docker-compose.dev.yml up -d --build db api

echo "⏳ Esperando a que los servicios estén listos..."
sleep 5

# Verificar que los servicios estén corriendo
if docker compose --env-file env/.env.dev -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "✅ Backend y base de datos están corriendo!"
    echo "🌐 Backend disponible en: http://localhost:8000"
    echo "📊 Health check: http://localhost:8000/health"
    echo ""
    echo "💡 Ahora puedes iniciar un túnel con:"
    echo "   - ngrok: ./scripts/start_ngrok_tunnel.sh"
    echo "   - Cloudflare: ./scripts/start_cloudflare_tunnel.sh"
else
    echo "❌ Error al iniciar los servicios. Revisa los logs con:"
    echo "   docker compose --env-file env/.env.dev -f docker-compose.dev.yml logs"
fi

