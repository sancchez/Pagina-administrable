# Guía de Despliegue a Producción

Este documento describe cómo desplegar el proyecto CMS de administración en producción usando PM2.

## Requisitos Previos

1. **Node.js** v18 o superior
2. **NPM** v9 o superior
3. **PM2** instalado globalmente:
   ```bash
   npm install -g pm2
   ```

## Configuración Inicial

### 1. Variables de Entorno del Backend

Crear o actualizar el archivo `backend/.env` para producción:

```env
# Base de datos
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="tu-secreto-jwt-muy-seguro-aqui"
JWT_REFRESH_SECRET="tu-secreto-refresh-jwt-muy-seguro-aqui"
SESSION_SECRET="tu-secreto-session-muy-seguro-aqui"

# Servidor
PORT=4000
NODE_ENV=production

# CORS
CORS_ORIGIN="http://tu-dominio.com,https://tu-dominio.com"
FRONTEND_URL="https://tu-dominio.com"

# Uploads
UPLOAD_PATH="./uploads"
```

**IMPORTANTE**: Cambiar los valores de `JWT_SECRET`, `JWT_REFRESH_SECRET` y `SESSION_SECRET` por valores seguros únicos.

### 2. Instalar Dependencias

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed  # Opcional: solo si necesitas datos iniciales

# Frontend
cd ../frontend
npm install

# Volver a la raíz
cd ..
```

## Despliegue Completo (Primera vez)

Desde la raíz del proyecto, ejecutar:

```bash
npm run deploy
```

Este comando:
1. Compila el backend (TypeScript → JavaScript en `backend/dist/`)
2. Compila el frontend (Vite → archivos optimizados en `frontend/dist/`)
3. Inicia el servidor con PM2

## Comandos de PM2

Todos los comandos se ejecutan desde la raíz del proyecto:

### Iniciar el servidor
```bash
npm run pm2:start
```

### Detener el servidor
```bash
npm run pm2:stop
```

### Reiniciar el servidor (después de cambios)
```bash
npm run pm2:restart
```

### Ver logs en tiempo real
```bash
npm run pm2:logs
```

### Ver estado del servidor
```bash
npm run pm2:status
```

### Comandos manuales de PM2
```bash
# Ver todos los procesos
pm2 list

# Eliminar el proceso de PM2
pm2 delete pagina-admin-backend

# Guardar configuración de PM2 (para auto-inicio)
pm2 save

# Configurar PM2 para iniciar al arrancar el sistema
pm2 startup
```

## Actualizar el Proyecto en Producción

Cuando tengas cambios nuevos:

```bash
# 1. Descargar cambios (si usas git)
git pull

# 2. Instalar nuevas dependencias si es necesario
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Recompilar y reiniciar
npm run build:prod
npm run pm2:restart
```

## Estructura de Archivos de Producción

```
/
├── backend/
│   ├── dist/              # Código compilado del backend (generado)
│   ├── uploads/           # Archivos subidos
│   ├── prisma/
│   │   └── dev.db         # Base de datos SQLite
│   └── logs/              # Logs de PM2 (generado)
├── frontend/
│   └── dist/              # Build del frontend (generado)
└── ecosystem.config.cjs   # Configuración de PM2
```

## Acceso a la Aplicación

Una vez desplegada, la aplicación estará disponible en:

- **URL Principal**: `http://localhost:4000` o `http://tu-ip:4000`
- **Panel Admin**: `http://localhost:4000/admin/dashboard`
- **API**: `http://localhost:4000/api`
- **Documentación API**: `http://localhost:4000/api-docs`
- **Health Check**: `http://localhost:4000/health`

### Credenciales por defecto
- **Email**: admin@acueducto.com
- **Password**: admin123

**IMPORTANTE**: Cambiar estas credenciales después del primer acceso.

## Monitoreo y Logs

### Ver logs
```bash
# Logs en tiempo real
npm run pm2:logs

# Logs específicos
pm2 logs pagina-admin-backend --lines 100

# Solo errores
pm2 logs pagina-admin-backend --err

# Solo salida estándar
pm2 logs pagina-admin-backend --out
```

### Ubicación de logs
- **PM2 Logs**: `backend/logs/pm2-error.log` y `backend/logs/pm2-out.log`
- **Application Logs**: Según configuración de Winston en el backend

## Troubleshooting

### El servidor no inicia
1. Verificar que el puerto 4000 no esté en uso:
   ```bash
   netstat -ano | findstr :4000  # Windows
   lsof -i :4000                 # Linux/Mac
   ```

2. Verificar logs de PM2:
   ```bash
   npm run pm2:logs
   ```

3. Verificar que los archivos compilados existen:
   ```bash
   ls backend/dist/
   ls frontend/dist/
   ```

### Error de base de datos
1. Regenerar Prisma client:
   ```bash
   cd backend
   npx prisma generate
   ```

2. Aplicar migraciones:
   ```bash
   npx prisma db push
   ```

### Error 502 o página en blanco
1. Verificar que el frontend se compiló correctamente:
   ```bash
   ls frontend/dist/index.html
   ```

2. Revisar la configuración de `NODE_ENV` en `backend/.env`

3. Reiniciar el servidor:
   ```bash
   npm run pm2:restart
   ```

### Alto uso de memoria
Editar `ecosystem.config.cjs` y ajustar `max_memory_restart`:

```javascript
max_memory_restart: '2G'  // Aumentar de 1G a 2G
```

## Producción con Nginx (Opcional)

Si deseas usar Nginx como reverse proxy:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

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
}
```

## Backup de Base de Datos

La base de datos SQLite está en `backend/prisma/dev.db`. Para hacer backup:

```bash
# Backup manual
cp backend/prisma/dev.db backend/prisma/dev.db.backup

# Backup automático con fecha
cp backend/prisma/dev.db backend/prisma/dev.db.$(date +%Y%m%d_%H%M%S)
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
