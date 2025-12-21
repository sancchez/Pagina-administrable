#!/bin/bash

# Script de utilidades para gestionar PM2
# Proporciona comandos útiles para operar la aplicación en producción

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

# Función para mostrar el menú
show_menu() {
    echo ""
    log_info "=== PM2 Utilidades - Pagina Admin ==="
    echo ""
    echo "1)  Ver estado de los servicios (pm2 status)"
    echo "2)  Ver logs en tiempo real (pm2 logs)"
    echo "3)  Reiniciar aplicación (pm2 restart)"
    echo "4)  Detener aplicación (pm2 stop)"
    echo "5)  Iniciar aplicación (pm2 start)"
    echo "6)  Ver monitor en tiempo real (pm2 monit)"
    echo "7)  Limpiar logs (pm2 flush)"
    echo "8)  Ver información detallada del proceso"
    echo "9)  Eliminar aplicación de PM2 (pm2 delete)"
    echo "10) Redesplegar aplicación (ejecutar deploy.sh)"
    echo "11) Ver últimas 50 líneas de logs"
    echo "12) Ver logs de error"
    echo "0)  Salir"
    echo ""
    read -p "Selecciona una opción: " choice
}

# Función principal
main() {
    while true; do
        show_menu

        case $choice in
            1)
                log_info "Estado de los servicios PM2:"
                pm2 status
                read -p "Presiona Enter para continuar..."
                ;;
            2)
                log_info "Mostrando logs en tiempo real (Ctrl+C para salir)..."
                pm2 logs pagina-admin
                ;;
            3)
                log_info "Reiniciando aplicación..."
                pm2 restart pagina-admin
                log_success "Aplicación reiniciada"
                pm2 status
                read -p "Presiona Enter para continuar..."
                ;;
            4)
                log_warning "Deteniendo aplicación..."
                pm2 stop pagina-admin
                log_success "Aplicación detenida"
                pm2 status
                read -p "Presiona Enter para continuar..."
                ;;
            5)
                log_info "Iniciando aplicación..."
                pm2 start pagina-admin
                log_success "Aplicación iniciada"
                pm2 status
                read -p "Presiona Enter para continuar..."
                ;;
            6)
                log_info "Abriendo monitor PM2 (Ctrl+C para salir)..."
                pm2 monit
                ;;
            7)
                log_warning "Limpiando logs..."
                pm2 flush
                log_success "Logs limpiados"
                read -p "Presiona Enter para continuar..."
                ;;
            8)
                log_info "Información detallada del proceso:"
                pm2 describe pagina-admin
                read -p "Presiona Enter para continuar..."
                ;;
            9)
                log_error "¿Estás seguro de que quieres eliminar la aplicación de PM2?"
                read -p "Escribe 'SI' para confirmar: " confirm
                if [ "$confirm" = "SI" ]; then
                    pm2 delete pagina-admin
                    log_success "Aplicación eliminada de PM2"
                else
                    log_info "Operación cancelada"
                fi
                read -p "Presiona Enter para continuar..."
                ;;
            10)
                log_info "Ejecutando deploy.sh para redesplegar..."
                ./deploy.sh
                read -p "Presiona Enter para continuar..."
                ;;
            11)
                log_info "Últimas 50 líneas de logs:"
                pm2 logs pagina-admin --lines 50 --nostream
                read -p "Presiona Enter para continuar..."
                ;;
            12)
                log_error "Logs de error:"
                pm2 logs pagina-admin --err --lines 50 --nostream
                read -p "Presiona Enter para continuar..."
                ;;
            0)
                log_success "¡Hasta luego!"
                exit 0
                ;;
            *)
                log_error "Opción inválida"
                read -p "Presiona Enter para continuar..."
                ;;
        esac
    done
}

# Verificar que PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log_error "PM2 no está instalado"
    log_info "Instala PM2 con: npm install -g pm2"
    exit 1
fi

# Ejecutar función principal
main
