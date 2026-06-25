#!/usr/bin/env bash
#
# Deploy de "Acueducto El Socorro" en un VPS (Linux).
# Instala dependencias, compila frontend y backend, prepara la base de datos
# y arranca el backend con PM2 (que sirve también el frontend).
#
# Uso:
#   git clone https://github.com/sancchez/Pagina-administrable.git
#   cd Pagina-administrable
#   git checkout socorro
#   bash scripts/deploy_vps.sh
#
# Variables opcionales:
#   PORT=4100 bash scripts/deploy_vps.sh   # puerto del backend (default 4100)
#
set -e

PORT="${PORT:-4100}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "==> Deploy El Socorro desde: $ROOT  (puerto $PORT)"

# Evitar que un DATABASE_URL global del VPS pise el del proyecto
unset DATABASE_URL

# ---------- BACKEND ----------
cd "$ROOT/backend"
echo "==> [backend] npm install"
npm install --no-audit --no-fund
echo "==> [backend] prisma generate"
npx prisma generate

# Base de datos: respetar la existente; si no hay, crear y sembrar contenido base
if [ -f prisma/socorro.sqlite ]; then
  echo "==> [backend] socorro.sqlite ya existe -> se respeta (no se re-siembra)"
else
  echo "==> [backend] creando socorro.sqlite (prisma db push)"
  DATABASE_URL="file:./socorro.sqlite" npx prisma db push --skip-generate
  echo "==> [backend] sembrando contenido base (puede tardar ~1 min)..."
  # --transpile-only: evita que ts-node type-checke todo el proyecto (eso lo
  # hacia parecer 'colgado'). Solo transpila y ejecuta, mucho mas rapido.
  DATABASE_URL="file:./socorro.sqlite" npx ts-node --transpile-only prisma/seed.ts
fi

# .env de produccion: crear solo si no existe (no pisa configuracion previa)
if [ ! -f .env ]; then
  echo "==> [backend] generando .env de produccion"
  JWT_S=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  JWT_R=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  SESS_S=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  cat > .env <<EOF
NODE_ENV=production
PORT=${PORT}
DATABASE_URL=file:./socorro.sqlite
JWT_SECRET="${JWT_S}"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="${JWT_R}"
JWT_REFRESH_EXPIRES_IN="30d"
SESSION_SECRET="${SESS_S}"
CORS_ORIGIN="*"
FRONTEND_URL=""
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=52428800
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
EOF
else
  echo "==> [backend] .env ya existe -> se respeta"
fi

echo "==> [backend] build (tsc)"
npm run build

# ---------- FRONTEND ----------
cd "$ROOT/frontend"
echo "==> [frontend] npm install"
npm install --no-audit --no-fund
echo "==> [frontend] build (vite)"
npm run build

# ---------- ARRANQUE ----------
cd "$ROOT/backend"
if command -v pm2 >/dev/null 2>&1; then
  # VPS: arrancar con PM2
  echo "==> [pm2] (re)arrancando proceso 'socorro'"
  pm2 delete socorro >/dev/null 2>&1 || true
  pm2 start dist/index.js --name socorro --update-env
  pm2 save
  echo ""
  echo "==================================================================="
  echo " LISTO (PM2). Backend 'socorro' corriendo en el puerto ${PORT}."
  echo " Dentro del servidor:   curl http://localhost:${PORT}/health"
  echo " Navegador:             http://IP_DEL_SERVIDOR:${PORT}/  y  /admin"
  echo " Login admin:           admin@elsocorro.com / socorro2026"
  echo "==================================================================="
else
  # Hostinger u hosting con panel: no hay PM2, se arranca desde el hPanel
  echo ""
  echo "==================================================================="
  echo " INSTALACION Y BUILD COMPLETOS."
  echo " No hay PM2 -> arranca la app desde el PANEL Node.js del hosting:"
  echo "   Application root : $ROOT/backend"
  echo "   Startup file     : dist/index.js"
  echo "   Node version     : 18 o 20"
  echo "   Variables entorno: copia las de  backend/.env  (NODE_ENV, DATABASE_URL,"
  echo "                      los 3 JWT, etc.)"
  echo " Luego pulsa Start/Restart en el panel."
  echo " Login admin: admin@elsocorro.com / socorro2026"
  echo "==================================================================="
fi
