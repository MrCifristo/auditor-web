#!/bin/bash

# Script para detener Cloudflare Tunnel
# Uso: ./scripts/stop_cloudflare_tunnel.sh

echo "🛑 Deteniendo Cloudflare Tunnel..."

# Buscar procesos de cloudflared tunnel
PIDS=$(pgrep -f "cloudflared tunnel run" || true)

if [ -z "$PIDS" ]; then
    echo "✅ No hay túneles corriendo"
    exit 0
fi

# Detener procesos
for PID in $PIDS; do
    echo "   Deteniendo proceso $PID..."
    kill $PID 2>/dev/null || true
done

sleep 2

# Verificar que se detuvieron
if pgrep -f "cloudflared tunnel run" > /dev/null; then
    echo "⚠️  Algunos procesos no se detuvieron. Forzando..."
    pkill -9 -f "cloudflared tunnel run" 2>/dev/null || true
fi

echo "✅ Túnel detenido"

