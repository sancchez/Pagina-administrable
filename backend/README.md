# Admin Panel Backend API

API completa para el panel de administración con gestión de usuarios, reportes, PQR, facturación y páginas con GrapesJS.

## 🚀 Características

- **Autenticación JWT** completa con refresh tokens
- **Gestión de usuarios** con roles y permisos
- **Sistema de reportes** con comentarios y archivos
- **Módulo PQR** (Peticiones, Quejas y Reclamos)
- **Sistema de facturación** con pagos
- **Editor de páginas** con integración GrapesJS
- **Documentación Swagger** completa
- **Rate limiting** y seguridad
- **Base de datos PostgreSQL** con Prisma ORM

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 13+
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
# Base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/adminpanel"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Servidor
PORT=3000
NODE_ENV=development

# Frontend (para CORS)
FRONTEND_URL="http://localhost:3001"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

4. **Configurar base de datos**
```bash
# Ejecutar migraciones y poblar con datos iniciales
npm run db:setup
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

## 📚 Documentación API

Una vez iniciado el servidor, la documentación estará disponible en:
- **Swagger UI**: http://localhost:3000/api-docs
- **JSON Spec**: http://localhost:3000/api-docs.json

## 🗄️ Scripts Disponibles

### Desarrollo
```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar TypeScript
npm run start        # Iniciar servidor de producción
```

### Base de datos
```bash
npm run migrate:run     # Ejecutar migraciones pendientes
npm run migrate:create  # Crear nueva migración
npm run migrate:reset   # Resetear base de datos
npm run migrate:status  # Ver estado de migraciones
npm run seed           # Poblar base de datos con datos de prueba
npm run db:setup       # Configurar BD (migrar + seed)
npm run db:reset       # Resetear BD completamente
```

### Testing y calidad
```bash
npm run test           # Ejecutar tests
npm run test:watch     # Tests en modo watch
npm run test:coverage  # Tests con cobertura
npm run lint           # Verificar código
npm run lint:fix       # Corregir errores de lint
npm run format         # Formatear código
```

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones
│   │   ├── database.ts
│   │   └── swagger.ts
│   ├── controllers/     # Controladores
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── reportController.ts
│   │   ├── pqrController.ts
│   │   ├── invoiceController.ts
│   │   └── pageController.ts
│   ├── middleware/      # Middlewares
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── routes/          # Rutas
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── reportRoutes.ts
│   │   ├── pqrRoutes.ts
│   │   ├── invoiceRoutes.ts
│   │   └── pageRoutes.ts
│   ├── services/        # Lógica de negocio
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── reportService.ts
│   │   ├── pqrService.ts
│   │   ├── invoiceService.ts
│   │   ├── pageService.ts
│   │   ├── passwordService.ts
│   │   └── jwtService.ts
│   ├── utils/           # Utilidades
│   │   └── errors.ts
│   ├── app.ts           # Configuración Express
│   └── server.ts        # Punto de entrada
├── scripts/             # Scripts de utilidad
│   ├── migrate.ts       # Script de migraciones
│   └── seed.ts          # Script de seeding
├── prisma/              # Configuración Prisma
│   └── schema.prisma    # Esquema de BD
├── uploads/             # Archivos subidos
└── tests/               # Tests
```

## 🔐 Autenticación

El sistema utiliza JWT con refresh tokens:

1. **Login**: `POST /api/auth/login`
2. **Registro**: `POST /api/auth/register`
3. **Refresh Token**: `POST /api/auth/refresh`
4. **Logout**: `POST /api/auth/logout`

### Roles de usuario:
- **ADMIN**: Acceso completo
- **MANAGER**: Gestión de contenido y usuarios
- **USER**: Acceso básico

## 📊 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Reportes
- `GET /api/reports` - Listar reportes
- `POST /api/reports` - Crear reporte
- `GET /api/reports/:id` - Obtener reporte
- `PUT /api/reports/:id` - Actualizar reporte
- `POST /api/reports/:id/comments` - Agregar comentario

### PQR
- `GET /api/pqr` - Listar PQRs
- `POST /api/pqr` - Crear PQR
- `GET /api/pqr/:id` - Obtener PQR
- `PATCH /api/pqr/:id/status` - Cambiar estado

### Facturación
- `GET /api/invoices` - Listar facturas
- `POST /api/invoices` - Crear factura
- `POST /api/invoices/:id/payments` - Registrar pago

### Páginas (GrapesJS)
- `GET /api/pages` - Listar páginas
- `POST /api/pages` - Crear página
- `POST /api/pages/:id/grapes-data` - Guardar datos GrapesJS
- `POST /api/pages/:id/content` - Guardar contenido HTML

## 🔒 Seguridad

- **Helmet**: Headers de seguridad
- **CORS**: Configurado para frontend
- **Rate Limiting**: Límites por endpoint
- **JWT**: Tokens seguros con expiración
- **Bcrypt**: Hash de contraseñas
- **Validación**: Joi para validar entrada

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage
```

## 📦 Datos de Prueba

El comando `npm run seed` crea:

- **1 Admin**: admin@adminpanel.com / admin123
- **1 Manager**: manager@adminpanel.com / manager123
- **5 Usuarios**: user1@example.com / user1123 (user1-user5)
- **5 Reportes** con comentarios
- **5 PQRs** de diferentes tipos
- **10 Facturas** con pagos
- **3 Páginas** con datos GrapesJS

## 🚀 Despliegue

### Producción
1. Configurar variables de entorno de producción
2. Compilar el proyecto: `npm run build`
3. Ejecutar migraciones: `npm run migrate:run`
4. Iniciar servidor: `npm start`

### Docker (opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte y preguntas:
- Email: dev@adminpanel.com
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 📝 Changelog

### v1.0.0
- ✅ Sistema de autenticación JWT completo
- ✅ Gestión de usuarios con roles
- ✅ Módulo de reportes con comentarios
- ✅ Sistema PQR completo
- ✅ Facturación con pagos
- ✅ Editor de páginas con GrapesJS
- ✅ Documentación Swagger
- ✅ Scripts de migración y seeding