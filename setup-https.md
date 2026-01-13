# Configurar HTTPS con Let's Encrypt

Si prefieres usar HTTPS correctamente en lugar de forzar HTTP:

## Opción 1: Con Nginx (Recomendado)

### 1. Instalar Nginx y Certbot

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install nginx certbot python3-certbot-nginx
```

### 2. Configurar Nginx

Crear archivo `/etc/nginx/sites-available/pagina-admin`:

```nginx
server {
    listen 80;
    server_name 155.117.40.245;  # O tu dominio si tienes uno

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
    }

    client_max_body_size 10M;
}
```

### 3. Habilitar el sitio

```bash
sudo ln -s /etc/nginx/sites-available/pagina-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Obtener Certificado SSL (Si tienes un dominio)

**IMPORTANTE:** Let's Encrypt NO funciona con IPs directas. Necesitas un dominio.

Si tienes un dominio:

```bash
sudo certbot --nginx -d tu-dominio.com
```

### 5. Si NO tienes dominio (usar certificado autofirmado)

```bash
# Generar certificado autofirmado
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt

# Actualizar configuración de Nginx
sudo nano /etc/nginx/sites-available/pagina-admin
```

Agregar bloque HTTPS:

```nginx
server {
    listen 443 ssl http2;
    server_name 155.117.40.245;

    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

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
    }

    client_max_body_size 10M;
}

# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name 155.117.40.245;
    return 301 https://$server_name$request_uri;
}
```

Reiniciar Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

**Nota:** Con certificado autofirmado, el navegador mostrará advertencia de seguridad. Tendrás que aceptarla manualmente.

## Opción 2: Obtener un Dominio Gratis

Servicios que ofrecen dominios/subsubdominios gratis:

1. **DuckDNS** (duckdns.org)
   - Subdominio gratis: `tu-nombre.duckdns.org`
   - Compatible con Let's Encrypt

2. **No-IP** (noip.com)
   - Subdominio gratis con plan free

3. **Freenom** (freenom.com)
   - Dominios .tk, .ml, .ga, .cf gratis

### Ejemplo con DuckDNS

1. Registrarse en duckdns.org
2. Crear subdominio: `mi-acueducto.duckdns.org`
3. Apuntar a tu IP: `155.117.40.245`
4. Usar Certbot:

```bash
sudo certbot --nginx -d mi-acueducto.duckdns.org
```

## Actualizar Backend .env

Una vez configurado HTTPS, actualizar `backend/.env`:

```env
CORS_ORIGIN="https://tu-dominio.com,https://155.117.40.245"
FRONTEND_URL="https://tu-dominio.com"
```

Reiniciar PM2:

```bash
pm2 restart pagina-admin
```

## Verificar

```bash
# HTTP debería redirigir a HTTPS
curl -I http://tu-dominio.com

# HTTPS debería funcionar
curl -I https://tu-dominio.com
```

## Firewall

Abrir puerto HTTPS:

```bash
# UFW
sudo ufw allow 443/tcp
sudo ufw reload

# Firewalld
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Renovación Automática (Let's Encrypt)

Certbot configura renovación automática. Verificar:

```bash
sudo certbot renew --dry-run
```

---

**¿Necesitas ayuda para configurar HTTPS? Avísame y te guío paso a paso.**
