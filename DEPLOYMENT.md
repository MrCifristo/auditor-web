# Guía de Deployment

Esta guía explica cómo deployar el frontend en Vercel mientras el backend y la base de datos corren localmente, exponiendo el backend a través de un túnel.

## Arquitectura

- **Frontend**: Deployado en Vercel
- **Backend**: Corriendo localmente (puerto 8000)
- **Base de datos**: Corriendo localmente (PostgreSQL en puerto 5432)
- **Túnel**: ngrok o Cloudflare Tunnel para exponer el backend local

## Paso 1: Preparar el Backend Local

### 1.1 Iniciar Backend y Base de Datos

```bash
# Opción 1: Usar el script helper
./scripts/start_backend_local.sh

# Opción 2: Manualmente con docker-compose
docker-compose -f docker-compose.dev.yml up -d db api
```

Verifica que el backend esté corriendo:
```bash
curl http://localhost:8000/health
```

### 1.2 Verificar Variables de Entorno

Asegúrate de que el archivo `env/.env.dev` tenga todas las variables necesarias:
- `DATABASE_URL`
- `JWT_SECRET`
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- etc.

## Paso 2: Exponer el Backend con un Túnel

Tienes dos opciones: **ngrok** o **Cloudflare Tunnel**

### Opción A: ngrok (Recomendado para desarrollo)

#### 2.1 Instalar ngrok

```bash
# macOS
brew install ngrok/ngrok/ngrok

# O descarga desde: https://ngrok.com/download
```

#### 2.2 Obtener Token de Autenticación (Opcional pero recomendado)

1. Regístrate en https://ngrok.com/
2. Obtén tu authtoken desde el dashboard
3. Configúralo:
```bash
export NGROK_AUTH_TOKEN="tu_token_aqui"
ngrok config add-authtoken $NGROK_AUTH_TOKEN
```

#### 2.3 Iniciar el Túnel

```bash
# Usar el script helper
./scripts/start_ngrok_tunnel.sh

# O manualmente
ngrok http 8000
```

#### 2.4 Copiar la URL Pública

ngrok mostrará una URL como:
```
Forwarding  https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:8000
```

**Copia esta URL HTTPS** (ej: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`)

⚠️ **Nota**: Con el plan gratuito de ngrok, la URL cambia cada vez que reinicias el túnel. Para una URL fija, necesitas el plan de pago.

### Opción B: Cloudflare Tunnel (Gratis y URL más estable)

#### 2.1 Instalar cloudflared

```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# O descarga desde: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

#### 2.2 Iniciar el Túnel

```bash
# Usar el script helper
./scripts/start_cloudflare_tunnel.sh

# O manualmente
cloudflared tunnel --url http://localhost:8000
```

#### 2.3 Copiar la URL Pública

Cloudflare mostrará una URL como:
```
https://xxxx-xx-xx-xx-xx.trycloudflare.com
```

**Copia esta URL HTTPS**

⚠️ **Nota**: La URL de Cloudflare también cambia en cada sesión, pero es más estable durante la sesión activa.

## Paso 3: Deployar Frontend en Vercel

### 3.1 Preparar el Proyecto

Asegúrate de que el proyecto esté en un repositorio Git (GitHub, GitLab, Bitbucket).

### 3.2 Conectar con Vercel

1. Ve a https://vercel.com/
2. Inicia sesión con tu cuenta de GitHub/GitLab/Bitbucket
3. Click en "Add New Project"
4. Importa el repositorio `auditor-web`

### 3.3 Configurar el Proyecto en Vercel

**Root Directory**: `frontend`

**Build Settings**:
- Framework Preset: Next.js
- Build Command: `npm run build` (o dejar por defecto)
- Output Directory: `.next` (o dejar por defecto)
- Install Command: `npm install` (o dejar por defecto)

### 3.4 Configurar Variables de Entorno

En la configuración del proyecto en Vercel, ve a **Settings > Environment Variables** y agrega:

```
NEXT_PUBLIC_API_BASE_URL = https://xxxx-xx-xx-xx-xx.ngrok-free.app
```

O si usas Cloudflare:
```
NEXT_PUBLIC_API_BASE_URL = https://xxxx-xx-xx-xx-xx.trycloudflare.com
```

⚠️ **IMPORTANTE**: 
- Usa la URL HTTPS completa (sin `/api` al final, a menos que tu backend lo requiera)
- Si cambias la URL del túnel, actualiza esta variable en Vercel y haz un nuevo deployment

### 3.5 Deploy

Click en "Deploy" y espera a que se complete el proceso.

## Paso 4: Verificar el Deployment

1. Una vez deployado, Vercel te dará una URL (ej: `https://auditor-web.vercel.app`)
2. Abre esa URL en tu navegador
3. Verifica que el frontend se conecte correctamente al backend a través del túnel

## Troubleshooting

### El frontend no se conecta al backend

1. **Verifica que el túnel esté activo**: Debe estar corriendo en tu terminal
2. **Verifica la URL en Vercel**: Asegúrate de que `NEXT_PUBLIC_API_BASE_URL` tenga la URL correcta
3. **Verifica CORS**: El backend ya tiene CORS configurado para aceptar todos los orígenes (`allow_origins=["*"]`)
4. **Revisa los logs de Vercel**: Ve a la pestaña "Functions" o "Logs" en el dashboard de Vercel
5. **Revisa los logs del backend**: `docker-compose -f docker-compose.dev.yml logs api`

### El túnel se desconecta

- **ngrok**: Con el plan gratuito, las sesiones duran 2 horas. Reinicia el túnel cuando sea necesario.
- **Cloudflare**: Similar, reinicia cuando sea necesario.

### La URL del túnel cambia frecuentemente

Para URLs estables:
- **ngrok**: Necesitas el plan de pago para dominios fijos
- **Cloudflare Tunnel**: Puedes configurar un túnel permanente con un dominio personalizado (requiere configuración adicional)

## Mantener el Túnel Activo

Para mantener el túnel activo durante el desarrollo:

1. **Usar tmux o screen**:
```bash
# Con tmux
tmux new -s tunnel
./scripts/start_ngrok_tunnel.sh
# Presiona Ctrl+B luego D para detach

# Para volver
tmux attach -t tunnel
```

2. **Usar un servicio del sistema** (macOS con launchd, Linux con systemd)

3. **Usar un VPS**: Si tienes un servidor, puedes correr el túnel allí de forma permanente

## Próximos Pasos

- Considera usar un túnel permanente o un VPS para producción
- Configura un dominio personalizado para el túnel
- Implementa monitoreo para el túnel
- Considera deployar el backend en un servicio como Railway, Render, o Fly.io para producción

