#!/bin/bash

# Script para verificar la configuración DNS antes de iniciar Caddy
# Uso: ./scripts/verificar_dns.sh [dominio]

DOMAIN=${1:-miltonbeltran.online}

echo "🔍 Verificando configuración DNS para $DOMAIN..."
echo ""

# Obtener IP pública
echo "📡 Tu IP pública es:"
PUBLIC_IP=$(curl -s ifconfig.me)
echo "   $PUBLIC_IP"
echo ""

# Verificar DNS
echo "🌐 Verificando DNS de $DOMAIN..."
DNS_IP=$(dig +short $DOMAIN | tail -n1)

if [ -z "$DNS_IP" ]; then
    echo "❌ ERROR: No se pudo resolver $DOMAIN"
    echo "   Asegúrate de que el registro DNS está configurado en GoDaddy"
    exit 1
fi

echo "   DNS apunta a: $DNS_IP"
echo ""

# Comparar IPs
if [ "$PUBLIC_IP" = "$DNS_IP" ]; then
    echo "✅ ¡Perfecto! El DNS está configurado correctamente"
    echo "   Tu dominio $DOMAIN apunta a tu IP pública"
else
    echo "⚠️  ADVERTENCIA: El DNS no apunta a tu IP pública"
    echo "   DNS apunta a: $DNS_IP"
    echo "   Tu IP es:     $PUBLIC_IP"
    echo ""
    echo "   Si acabas de configurar el DNS, espera unos minutos para que se propague"
    echo "   La propagación DNS puede tardar desde minutos hasta 24 horas"
fi

echo ""
echo "🔐 Verificando puertos necesarios para Let's Encrypt..."

# Verificar puerto 80
if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    PORT80_PROCESS=$(lsof -Pi :80 -sTCP:LISTEN | tail -n1 | awk '{print $1, $2}')
    echo "   Puerto 80: En uso por $PORT80_PROCESS"
    if [[ "$PORT80_PROCESS" == *"docker"* ]] || [[ "$PORT80_PROCESS" == *"caddy"* ]]; then
        echo "   ✅ Está siendo usado por Docker/Caddy (correcto)"
    else
        echo "   ⚠️  Otro proceso está usando el puerto 80"
    fi
else
    echo "   Puerto 80: Disponible ✅"
fi

# Verificar puerto 443
if lsof -Pi :443 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    PORT443_PROCESS=$(lsof -Pi :443 -sTCP:LISTEN | tail -n1 | awk '{print $1, $2}')
    echo "   Puerto 443: En uso por $PORT443_PROCESS"
    if [[ "$PORT443_PROCESS" == *"docker"* ]] || [[ "$PORT443_PROCESS" == *"caddy"* ]]; then
        echo "   ✅ Está siendo usado por Docker/Caddy (correcto)"
    else
        echo "   ⚠️  Otro proceso está usando el puerto 443"
    fi
else
    echo "   Puerto 443: Disponible ✅"
fi

echo ""
echo "📋 Próximos pasos:"
echo "   1. Si el DNS está correcto, inicia el proxy:"
echo "      docker-compose -f docker-compose.dev.yml up -d proxy"
echo ""
echo "   2. Monitorea los logs para ver la obtención del certificado:"
echo "      docker logs -f auditor_proxy"
echo ""
echo "   3. Espera 1-2 minutos y visita: https://$DOMAIN"

