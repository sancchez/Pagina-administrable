@echo off
setlocal enabledelayedexpansion

REM Script de configuracion inicial para produccion en Windows
REM Ejecutar: setup-production.bat

echo =========================================
echo   Configuracion de Produccion - CMS Admin
echo =========================================
echo.

REM Verificar Node.js
echo Verificando Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js no esta instalado
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo   Node.js version: %NODE_VERSION%

REM Verificar NPM
echo Verificando NPM...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: NPM no esta instalado
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo   NPM version: %NPM_VERSION%

REM Verificar PM2
echo Verificando PM2...
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo PM2 no esta instalado. Instalando globalmente...
    call npm install -g pm2
    echo   PM2 instalado correctamente
) else (
    for /f "tokens=*" %%i in ('pm2 -v') do set PM2_VERSION=%%i
    echo   PM2 version: !PM2_VERSION!
)

echo.
echo =========================================
echo   Instalando dependencias del Backend
echo =========================================
cd backend
echo Instalando paquetes npm...
call npm install

echo Generando Prisma Client...
call npx prisma generate

echo Aplicando schema a la base de datos...
call npx prisma db push

REM Preguntar si desea ejecutar seed
echo.
set /p SEED="Deseas crear el usuario admin y datos de ejemplo? (s/n): "
if /i "%SEED%"=="s" (
    echo Ejecutando seed de base de datos...
    call npm run db:seed
)

cd ..

echo.
echo =========================================
echo   Instalando dependencias del Frontend
echo =========================================
cd frontend
echo Instalando paquetes npm...
call npm install
cd ..

echo.
echo =========================================
echo   Compilando proyectos
echo =========================================
echo Compilando Backend...
call npm run build:backend

echo Compilando Frontend...
call npm run build:frontend

echo.
echo =========================================
echo   Creando directorios necesarios
echo =========================================
if not exist "backend\logs" mkdir backend\logs
if not exist "backend\uploads\images" mkdir backend\uploads\images
echo Directorios creados

echo.
echo =========================================
echo   Verificando configuracion
echo =========================================

REM Verificar que existe .env en backend
if not exist "backend\.env" (
    echo ADVERTENCIA: No se encontro backend\.env
    echo   Creando archivo .env de ejemplo...
    (
        echo # Base de datos
        echo DATABASE_URL="file:./dev.db"
        echo.
        echo # JWT - CAMBIAR ESTOS VALORES EN PRODUCCION
        echo JWT_SECRET="cambiar-este-secreto-en-produccion"
        echo JWT_REFRESH_SECRET="cambiar-este-refresh-secreto-en-produccion"
        echo.
        echo # Servidor
        echo PORT=4000
        echo NODE_ENV=production
        echo.
        echo # CORS - Actualizar con tu dominio
        echo CORS_ORIGIN="http://localhost:4000"
        echo FRONTEND_URL="http://localhost:4000"
        echo.
        echo # Uploads
        echo UPLOAD_PATH="./uploads"
    ) > backend\.env
    echo   IMPORTANTE: Editar backend\.env y cambiar los valores de JWT_SECRET antes de desplegar
) else (
    echo Archivo backend\.env existe
)

echo.
echo =========================================
echo   Configuracion completada!
echo =========================================
echo.
echo Proximos pasos:
echo.
echo 1. Editar backend\.env con tus valores de produccion:
echo    - JWT_SECRET
echo    - JWT_REFRESH_SECRET
echo    - CORS_ORIGIN
echo    - FRONTEND_URL
echo.
echo 2. Iniciar el servidor con PM2:
echo    npm run pm2:start
echo.
echo 3. Verificar que esta corriendo:
echo    npm run pm2:status
echo.
echo 4. Ver logs:
echo    npm run pm2:logs
echo.
echo 5. Acceder a la aplicacion:
echo    http://localhost:4000
echo.
echo Credenciales por defecto:
echo   Email: admin@acueducto.com
echo   Password: admin123
echo.
echo Para mas informacion, leer DEPLOYMENT.md
echo.
pause
