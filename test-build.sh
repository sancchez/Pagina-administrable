#!/bin/bash

# Script para probar el build localmente antes de deployar
# Útil para detectar errores sin tener que hacer deploy completo

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo ""
log_info "🧪 Probando build del proyecto..."
echo ""

# Test Frontend
log_info "📦 Probando build del frontend..."
cd frontend

# Limpiar caché
log_info "🧹 Limpiando caché..."
rm -rf node_modules/.vite dist .vite

# Instalar dependencias
log_info "📥 Instalando dependencias..."
npm install --production=false

# Build
log_info "🔨 Compilando..."
if npm run build; then
    log_success "Frontend compilado correctamente"

    # Verificar archivos
    if [ -f "dist/index.html" ]; then
        log_success "dist/index.html existe"
    else
        log_error "dist/index.html NO existe"
        exit 1
    fi
else
    log_error "Error al compilar frontend"
    exit 1
fi

cd ..
echo ""

# Test Backend
log_info "📦 Probando build del backend..."
cd backend

# Instalar dependencias
log_info "📥 Instalando dependencias..."
npm install --production=false

# Generar Prisma
log_info "🔄 Generando Prisma Client..."
npx prisma generate

# Build
log_info "🔨 Compilando..."
if npm run build; then
    log_success "Backend compilado correctamente"

    # Verificar archivos
    if [ -f "dist/index.js" ]; then
        log_success "dist/index.js existe"
    else
        log_error "dist/index.js NO existe"
        exit 1
    fi
else
    log_error "Error al compilar backend"
    exit 1
fi

cd ..
echo ""

log_success "✅ ¡Todo compiló correctamente!"
echo ""
log_info "Ahora puedes deployar con confianza:"
echo "   ./deploy.sh"
echo ""
