#!/bin/bash

# Script automatizado para exponer localhost con Cloudflare Tunnel y SSL válido
# Uso: ./scripts/setup_cloudflare_ssl.sh [opciones]
#
# Opciones:
#   --domain DOMINIO    - Usar dominio personalizado (ej: miltonbeltran.online)
#   --frontend PORT     - Puerto del frontend (default: 3000)
#   --backend PORT      - Puerto del backend (default: 8000)
#   --tunnel-name NAME  - Nombre del túnel (default: auditor)

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración por defecto
FRONTEND_PORT=3000
BACKEND_PORT=8000
TUNNEL_NAME="auditor"
DOMAIN=""
USE_CUSTOM_DOMAIN=false

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)
            DOMAIN="$2"
            USE_CUSTOM_DOMAIN=true
            shift 2
            ;;
        --frontend)
            FRONTEND_PORT="$2"
            shift 2
            ;;
        --backend)
            BACKEND_PORT="$2"
            shift 2
            ;;
        --tunnel-name)
            TUNNEL_NAME="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}❌ Opción desconocida: $1${NC}"
            echo "Uso: $0 [--domain DOMINIO] [--frontend PORT] [--backend PORT] [--tunnel-name NAME]"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Configuración de Cloudflare Tunnel con SSL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Paso 1: Verificar/Instalar cloudflared
echo -e "${YELLOW}📦 Paso 1: Verificando cloudflared...${NC}"

if ! command -v cloudflared &> /dev/null; then
    echo -e "${YELLOW}   cloudflared no está instalado. Instalando...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install cloudflare/cloudflare/cloudflared
        else
            echo -e "${RED}❌ Homebrew no está instalado. Por favor instálalo desde https://brew.sh${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "${YELLOW}   Descargando cloudflared para Linux...${NC}"
        curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
        chmod +x /tmp/cloudflared
        sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
    else
        echo -e "${RED}❌ Sistema operativo no soportado. Instala cloudflared manualmente desde:${NC}"
        echo "   https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
        exit 1
    fi
fi

echo -e "${GREEN}✅ cloudflared instalado${NC}"
echo ""

# Paso 2: Autenticación
echo -e "${YELLOW}🔐 Paso 2: Autenticación con Cloudflare...${NC}"

# Verificar si ya está autenticado
if [ ! -f ~/.cloudflared/cert.pem ]; then
    echo -e "${YELLOW}   No estás autenticado. Abriendo navegador para autenticarte...${NC}"
    cloudflared tunnel login
else
    echo -e "${GREEN}✅ Ya estás autenticado${NC}"
fi
echo ""

# Paso 3: Crear o usar túnel existente
echo -e "${YELLOW}🌐 Paso 3: Configurando túnel '${TUNNEL_NAME}'...${NC}"

# Verificar si el túnel ya existe
if cloudflared tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME"; then
    echo -e "${GREEN}✅ Túnel '${TUNNEL_NAME}' ya existe${NC}"
    TUNNEL_ID=$(cloudflared tunnel list 2>/dev/null | grep "$TUNNEL_NAME" | awk '{print $1}')
else
    echo -e "${YELLOW}   Creando nuevo túnel '${TUNNEL_NAME}'...${NC}"
    TUNNEL_OUTPUT=$(cloudflared tunnel create "$TUNNEL_NAME" 2>&1)
    TUNNEL_ID=$(echo "$TUNNEL_OUTPUT" | grep -oP 'Created tunnel \K[^\s]+' || echo "$TUNNEL_NAME")
    echo -e "${GREEN}✅ Túnel creado: ${TUNNEL_ID}${NC}"
fi
echo ""

# Paso 4: Crear configuración del túnel
echo -e "${YELLOW}⚙️  Paso 4: Configurando túnel...${NC}"

CONFIG_DIR="$HOME/.cloudflared"
CONFIG_FILE="$CONFIG_DIR/config.yml"

# Crear directorio si no existe
mkdir -p "$CONFIG_DIR"

if [ "$USE_CUSTOM_DOMAIN" = true ] && [ -n "$DOMAIN" ]; then
    # Configuración con dominio personalizado
    echo -e "${BLUE}   Configurando con dominio personalizado: ${DOMAIN}${NC}"
    
    cat > "$CONFIG_FILE" <<EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${CONFIG_DIR}/${TUNNEL_ID}.json

ingress:
  # Frontend
  - hostname: ${DOMAIN}
    service: http://localhost:${FRONTEND_PORT}
  
  # API en subdominio
  - hostname: api.${DOMAIN}
    service: http://localhost:${BACKEND_PORT}
  
  # Catch-all
  - service: http_status:404
EOF

    echo -e "${GREEN}✅ Configuración creada con dominio personalizado${NC}"
    echo ""
    echo -e "${YELLOW}📋 Paso 5: Configurando DNS en Cloudflare...${NC}"
    echo -e "${YELLOW}   Esto requiere que tu dominio esté en Cloudflare${NC}"
    echo ""
    
    # Intentar configurar DNS automáticamente
    if cloudflared tunnel route dns "$TUNNEL_ID" "$DOMAIN" 2>/dev/null; then
        echo -e "${GREEN}✅ DNS configurado para ${DOMAIN}${NC}"
    else
        echo -e "${YELLOW}⚠️  No se pudo configurar DNS automáticamente${NC}"
        echo -e "${YELLOW}   Configura manualmente en Cloudflare Dashboard:${NC}"
        echo -e "${BLUE}   1. Ve a https://dash.cloudflare.com${NC}"
        echo -e "${BLUE}   2. Selecciona tu dominio ${DOMAIN}${NC}"
        echo -e "${BLUE}   3. Ve a DNS > Records${NC}"
        echo -e "${BLUE}   4. Crea CNAME:${NC}"
        echo -e "${BLUE}      - Nombre: @ (o deja en blanco)${NC}"
        echo -e "${BLUE}      - Target: ${TUNNEL_ID}.cfargotunnel.com${NC}"
        echo -e "${BLUE}      - Proxy: Proxied (nube naranja)${NC}"
        echo -e "${BLUE}   5. Crea otro CNAME para API:${NC}"
        echo -e "${BLUE}      - Nombre: api${NC}"
        echo -e "${BLUE}      - Target: ${TUNNEL_ID}.cfargotunnel.com${NC}"
        echo -e "${BLUE}      - Proxy: Proxied${NC}"
        echo ""
        read -p "Presiona Enter cuando hayas configurado el DNS..."
    fi
    
    FRONTEND_URL="https://${DOMAIN}"
    BACKEND_URL="https://api.${DOMAIN}"
    
else
    # Configuración con URL temporal
    echo -e "${BLUE}   Configurando con URL temporal (sin dominio personalizado)${NC}"
    
    cat > "$CONFIG_FILE" <<EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${CONFIG_DIR}/${TUNNEL_ID}.json

ingress:
  # Frontend
  - service: http://localhost:${FRONTEND_PORT}
  
  # API
  - service: http://localhost:${BACKEND_PORT}
  
  # Catch-all
  - service: http_status:404
EOF

    echo -e "${GREEN}✅ Configuración creada${NC}"
    echo ""
    echo -e "${YELLOW}📋 Paso 5: El túnel usará URLs temporales${NC}"
    echo -e "${YELLOW}   Las URLs se mostrarán cuando inicies el túnel${NC}"
    
    FRONTEND_URL="(se mostrará al iniciar)"
    BACKEND_URL="(se mostrará al iniciar)"
fi

echo ""

# Paso 6: Verificar que los servicios están corriendo
echo -e "${YELLOW}🔍 Paso 6: Verificando servicios locales...${NC}"

check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ ${service} corriendo en puerto ${port}${NC}"
        return 0
    else
        echo -e "${RED}❌ ${service} NO está corriendo en puerto ${port}${NC}"
        return 1
    fi
}

FRONTEND_OK=false
BACKEND_OK=false

if check_port $FRONTEND_PORT "Frontend"; then
    FRONTEND_OK=true
fi

if check_port $BACKEND_PORT "Backend"; then
    BACKEND_OK=true
fi

echo ""

if [ "$FRONTEND_OK" = false ] || [ "$BACKEND_OK" = false ]; then
    echo -e "${YELLOW}⚠️  Algunos servicios no están corriendo${NC}"
    echo -e "${YELLOW}   Inicia los servicios antes de usar el túnel:${NC}"
    echo -e "${BLUE}   docker-compose -f docker-compose.dev.yml up -d${NC}"
    echo ""
    read -p "¿Quieres continuar de todas formas? (s/n): " continuar
    if [ "$continuar" != "s" ] && [ "$continuar" != "S" ]; then
        exit 0
    fi
fi

# Paso 7: Iniciar el túnel
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Configuración completada${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🚀 Iniciando túnel Cloudflare...${NC}"
echo ""
echo -e "${YELLOW}📋 Información del túnel:${NC}"
echo -e "   Nombre: ${TUNNEL_NAME}"
echo -e "   ID: ${TUNNEL_ID}"
if [ "$USE_CUSTOM_DOMAIN" = true ]; then
    echo -e "   Frontend: ${FRONTEND_URL}"
    echo -e "   Backend: ${BACKEND_URL}"
fi
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "   - El túnel se ejecutará en esta terminal"
echo -e "   - Presiona Ctrl+C para detenerlo"
echo -e "   - Para ejecutarlo en background, usa: cloudflared tunnel run ${TUNNEL_NAME} &"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Iniciar el túnel
cloudflared tunnel run "$TUNNEL_ID"

