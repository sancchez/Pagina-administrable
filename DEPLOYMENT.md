# Guía de Deployment para Producción

Esta guía explica cómo hacer el deployment de la aplicación Pagina Admin en un servidor de producción usando PM2.

## Arquitectura de Producción

En producción, la aplicación funciona de la siguiente manera:

```
┌─────────────────────────────────────────┐
│         Servidor (Puerto 4000)          │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Backend (Express + Node.js)      │  │
│  │                                   │  │
│  │  - API REST (/api/*)              │  │
│  │  - Archivos estáticos del frontend│  │
│  │  - SPA routing (todas las rutas)  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Frontend (React compilado)       │  │
│  │  Servido desde ./frontend/dist    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Base de datos (SQLite)           │  │
│  │  ./backend/prisma/db.sqlite       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**⚠️ IMPORTANTE:** No se necesita un servidor separado para el frontend. El backend sirve automáticamente los archivos compilados del frontend en modo producción, todo en el puerto 4000.

## Requisitos Previos

Antes de hacer el deployment, asegúrate de tener instalado:

1. **Node.js** >= 18.0.0
2. **npm** >= 9.0.0
3. **PM2** (se instalará automáticamente si no está presente)
4. **Git** (opcional, para clonar el repositorio)

## Proceso de Deployment

### Método 1: Deployment Automático (Recomendado) 🚀

El método más simple es usar el script `deploy.sh`:

```bash
# Desde la raíz del proyecto
chmod +x deploy.sh
./deploy.sh
```

Este script automáticamente:
1. ✅ Verifica que Node.js, npm y PM2 están instalados
2. ✅ Construye el frontend (React + Vite)
3. ✅ Construye el backend (TypeScript → JavaScript)
4. ✅ Genera el cliente de Prisma
5. ✅ Crea la base de datos si no existe
6. ✅ Detiene procesos PM2 existentes
7. ✅ Inicia la aplicación con PM2
8. ✅ Configura PM2 para reinicio automático al arrancar el sistema
9. ✅ Muestra el estado y logs de la aplicación

### Método 2: Deployment Manual

Si prefieres hacer el deployment paso a paso:

#### 1. Construir el Frontend

```bash
cd frontend
npm install --production=false
npm run build
cd ..
```

Esto generará los archivos estáticos en `frontend/dist/`.

#### 2. Construir el Backend

```bash
cd backend
npm install --production=false
npx prisma generate
npm run build
cd ..
```

Esto compilará TypeScript a JavaScript en `backend/dist/`.

#### 3. Configurar la Base de Datos

Si es la primera vez:

```bash
cd backend
npx prisma db push --accept-data-loss
npm run db:seed
cd ..
```

#### 4. Iniciar con PM2

```bash
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup systemd
```

## Configuración del Entorno

### Variables de Entorno

Edita el archivo `backend/.env` con la configuración de producción:

```env
# Base de datos (ruta relativa o absoluta)
DATABASE_URL="file:./prisma/db.sqlite"
# Para ruta absoluta: "file:/ruta/absoluta/al/proyecto/backend/prisma/db.sqlite"

# JWT - ⚠️ CAMBIAR ESTOS VALORES EN PRODUCCIÓN
JWT_SECRET="tu-secreto-super-seguro-aqui"
JWT_REFRESH_SECRET="otro-secreto-super-seguro-aqui"
SESSION_SECRET="session-secret-super-seguro"

# Servidor
PORT=4000
NODE_ENV=production

# CORS - Actualizar con tu dominio/IP
CORS_ORIGIN="http://tu-ip:4000,http://tu-dominio.com"
FRONTEND_URL="http://tu-ip:4000"

# Uploads
UPLOAD_PATH="./uploads"
```

**⚠️ IMPORTANTE:**
- Cambia los secretos JWT por valores únicos y seguros (usa generadores de contraseñas)
- Actualiza `CORS_ORIGIN` con la IP/dominio de tu servidor
- Si usas HTTPS, actualiza las URLs a `https://`
- La base de datos SQLite se crea automáticamente en `backend/prisma/db.sqlite`

## Gestión de la Aplicación

### Comandos PM2 Básicos

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs pagina-admin

# Ver últimas 100 líneas de logs
pm2 logs pagina-admin --lines 100

# Reiniciar
pm2 restart pagina-admin

# Detener
pm2 stop pagina-admin

# Iniciar
pm2 start pagina-admin

# Monitor en tiempo real con uso de CPU/memoria
pm2 monit

# Limpiar logs
pm2 flush

# Información detallada del proceso
pm2 describe pagina-admin
```

### Script de Utilidades Interactivo

Para facilitar la gestión, puedes usar el script `pm2-utils.sh` que proporciona un menú interactivo:

```bash
chmod +x pm2-utils.sh
./pm2-utils.sh
```

Este script ofrece opciones para:
- Ver estado de los servicios
- Ver y gestionar logs
- Reiniciar/detener/iniciar la aplicación
- Monitor en tiempo real
- Limpiar logs
- Redesplegar completamente
- Y más...

## Actualizar la Aplicación

Para actualizar a una nueva versión después de hacer cambios:

```bash
# Opción 1: Redespliegue completo (recomendado)
./deploy.sh

# Opción 2: Actualización manual
# 1. Obtener cambios (si usas git)
git pull origin main

# 2. Instalar nuevas dependencias si es necesario
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Recompilar
npm run build:prod

# 4. Reiniciar PM2
pm2 restart pagina-admin
```

El script `deploy.sh` se encarga automáticamente de:
- Recompilar frontend y backend
- Actualizar dependencias
- Actualizar Prisma client
- Reiniciar PM2 con la nueva versión

## Verificar el Deployment

Después del deployment, verifica que todo funciona correctamente:

### 1. Verificar que PM2 está corriendo

```bash
pm2 status
```

Deberías ver `pagina-admin` con estado `online`.

### 2. Ver los logs

```bash
pm2 logs pagina-admin --lines 20
```

Busca mensajes como:
- `Database connected successfully`
- `Server started successfully`
- `Server endpoints available`

### 3. Probar la API

```bash
# Health check
curl http://localhost:4000/health

# Deberías recibir algo como:
# {"success":true,"message":"Server is running",...}
```

### 4. Probar el Frontend

Abre en tu navegador: `http://tu-ip:4000`

Deberías ver la página de inicio de la aplicación.

### 5. Acceder al Panel de Administración

- **URL**: `http://tu-ip:4000/admin/dashboard`
- **Email**: admin@acueducto.com
- **Password**: admin123

**⚠️ IMPORTANTE**: Cambia estas credenciales inmediatamente después del primer acceso.

## Estructura de Archivos de Producción

```
/
├── backend/
│   ├── dist/              # Código compilado del backend (TypeScript → JS)
│   ├── uploads/           # Archivos subidos por usuarios
│   ├── prisma/
│   │   └── db.sqlite      # Base de datos SQLite
│   ├── logs/              # Logs de PM2
│   │   ├── pm2-out.log    # Logs estándar
│   │   └── pm2-error.log  # Logs de error
│   └── .env               # Variables de entorno
├── frontend/
│   └── dist/              # Build del frontend (servido por backend)
├── ecosystem.config.cjs   # Configuración de PM2
├── deploy.sh              # Script de deployment automático
└── pm2-utils.sh           # Script de utilidades
```

## Monitoreo

### Logs de PM2

Los logs se guardan automáticamente en:
- `backend/logs/pm2-out.log` - Logs estándar (info, database, server)
- `backend/logs/pm2-error.log` - Logs de error

### Ver Logs

```bash
# Logs en tiempo real
pm2 logs pagina-admin

# Últimas 100 líneas
pm2 logs pagina-admin --lines 100

# Solo errores
pm2 logs pagina-admin --err

# Solo salida estándar
pm2 logs pagina-admin --out

# Sin streaming (no se queda esperando)
pm2 logs pagina-admin --lines 50 --nostream
```

### Monitoreo de Recursos

```bash
# Monitor en tiempo real (CPU, memoria)
pm2 monit

# Información detallada del proceso
pm2 describe pagina-admin

# Lista de todos los procesos
pm2 list
```

## Troubleshooting

### El servidor no inicia

1. **Verificar los logs:**
   ```bash
   pm2 logs pagina-admin --err --lines 50
   ```

2. **Verificar que el puerto 4000 no esté en uso:**
   ```bash
   # Linux/Mac
   lsof -i :4000

   # Windows
   netstat -ano | findstr :4000
   ```

   Si el puerto está en uso, detén el proceso o cambia el puerto en `.env`.

3. **Verificar que los archivos compilados existen:**
   ```bash
   ls -la backend/dist/index.js
   ls -la frontend/dist/index.html
   ```

   Si no existen, ejecuta `./deploy.sh` nuevamente.

4. **Verificar el archivo .env:**
   ```bash
   cat backend/.env
   ```

   Asegúrate de que `NODE_ENV=production` y las rutas sean correctas.

### Error de base de datos

1. **Verificar que la base de datos existe:**
   ```bash
   ls -la backend/prisma/db.sqlite
   ```

2. **Regenerar Prisma client:**
   ```bash
   cd backend
   npx prisma generate
   ```

3. **Recrear la base de datos:**
   ```bash
   cd backend
   # Backup de la base de datos actual (si existe)
   cp prisma/db.sqlite prisma/db.sqlite.backup

   # Recrear
   rm prisma/db.sqlite
   npx prisma db push --accept-data-loss
   npm run db:seed
   ```

4. **Verificar permisos:**
   ```bash
   chmod 644 backend/prisma/db.sqlite
   chmod 755 backend/prisma
   ```

### El frontend no se comunica con el backend

En producción, el frontend está servido por el backend en el mismo puerto (4000), por lo que no debería haber problemas de CORS.

1. **Verificar que NODE_ENV=production:**
   ```bash
   grep NODE_ENV backend/.env
   ```

2. **Verificar que frontend/dist existe:**
   ```bash
   ls -la frontend/dist/index.html
   ```

3. **Verificar los logs del backend:**
   ```bash
   pm2 logs pagina-admin --lines 50
   ```

   Busca el mensaje: `Frontend build servido desde backend`

4. **Probar directamente la API:**
   ```bash
   curl http://localhost:4000/api
   ```

### Error de permisos

```bash
# Dar permisos de ejecución a los scripts
chmod +x deploy.sh pm2-utils.sh

# Verificar permisos de la base de datos
chmod 644 backend/prisma/db.sqlite
chmod 755 backend/prisma

# Verificar permisos de uploads
chmod 755 backend/uploads
```

### PM2 no guarda la configuración

```bash
# Eliminar configuración anterior
pm2 delete all
pm2 save --force

# Volver a deployar
./deploy.sh
```

### Alto uso de memoria

Editar `ecosystem.config.cjs` y ajustar `max_memory_restart`:

```javascript
max_memory_restart: '2G'  // Aumentar de 1G a 2G si es necesario
```

Luego reiniciar:
```bash
pm2 restart pagina-admin
```

### El proceso se reinicia constantemente

Verifica los logs para identificar el problema:
```bash
pm2 logs pagina-admin --err --lines 100
```

Causas comunes:
- Error en el código (verifica los logs de error)
- Puerto ya en uso
- Base de datos corrupta o inaccesible
- Falta de memoria

### Página en blanco o error 404

1. **Limpiar caché del navegador** (Ctrl+Shift+R)

2. **Verificar que el frontend se compiló:**
   ```bash
   ls -la frontend/dist/
   ```

3. **Verificar configuración en app.ts:**
   El backend debe estar configurado para servir archivos estáticos en producción (líneas 200-217 en `backend/src/app.ts`).

4. **Reiniciar PM2:**
   ```bash
   pm2 restart pagina-admin
   ```

## Configuración de Firewall

Si usas un firewall (ufw, iptables), asegúrate de abrir el puerto 4000:

```bash
# Para UFW (Ubuntu/Debian)
sudo ufw allow 4000/tcp
sudo ufw reload
sudo ufw status

# Para iptables
sudo iptables -A INPUT -p tcp --dport 4000 -j ACCEPT
sudo iptables-save

# Para firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=4000/tcp
sudo firewall-cmd --reload
```

## Producción con Nginx (Opcional)

Si deseas usar Nginx como reverse proxy (recomendado para HTTPS):

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirigir a HTTPS (si tienes certificado SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Tamaño máximo de archivos subidos
    client_max_body_size 10M;
}

# Para HTTPS (con certificado SSL - Let's Encrypt recomendado)
# server {
#     listen 443 ssl http2;
#     server_name tu-dominio.com www.tu-dominio.com;
#
#     ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
#
#     location / {
#         proxy_pass http://localhost:4000;
#         # ... resto de la configuración
#     }
# }
```

Después de configurar Nginx:
```bash
sudo nginx -t              # Verificar configuración
sudo systemctl reload nginx # Recargar Nginx
```

## Backup y Restauración

### Crear Backup

```bash
# Crear directorio de backups si no existe
mkdir -p backups

# Backup de la base de datos
cp backend/prisma/db.sqlite backups/db.sqlite.$(date +%Y%m%d_%H%M%S)

# Backup de los uploads
tar -czf backups/uploads.$(date +%Y%m%d_%H%M%S).tar.gz backend/uploads/

# Backup completo (base de datos + uploads + .env)
tar -czf backups/full-backup.$(date +%Y%m%d_%H%M%S).tar.gz \
    backend/prisma/db.sqlite \
    backend/uploads/ \
    backend/.env
```

### Script de Backup Automático

Crea un script `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="$HOME/backups/pagina-admin"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup de base de datos
cp backend/prisma/db.sqlite "$BACKUP_DIR/db-$DATE.sqlite"

# Backup de uploads
tar -czf "$BACKUP_DIR/uploads-$DATE.tar.gz" backend/uploads/

# Eliminar backups antiguos (más de 30 días)
find "$BACKUP_DIR" -name "*.sqlite" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "Backup completado: $DATE"
```

Programa el backup con cron:
```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 3 AM
0 3 * * * /ruta/al/proyecto/backup.sh >> /var/log/backup.log 2>&1
```

### Restaurar Backup

```bash
# Detener el servidor
pm2 stop pagina-admin

# Restaurar base de datos
cp backups/db.sqlite.YYYYMMDD_HHMMSS backend/prisma/db.sqlite

# Restaurar uploads
rm -rf backend/uploads/
tar -xzf backups/uploads.YYYYMMDD_HHMMSS.tar.gz -C .

# Reiniciar el servidor
pm2 start pagina-admin

# Verificar que todo funciona
pm2 logs pagina-admin --lines 20
```

## Seguridad

1. **Cambiar credenciales por defecto** inmediatamente
2. **Usar HTTPS** en producción (con certificado SSL)
3. **Configurar firewall** para limitar acceso al puerto 4000
4. **Actualizar secretos** en `.env` (JWT_SECRET, JWT_REFRESH_SECRET, SESSION_SECRET)
5. **Configurar backups automáticos** de la base de datos
6. **Revisar logs regularmente** para detectar actividad sospechosa

## Soporte

Para problemas o preguntas, revisar:
- [CLAUDE.md](./CLAUDE.md) - Documentación técnica del proyecto
- [README.md](./README.md) - Información general
- Logs de PM2: `npm run pm2:logs`
