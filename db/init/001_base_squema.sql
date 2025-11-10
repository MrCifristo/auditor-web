-- Crea un esquema lógico para la app
CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION CURRENT_USER;

-- Asegura timezone consistente
ALTER DATABASE auditor_db SET TIMEZONE TO 'UTC';

-- Opcional: extensiones útiles para más adelante (Rol A las puede usar)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
