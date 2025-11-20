#!/bin/bash

# Script para iniciar un túnel ngrok para el backend local
# Uso: ./scripts/start_ngrok_tunnel.sh [puerto]
# Por defecto usa el puerto 8000

PORT=${1:-8000}
NGROK_AUTH_TOKEN=${NGROK_AUTH_TOKEN:-""}

echo "🚀 Iniciando túnel ngrok para el backend en puerto $PORT..."

# Verificar si ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok no está instalado."
    echo "📦 Instálalo con: brew install ngrok/ngrok/ngrok (macOS) o descárgalo de https://ngrok.com/"
    exit 1
fi

# Si hay un token de autenticación, configurarlo
if [ -n "$NGROK_AUTH_TOKEN" ]; then
    ngrok config add-authtoken "$NGROK_AUTH_TOKEN"
fi

# Iniciar el túnel
echo "✅ Túnel iniciado. La URL pública será mostrada a continuación:"
echo "📋 Copia la URL HTTPS (ej: https://xxxx-xx-xx-xx-xx.ngrok-free.app) y úsala como NEXT_PUBLIC_API_BASE_URL en Vercel"
echo ""
echo "⚠️  IMPORTANTE: Asegúrate de que el backend esté corriendo en el puerto $PORT"
echo ""

ngrok http $PORT

