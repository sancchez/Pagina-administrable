# Guía Rápida de Deployment

## Resumen Ultra-Rápido

### Primera vez en el VPS

```bash
# 1. Clonar repo
git clone git@github.com:tu-usuario/tu-repo.git
cd tu-repo

# 2. Configurar .env
cp backend/.env.example backend/.env
nano backend/.env  # Editar con tus valores

# 3. Setup inicial
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed  # Opcional
cd ..

# 4. Deploy
chmod +x deploy.sh
bash deploy.sh

# 5. Auto-inicio
pm2 startup
pm2 save
```

### Actualizaciones (en el VPS)

```bash
git pull origin main
bash deploy.sh
```

### Desde tu PC Local

```bash
git add .
git commit -m "descripción cambios"
git push origin main
```

Luego en el VPS: `git pull && bash deploy.sh`

## Comandos Esenciales

```bash
# Estado
pm2 status

# Logs
pm2 logs pagina-admin-backend

# Reiniciar
pm2 restart pagina-admin-backend

# Detener
pm2 stop pagina-admin-backend

# Ver salud de la app
curl http://localhost:4000/health
```

## Qué NO subir a GitHub

✅ Ya está configurado en `.gitignore`:
- `backend/.env` (secretos)
- `node_modules/` (dependencias)
- `dist/` y `build/` (archivos compilados)
- `*.db` (base de datos)
- `uploads/` (archivos subidos)
- `logs/` (archivos de log)

## Variables de Entorno Importantes

En `backend/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="generar-con-openssl-rand-base64-32"
JWT_REFRESH_SECRET="generar-con-openssl-rand-base64-32"
SESSION_SECRET="generar-con-openssl-rand-base64-32"
PORT=4000
NODE_ENV=production
CORS_ORIGIN="https://tu-dominio.com"
FRONTEND_URL="https://tu-dominio.com"
```

## Flujo Completo Ilustrado

```
┌─────────────────┐
│   PC LOCAL      │
│                 │
│ 1. Editar código│
│ 2. git commit   │
│ 3. git push     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    GITHUB       │
│  (Repositorio)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      VPS        │
│                 │
│ 1. git pull     │
│ 2. deploy.sh    │
│    ├─ npm install
│    ├─ npm build
│    └─ pm2 restart
└─────────────────┘
```

## Checklist Pre-Deploy

- [ ] Backend `.env` configurado
- [ ] Secretos JWT generados (openssl rand -base64 32)
- [ ] CORS_ORIGIN actualizado con dominio real
- [ ] Firewall permite puerto 4000 (o tu puerto)
- [ ] PM2 instalado globalmente
- [ ] Base de datos inicializada (prisma db push)

## Checklist Post-Deploy

- [ ] `pm2 status` muestra "online"
- [ ] `curl http://localhost:4000/health` responde
- [ ] Logs de PM2 sin errores críticos
- [ ] Acceso a la app funciona desde navegador
- [ ] Login con credenciales admin funciona

## Problemas Comunes

**"Port already in use"**
```bash
pm2 delete all
pm2 start ecosystem.config.cjs
```

**"Module not found"**
```bash
cd backend && npm install
cd ../frontend && npm install
bash deploy.sh
```

**"Cannot connect to database"**
```bash
cd backend
npx prisma generate
npx prisma db push
```

## URLs Importantes

- App: `http://tu-ip:4000`
- Admin: `http://tu-ip:4000/admin/dashboard`
- API: `http://tu-ip:4000/api`
- Health: `http://tu-ip:4000/health`
- Docs: `http://tu-ip:4000/api-docs`

## Más Información

- Setup detallado VPS: [VPS-DEPLOYMENT.md](./VPS-DEPLOYMENT.md)
- Documentación completa: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Arquitectura del proyecto: [CLAUDE.md](./CLAUDE.md)
