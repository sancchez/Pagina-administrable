@echo off
REM Script de deployment para producción en Windows
REM Este script construye el frontend y backend, y los despliega con PM2

echo 🚀 Iniciando deployment de producción...

REM 1. Construir el frontend
echo 📦 Construyendo frontend...
cd frontend
echo 🧹 Limpiando caché...
if exist node_modules\.vite rd /s /q node_modules\.vite
call npm install
call npm run build
cd ..

REM 2. Construir el backend
echo 📦 Construyendo backend...
cd backend
call npm install
call npx prisma generate
call npm run build
cd ..

REM 3. Detener PM2 si está corriendo
echo ⏹️  Deteniendo servicios PM2...
pm2 stop ecosystem.config.cjs 2>nul
pm2 delete ecosystem.config.cjs 2>nul

REM 4. Iniciar con PM2
echo ▶️  Iniciando servicios con PM2...
pm2 start ecosystem.config.cjs

REM 5. Guardar configuración PM2
echo 💾 Guardando configuración PM2...
pm2 save

echo ✅ Deployment completado!
echo.
echo 📊 Estado de los servicios:
pm2 status

echo.
echo 🌐 La aplicación está disponible en:
echo    http://155.117.40.245:4000
echo.
echo 📝 Comandos útiles:
echo    pm2 logs pagina-admin          - Ver logs
echo    pm2 restart pagina-admin       - Reiniciar
echo    pm2 stop pagina-admin          - Detener
echo    pm2 monit                      - Monitor en tiempo real
