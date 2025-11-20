#!/bin/bash

# Script para iniciar Cloudflare Tunnel como servicio en background
# Uso: ./scripts/start_cloudflare_tunnel_daemon.sh [tunnel-name]

set -e

TUNNEL_NAME=${1:-auditor}

echo "🚀 Iniciando Cloudflare Tunnel como servicio en background..."
echo ""

# Verificar que cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared no está instalado."
    echo "   Ejecuta primero: ./scripts/setup_cloudflare_ssl.sh"
    exit 1
fi

# Verificar que el túnel existe
if ! cloudflared tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME"; then
    echo "❌ El túnel '$TUNNEL_NAME' no existe."
    echo "   Ejecuta primero: ./scripts/setup_cloudflare_ssl.sh"
    exit 1
fi

# Verificar si ya está corriendo
if pgrep -f "cloudflared tunnel run" > /dev/null; then
    echo "⚠️  Ya hay un túnel corriendo."
    read -p "¿Quieres detenerlo y reiniciar? (s/n): " reiniciar
    if [ "$reiniciar" = "s" ] || [ "$reiniciar" = "S" ]; then
        pkill -f "cloudflared tunnel run"
        sleep 2
    else
        echo "✅ Túnel ya está corriendo"
        exit 0
    fi
fi

# Obtener ID del túnel
TUNNEL_ID=$(cloudflared tunnel list 2>/dev/null | grep "$TUNNEL_NAME" | awk '{print $1}')

echo "✅ Iniciando túnel: $TUNNEL_NAME (ID: $TUNNEL_ID)"
echo ""

# Iniciar en background
nohup cloudflared tunnel run "$TUNNEL_ID" > /tmp/cloudflared_${TUNNEL_NAME}.log 2>&1 &
TUNNEL_PID=$!

sleep 3

# Verificar que está corriendo
if ps -p $TUNNEL_PID > /dev/null; then
    echo "✅ Túnel iniciado correctamente (PID: $TUNNEL_PID)"
    echo ""
    echo "📋 Información:"
    echo "   - Logs: tail -f /tmp/cloudflared_${TUNNEL_NAME}.log"
    echo "   - Detener: pkill -f 'cloudflared tunnel run'"
    echo "   - O usar: ./scripts/stop_cloudflare_tunnel.sh"
    echo ""
    echo "📊 Ver logs en tiempo real:"
    echo "   tail -f /tmp/cloudflared_${TUNNEL_NAME}.log"
else
    echo "❌ Error al iniciar el túnel"
    echo "   Revisa los logs: cat /tmp/cloudflared_${TUNNEL_NAME}.log"
    exit 1
fi

