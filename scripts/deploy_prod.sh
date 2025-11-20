#!/bin/bash

# Script para deployar en producción
# Uso: ./scripts/deploy_prod.sh

set -e

echo "🚀 Iniciando deployment en producción..."
echo ""

# Verificar que existe el archivo de entorno
if [ ! -f "env/.env.prod" ]; then
    echo "❌ ERROR: No se encontró env/.env.prod"
    echo "   Crea el archivo con las variables de entorno necesarias"
    exit 1
fi

echo "✅ Archivo de entorno encontrado"
echo ""

# Verificar DNS (opcional, puede fallar si no está configurado aún)
echo "🔍 Verificando DNS..."
if command -v dig &> /dev/null; then
    DOMAIN="miltonbeltran.online"
    DNS_IP=$(dig +short $DOMAIN | tail -n1)
    if [ -n "$DNS_IP" ]; then
        echo "   DNS apunta a: $DNS_IP"
    else
        echo "   ⚠️  No se pudo verificar DNS (puede estar bien si acabas de configurarlo)"
    fi
else
    echo "   ⚠️  'dig' no está instalado, saltando verificación DNS"
fi

echo ""
echo "📦 Construyendo imágenes..."
docker-compose -f docker-compose.prod.yml build

echo ""
echo "🛑 Deteniendo servicios existentes (si hay)..."
docker-compose -f docker-compose.prod.yml down

echo ""
echo "🚀 Iniciando servicios..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Esperando a que los servicios inicien..."
sleep 5

echo ""
echo "📊 Estado de los servicios:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deployment completado!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Monitorea los logs del proxy para ver la obtención del certificado:"
echo "      docker logs -f auditor_proxy"
echo ""
echo "   2. Espera 1-2 minutos y visita:"
echo "      - Frontend: https://miltonbeltran.online"
echo "      - API: https://api.miltonbeltran.online/docs"
echo ""
echo "   3. Para ver todos los logs:"
echo "      docker-compose -f docker-compose.prod.yml logs -f"

