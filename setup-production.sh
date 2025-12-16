#!/bin/bash

# Script de configuración inicial para producción
# Ejecutar: bash setup-production.sh

set -e  # Salir si hay algún error

echo "========================================="
echo "  Configuración de Producción - CMS Admin"
echo "========================================="
echo ""

# Verificar Node.js
echo "✓ Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Error: Node.js no está instalado"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "  Node.js version: $NODE_VERSION"

# Verificar NPM
echo "✓ Verificando NPM..."
if ! command -v npm &> /dev/null; then
    echo "✗ Error: NPM no está instalado"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "  NPM version: $NPM_VERSION"

# Verificar PM2
echo "✓ Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "⚠ PM2 no está instalado. Instalando globalmente..."
    npm install -g pm2
    echo "  PM2 instalado correctamente"
else
    PM2_VERSION=$(pm2 -v)
    echo "  PM2 version: $PM2_VERSION"
fi

echo ""
echo "========================================="
echo "  Instalando dependencias del Backend"
echo "========================================="
cd backend
echo "✓ Instalando paquetes npm..."
npm install

echo "✓ Generando Prisma Client..."
npx prisma generate

echo "✓ Aplicando schema a la base de datos..."
npx prisma db push

# Preguntar si desea ejecutar seed
echo ""
read -p "¿Deseas crear el usuario admin y datos de ejemplo? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "✓ Ejecutando seed de base de datos..."
    npm run db:seed
fi

cd ..

echo ""
echo "========================================="
echo "  Instalando dependencias del Frontend"
echo "========================================="
cd frontend
echo "✓ Instalando paquetes npm..."
npm install
cd ..

echo ""
echo "========================================="
echo "  Compilando proyectos"
echo "========================================="
echo "✓ Compilando Backend..."
npm run build:backend

echo "✓ Compilando Frontend..."
npm run build:frontend

echo ""
echo "========================================="
echo "  Creando directorios necesarios"
echo "========================================="
mkdir -p backend/logs
mkdir -p backend/uploads/images
echo "✓ Directorios creados"

echo ""
echo "========================================="
echo "  Verificando configuración"
echo "========================================="

# Verificar que existe .env en backend
if [ ! -f backend/.env ]; then
    echo "⚠ ADVERTENCIA: No se encontró backend/.env"
    echo "  Creando archivo .env de ejemplo..."
    cat > backend/.env << 'EOF'
# Base de datos
DATABASE_URL="file:./dev.db"

# JWT - CAMBIAR ESTOS VALORES EN PRODUCCIÓN
JWT_SECRET="cambiar-este-secreto-en-produccion"
JWT_REFRESH_SECRET="cambiar-este-refresh-secreto-en-produccion"

# Servidor
PORT=4000
NODE_ENV=production

# CORS - Actualizar con tu dominio
CORS_ORIGIN="http://localhost:4000"
FRONTEND_URL="http://localhost:4000"

# Uploads
UPLOAD_PATH="./uploads"
EOF
    echo "  ⚠ IMPORTANTE: Editar backend/.env y cambiar los valores de JWT_SECRET antes de desplegar"
else
    echo "✓ Archivo backend/.env existe"
fi

echo ""
echo "========================================="
echo "  ¡Configuración completada!"
echo "========================================="
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Editar backend/.env con tus valores de producción:"
echo "   - JWT_SECRET"
echo "   - JWT_REFRESH_SECRET"
echo "   - CORS_ORIGIN"
echo "   - FRONTEND_URL"
echo ""
echo "2. Iniciar el servidor con PM2:"
echo "   npm run pm2:start"
echo ""
echo "3. Verificar que está corriendo:"
echo "   npm run pm2:status"
echo ""
echo "4. Ver logs:"
echo "   npm run pm2:logs"
echo ""
echo "5. Acceder a la aplicación:"
echo "   http://localhost:4000"
echo ""
echo "Credenciales por defecto:"
echo "  Email: admin@acueducto.com"
echo "  Password: admin123"
echo ""
echo "Para más información, leer DEPLOYMENT.md"
echo ""
