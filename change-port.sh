#!/bin/bash

# Script para cambiar el puerto de la aplicación
# Útil cuando el navegador fuerza HTTPS en el puerto actual

set -e

NEW_PORT=${1:-8080}

echo "Cambiando puerto a: $NEW_PORT"

# 1. Actualizar .env del backend
if [ -f "backend/.env" ]; then
    sed -i "s/PORT=.*/PORT=$NEW_PORT/" backend/.env
    sed -i "s/:4000/:$NEW_PORT/g" backend/.env
    echo "✅ backend/.env actualizado"
else
    echo "❌ backend/.env no encontrado"
    exit 1
fi

# 2. Actualizar ecosystem.config.cjs
if [ -f "ecosystem.config.cjs" ]; then
    sed -i "s/PORT: .*/PORT: $NEW_PORT/" ecosystem.config.cjs
    echo "✅ ecosystem.config.cjs actualizado"
fi

echo ""
echo "✅ Puerto cambiado a $NEW_PORT"
echo ""
echo "Ahora ejecuta:"
echo "  pm2 restart pagina-admin"
echo ""
echo "Y accede a:"
echo "  http://155.117.40.245:$NEW_PORT"
