#!/bin/bash

# Script de deployment para VPS
# Ejecutar en el servidor después de hacer git pull

set -e  # Salir si hay algún error

echo "========================================="
echo "  Deployment - CMS Admin"
echo "========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mensajes
info() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "ecosystem.config.cjs" ]; then
    error "No se encontró ecosystem.config.cjs"
    error "Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

info "Iniciando proceso de deployment..."

# 1. Instalar/actualizar dependencias del backend
echo ""
echo "1. Actualizando dependencias del backend..."
cd backend
if [ -f "package-lock.json" ]; then
    npm ci --production=false
else
    npm install
fi
info "Dependencias del backend actualizadas"

# 2. Generar Prisma Client
echo ""
echo "2. Generando Prisma Client..."
npx prisma generate
info "Prisma Client generado"

# 3. Aplicar migraciones de base de datos (opcional, comentado por seguridad)
# Descomentar si quieres aplicar migraciones automáticamente
# echo ""
# echo "3. Aplicando migraciones de base de datos..."
# npx prisma migrate deploy
# info "Migraciones aplicadas"

cd ..

# 4. Instalar/actualizar dependencias del frontend
echo ""
echo "3. Actualizando dependencias del frontend..."
cd frontend
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi
info "Dependencias del frontend actualizadas"
cd ..

# 5. Compilar backend
echo ""
echo "4. Compilando backend..."
cd backend
npm run build
info "Backend compilado exitosamente"
cd ..

# 6. Compilar frontend
echo ""
echo "5. Compilando frontend..."
cd frontend
npm run build
info "Frontend compilado exitosamente"
cd ..

# 7. Verificar archivos compilados
echo ""
echo "6. Verificando archivos compilados..."
if [ ! -f "backend/dist/index.js" ]; then
    error "Error: backend/dist/index.js no encontrado"
    exit 1
fi
if [ ! -f "frontend/dist/index.html" ]; then
    error "Error: frontend/dist/index.html no encontrado"
    exit 1
fi
info "Archivos compilados verificados"

# 8. Reiniciar PM2
echo ""
echo "7. Reiniciando aplicación con PM2..."

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    error "PM2 no está instalado"
    echo "  Instálalo con: npm install -g pm2"
    exit 1
fi

# Verificar si la app ya está corriendo
if pm2 describe pagina-admin-backend &> /dev/null; then
    info "Aplicación encontrada, reiniciando..."
    pm2 restart ecosystem.config.cjs
else
    info "Aplicación no encontrada, iniciando por primera vez..."
    pm2 start ecosystem.config.cjs
fi

# Guardar configuración de PM2
pm2 save

info "Aplicación reiniciada exitosamente"

# 9. Mostrar estado
echo ""
echo "8. Estado de la aplicación:"
pm2 status

echo ""
echo "========================================="
echo "  Deployment completado exitosamente"
echo "========================================="
echo ""
echo "Próximos pasos:"
echo "  - Verificar logs: pm2 logs pagina-admin-backend"
echo "  - Verificar salud: curl http://localhost:4000/health"
echo "  - Acceder a la app: http://tu-dominio-o-ip:4000"
echo ""
