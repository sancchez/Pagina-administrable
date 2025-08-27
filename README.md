# Sistema Web Administrable para Acueducto

Sistema completo para gestión de acueducto con frontend público, panel administrativo y backend con API REST.

## Stack Tecnológico

### Frontend
- React.js + Vite
- TailwindCSS
- Craft.js (Editor drag & drop)
- React Router

### Backend
- NestJS
- Prisma ORM
- SQLite
- JWT Authentication
- bcrypt

## Estructura del Proyecto

```
/
├── frontend/          # Aplicación React
├── backend/           # API NestJS
└── README.md
```

## Instalación y Configuración

### 1. Backend (API)

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed  # Crea usuario admin inicial
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## Credenciales por Defecto

- **Email**: admin@acueducto.com
- **Password**: admin123

## Funcionalidades

### Frontend Público
- **Home** (`/`): Página de inicio editable desde admin
- **Consultar Factura** (`/consultar-factura`): Búsqueda por número de cuenta o cédula

### Panel Administrativo
- **Login** (`/admin`): Autenticación con email/password
- **Dashboard**: Gestión de páginas
- **Editor**: Craft.js con bloques drag & drop
- **Toolbar**: Fuentes, colores, alineación
- **Medios**: Inserción de imágenes y videos

### API Endpoints

```
POST /auth/login              # Autenticación
GET  /invoices/:account       # Consultar factura
GET  /pages/:slug            # Obtener página pública
POST /admin/pages            # Guardar página (requiere JWT)
PUT  /admin/pages/:id        # Actualizar página
GET  /admin/pages            # Listar todas las páginas
```

## Base de Datos

### Modelos
- **User**: Usuarios administrativos
- **Invoice**: Facturas del acueducto  
- **Page**: Páginas dinámicas del sitio

### Migración Inicial
El sistema incluye:
- Usuario admin inicial
- Páginas de ejemplo (Home, Quiénes Somos)
- Facturas de prueba

## Desarrollo

### Comandos Backend
```bash
npm run start:dev      # Desarrollo
npm run build          # Construcción
npm run start:prod     # Producción
npx prisma studio      # Explorador de BD
```

### Comandos Frontend  
```bash
npm run dev           # Desarrollo
npm run build         # Construcción
npm run preview       # Vista previa
```

## Características del Editor

- **Bloques disponibles**: Texto, Imagen, Columnas, Botones
- **Personalización**: Fuentes, tamaños, colores, alineación
- **Medios**: Carga de archivos locales y URLs externas
- **Vista previa**: Renderizado en tiempo real
- **Guardado**: Serialización JSON automática