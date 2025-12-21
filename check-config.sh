#!/bin/bash

# Script para verificar la configuración del deployment
# Detecta problemas comunes de configuración

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
log_info "🔍 Verificando configuración del deployment..."
echo ""

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    log_error "Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

# 2. Obtener IP del servidor
log_info "Detectando IP del servidor..."
if command -v hostname &> /dev/null; then
    SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    if [ -n "$SERVER_IP" ]; then
        log_success "IP del servidor: $SERVER_IP"
    else
        log_warning "No se pudo detectar la IP del servidor"
        SERVER_IP="unknown"
    fi
else
    log_warning "Comando hostname no disponible"
    SERVER_IP="unknown"
fi

# 3. Verificar archivo .env del backend
log_info "Verificando backend/.env..."

if [ ! -f "backend/.env" ]; then
    log_error "No existe backend/.env"
    echo "Crea el archivo backend/.env con las variables necesarias"
else
    log_success "backend/.env existe"

    # Verificar variables importantes
    if grep -q "NODE_ENV=production" backend/.env; then
        log_success "NODE_ENV=production configurado"
    else
        log_warning "NODE_ENV no está en production"
    fi

    if grep -q "PORT=4000" backend/.env; then
        log_success "PORT=4000 configurado"
    else
        log_warning "PORT no está configurado o no es 4000"
    fi

    # Verificar CORS_ORIGIN
    CORS_ORIGIN=$(grep "CORS_ORIGIN=" backend/.env | cut -d '=' -f2 | tr -d '"')
    if [ -n "$CORS_ORIGIN" ]; then
        log_success "CORS_ORIGIN configurado: $CORS_ORIGIN"

        # Verificar si contiene la IP actual
        if [ "$SERVER_IP" != "unknown" ] && echo "$CORS_ORIGIN" | grep -q "$SERVER_IP"; then
            log_success "CORS_ORIGIN incluye la IP del servidor ($SERVER_IP)"
        else
            log_warning "CORS_ORIGIN podría no incluir la IP actual del servidor"
            if [ "$SERVER_IP" != "unknown" ]; then
                echo "   IP actual: $SERVER_IP"
                echo "   Considera actualizar CORS_ORIGIN a: http://$SERVER_IP:4000"
            fi
        fi

        # Verificar si usa HTTPS
        if echo "$CORS_ORIGIN" | grep -q "https://"; then
            log_warning "CORS_ORIGIN usa HTTPS - asegúrate de tener SSL configurado"
        else
            log_success "CORS_ORIGIN usa HTTP (correcto para servidor sin SSL)"
        fi
    else
        log_warning "CORS_ORIGIN no está configurado"
    fi

    # Verificar secretos
    if grep -q "cambiar-este-secreto" backend/.env; then
        log_error "Los secretos JWT aún tienen valores por defecto - CAMBIAR EN PRODUCCIÓN"
    else
        log_success "Secretos JWT actualizados"
    fi
fi

echo ""

# 4. Verificar que el frontend está compilado
log_info "Verificando build del frontend..."

if [ ! -d "frontend/dist" ]; then
    log_error "frontend/dist no existe - necesitas compilar el frontend"
    echo "   Ejecuta: npm run build --prefix frontend"
elif [ ! -f "frontend/dist/index.html" ]; then
    log_error "frontend/dist/index.html no existe - build incompleto"
else
    log_success "Frontend compilado correctamente"

    # Verificar que no haya referencias a HTTPS si el servidor es HTTP
    if grep -q 'https://' frontend/dist/index.html 2>/dev/null; then
        log_warning "index.html contiene referencias a HTTPS"
        echo "   Esto podría causar problemas si el servidor está en HTTP"
    fi
fi

echo ""

# 5. Verificar que el backend está compilado
log_info "Verificando build del backend..."

if [ ! -d "backend/dist" ]; then
    log_error "backend/dist no existe - necesitas compilar el backend"
    echo "   Ejecuta: npm run build --prefix backend"
elif [ ! -f "backend/dist/index.js" ]; then
    log_error "backend/dist/index.js no existe - build incompleto"
else
    log_success "Backend compilado correctamente"
fi

echo ""

# 6. Verificar base de datos
log_info "Verificando base de datos..."

if [ ! -f "backend/prisma/db.sqlite" ]; then
    log_warning "Base de datos SQLite no existe"
    echo "   Se creará automáticamente al ejecutar deploy.sh"
else
    log_success "Base de datos existe"
    DB_SIZE=$(du -h "backend/prisma/db.sqlite" | cut -f1)
    echo "   Tamaño: $DB_SIZE"
fi

echo ""

# 7. Verificar PM2
log_info "Verificando estado de PM2..."

if ! command -v pm2 &> /dev/null; then
    log_warning "PM2 no está instalado"
    echo "   Se instalará automáticamente al ejecutar deploy.sh"
else
    log_success "PM2 está instalado"

    # Verificar procesos corriendo
    PM2_COUNT=$(pm2 list | grep -c "pagina-admin" || echo "0")
    if [ "$PM2_COUNT" -gt 0 ]; then
        log_info "Procesos PM2 activos: $PM2_COUNT"
        pm2 list | grep "pagina-admin"

        if [ "$PM2_COUNT" -gt 1 ]; then
            log_warning "Hay múltiples procesos con nombre pagina-admin"
            echo "   Considera ejecutar: ./cleanup.sh"
        fi
    else
        log_info "No hay procesos PM2 corriendo"
    fi
fi

echo ""

# 8. Verificar puerto 4000
log_info "Verificando puerto 4000..."

if command -v lsof &> /dev/null; then
    if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "Puerto 4000 está en uso"
        lsof -Pi :4000 -sTCP:LISTEN
        echo "   Si necesitas liberar el puerto, ejecuta: ./cleanup.sh"
    else
        log_success "Puerto 4000 está libre"
    fi
elif command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":4000 "; then
        log_warning "Puerto 4000 parece estar en uso"
    else
        log_success "Puerto 4000 está libre"
    fi
fi

echo ""

# 9. Resumen y recomendaciones
log_info "📋 Resumen:"
echo ""

if [ "$SERVER_IP" != "unknown" ]; then
    echo "🌐 Accede a tu aplicación en:"
    echo "   http://$SERVER_IP:4000"
    echo ""
    echo "⚠️  IMPORTANTE: Usa HTTP (no HTTPS) a menos que hayas configurado SSL"
    echo ""
fi

echo "🔧 Comandos útiles:"
echo "   ./deploy.sh        - Deployar/actualizar la aplicación"
echo "   ./cleanup.sh       - Limpiar procesos y puerto"
echo "   ./pm2-utils.sh     - Gestión interactiva de PM2"
echo "   ./test-build.sh    - Probar build localmente"
echo ""

if [ "$SERVER_IP" != "unknown" ] && [ -f "backend/.env" ]; then
    CURRENT_CORS=$(grep "CORS_ORIGIN=" backend/.env | cut -d '=' -f2 | tr -d '"')
    if ! echo "$CURRENT_CORS" | grep -q "$SERVER_IP"; then
        log_warning "Acción recomendada:"
        echo "   Actualizar backend/.env con:"
        echo "   CORS_ORIGIN=\"http://$SERVER_IP:4000,http://localhost:4000\""
        echo "   FRONTEND_URL=\"http://$SERVER_IP:4000\""
        echo ""
    fi
fi

log_success "Verificación completa!"
echo ""
