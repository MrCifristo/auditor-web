#!/bin/bash

# Script para guiar el deployment en Vercel + Railway
# Este script te guía paso a paso

echo "🚀 Guía de Deployment en Vercel + Railway"
echo "=========================================="
echo ""
echo "Este script te ayudará a deployar tu proyecto con SSL automático"
echo "sin necesidad de configurar DNS."
echo ""
echo "📋 Requisitos previos:"
echo "   - Cuenta en GitHub (repositorio del proyecto)"
echo "   - Cuenta en Vercel (https://vercel.com)"
echo "   - Cuenta en Railway (https://railway.app)"
echo ""
read -p "¿Tienes todas las cuentas? (s/n): " tiene_cuentas

if [ "$tiene_cuentas" != "s" ] && [ "$tiene_cuentas" != "S" ]; then
    echo ""
    echo "📝 Pasos para crear cuentas:"
    echo "   1. GitHub: https://github.com (si no tienes)"
    echo "   2. Vercel: https://vercel.com/signup"
    echo "   3. Railway: https://railway.app/signup"
    echo ""
    echo "Vuelve a ejecutar este script cuando tengas las cuentas."
    exit 0
fi

echo ""
echo "✅ Perfecto, continuemos..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 1: Deploy Backend en Railway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Ve a https://railway.app"
echo "2. Click en 'New Project'"
echo "3. Selecciona 'Deploy from GitHub repo'"
echo "4. Autoriza Railway a acceder a tu repositorio"
echo "5. Selecciona tu repositorio 'auditor-web'"
echo ""
echo "6. Railway detectará automáticamente Python"
echo "   Si no, configura manualmente:"
echo "   - Build Command: (dejar vacío o pip install -r backend/requirements.txt)"
echo "   - Start Command: cd backend && uvicorn app.main:app --host 0.0.0.0 --port \$PORT"
echo ""
echo "7. Agrega servicio PostgreSQL:"
echo "   - Click en '+ New' → 'Database' → 'PostgreSQL'"
echo ""
echo "8. Configura Variables de Entorno:"
echo "   - Click en tu servicio (backend)"
echo "   - Ve a 'Variables'"
echo "   - Agrega:"
echo "     * DATABASE_URL = \${{Postgres.DATABASE_URL}}"
echo "     * JWT_SECRET = (genera uno seguro)"
echo "     * JWT_ALGORITHM = HS256"
echo ""
echo "9. Railway te dará una URL automática:"
echo "   Ejemplo: https://auditor-web-production.up.railway.app"
echo ""
read -p "¿Ya deployaste el backend en Railway? (s/n): " backend_deploy

if [ "$backend_deploy" != "s" ] && [ "$backend_deploy" != "S" ]; then
    echo ""
    echo "⏸️  Pausa aquí. Cuando termines, vuelve a ejecutar este script."
    exit 0
fi

echo ""
read -p "📋 Copia y pega la URL de tu backend en Railway: " backend_url

echo ""
echo "✅ Backend URL guardada: $backend_url"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 2: Deploy Frontend en Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Ve a https://vercel.com"
echo "2. Click en 'Add New Project'"
echo "3. Conecta tu repositorio de GitHub"
echo "4. Selecciona 'auditor-web'"
echo ""
echo "5. Configura el proyecto:"
echo "   - Framework Preset: Next.js"
echo "   - Root Directory: frontend"
echo "   - Build Command: npm run build (o dejar por defecto)"
echo "   - Output Directory: .next (o dejar por defecto)"
echo ""
echo "6. Variables de Entorno:"
echo "   - Click en 'Environment Variables'"
echo "   - Agrega:"
echo "     * NEXT_PUBLIC_API_BASE_URL = $backend_url"
echo ""
echo "7. Click en 'Deploy'"
echo ""
read -p "¿Ya deployaste el frontend en Vercel? (s/n): " frontend_deploy

if [ "$frontend_deploy" != "s" ] && [ "$frontend_deploy" != "S" ]; then
    echo ""
    echo "⏸️  Pausa aquí. Cuando termines, vuelve a ejecutar este script."
    exit 0
fi

echo ""
read -p "📋 Copia y pega la URL de tu frontend en Vercel: " frontend_url

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ¡Deployment Completado!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Tu aplicación está deployada con SSL válido:"
echo ""
echo "   Frontend: $frontend_url"
echo "   Backend:  $backend_url"
echo ""
echo "🔐 Ambos tienen SSL automático y válido."
echo ""
echo "📝 Próximos pasos:"
echo "   1. Visita tu frontend: $frontend_url"
echo "   2. Verifica que se conecta al backend"
echo "   3. Prueba la API: $backend_url/docs"
echo ""
echo "💡 Tips:"
echo "   - Si cambias variables de entorno, haz un nuevo deploy"
echo "   - Los logs están disponibles en los dashboards de Vercel y Railway"
echo "   - Railway tiene límite de horas gratuitas, Vercel es más generoso"
echo ""

