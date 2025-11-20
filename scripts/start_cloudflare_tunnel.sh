#!/bin/bash

# Script para iniciar un túnel Cloudflare para el backend local
# Uso: ./scripts/start_cloudflare_tunnel.sh [puerto]
# Por defecto usa el puerto 8000

PORT=${1:-8000}

echo "🚀 Iniciando túnel Cloudflare para el backend en puerto $PORT..."

# Verificar si cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared no está instalado."
    echo "📦 Instálalo con: brew install cloudflare/cloudflare/cloudflared (macOS) o descárgalo de https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
    exit 1
fi

echo "✅ Túnel iniciado. La URL pública será mostrada a continuación:"
echo "📋 Copia la URL (ej: https://xxxx-xx-xx-xx-xx.trycloudflare.com) y úsala como NEXT_PUBLIC_API_BASE_URL en Vercel"
echo ""
echo "⚠️  IMPORTANTE: Asegúrate de que el backend esté corriendo en el puerto $PORT"
echo ""

cloudflared tunnel --url http://localhost:$PORT

