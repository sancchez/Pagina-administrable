# Guía de Instalación para VPS (IP: 155.117.40.245)

Esta guía específica asume que tienes acceso `root` o `sudo` en tu servidor **155.117.40.245**.

### Paso 1: Acceder al Servidor

```bash
ssh administrator@155.117.40.245
# (Ingresa tu contraseña de ese usuario si es necesario)
```

### Paso 2: Preparar el Entorno

Como estás usando el usuario `administrator`, usaremos `sudo` para instalar los paquetes.

```bash
# 1. Actualizar repositorios
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js (Versión 20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Instalar Nginx y Git (Al instalar nginx se crea /var/www)
sudo apt install -y nginx git

# 4. Instalar PM2 globalmente
sudo npm install -g pm2
```


### Paso 3: Configurar Permisos y Clonar

La carpeta `/var/www` se crea automáticamente al instalar Nginx. Ahora debemos darte permisos para escribir en ella sin usar sudo todo el tiempo.

```bash
# Asignar permisos a tu usuario actual
sudo chown -R $USER:$USER /var/www

# Crear directorio del proyecto
mkdir -p /var/www/Pagina-administrable
cd /var/www/Pagina-administrable

# Clonar repo (o copiar archivos)
# Si clonas:
git clone https://github.com/sancchez/Pagina-administrable.git .
```


## Paso 4: Configurar Variables de Entorno

```bash
cd backend
cp .env.example .env
nano .env
```
Asegúrate de que el puerto sea 4000:
```env
PORT=4000
DATABASE_URL="file:./dev.db" 
# ... configura tus secretos JWT ...
```
*(Para salir de nano: `Ctrl+X`, luego `Y`, luego `Enter`)*

Volver a la raíz:
```bash
cd ..
```

## Paso 5: Compilar y Desplegar Aplicación

Usa el script `deploy.sh` que ya tienes, pero asegúrate de que tenga permisos:

```bash
chmod +x deploy.sh
./deploy.sh
```
*Este script instalará dependencias y construirá el `frontend/dist` y `backend/dist`.*

## Paso 6: Configurar Nginx

Hemos creado un archivo `nginx.conf` en tu proyecto. Úsalo para configurar el servidor.

```bash
# 1. Borrar configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# 2. Crear nueva configuración
sudo nano /etc/nginx/sites-available/pagina-admin
```


**Copia y pega el contenido exacto del archivo `nginx.conf` que está en tu proyecto.** 
(O copia el bloque de abajo si no lo tienes a mano):

```nginx
server {
    listen 80;
    server_name 155.117.40.245;

    root /var/www/Pagina-administrable/frontend/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/Pagina-administrable/backend/uploads;
        try_files $uri =404;
    }
     location /api/uploads {
        alias /var/www/Pagina-administrable/backend/uploads;
        try_files $uri =404;
    }
}
```

Guardar y salir (`Ctrl+X`, `Y`, `Enter`).

```bash
# 3. Activar el sitio
sudo ln -s /etc/nginx/sites-available/pagina-admin /etc/nginx/sites-enabled/

# 4. Verificar errores de sintaxis
sudo nginx -t

# 5. Reiniciar Nginx
sudo systemctl restart nginx
```


## Paso 7: Verificar

Abre tu navegador e ingresa:
`http://155.117.40.245`

¡Deberías ver tu aplicación funcionando!
