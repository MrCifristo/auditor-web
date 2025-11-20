# 🌐 Cloudflare Tunnel - Exponer Localhost con SSL

Esta guía explica cómo usar Cloudflare Tunnel para exponer tu aplicación local con certificados SSL válidos, **sin necesidad de IP pública ni abrir puertos**.

## 🚀 Inicio Rápido

### Opción 1: Con dominio personalizado (Recomendado)

```bash
# Configurar túnel con tu dominio
./scripts/setup_cloudflare_ssl.sh --domain miltonbeltran.online

# El script te guiará paso a paso
```

**Resultado:**
- Frontend: `https://miltonbeltran.online` ✅ SSL válido
- Backend: `https://api.miltonbeltran.online` ✅ SSL válido

### Opción 2: Sin dominio (URL temporal)

```bash
# Configurar túnel con URL temporal
./scripts/setup_cloudflare_ssl.sh

# El script te dará URLs temporales con SSL
```

**Resultado:**
- URLs temporales como: `https://xxxx-xx-xx-xx-xx.trycloudflare.com`
- SSL válido automático ✅

---

## 📋 Requisitos Previos

1. **Cuenta en Cloudflare** (gratis): https://www.cloudflare.com/sign-up/
2. **Dominio en Cloudflare** (solo si usas dominio personalizado):
   - Si tu dominio está en GoDaddy, necesitas moverlo a Cloudflare
   - O usar URLs temporales (no requiere dominio)

---

## 🔧 Uso Detallado

### Paso 1: Configuración Inicial

```bash
./scripts/setup_cloudflare_ssl.sh --domain miltonbeltran.online
```

Este script:
- ✅ Verifica/instala `cloudflared`
- ✅ Te autentica con Cloudflare (abre navegador)
- ✅ Crea un túnel llamado "auditor"
- ✅ Configura el túnel para frontend (puerto 3000) y backend (puerto 8000)
- ✅ Configura DNS automáticamente (si es posible)
- ✅ Inicia el túnel

### Paso 2: Iniciar tu Aplicación Local

En otra terminal:

```bash
# Iniciar servicios
docker-compose -f docker-compose.dev.yml up -d

# Verificar que están corriendo
docker-compose -f docker-compose.dev.yml ps
```

### Paso 3: Acceder

- **Con dominio**: `https://miltonbeltran.online`
- **Sin dominio**: Las URLs se mostrarán en la terminal del túnel

---

## 🎛️ Opciones del Script

```bash
# Con dominio personalizado
./scripts/setup_cloudflare_ssl.sh --domain miltonbeltran.online

# Con puertos personalizados
./scripts/setup_cloudflare_ssl.sh --frontend 3000 --backend 8000

# Con nombre de túnel personalizado
./scripts/setup_cloudflare_ssl.sh --tunnel-name mi-tunel

# Combinar opciones
./scripts/setup_cloudflare_ssl.sh \
  --domain miltonbeltran.online \
  --frontend 3000 \
  --backend 8000 \
  --tunnel-name auditor
```

---

## 🔄 Gestión del Túnel

### Iniciar en Background (Daemon)

```bash
# Iniciar túnel en background
./scripts/start_cloudflare_tunnel_daemon.sh

# O con nombre específico
./scripts/start_cloudflare_tunnel_daemon.sh auditor
```

### Ver Estado

```bash
./scripts/status_cloudflare_tunnel.sh
```

### Detener Túnel

```bash
./scripts/stop_cloudflare_tunnel.sh
```

### Ver Logs

```bash
# Si está corriendo en background
tail -f /tmp/cloudflared_auditor.log

# Si está corriendo en foreground, los logs aparecen en la terminal
```

---

## 🌐 Configurar Dominio en Cloudflare

Si tu dominio está en GoDaddy y quieres usarlo con Cloudflare:

### Paso 1: Mover Dominio a Cloudflare

1. Ve a https://dash.cloudflare.com
2. Click en "Add a Site"
3. Ingresa tu dominio: `miltonbeltran.online`
4. Cloudflare escaneará tus registros DNS actuales
5. Selecciona el plan gratuito
6. Cloudflare te dará **nameservers** (ej: `ns1.cloudflare.com`)

### Paso 2: Actualizar Nameservers en GoDaddy

1. Ve a tu panel de GoDaddy
2. Ve a "DNS Management"
3. Cambia los **nameservers** a los que Cloudflare te dio
4. Espera 24-48 horas para la propagación (normalmente es más rápido)

### Paso 3: Configurar Túnel

```bash
./scripts/setup_cloudflare_ssl.sh --domain miltonbeltran.online
```

El script intentará configurar DNS automáticamente. Si no puede, te dará instrucciones manuales.

---

## 🔍 Solución de Problemas

### Error: "tunnel not found"

El túnel no existe. Ejecuta primero:
```bash
./scripts/setup_cloudflare_ssl.sh
```

### Error: "not authenticated"

Necesitas autenticarte:
```bash
cloudflared tunnel login
```

### El túnel no conecta

1. **Verifica que los servicios locales están corriendo:**
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

2. **Verifica los puertos:**
   ```bash
   lsof -i :3000  # Frontend
   lsof -i :8000  # Backend
   ```

3. **Revisa los logs:**
   ```bash
   tail -f /tmp/cloudflared_auditor.log
   ```

### DNS no se configura automáticamente

Si el script no puede configurar DNS automáticamente:

1. Ve a https://dash.cloudflare.com
2. Selecciona tu dominio
3. Ve a **DNS > Records**
4. Crea registros **CNAME**:
   - **Nombre**: `@` (o deja en blanco)
   - **Target**: `[TUNNEL_ID].cfargotunnel.com`
   - **Proxy**: ✅ Proxied (nube naranja)
   
   Y otro para API:
   - **Nombre**: `api`
   - **Target**: `[TUNNEL_ID].cfargotunnel.com`
   - **Proxy**: ✅ Proxied

### El dominio no carga

1. **Verifica DNS:**
   ```bash
   dig miltonbeltran.online
   # Debe apuntar a Cloudflare
   ```

2. **Verifica que el túnel está corriendo:**
   ```bash
   ./scripts/status_cloudflare_tunnel.sh
   ```

3. **Espera propagación DNS** (puede tardar hasta 24 horas, normalmente es rápido)

---

## 💡 Ventajas de Cloudflare Tunnel

✅ **SSL automático y válido** - Certificados gestionados por Cloudflare  
✅ **Sin IP pública** - No necesitas IP pública  
✅ **Sin abrir puertos** - No necesitas configurar router/firewall  
✅ **Gratis** - Plan gratuito de Cloudflare es suficiente  
✅ **Fácil de usar** - Scripts automatizados  
✅ **Dominio personalizado** - Puedes usar tu propio dominio  

---

## 📊 Comparación con Otras Opciones

| Característica | Cloudflare Tunnel | ngrok | mkcert | Let's Encrypt |
|----------------|-------------------|-------|--------|---------------|
| SSL Válido | ✅ Sí | ✅ Sí | ❌ Solo local | ✅ Sí |
| Requiere DNS | ⚠️ Solo si usas dominio | ❌ No | ❌ No | ✅ Sí |
| Requiere IP Pública | ❌ No | ❌ No | ❌ No | ✅ Sí |
| Requiere Abrir Puertos | ❌ No | ❌ No | ❌ No | ✅ Sí |
| Dominio Personalizado | ✅ Sí | ⚠️ Plan pago | ❌ No | ✅ Sí |
| Gratis | ✅ Sí | ⚠️ Limitado | ✅ Sí | ✅ Sí |

---

## 🎯 Casos de Uso

### Desarrollo Local
```bash
# URL temporal, rápido y fácil
./scripts/setup_cloudflare_ssl.sh
```

### Testing/Demo
```bash
# Con dominio personalizado
./scripts/setup_cloudflare_ssl.sh --domain miltonbeltran.online
```

### Producción Temporal
```bash
# Iniciar en background
./scripts/start_cloudflare_tunnel_daemon.sh
```

---

## 📝 Notas Importantes

1. **URLs temporales cambian**: Si no usas dominio personalizado, las URLs cambian en cada sesión
2. **Túnel debe estar corriendo**: El túnel debe estar activo para que funcione
3. **Servicios locales**: Tus servicios (frontend/backend) deben estar corriendo localmente
4. **Límites de Cloudflare**: El plan gratuito tiene límites, pero son generosos para desarrollo/testing

---

## 🚀 Próximos Pasos

Una vez configurado:
1. ✅ Tu aplicación está accesible desde internet con SSL válido
2. ✅ Puedes compartir las URLs con otros
3. ✅ Puedes usar estas URLs en Vercel u otros servicios
4. ✅ Perfecto para demos y testing

¿Necesitas ayuda? Revisa los logs o ejecuta:
```bash
./scripts/status_cloudflare_tunnel.sh
```

