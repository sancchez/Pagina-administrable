#!/bin/bash

# Script de deployment para producción
# Este script construye el frontend y backend, y los despliega con PM2
# El backend sirve el frontend en producción en el puerto 4000

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    log_error "Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

echo ""
log_info "🚀 Iniciando deployment de producción..."
echo ""

# Verificar que Node.js y npm están instalados
if ! command -v node &> /dev/null; then
    log_error "Node.js no está instalado"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm no está instalado"
    exit 1
fi

log_info "Node version: $(node -v)"
log_info "npm version: $(npm -v)"

# Verificar que PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log_warning "PM2 no está instalado. Instalando PM2 globalmente..."
    npm install -g pm2
    log_success "PM2 instalado"
fi

log_info "PM2 version: $(pm2 -v)"
echo ""

# 1. Construir el FRONTEND
log_info "📦 Construyendo frontend..."
cd frontend

# Limpiar caché y node_modules/.vite
log_info "🧹 Limpiando caché del frontend..."
rm -rf node_modules/.vite dist .vite

# Instalar dependencias
log_info "📥 Instalando dependencias del frontend..."
npm install --production=false

# Build del frontend
log_info "🔨 Compilando frontend con Vite..."
npm run build

# Verificar que el build se creó correctamente
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    log_error "El build del frontend falló - no se encontró dist/index.html"
    exit 1
fi

log_success "Frontend compilado correctamente en ./frontend/dist"
cd ..
echo ""

# 2. Construir el BACKEND
log_info "📦 Construyendo backend..."
cd backend

# Instalar dependencias
log_info "📥 Instalando dependencias del backend..."
npm install --production=false

# Generar Prisma Client
log_info "🔄 Generando Prisma Client..."
npx prisma generate

# Verificar que existe .env
if [ ! -f ".env" ]; then
    log_warning "No se encontró .env en el backend"
    log_info "Asegúrate de crear el archivo .env con las variables necesarias"
fi

# Verificar que existe la base de datos
if [ ! -f "prisma/db.sqlite" ]; then
    log_warning "No se encontró la base de datos SQLite"
    log_info "Ejecutando prisma db push para crear la base de datos..."
    npx prisma db push --accept-data-loss

    log_info "Ejecutando seed para crear datos iniciales..."
    npm run db:seed || log_warning "El seed falló, continuar manualmente si es necesario"
fi

# Compilar TypeScript
log_info "🔨 Compilando backend (TypeScript -> JavaScript)..."
npm run build

# Verificar que el build se creó correctamente
if [ ! -d "dist" ] || [ ! -f "dist/index.js" ]; then
    log_error "El build del backend falló - no se encontró dist/index.js"
    exit 1
fi

log_success "Backend compilado correctamente en ./backend/dist"
cd ..
echo ""

# 3. Detener PM2 si está corriendo
log_info "⏹️  Deteniendo servicios PM2 existentes..."
pm2 stop ecosystem.config.cjs 2>/dev/null || true
pm2 delete ecosystem.config.cjs 2>/dev/null || true
pm2 stop pagina-admin 2>/dev/null || true
pm2 delete pagina-admin 2>/dev/null || true

log_success "Servicios PM2 detenidos"
echo ""

# 4. Iniciar con PM2
log_info "▶️  Iniciando servicios con PM2..."

# Verificar que existe ecosystem.config.cjs
if [ ! -f "ecosystem.config.cjs" ]; then
    log_error "No se encontró ecosystem.config.cjs"
    exit 1
fi

# Iniciar con PM2 usando ecosystem config
pm2 start ecosystem.config.cjs --env production

# Esperar un momento para que el proceso inicie
sleep 2

# Verificar que el proceso está corriendo
if pm2 describe pagina-admin > /dev/null 2>&1; then
    log_success "Proceso PM2 'pagina-admin' iniciado correctamente"
else
    log_error "El proceso PM2 no se inició correctamente"
    pm2 logs pagina-admin --lines 50
    exit 1
fi

echo ""

# 5. Guardar configuración PM2
log_info "💾 Guardando configuración PM2..."
pm2 save

# Configurar PM2 para iniciarse al arrancar el sistema
log_info "🔧 Configurando PM2 startup..."
pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || log_warning "No se pudo configurar PM2 startup. Ejecuta manualmente: sudo env PATH=\$PATH:\$(which node | xargs dirname) pm2 startup systemd -u $USER --hp $HOME"

echo ""
log_success "✅ Deployment completado exitosamente!"
echo ""

# 6. Mostrar estado y información
log_info "📊 Estado de los servicios:"
pm2 status

echo ""
log_info "🌐 La aplicación está disponible en:"
echo "   http://localhost:4000"
echo "   http://$(hostname -I | awk '{print $1}'):4000"

echo ""
log_info "📝 Comandos útiles:"
echo "   pm2 logs pagina-admin          - Ver logs en tiempo real"
echo "   pm2 logs pagina-admin --lines 100  - Ver últimas 100 líneas de logs"
echo "   pm2 restart pagina-admin       - Reiniciar la aplicación"
echo "   pm2 stop pagina-admin          - Detener la aplicación"
echo "   pm2 start pagina-admin         - Iniciar la aplicación"
echo "   pm2 monit                      - Monitor en tiempo real"
echo "   pm2 flush                      - Limpiar logs"
echo ""

# Mostrar logs finales
log_info "📋 Últimas líneas de los logs:"
pm2 logs pagina-admin --lines 20 --nostream

echo ""
log_success "🎉 Todo listo! El servidor está corriendo."
echo ""
