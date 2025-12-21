#!/bin/bash

# Script de limpieza para cuando hay problemas con procesos duplicados
# o el puerto 4000 está en uso

set +e  # No salir en errores

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

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo ""
log_info "🧹 Iniciando limpieza de procesos y puertos..."
echo ""

# 1. Detener y eliminar todos los procesos PM2
log_info "Deteniendo todos los procesos PM2..."

pm2 stop all 2>/dev/null || true
sleep 1
pm2 delete all 2>/dev/null || true
sleep 1
pm2 kill 2>/dev/null || true

log_success "Procesos PM2 eliminados"

# 2. Verificar y liberar el puerto 4000
log_info "Verificando puerto 4000..."

if command -v lsof &> /dev/null; then
    # Linux/Mac con lsof
    if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        log_warning "Puerto 4000 en uso, liberando..."
        lsof -ti:4000 | xargs kill -9 2>/dev/null || true
        sleep 2

        # Verificar de nuevo
        if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            log_error "No se pudo liberar el puerto 4000"
            log_info "Procesos usando el puerto:"
            lsof -Pi :4000 -sTCP:LISTEN
        else
            log_success "Puerto 4000 liberado"
        fi
    else
        log_success "Puerto 4000 está libre"
    fi
elif command -v netstat &> /dev/null; then
    # Alternativa con netstat
    if netstat -tuln | grep -q ":4000 "; then
        log_warning "Puerto 4000 en uso (usa lsof o fuser para más detalles)"
    else
        log_success "Puerto 4000 está libre"
    fi
else
    log_warning "No se puede verificar el puerto (lsof no disponible)"
fi

# 3. Verificar procesos node
log_info "Buscando procesos Node.js..."

if pgrep -f "node.*dist/index.js" > /dev/null; then
    log_warning "Encontrados procesos node relacionados:"
    ps aux | grep -i "node.*dist/index.js" | grep -v grep

    read -p "¿Quieres matar estos procesos? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pkill -f "node.*dist/index.js" 2>/dev/null || true
        log_success "Procesos Node eliminados"
    fi
else
    log_success "No hay procesos node huérfanos"
fi

echo ""
log_success "✅ Limpieza completada!"
echo ""
log_info "Estado actual de PM2:"
pm2 list

echo ""
log_info "Puertos en uso:"
if command -v lsof &> /dev/null; then
    lsof -Pi :4000 -sTCP:LISTEN 2>/dev/null || echo "Puerto 4000: libre"
elif command -v netstat &> /dev/null; then
    netstat -tuln | grep ":4000 " || echo "Puerto 4000: libre"
fi

echo ""
log_info "Ahora puedes deployar con:"
echo "   ./deploy.sh"
echo ""
