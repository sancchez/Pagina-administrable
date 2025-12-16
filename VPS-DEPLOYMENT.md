# Guía de Despliegue en VPS

Esta guía describe cómo desplegar el CMS en un servidor VPS (Linux) usando Git y PM2.

## Flujo de Trabajo

```
Local (Desarrollo)          GitHub                VPS (Producción)
      │                        │                        │
      │   git commit           │                        │
      │   git push             │                        │
      ├───────────────────────>│                        │
      │                        │   git pull             │
      │                        │<───────────────────────┤
      │                        │   bash deploy.sh       │
      │                        │   (automático)         │
      │                        │                        │
```

## Configuración Inicial del VPS

### 1. Requisitos del Servidor

- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- Node.js 18+ y NPM 9+
- Git
- PM2
- Al menos 1GB de RAM
- Puerto 4000 abierto (o el que configures)

### 2. Instalar Dependencias

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (usando NodeSource para versión LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node -v  # Debe mostrar v20.x.x o superior
npm -v

# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar PM2
pm2 -v
```

### 3. Configurar Git en el VPS

```bash
# Configurar Git (si no lo has hecho)
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Generar clave SSH para GitHub (opcional pero recomendado)
ssh-keygen -t ed25519 -C "tu@email.com"
cat ~/.ssh/id_ed25519.pub
# Copiar la clave y agregarla en GitHub: Settings > SSH Keys
```

### 4. Clonar el Repositorio

```bash
# Ir al directorio donde quieres el proyecto (ejemplo: /var/www)
cd /var/www

# Clonar el repositorio
git clone git@github.com:tu-usuario/tu-repositorio.git
# O con HTTPS: git clone https://github.com/tu-usuario/tu-repositorio.git

# Entrar al directorio
cd tu-repositorio
```

### 5. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp backend/.env.example backend/.env

# Editar con tu editor favorito (nano, vim, etc.)
nano backend/.env
```

**Configuración mínima requerida en backend/.env:**

```env
# Base de datos
DATABASE_URL="file:./dev.db"

# JWT - GENERAR SECRETOS SEGUROS
JWT_SECRET="GENERAR_CON_COMANDO_ABAJO"
JWT_REFRESH_SECRET="GENERAR_CON_COMANDO_ABAJO"
SESSION_SECRET="GENERAR_CON_COMANDO_ABAJO"

# Servidor
PORT=4000
NODE_ENV=production

# CORS - Reemplazar con tu dominio
CORS_ORIGIN="https://tu-dominio.com,https://www.tu-dominio.com"
FRONTEND_URL="https://tu-dominio.com"

# Uploads
UPLOAD_PATH="./uploads"
```

**Generar secretos seguros:**

```bash
# Generar secretos aleatorios seguros
openssl rand -base64 32  # Para JWT_SECRET
openssl rand -base64 32  # Para JWT_REFRESH_SECRET
openssl rand -base64 32  # Para SESSION_SECRET
```

### 6. Configuración Inicial de la Base de Datos

```bash
cd backend

# Instalar dependencias
npm install

# Generar Prisma Client
npx prisma generate

# Crear base de datos y aplicar schema
npx prisma db push

# (Opcional) Crear usuario admin y datos de ejemplo
npm run db:seed

cd ..
```

### 7. Primera Compilación y Deploy

```bash
# Dar permisos de ejecución al script
chmod +x deploy.sh

# Ejecutar el script de deployment
bash deploy.sh
```

### 8. Configurar PM2 para Auto-inicio

```bash
# Generar script de startup
pm2 startup

# Ejecutar el comando que PM2 te muestra (ejemplo):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u tu-usuario --hp /home/tu-usuario

# Guardar configuración actual
pm2 save
```

### 9. Configurar Firewall (UFW)

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH (IMPORTANTE: antes de habilitar UFW)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Permitir puerto de la aplicación
sudo ufw allow 4000/tcp

# Si usas Nginx (puerto 80 y 443)
sudo ufw allow 'Nginx Full'

# Verificar estado
sudo ufw status
```

## Flujo de Deployment (Actualizaciones)

### Desde tu Máquina Local

```bash
# 1. Hacer cambios en el código
# 2. Hacer commit
git add .
git commit -m "Descripción de los cambios"

# 3. Subir a GitHub
git push origin main
```

### En el VPS

```bash
# 1. Conectarse al VPS
ssh usuario@tu-servidor-ip

# 2. Ir al directorio del proyecto
cd /var/www/tu-repositorio

# 3. Descargar últimos cambios
git pull origin main

# 4. Ejecutar script de deployment
bash deploy.sh
```

**¡Eso es todo!** El script `deploy.sh` automáticamente:
- Instala dependencias actualizadas
- Compila backend y frontend
- Reinicia PM2
- Verifica que todo esté corriendo

### Script de Deployment Automatizado

El archivo `deploy.sh` incluye:

1. ✅ Instalación de dependencias (backend y frontend)
2. ✅ Generación de Prisma Client
3. ✅ Compilación de TypeScript (backend)
4. ✅ Compilación de Vite (frontend)
5. ✅ Verificación de archivos compilados
6. ✅ Reinicio/inicio de PM2
7. ✅ Guardado de configuración PM2
8. ✅ Muestra estado final

### Comandos Útiles en el VPS

```bash
# Ver estado de PM2
pm2 status

# Ver logs en tiempo real
pm2 logs pagina-admin-backend

# Ver logs específicos
pm2 logs pagina-admin-backend --lines 100

# Reiniciar manualmente
pm2 restart pagina-admin-backend

# Detener
pm2 stop pagina-admin-backend

# Eliminar de PM2
pm2 delete pagina-admin-backend

# Ver información detallada
pm2 describe pagina-admin-backend

# Monitorear recursos
pm2 monit
```

## Configuración con Nginx (Recomendado para Producción)

Si quieres usar un dominio con HTTPS, configura Nginx como reverse proxy:

### 1. Instalar Nginx

```bash
sudo apt install nginx -y
```

### 2. Configurar Virtual Host

```bash
sudo nano /etc/nginx/sites-available/tu-dominio.com
```

**Contenido del archivo:**

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirigir a HTTPS (después de configurar SSL)
    # return 301 https://$host$request_uri;

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

    # Logs
    access_log /var/log/nginx/tu-dominio-access.log;
    error_log /var/log/nginx/tu-dominio-error.log;
}
```

### 3. Habilitar el sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/tu-dominio.com /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 4. Instalar SSL con Let's Encrypt (HTTPS)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Certbot configurará automáticamente HTTPS y renovación automática
```

### 5. Actualizar CORS en .env

Después de configurar tu dominio, actualiza el archivo `.env`:

```env
CORS_ORIGIN="https://tu-dominio.com,https://www.tu-dominio.com"
FRONTEND_URL="https://tu-dominio.com"
```

Y reinicia:

```bash
pm2 restart pagina-admin-backend
```

## Backup y Restauración

### Backup de Base de Datos

```bash
# Backup manual
cp backend/prisma/dev.db backend/prisma/backup-$(date +%Y%m%d-%H%M%S).db

# Script de backup automático (agregar a crontab)
# Crear script
nano ~/backup-db.sh
```

**Contenido de backup-db.sh:**

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/cms-admin"
mkdir -p $BACKUP_DIR
cp /var/www/tu-repositorio/backend/prisma/dev.db \
   $BACKUP_DIR/db-backup-$(date +%Y%m%d-%H%M%S).db
# Mantener solo los últimos 7 días
find $BACKUP_DIR -name "db-backup-*" -mtime +7 -delete
```

```bash
# Dar permisos
chmod +x ~/backup-db.sh

# Agregar a crontab (diario a las 2 AM)
crontab -e
# Agregar línea:
0 2 * * * /home/tu-usuario/backup-db.sh
```

### Restaurar Backup

```bash
# Detener aplicación
pm2 stop pagina-admin-backend

# Restaurar
cp backend/prisma/backup-YYYYMMDD-HHMMSS.db backend/prisma/dev.db

# Reiniciar
pm2 start pagina-admin-backend
```

## Troubleshooting

### Error: "Port 4000 already in use"

```bash
# Ver qué proceso usa el puerto
sudo lsof -i :4000

# Matar el proceso
pm2 delete pagina-admin-backend
# O encontrar PID y matarlo: kill -9 PID
```

### Error: "Cannot find module" después de git pull

```bash
# Reinstalar dependencias
cd backend && npm install
cd ../frontend && npm install
cd ..

# Ejecutar deploy
bash deploy.sh
```

### PM2 no inicia después de reiniciar servidor

```bash
# Verificar servicio de PM2
pm2 status

# Si no hay procesos, revisar startup
pm2 resurrect

# Si no funciona, configurar startup nuevamente
pm2 startup
pm2 save
```

### Base de datos corrupta

```bash
# Restaurar desde backup
pm2 stop pagina-admin-backend
cp backend/prisma/backup-mas-reciente.db backend/prisma/dev.db
pm2 start pagina-admin-backend
```

## Monitoreo y Logs

### Logs de Aplicación

```bash
# Ver logs en tiempo real
pm2 logs pagina-admin-backend

# Logs de errores solamente
pm2 logs pagina-admin-backend --err

# Logs de salida solamente
pm2 logs pagina-admin-backend --out

# Logs con marca de tiempo
pm2 logs --timestamp
```

### Logs de Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/tu-dominio-access.log

# Error logs
sudo tail -f /var/log/nginx/tu-dominio-error.log
```

### Monitoreo de Recursos

```bash
# Monitor de PM2
pm2 monit

# Uso de disco
df -h

# Uso de memoria
free -m

# Procesos de Node
ps aux | grep node
```

## Seguridad

1. **Mantén el sistema actualizado**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Cambia las credenciales por defecto** del admin

3. **Usa HTTPS** siempre en producción

4. **Configura firewall** (UFW)

5. **Backups automáticos** de la base de datos

6. **Mantén .env fuera de Git** (ya configurado en .gitignore)

7. **Usa SSH keys** para GitHub en lugar de HTTPS

8. **Configura fail2ban** para proteger SSH:
   ```bash
   sudo apt install fail2ban -y
   ```

## Recursos Adicionales

- [Documentación PM2](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

Para más información técnica del proyecto, consulta [DEPLOYMENT.md](./DEPLOYMENT.md) y [CLAUDE.md](./CLAUDE.md).
