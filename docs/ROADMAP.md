# 🗺️ Roadmap de Desarrollo - Auditor Web de Seguridad

Este documento presenta un roadmap estructurado para desarrollar el proyecto **Auditor Web de Seguridad** desde su estado actual hasta un sistema funcional completo.

**Fecha de creación:** 2024  
**Estado del proyecto:** Inicial (infraestructura base configurada, código pendiente)

---

## 📊 Estado Actual del Proyecto

### ✅ Completado
- ✅ Documentación completa (README, arquitectura, roles, contexto)
- ✅ Configuración de Docker Compose (dev y prod)
- ✅ Dockerfiles para backend y frontend
- ✅ Configuración de Caddy (proxy reverse)
- ✅ Scripts base (bootstrap/teardown)
- ✅ Esquema inicial de base de datos (solo estructura base)

### ❌ Pendiente
- ❌ Código del backend (FastAPI)
- ❌ Código del frontend (Next.js/React)
- ❌ Modelos de base de datos completos
- ❌ Variables de entorno de ejemplo
- ❌ Integración con herramientas de seguridad
- ❌ Autenticación y autorización
- ❌ Dashboard de métricas
- ❌ Scripts de desarrollo completos

---

## 🎯 Fases de Desarrollo

### **FASE 0: Preparación e Infraestructura Base** ⏱️ ~2-3 días

**Objetivo:** Tener el entorno de desarrollo funcionando y listo para empezar a codificar.

#### Tareas:
1. **Configuración de variables de entorno**
   - [ ] Crear `env/.env.example` con todas las variables necesarias
   - [ ] Documentar cada variable y su propósito
   - [ ] Crear `env/.env.dev` local (no versionado)

2. **Completar scripts de desarrollo**
   - [ ] Implementar `scripts/dev_bootstrap.sh`:
     - Verificar Docker instalado
     - Cargar variables de entorno
     - Construir imágenes
     - Levantar servicios
     - Verificar salud de servicios
   - [ ] Mejorar `scripts/dev_teardown.sh`:
     - Detener servicios limpiamente
     - Opción para limpiar volúmenes (opcional)

3. **Verificar infraestructura Docker**
   - [ ] Probar que docker-compose.dev.yml funciona
   - [ ] Verificar conectividad entre servicios
   - [ ] Asegurar que Caddy enruta correctamente

4. **Estructura inicial de carpetas**
   - [ ] Crear estructura base de `backend/` (carpetas vacías)
   - [ ] Crear estructura base de `frontend/` (carpetas vacías)

**Entregables:**
- ✅ Stack de desarrollo levantándose con un comando
- ✅ Variables de entorno documentadas
- ✅ Estructura de carpetas lista

---

### **FASE 1: Backend - Base y Autenticación** ⏱️ ~5-7 días

**Objetivo:** Tener un backend funcional con autenticación completa (Rol A).

#### Tareas:

1. **Configuración inicial del backend**
   - [ ] Crear `backend/requirements.txt` con dependencias:
     - FastAPI, Uvicorn
     - SQLAlchemy, Alembic
     - PyJWT, passlib[bcrypt]
     - psycopg2-binary
     - python-dotenv
     - pydantic
   - [ ] Configurar estructura de carpetas:
     ```
     backend/
     ├── app/
     │   ├── main.py
     │   ├── config.py
     │   ├── database.py
     │   ├── models/
     │   ├── schemas/
     │   ├── routers/
     │   ├── services/
     │   ├── security/
     │   └── utils/
     └── requirements.txt
     ```

2. **Configuración y base de datos**
   - [ ] Implementar `config.py` (lectura de variables de entorno)
   - [ ] Implementar `database.py` (sesión SQLAlchemy)
   - [ ] Crear modelos SQLAlchemy:
     - [ ] `User` (id, email, password_hash, role, timestamps)
     - [ ] `Target` (id, user_id, url, created_at)
     - [ ] `Job` (id, user_id, target_id, status, tools_used, timestamps)
     - [ ] `Finding` (id, job_id, severity, title, description, evidence, recommendation, tool, created_at)
   - [ ] Configurar Alembic para migraciones
   - [ ] Crear migración inicial

3. **Autenticación y seguridad**
   - [ ] Implementar `security/jwt.py`:
     - Función para crear tokens
     - Función para verificar tokens
     - Función para obtener usuario del token
   - [ ] Implementar `security/hashing.py`:
     - Hash de contraseñas (bcrypt)
     - Verificación de contraseñas
   - [ ] Crear dependencia `get_current_user` para proteger endpoints

4. **Endpoints de autenticación**
   - [ ] `POST /auth/register`:
     - Validar email y password
     - Hashear password
     - Crear usuario en BD
     - Retornar usuario (sin password)
   - [ ] `POST /auth/login`:
     - Verificar credenciales
     - Generar JWT
     - Retornar token y datos del usuario
   - [ ] `GET /auth/me`:
     - Obtener usuario actual desde token
     - Retornar datos del usuario

5. **Endpoints básicos de salud**
   - [ ] `GET /health` (público)
   - [ ] `GET /health/db` (verificar conexión a BD)

**Entregables:**
- ✅ Backend corriendo y accesible
- ✅ Autenticación completa funcionando
- ✅ Base de datos con modelos creados
- ✅ Endpoints de auth probados (con Postman/curl)

---

### **FASE 2: Backend - Gestión de Jobs y Targets** ⏱️ ~4-5 días

**Objetivo:** Permitir crear y gestionar escaneos (jobs) y targets.

#### Tareas:

1. **Endpoints de Targets**
   - [ ] `POST /targets` (protegido):
     - Validar URL
     - Crear target asociado al usuario
   - [ ] `GET /targets` (protegido):
     - Listar targets del usuario autenticado
   - [ ] `GET /targets/{id}` (protegido):
     - Obtener target específico (solo si es del usuario)
   - [ ] `DELETE /targets/{id}` (protegido):
     - Eliminar target (solo si es del usuario)

2. **Endpoints de Jobs**
   - [ ] `POST /jobs` (protegido):
     - Validar target_id (debe pertenecer al usuario)
     - Validar herramientas seleccionadas
     - Crear job con status "queued"
     - Retornar job creado
   - [ ] `GET /jobs` (protegido):
     - Listar jobs del usuario (con paginación)
     - Filtrar por status (opcional)
   - [ ] `GET /jobs/{id}` (protegido):
     - Obtener job específico (solo si es del usuario)
     - Incluir información del target
   - [ ] `GET /jobs/{id}/findings` (protegido):
     - Listar findings del job
     - Filtrar por severidad (opcional)

3. **Validación de URLs**
   - [ ] Implementar validación de formato de URL
   - [ ] Implementar whitelist de dominios permitidos (configurable)
   - [ ] Prevenir escaneos a localhost/IPs privadas (excepto en dev)

**Entregables:**
- ✅ CRUD completo de targets
- ✅ CRUD completo de jobs
- ✅ Validación de seguridad de URLs

---

### **FASE 3: Backend - Integración con Herramientas de Seguridad** ⏱️ ~7-10 días

**Objetivo:** Ejecutar herramientas de seguridad reales y normalizar resultados.

#### Tareas:

1. **Servicio de ejecución de escaneos**
   - [ ] Crear `services/scanner_service.py`:
     - Función para ejecutar contenedores Docker
     - Manejo de timeouts
     - Captura de logs y salidas
   - [ ] Implementar ejecución asíncrona (background tasks o workers)

2. **Integración con OWASP ZAP**
   - [ ] Crear `services/scanners/zap_scanner.py`:
     - Ejecutar `zap-baseline.py` en contenedor
     - Parsear salida JSON
     - Normalizar a modelo Finding
   - [ ] Probar con un target de prueba

3. **Integración con Nuclei**
   - [ ] Crear `services/scanners/nuclei_scanner.py`:
     - Ejecutar `nuclei -u <url> -json` en contenedor
     - Parsear salida JSON
     - Normalizar a modelo Finding
   - [ ] Probar con un target de prueba

4. **Integración con SSLyze**
   - [ ] Crear `services/scanners/sslyze_scanner.py`:
     - Ejecutar `sslyze --json_out` en contenedor
     - Parsear salida JSON
     - Normalizar a modelo Finding
   - [ ] Probar con un target de prueba

5. **Normalización de findings**
   - [ ] Crear `utils/normalizer.py`:
     - Mapear severidades de diferentes herramientas a estándar común
     - Extraer título, descripción, evidencia, recomendación
   - [ ] Guardar findings en BD asociados al job

6. **Actualización de estado de jobs**
   - [ ] Actualizar status: queued → running → done/failed
   - [ ] Guardar timestamps (started_at, finished_at)
   - [ ] Manejar errores y timeouts

**Entregables:**
- ✅ Al menos 3 herramientas de seguridad integradas
- ✅ Escaneos ejecutándose correctamente
- ✅ Findings normalizados guardados en BD

---

### **FASE 4: Backend - Métricas y Dashboard API** ⏱️ ~3-4 días

**Objetivo:** Proveer endpoints de métricas para el dashboard del frontend.

#### Tareas:

1. **Endpoint de resumen general**
   - [ ] `GET /metrics/summary`:
     - Total de jobs del usuario
     - Total de findings del usuario
     - Conteo por severidad (critical, high, medium, low, info)

2. **Endpoint de métricas por severidad**
   - [ ] `GET /metrics/by-severity`:
     - Retornar array: `[{severity: "critical", count: N}, ...]`

3. **Endpoint de métricas por herramienta**
   - [ ] `GET /metrics/by-tool`:
     - Retornar array: `[{tool: "ZAP", count: N}, ...]`

4. **Endpoint de timeline**
   - [ ] `GET /metrics/timeline`:
     - Retornar serie temporal de escaneos/findings
     - Agrupar por día/semana (configurable)
     - Formato: `[{date: "2024-01-01", jobs: N, findings: N}, ...]`

5. **Endpoint de top targets**
   - [ ] `GET /metrics/top-targets`:
     - Retornar top 5 targets con más findings
     - Incluir conteo de findings por target

**Entregables:**
- ✅ Todos los endpoints de métricas funcionando
- ✅ Datos filtrados por usuario autenticado
- ✅ Respuestas optimizadas para gráficas

---

### **FASE 5: Frontend - Base y Autenticación** ⏱️ ~4-5 días

**Objetivo:** Tener frontend funcionando con autenticación (Rol B).

#### Tareas:

1. **Configuración inicial del frontend**
   - [ ] Inicializar proyecto Next.js (App Router recomendado)
   - [ ] Configurar TypeScript
   - [ ] Instalar dependencias:
     - Tailwind CSS
     - Axios o fetch wrapper
     - Librería de gráficas (Recharts o Chart.js)
     - React Hook Form (opcional, para formularios)
   - [ ] Configurar estructura de carpetas:
     ```
     frontend/
     ├── src/
     │   ├── app/          # Next.js App Router
     │   ├── components/
     │   ├── hooks/
     │   ├── lib/
     │   ├── types/
     │   └── styles/
     ├── package.json
     └── next.config.js
     ```

2. **Cliente API**
   - [ ] Crear `lib/api.ts`:
     - Configurar base URL desde env
     - Función para hacer requests con token
     - Manejo de errores (401 → redirect a login)

3. **Gestión de autenticación**
   - [ ] Crear `hooks/useAuth.ts`:
     - Estado de usuario autenticado
     - Función de login
     - Función de logout
     - Verificación de token válido
   - [ ] Crear `lib/auth.ts`:
     - Guardar/obtener token (localStorage o cookies)
     - Validar expiración

4. **Pantallas de autenticación**
   - [ ] Página de login (`/login`):
     - Formulario email/password
     - Manejo de errores
     - Redirección a dashboard tras login exitoso
   - [ ] Página de registro (`/register`):
     - Formulario email/password
     - Validación de inputs
     - Redirección a login tras registro exitoso

5. **Protección de rutas**
   - [ ] Crear middleware o HOC para proteger rutas
   - [ ] Redirigir a login si no está autenticado

**Entregables:**
- ✅ Frontend corriendo y accesible
- ✅ Login y registro funcionando
- ✅ Rutas protegidas implementadas

---

### **FASE 6: Frontend - Dashboard de Métricas** ⏱️ ~5-6 días

**Objetivo:** Implementar dashboard principal con gráficas y KPIs.

#### Tareas:

1. **Página principal del dashboard**
   - [ ] Crear `/dashboard` (o `/` para usuarios autenticados)
   - [ ] Layout con navegación (header/sidebar)
   - [ ] Cargar datos de `/metrics/summary` al montar

2. **Componentes de KPIs**
   - [ ] Crear componente `KpiCard`:
     - Mostrar número total de escaneos
     - Mostrar número total de findings
     - Mostrar findings críticos/altos
   - [ ] Diseño responsive con Tailwind

3. **Gráficas de métricas**
   - [ ] Gráfica de barras: Findings por severidad
     - Usar datos de `/metrics/by-severity`
   - [ ] Gráfica de dona/pastel: Distribución de severidades
     - Mismo endpoint, diferente visualización
   - [ ] Gráfica de líneas: Timeline de escaneos/findings
     - Usar datos de `/metrics/timeline`
   - [ ] Gráfica de barras: Findings por herramienta
     - Usar datos de `/metrics/by-tool`

4. **Tabla de top targets**
   - [ ] Crear componente de tabla
   - [ ] Mostrar top 5 targets con más findings
   - [ ] Incluir enlaces a detalles del target

5. **Listado de últimos escaneos**
   - [ ] Mostrar últimos 5-10 jobs
   - [ ] Mostrar status, fecha, target
   - [ ] Enlace a detalle del job

**Entregables:**
- ✅ Dashboard visual y funcional
- ✅ Todas las gráficas renderizando datos reales
- ✅ Diseño responsive y profesional

---

### **FASE 7: Frontend - Gestión de Escaneos** ⏱️ ~4-5 días

**Objetivo:** Permitir crear y visualizar escaneos desde el frontend.

#### Tareas:

1. **Página de nuevo escaneo**
   - [ ] Crear `/scans/new`:
     - Formulario para seleccionar/crear target
     - Checkboxes para seleccionar herramientas (ZAP, Nuclei, SSLyze)
     - Botón para iniciar escaneo
   - [ ] Integrar con `POST /jobs`
   - [ ] Mostrar feedback de creación exitosa
   - [ ] Redirigir a detalle del job

2. **Página de listado de escaneos**
   - [ ] Crear `/scans`:
     - Tabla con todos los jobs del usuario
     - Filtros por status
     - Paginación
     - Enlaces a detalle de cada job

3. **Página de detalle de escaneo**
   - [ ] Crear `/scans/[id]`:
     - Información del job (status, target, herramientas, timestamps)
     - Listado de findings con:
       - Severidad (con badges de colores)
       - Título y descripción
       - Evidencia
       - Recomendación
       - Herramienta que lo detectó
     - Filtros por severidad
     - Botón para exportar reporte (futuro)

4. **Actualización en tiempo real**
   - [ ] Polling para actualizar status de jobs en ejecución
   - [ ] Mostrar indicador de progreso
   - [ ] Actualizar automáticamente cuando termine

**Entregables:**
- ✅ Flujo completo: crear escaneo → ver resultados
- ✅ Visualización clara de findings
- ✅ UX intuitiva y profesional

---

### **FASE 8: Mejoras y Pulido** ⏱️ ~3-4 días

**Objetivo:** Mejorar calidad, UX y completar funcionalidades pendientes.

#### Tareas:

1. **Manejo de errores**
   - [ ] Mejorar mensajes de error en frontend
   - [ ] Manejar casos edge (sin datos, errores de red)
   - [ ] Loading states en todas las operaciones asíncronas

2. **Validaciones y seguridad**
   - [ ] Validar inputs en frontend
   - [ ] Sanitizar datos mostrados (prevenir XSS)
   - [ ] Revisar y mejorar validaciones en backend

3. **Optimizaciones**
   - [ ] Optimizar queries de métricas (índices en BD)
   - [ ] Implementar caché donde sea apropiado
   - [ ] Mejorar tiempos de carga del dashboard

4. **Documentación de API**
   - [ ] Asegurar que FastAPI docs (`/docs`) estén completos
   - [ ] Documentar endpoints con ejemplos

5. **Testing básico**
   - [ ] Probar flujo completo end-to-end
   - [ ] Probar casos de error
   - [ ] Verificar autenticación en todos los endpoints

6. **Preparación para producción**
   - [ ] Revisar `docker-compose.prod.yml`
   - [ ] Asegurar que variables de entorno de prod estén documentadas
   - [ ] Crear guía de despliegue

**Entregables:**
- ✅ Sistema robusto y pulido
- ✅ Documentación completa
- ✅ Listo para demo/presentación

---

## 📅 Estimación Total

| Fase | Duración Estimada | Prioridad |
|------|-------------------|-----------|
| Fase 0: Preparación | 2-3 días | 🔴 Crítica |
| Fase 1: Backend Base + Auth | 5-7 días | 🔴 Crítica |
| Fase 2: Backend Jobs/Targets | 4-5 días | 🔴 Crítica |
| Fase 3: Integración Herramientas | 7-10 días | 🔴 Crítica |
| Fase 4: Backend Métricas | 3-4 días | 🟡 Alta |
| Fase 5: Frontend Base + Auth | 4-5 días | 🔴 Crítica |
| Fase 6: Frontend Dashboard | 5-6 días | 🟡 Alta |
| Fase 7: Frontend Escaneos | 4-5 días | 🟡 Alta |
| Fase 8: Mejoras y Pulido | 3-4 días | 🟢 Media |
| **TOTAL** | **37-49 días** | |

*Nota: Las estimaciones asumen trabajo a tiempo parcial (4-6 horas/día). Con trabajo full-time, se puede reducir a 3-4 semanas.*

---

## 🎯 Priorización para MVP (Minimum Viable Product)

Si el tiempo es limitado, priorizar en este orden:

1. **Fase 0** (Infraestructura) - Sin esto no se puede empezar
2. **Fase 1** (Backend Auth) - Requisito esencial
3. **Fase 5** (Frontend Auth) - Requisito esencial
4. **Fase 2** (Jobs/Targets) - Core functionality
5. **Fase 3** (Integración herramientas) - Core functionality
6. **Fase 6** (Dashboard) - Requisito del curso
7. **Fase 7** (Gestión escaneos) - Core functionality
8. **Fase 4** (Métricas API) - Puede hacerse en paralelo con Fase 6
9. **Fase 8** (Mejoras) - Nice to have

---

## 🔄 Flujo de Trabajo Recomendado

### Para Rol A (Backend & Seguridad):
1. Completar Fases 0, 1, 2, 3, 4 en secuencia
2. Comunicar contratos de API a Rol B
3. Proporcionar ejemplos de respuestas JSON

### Para Rol B (Frontend & Infraestructura):
1. Completar Fase 0 (scripts, env)
2. Esperar a que Rol A tenga Fase 1 lista (auth)
3. Completar Fase 5 (Frontend Auth) en paralelo con Fase 2 del backend
4. Completar Fases 6 y 7 cuando backend esté listo
5. Colaborar en Fase 8

### Trabajo en Paralelo:
- Fase 1 (Backend Auth) y Fase 5 (Frontend Auth) pueden hacerse en paralelo si se acuerdan contratos primero
- Fase 4 (Métricas API) y Fase 6 (Dashboard) pueden hacerse en paralelo
- Fase 8 puede empezar cuando las fases críticas estén completas

---

## 📝 Notas Importantes

1. **Autenticación es obligatoria**: No se puede omitir ni simplificar
2. **Dashboard con gráficas es requisito**: No solo tablas, deben haber visualizaciones
3. **Herramientas reales**: Deben ejecutarse realmente, no simularse
4. **Seguridad primero**: Validar inputs, proteger endpoints, manejar secretos correctamente
5. **Comunicación entre roles**: Mantener sincronización en contratos de API

---

## 🚀 Siguiente Paso Inmediato

**Empezar con Fase 0:**
1. Crear `env/.env.example`
2. Completar scripts de desarrollo
3. Verificar que el stack se levanta correctamente
4. Crear estructura base de carpetas

---

**Última actualización:** 2024  
**Mantenedor:** Equipo de desarrollo

