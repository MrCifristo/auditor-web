#!/bin/bash

# Script para configurar SSL local con mkcert
# Este script instala mkcert y genera certificados para localhost

set -e

echo "🔐 Configurando SSL local con mkcert..."

# Verificar si mkcert está instalado
if ! command -v mkcert &> /dev/null; then
    echo "📦 mkcert no está instalado. Instalando..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install mkcert
            brew install nss  # Para Firefox en macOS
        else
            echo "❌ Homebrew no está instalado. Por favor instálalo desde https://brew.sh"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y libnss3-tools
            # Descargar mkcert
            curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
            chmod +x mkcert-v*-linux-amd64
            sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
        else
            echo "❌ Por favor instala mkcert manualmente desde https://github.com/FiloSottile/mkcert"
            exit 1
        fi
    else
        echo "❌ Sistema operativo no soportado. Por favor instala mkcert manualmente."
        exit 1
    fi
fi

# Crear directorio para certificados si no existe
CERT_DIR="./certs"
mkdir -p "$CERT_DIR"

# Instalar la CA local (solo la primera vez)
if [ ! -f "$(mkcert -CAROOT)/rootCA.pem" ]; then
    echo "📜 Instalando certificado raíz local (CA)..."
    mkcert -install
    echo "✅ Certificado raíz instalado. Los navegadores confiarán en los certificados generados."
fi

# Generar certificados para localhost
echo "🔑 Generando certificados para localhost..."
cd "$CERT_DIR"
mkcert localhost 127.0.0.1 ::1
cd ..

echo ""
echo "✅ ¡SSL configurado correctamente!"
echo ""
echo "📋 Certificados generados en: $CERT_DIR/"
echo "   - localhost+2.pem (certificado)"
echo "   - localhost+2-key.pem (clave privada)"
echo ""
echo "🚀 Ahora puedes usar HTTPS en localhost con Caddy."
echo "   Ejecuta: docker-compose -f docker-compose.dev.yml up"
echo "   Accede a: https://localhost:8443"

