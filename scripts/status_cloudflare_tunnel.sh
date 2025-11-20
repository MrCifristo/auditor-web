#!/bin/bash

# Script para ver el estado del Cloudflare Tunnel
# Uso: ./scripts/status_cloudflare_tunnel.sh

echo "📊 Estado de Cloudflare Tunnel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar si cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared no está instalado"
    exit 1
fi

# Verificar autenticación
if [ ! -f ~/.cloudflared/cert.pem ]; then
    echo "❌ No estás autenticado"
    echo "   Ejecuta: ./scripts/setup_cloudflare_ssl.sh"
    exit 1
else
    echo "✅ Autenticado con Cloudflare"
fi

echo ""

# Listar túneles
echo "🌐 Túneles configurados:"
cloudflared tunnel list 2>/dev/null || echo "   No hay túneles configurados"

echo ""

# Verificar procesos corriendo
PIDS=$(pgrep -f "cloudflared tunnel run" || true)

if [ -z "$PIDS" ]; then
    echo "❌ No hay túneles corriendo"
    echo ""
    echo "💡 Para iniciar:"
    echo "   ./scripts/setup_cloudflare_ssl.sh"
    echo "   O: ./scripts/start_cloudflare_tunnel_daemon.sh"
else
    echo "✅ Túneles corriendo:"
    for PID in $PIDS; do
        CMD=$(ps -p $PID -o command= 2>/dev/null || echo "N/A")
        echo "   PID: $PID"
        echo "   Comando: $CMD"
    done
    echo ""
    echo "📋 Logs disponibles en: /tmp/cloudflared_*.log"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

