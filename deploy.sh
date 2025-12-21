#!/bin/bash

# Script de deployment para producción
# Este script construye el frontend y backend, y los despliega con PM2

set -e  # Salir si hay algún error

echo "🚀 Iniciando deployment de producción..."

# 1. Construir el frontend
echo "📦 Construyendo frontend..."
cd frontend
echo "🧹 Limpiando caché..."
rm -rf node_modules/.vite
npm install
npm run build
cd ..

# 2. Construir el backend
echo "📦 Construyendo backend..."
cd backend
npm install
npx prisma generate
npm run build
cd ..

# 3. Detener PM2 si está corriendo
echo "⏹️  Deteniendo servicios PM2..."
pm2 stop ecosystem.config.cjs || true
pm2 delete ecosystem.config.cjs || true

# 4. Iniciar con PM2
echo "▶️  Iniciando servicios con PM2..."
pm2 start ecosystem.config.cjs

# 5. Guardar configuración PM2
echo "💾 Guardando configuración PM2..."
pm2 save

echo "✅ Deployment completado!"
echo ""
echo "📊 Estado de los servicios:"
pm2 status

echo ""
echo "🌐 La aplicación está disponible en:"
echo "   http://2.58.80.90:4000"
echo ""
echo "📝 Comandos útiles:"
echo "   pm2 logs pagina-admin          - Ver logs"
echo "   pm2 restart pagina-admin       - Reiniciar"
echo "   pm2 stop pagina-admin          - Detener"
echo "   pm2 monit                      - Monitor en tiempo real"
