#!/usr/bin/env bash
# deploy_pm2.sh
# Script para compilar frontend/backend y gestionar ambos con PM2
# Uso: ejecutar desde la raíz del repo: ./deploy_pm2.sh [--no-startup] [--skip-save]

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
LOG="$DIR/deploy_pm2.log"
: > "$LOG"

echo "=== DEPLOY PM2 START: $(date -u) ===" | tee -a "$LOG"

fail(){ echo "ERROR: $*" | tee -a "$LOG"; exit 1; }
cmd_exists(){ command -v "$1" >/dev/null 2>&1; }

# Parse flags
NO_STARTUP=0
SKIP_SAVE=0
for a in "$@"; do
  case "$a" in
    --no-startup) NO_STARTUP=1 ;; 
    --skip-save) SKIP_SAVE=1 ;;
    -h|--help)
      cat <<'EOF'
Uso: ./deploy_pm2.sh [--no-startup] [--skip-save]
  --no-startup   : no ejecutar el comando de pm2 startup
  --skip-save    : no ejecutar pm2 save al final
EOF
      exit 0
    ;;
  esac
done

# Requisitos mínimos
if ! cmd_exists node; then fail "Node.js no está instalado"; fi
if ! cmd_exists npm; then fail "npm no está instalado"; fi

# Instalar pm2 si es necesario
if ! cmd_exists pm2; then
  echo "pm2 no encontrado, instalando globalmente..." | tee -a "$LOG"
  if npm i -g pm2 2>&1 | tee -a "$LOG"; then
    echo "pm2 instalado correctamente" | tee -a "$LOG"
  else
    fail "Fallo instalando pm2 globalmente";
  fi
fi

# FRONTEND
echo "\n-- Preparando frontend --" | tee -a "$LOG"
if [ ! -d "frontend" ]; then
  fail "No existe el directorio ./frontend";
fi
cd frontend

# Instalar deps
echo "Instalando dependencias de frontend..." | tee -a "$LOG"
npm ci --no-audit --prefer-offline 2>&1 | tee -a "$LOG" || npm install --no-audit 2>&1 | tee -a "$LOG"

# Añadir script start:prod si falta
node -e "const fs=require('fs');const p='package.json';const j=JSON.parse(fs.readFileSync(p));j.scripts=j.scripts||{}; if(!j.scripts['start:prod']){j.scripts['start:prod']='serve -s dist -l 3000'; fs.writeFileSync(p, JSON.stringify(j,null,2)); console.log('Se agregó script start:prod (serve -s dist -l 3000)');} else {console.log('start:prod ya existe; no se modifica') }" 2>&1 | tee -a ../$LOG

# Instalar serve si no está
npm list --depth=0 --dev serve >/dev/null 2>&1 || npm install --save-dev serve 2>&1 | tee -a ../$LOG

# Build frontend (usa build:all si existe)
if npm run | grep -q "build:all"; then
  echo "Ejecutando npm run build:all" | tee -a ../$LOG
  npm run build:all 2>&1 | tee -a ../$LOG
else
  echo "Ejecutando npm run build" | tee -a ../$LOG
  npm run build 2>&1 | tee -a ../$LOG
fi

cd "$DIR"

# BACKEND
echo "\n-- Preparando backend --" | tee -a "$LOG"
if [ ! -d "backend" ]; then
  fail "No existe el directorio ./backend";
fi
cd backend

echo "Instalando dependencias de backend..." | tee -a ../$LOG
npm ci --no-audit --prefer-offline 2>&1 | tee -a ../$LOG || npm install --no-audit 2>&1 | tee -a ../$LOG

echo "Compilando backend (tsc) ..." | tee -a ../$LOG
if npm run build 2>&1 | tee -a ../$LOG; then
  echo "build backend OK" | tee -a ../$LOG
else
  fail "Fallo compilando backend";
fi

cd "$DIR"

# START PM2 APPS
echo "\n-- Iniciando/actualizando procesos con PM2 --" | tee -a "$LOG"

# Backend via ecosystem.config.cjs
if [ -f "ecosystem.config.cjs" ]; then
  echo "Usando ecosystem.config.cjs para el backend" | tee -a "$LOG"
  pm2 start ecosystem.config.cjs --env production 2>&1 | tee -a "$LOG"
  # Si el ecosystem no registró la app, intentar arrancar directamente
  if ! pm2 describe pagina-admin-backend >/dev/null 2>&1; then
    echo "ecosystem no registró la app; intentando arranque directo del backend" | tee -a "$LOG"
    if pm2 start backend/dist/index.js --name pagina-admin-backend --cwd ./backend --interpreter node 2>&1 | tee -a "$LOG"; then
      echo "Backend arrancado directamente con pm2" | tee -a "$LOG"
    else
      echo "Fallo al arrancar backend directamente; revisa logs" | tee -a "$LOG"
    fi
  fi
else
  echo "ecosystem.config.cjs no encontrado: lanzando backend manualmente" | tee -a "$LOG"
  cd backend
  if pm2 start npm --name "pagina-admin-backend" -- run start 2>&1 | tee -a ../$LOG; then
    echo "Backend iniciado via npm script" | tee -a ../$LOG
  else
    echo "Fallo arrancando backend via npm script; intentando arranque directo" | tee -a ../$LOG
    pm2 start dist/index.js --name pagina-admin-backend --cwd ./backend --interpreter node 2>&1 | tee -a ../$LOG || echo "Fallo definitivo arrancando backend" | tee -a ../$LOG
  fi
  cd "$DIR"
fi

# Frontend via npm script (serve)
npm_scripts_front=$(node -e "const j=require('./frontend/package.json'); console.log(Object.keys(j.scripts||{}).join(','))")
if echo "$npm_scripts_front" | grep -q "start:prod"; then
  echo "Intentando iniciar frontend via npm start:prod" | tee -a "$LOG"
  if pm2 start npm --name "pagina-admin-frontend" --prefix ./frontend -- run start:prod 2>&1 | tee -a "$LOG"; then
    echo "Frontend iniciado via npm start:prod" | tee -a "$LOG"
  else
    echo "Fallo al iniciar start:prod; intentando pm2 serve ./frontend/dist" | tee -a "$LOG"
    if pm2 serve ./frontend/dist 3000 --name pagina-admin-frontend --spa 2>&1 | tee -a "$LOG"; then
      echo "Frontend iniciado con pm2 serve" | tee -a "$LOG"
    else
      echo "No se pudo iniciar el frontend con start:prod ni con pm2 serve" | tee -a "$LOG"
    fi
  fi
else
  echo "start:prod no encontrado en frontend/package.json; intentando pm2 serve ./frontend/dist" | tee -a "$LOG"
  if pm2 serve ./frontend/dist 3000 --name pagina-admin-frontend --spa 2>&1 | tee -a "$LOG"; then
    echo "Frontend iniciado con pm2 serve" | tee -a "$LOG"
  else
    echo "No se pudo iniciar el frontend; verifica build o instala 'serve'" | tee -a "$LOG"
  fi
fi

# Guardar la configuración y configurar arranque automático
if [ "$SKIP_SAVE" -eq 0 ]; then
  echo "Guardando procesos PM2 (pm2 save)" | tee -a "$LOG"
  pm2 save 2>&1 | tee -a "$LOG" || true
fi

if [ "$NO_STARTUP" -eq 0 ]; then
  echo "Configurando pm2 startup (systemd)" | tee -a "$LOG"
  START_CMD=$(pm2 startup systemd -u "$USER" --hp "$HOME" | tail -n 1)
  echo "Comando recomendado: $START_CMD" | tee -a "$LOG"
  # Intentar ejecutar el comando (puede requerir sudo)
  if eval "$START_CMD" 2>&1 | tee -a "$LOG"; then
    echo "pm2 startup configurado" | tee -a "$LOG"
  else
    echo "No se pudo ejecutar el comando de startup automáticamente. Ejecuta manualmente como root: $START_CMD" | tee -a "$LOG"
  fi
fi

# Resumen
echo "\n=== RESULTADO (pm2 status) ===" | tee -a "$LOG"
pm2 status 2>&1 | tee -a "$LOG" || pm2 status 2>&1 | tee -a "$LOG"

echo "Logs: $LOG"
echo "script finalizado: $(date -u)" | tee -a "$LOG"

exit 0
