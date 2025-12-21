# 🚀 Quick Start - Deployment a Producción

Guía rápida para deployar la aplicación en producción con PM2.

## ⚡ Deployment en 1 Comando

```bash
chmod +x deploy.sh
./deploy.sh
```

¡Eso es todo! El script hace todo automáticamente.

## 📋 Lo que hace el script automáticamente:

✅ Verifica que Node.js, npm y PM2 están instalados
✅ Construye el frontend (React + Vite)
✅ Construye el backend (TypeScript → JavaScript)
✅ Genera el cliente de Prisma
✅ Crea la base de datos si no existe
✅ Detiene procesos PM2 existentes
✅ Inicia la aplicación con PM2
✅ Configura PM2 para reinicio automático
✅ Muestra estado y logs

## 🌐 Acceso a la Aplicación

Una vez desplegada:

- **Frontend/API**: `http://tu-ip:4000`
- **Panel Admin**: `http://tu-ip:4000/admin/dashboard`
- **Health Check**: `http://tu-ip:4000/health`

### Credenciales por defecto:
- **Email**: admin@acueducto.com
- **Password**: admin123

⚠️ **Cambia estas credenciales inmediatamente después del primer acceso**

## 🔧 Configuración Previa (IMPORTANTE)

Antes del primer deployment, edita `backend/.env`:

```env
# Cambia estos valores por secretos seguros
JWT_SECRET="tu-secreto-super-seguro-aqui"
JWT_REFRESH_SECRET="otro-secreto-super-seguro-aqui"
SESSION_SECRET="session-secret-super-seguro"

# Actualiza con tu IP/dominio
CORS_ORIGIN="http://tu-ip:4000"
FRONTEND_URL="http://tu-ip:4000"
```

## 📊 Gestión de la Aplicación

### Comandos Rápidos PM2

```bash
pm2 status              # Ver estado
pm2 logs pagina-admin   # Ver logs en tiempo real
pm2 restart pagina-admin # Reiniciar
pm2 stop pagina-admin   # Detener
pm2 monit               # Monitor con CPU/memoria
```

### Script de Utilidades Interactivo

```bash
chmod +x pm2-utils.sh
./pm2-utils.sh
```

Menú interactivo con todas las opciones de gestión.

## 🔄 Actualizar la Aplicación

Cuando hagas cambios, simplemente:

```bash
./deploy.sh
```

El script se encarga de todo: recompilar, actualizar dependencias y reiniciar.

## ❓ Problemas Comunes

### Error SSL_PROTOCOL_ERROR o CONNECTION_RESET

Si ves errores como `ERR_SSL_PROTOCOL_ERROR` en el navegador:

**Causa:** El navegador intenta usar HTTPS pero el servidor está en HTTP.

**Solución:**
1. Accede a `http://tu-ip:4000` (SIN la 's' en https)
2. Limpia caché del navegador (Ctrl+Shift+Delete)
3. O usa modo incógnito

**Verificar configuración:**
```bash
chmod +x check-config.sh
./check-config.sh
```

### El servidor no inicia

```bash
# Ver logs de error
pm2 logs pagina-admin --err --lines 50

# Verificar que el puerto 4000 no está en uso
lsof -i :4000  # Linux/Mac
netstat -ano | findstr :4000  # Windows
```

### Puerto 4000 en uso / Procesos duplicados

```bash
# Limpiar todo y reiniciar
chmod +x cleanup.sh
./cleanup.sh
./deploy.sh
```

### Página en blanco

```bash
# Limpiar caché del navegador (Ctrl+Shift+R)
# Verificar que el frontend se compiló
ls -la frontend/dist/index.html

# Reiniciar PM2
pm2 restart pagina-admin
```

### Error de base de datos

```bash
cd backend
npx prisma generate
npx prisma db push
```

## 📚 Documentación Completa

Para más detalles, consulta:

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de deployment
- **[CLAUDE.md](./CLAUDE.md)** - Documentación técnica del proyecto
- **[README.md](./README.md)** - Información general

## 🆘 Ayuda

Si tienes problemas:

1. Revisa los logs: `pm2 logs pagina-admin`
2. Consulta el [Troubleshooting en DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)
3. Verifica el archivo `.env` del backend

---

**Arquitectura en Producción:**

```
Puerto 4000 → Backend (Express)
              ├── Sirve API REST (/api/*)
              ├── Sirve Frontend compilado (React)
              └── Maneja SPA routing
```

**No se necesita servidor separado para el frontend en producción.**
