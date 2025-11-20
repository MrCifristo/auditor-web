# 🚀 Guía Completa: Deploy con Certificado SSL Válido

Esta guía te explica cómo deployar tu proyecto `auditor-web` con un certificado SSL válido usando tu dominio `miltonbeltran.online`.

## 📋 Opciones de Deployment

Tienes **3 opciones** principales:

1. **🏠 Local con IP Pública** - Tu máquina local, dominio apunta a tu IP
2. **☁️ VPS/Servidor** - EC2, DigitalOcean, Linode, etc.
3. **🌐 Cloudflare Tunnel** - Sin IP pública, más fácil (recomendado para empezar)

---

## Opción 1: 🏠 Deploy Local con IP Pública

### Requisitos
- ✅ IP pública (puede ser dinámica con No-IP/DuckDNS)
- ✅ Puertos 80 y 443 abiertos en tu router
- ✅ Dominio `miltonbeltran.online` configurado en GoDaddy

### Paso 1: Configurar DNS en GoDaddy

1. Ve a tu panel de GoDaddy
2. Accede a **DNS Management** de `miltonbeltran.online`
3. Agrega un registro **A**:
   - **Tipo**: A
   - **Nombre**: `@` (o deja en blanco)
   - **Valor**: Tu IP pública (obténla con `curl ifconfig.me`)
   - **TTL**: 600

**Si tu IP es dinámica**, usa No-IP o DuckDNS:
- Crea cuenta en https://www.noip.com/
- Instala el cliente No-IP en tu Mac
- Crea un hostname (ej: `auditor.noip.com`)
- En GoDaddy, crea un registro **CNAME** apuntando a `auditor.noip.com`

### Paso 2: Verificar Configuración

```bash
# Verifica que el DNS apunta correctamente
./scripts/verificar_dns.sh miltonbeltran.online
```

### Paso 3: Preparar Variables de Entorno

Crea `env/.env.prod`:

```bash
# Base de datos
POSTGRES_USER=auditor_user
POSTGRES_PASSWORD=tu_password_seguro_aqui
POSTGRES_DB=auditor_db
DATABASE_URL=postgresql://auditor_user:tu_password_seguro_aqui@db:5432/auditor_db

# API
API_HOST=0.0.0.0
API_PORT=8000
API_LOG_LEVEL=info

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_minimo_32_caracteres
JWT_ALGORITHM=HS256

# Frontend
NEXT_PUBLIC_API_BASE_URL=https://api.miltonbeltran.online
NODE_ENV=production
```

### Paso 4: Build y Deploy

```bash
# Build de las imágenes
docker-compose -f docker-compose.prod.yml build

# Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# Ver logs del proxy (para ver la obtención del certificado)
docker logs -f auditor_proxy
```

### Paso 5: Verificar

Espera 1-2 minutos y visita:
- Frontend: `https://miltonbeltran.online`
- API: `https://api.miltonbeltran.online/docs`

---

## Opción 2: ☁️ Deploy en VPS/Servidor (Recomendado para Producción)

### Requisitos
- ✅ VPS con Ubuntu 22.04 (EC2, DigitalOcean, Linode, etc.)
- ✅ Dominio `miltonbeltran.online` configurado en GoDaddy
- ✅ Acceso SSH al servidor

### Paso 1: Provisionar VPS

**Ejemplo con DigitalOcean:**
1. Crea una cuenta en https://www.digitalocean.com/
2. Crea un Droplet:
   - **OS**: Ubuntu 22.04
   - **Plan**: $6/mes mínimo (1GB RAM)
   - **Región**: La más cercana a ti
   - **Autenticación**: SSH keys (recomendado)

### Paso 2: Configurar DNS

En GoDaddy, apunta tu dominio al VPS:
- **Tipo**: A
- **Nombre**: `@`
- **Valor**: IP del VPS
- **TTL**: 600

Opcionalmente, crea subdominios:
- `api.miltonbeltran.online` → misma IP

### Paso 3: Conectar al Servidor

```bash
ssh root@tu_ip_del_vps
```

### Paso 4: Instalar Docker y Docker Compose

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y

# Verificar instalación
docker --version
docker-compose --version
```

### Paso 5: Clonar el Repositorio

```bash
# Instalar Git
apt install git -y

# Clonar tu repositorio
git clone https://github.com/tu-usuario/auditor-web.git
cd auditor-web
```

### Paso 6: Configurar Variables de Entorno

```bash
# Crear directorio de env si no existe
mkdir -p env

# Crear archivo de producción
nano env/.env.prod
```

Pega el contenido del `.env.prod` (mismo que en Opción 1, pero ajusta `NEXT_PUBLIC_API_BASE_URL`):

```bash
# Base de datos
POSTGRES_USER=auditor_user
POSTGRES_PASSWORD=tu_password_seguro_aqui
POSTGRES_DB=auditor_db
DATABASE_URL=postgresql://auditor_user:tu_password_seguro_aqui@db:5432/auditor_db

# API
API_HOST=0.0.0.0
API_PORT=8000
API_LOG_LEVEL=info

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_minimo_32_caracteres
JWT_ALGORITHM=HS256

# Frontend
NEXT_PUBLIC_API_BASE_URL=https://api.miltonbeltran.online
NODE_ENV=production
```

Guarda con `Ctrl+X`, luego `Y`, luego `Enter`.

### Paso 7: Configurar Firewall

```bash
# Permitir puertos HTTP y HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp  # SSH
ufw enable
```

### Paso 8: Build y Deploy

```bash
# Build
docker-compose -f docker-compose.prod.yml build

# Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f proxy
```

### Paso 9: Verificar

Espera 1-2 minutos y visita:
- `https://miltonbeltran.online`
- `https://api.miltonbeltran.online/docs`

---

## Opción 3: 🌐 Cloudflare Tunnel (Más Fácil, Sin IP Pública)

Esta opción es la más fácil si no quieres lidiar con IP pública o abrir puertos.

### Paso 1: Configurar Cloudflare

1. Crea cuenta en https://www.cloudflare.com/ (gratis)
2. Añade tu dominio `miltonbeltran.online`
3. Cloudflare te dará **nameservers** (ej: `ns1.cloudflare.com`)
4. Ve a GoDaddy y cambia los **nameservers** a los de Cloudflare

### Paso 2: Instalar cloudflared

```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# O descarga desde: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### Paso 3: Autenticarse

```bash
cloudflared tunnel login
```

Esto abrirá tu navegador para autenticarte.

### Paso 4: Crear Túnel

```bash
cloudflared tunnel create auditor
```

Esto crea un túnel llamado "auditor" y guarda las credenciales.

### Paso 5: Configurar el Túnel

Crea un archivo de configuración:

```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Contenido:

```yaml
tunnel: auditor
credentials-file: /Users/milton/.cloudflared/[UUID].json

ingress:
  # Frontend
  - hostname: miltonbeltran.online
    service: http://localhost:3000
  # API
  - hostname: api.miltonbeltran.online
    service: http://localhost:8000
  # Catch-all
  - service: http_status:404
```

**Nota**: Reemplaza `[UUID]` con el ID del túnel que se mostró al crear el túnel.

### Paso 6: Configurar DNS en Cloudflare

```bash
cloudflared tunnel route dns auditor miltonbeltran.online
cloudflared tunnel route dns auditor api.miltonbeltran.online
```

O manualmente en el dashboard de Cloudflare:
- Ve a **DNS** > **Records**
- Crea registros **CNAME**:
  - `miltonbeltran.online` → `[UUID].cfargotunnel.com`
  - `api.miltonbeltran.online` → `[UUID].cfargotunnel.com`

### Paso 7: Iniciar el Túnel

```bash
# En una terminal, inicia el túnel
cloudflared tunnel run auditor

# O como servicio (macOS)
brew services start cloudflared
```

### Paso 8: Iniciar tu Aplicación Localmente

```bash
# En otra terminal, inicia tu app
docker-compose -f docker-compose.dev.yml up -d
```

### Paso 9: Verificar

Visita:
- `https://miltonbeltran.online`
- `https://api.miltonbeltran.online/docs`

**Ventajas de Cloudflare Tunnel:**
- ✅ No requiere IP pública
- ✅ No requiere abrir puertos
- ✅ SSL automático de Cloudflare
- ✅ Gratis
- ✅ Funciona desde tu máquina local

---

## 🔧 Comandos Útiles

### Ver logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Reiniciar servicios
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Detener servicios
```bash
docker-compose -f docker-compose.prod.yml down
```

### Ver estado
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Verificar certificados SSL
```bash
# Ver certificados de Caddy
docker exec auditor_proxy caddy list-certificates
```

---

## ⚠️ Solución de Problemas

### El certificado no se genera

1. **Verifica DNS**: `./scripts/verificar_dns.sh miltonbeltran.online`
2. **Verifica puertos**: Asegúrate de que 80 y 443 están abiertos
3. **Revisa logs**: `docker logs auditor_proxy`
4. **Verifica email**: Debe ser válido en `Caddyfile.prod`

### Error "challenge failed"

Let's Encrypt no puede verificar tu dominio. Verifica:
- DNS está propagado (puede tardar hasta 24h, normalmente es rápido)
- Puertos 80/443 están abiertos y accesibles desde internet
- No hay firewall bloqueando

### El sitio no carga

1. Verifica que los servicios están corriendo: `docker-compose ps`
2. Revisa logs: `docker-compose logs`
3. Verifica que el dominio apunta correctamente: `dig miltonbeltran.online`

---

## 📝 Checklist de Deployment

- [ ] DNS configurado en GoDaddy/Cloudflare
- [ ] Variables de entorno configuradas (`env/.env.prod`)
- [ ] Email actualizado en `Caddyfile.prod`
- [ ] Puertos 80/443 abiertos (si usas Opción 1 o 2)
- [ ] Build completado sin errores
- [ ] Servicios iniciados y corriendo
- [ ] Certificado SSL obtenido (ver logs)
- [ ] Sitio accesible en `https://miltonbeltran.online`
- [ ] API accesible en `https://api.miltonbeltran.online/docs`

---

## 🎯 Recomendación

Para empezar rápido: **Opción 3 (Cloudflare Tunnel)**
- Más fácil de configurar
- No requiere IP pública
- SSL automático
- Funciona desde tu máquina local

Para producción seria: **Opción 2 (VPS)**
- Mejor rendimiento
- Más control
- Escalable

¿Necesitas ayuda con alguna opción específica?

