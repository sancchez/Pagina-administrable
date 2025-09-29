# Contexto del Proyecto - Sistema de Administración de Acueducto

## Estado Actual del Proyecto

### Estructura del Proyecto
```
/
├── frontend/          # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── admin/           # Componentes administrativos
│   │   │   ├── AdminLayout.tsx      # Layout principal del admin
│   │   │   ├── AdminDashboard.tsx   # Dashboard con estadísticas
│   │   │   ├── AdminLogin.tsx       # Página de login
│   │   │   ├── GrapesEditor.tsx     # ⭐ Editor principal GrapesJS
│   │   │   ├── ContentManagement.tsx
│   │   │   ├── InvoiceManagement.tsx
│   │   │   ├── PQRManagement.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── ReportsAnalytics.tsx
│   │   │   ├── SystemSettings.tsx
│   │   │   ├── PageMigrator.tsx
│   │   │   ├── PageMigration.tsx
│   │   │   └── BackupManager.tsx
│   │   ├── components/      # Componentes públicos
│   │   │   ├── PageRenderer.tsx     # ⭐ Renderizador páginas públicas
│   │   │   ├── Layout.tsx           # Layout público
│   │   │   └── PreviewFrame.tsx     # Vista previa de páginas
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Context de autenticación
│   │   ├── utils/
│   │   │   └── http.ts              # Cliente HTTP
│   │   └── App.tsx                  # ⭐ Configuración de rutas
├── backend/           # Node.js + Express + Prisma + SQLite
│   ├── src/
│   │   ├── controllers/
│   │   │   └── pageController.ts    # ⭐ Controlador de páginas
│   │   ├── routes/
│   │   │   ├── pageRoutes.ts        # ⭐ Rutas API páginas
│   │   │   └── migrationRoutes.ts   # Rutas de migración
│   │   ├── services/
│   │   │   └── pageService.ts       # ⭐ Lógica de negocio páginas
│   │   ├── types/
│   │   │   └── pageTypes.ts         # ⭐ Tipos TypeScript páginas
│   │   ├── utils/
│   │   │   └── grapesValidator.ts   # ⭐ Validador GrapesJS
│   │   └── config/
│   │       └── database.ts          # Configuración Prisma
└── project/           # Directorio raíz del proyecto
```

### Servidores Activos
- **Backend**: `http://localhost:3001` (Node.js + Express)
- **Frontend**: `http://localhost:5173` (React + Vite)
- **Proxy configurado**: Frontend hace proxy de `/api/*` al backend

### Tecnologías Utilizadas
- **Frontend**: React, TypeScript, TailwindCSS, GrapesJS, React Router
- **Backend**: Node.js, Express, Prisma ORM, SQLite
- **Base de Datos**: SQLite con Prisma ORM
- **Editor**: GrapesJS para edición visual de páginas
- **Validación**: Joi + Validador personalizado GrapesJS

## Editor GrapesJS - Arquitectura Completa

### 🎯 Archivos Principales del Editor

#### Frontend - Editor GrapesJS
**📁 `frontend/src/admin/GrapesEditor.tsx`** (Archivo principal - 500+ líneas)
- **Función**: Editor visual principal con GrapesJS
- **Estado**: `pageData`, `isLoading`, `isSaving`, `editor`
- **Hooks**: `useParams`, `useNavigate`, `useEffect`
- **Configuración GrapesJS**:
  - Block Manager (bloques drag & drop)
  - Style Manager (estilos y propiedades)
  - Device Manager (responsive design)
  - Layer Manager (capas de componentes)
  - Trait Manager (propiedades de elementos)

#### Frontend - Renderizador Público
**📁 `frontend/src/components/PageRenderer.tsx`**
- **Función**: Renderiza páginas públicas desde la BD
- **Lógica**: Obtiene datos por slug y renderiza HTML/CSS
- **Manejo**: `grapesData` parsing y fallback a `content`

#### Backend - Controlador Principal
**📁 `backend/src/controllers/pageController.ts`** (1000+ líneas)
- **Función**: Maneja todas las operaciones CRUD de páginas
- **Validación**: Schemas Joi + GrapesValidator personalizado
- **Endpoints**: Todos los endpoints de la API de páginas

#### Backend - Servicio de Páginas
**📁 `backend/src/services/pageService.ts`** (570+ líneas)
- **Función**: Lógica de negocio para páginas
- **Operaciones**: CRUD, backups, estadísticas, validación
- **Base de datos**: Interacción directa con Prisma

#### Backend - Validador GrapesJS
**📁 `backend/src/utils/grapesValidator.ts`** (420 líneas)
- **Función**: Validación robusta de datos GrapesJS
- **Seguridad**: Sanitización, prevención XSS, límites de recursos
- **Validaciones**: Estructura, componentes, HTML, CSS

### 🔄 Flujo Completo Paso a Paso del Editor

#### 1. **Navegación al Editor**
```
Usuario → /admin/dashboard/editor/{slug}
↓
App.tsx → Route path="editor/:slug" → GrapesEditor.tsx
↓
useParams() extrae el slug de la URL
```

#### 2. **Carga Inicial de Datos**
```
GrapesEditor.tsx → useEffect() → loadPageData()
↓
HTTP GET /api/pages/slug/{slug}
↓
pageController.ts → getPageBySlug()
↓
pageService.ts → getPageBySlug()
↓
Prisma query → SQLite database
↓
Respuesta: { id, title, slug, content, html, css, grapesData, ... }
```

#### 3. **Inicialización del Editor GrapesJS**
```
Datos recibidos → initializeGrapesJS()
↓
¿grapesData existe y es válido?
├─ SÍ → JSON.parse(grapesData) → editor.loadProjectData()
└─ NO → ¿content existe?
    ├─ SÍ → loadHtmlCssFallback() con page.content
    └─ NO → Plantilla por defecto "Página vacía"
↓
Editor GrapesJS renderizado y funcional
```

#### 4. **Configuración del Editor**
```
GrapesJS inicializado
↓
Configuración de managers:
├─ BlockManager → Bloques disponibles (texto, imagen, columnas, etc.)
├─ StyleManager → Propiedades CSS (colores, tipografía, espaciado)
├─ DeviceManager → Dispositivos responsive (desktop, tablet, mobile)
├─ LayerManager → Jerarquía de componentes
└─ TraitManager → Atributos de elementos HTML
↓
Event listeners configurados (component:selected, etc.)
```

#### 5. **Edición en Tiempo Real**
```
Usuario edita en el canvas
↓
GrapesJS actualiza automáticamente:
├─ Componentes internos
├─ Estilos CSS
└─ HTML generado
↓
Vista previa en tiempo real
```

#### 6. **Proceso de Guardado**
```
Usuario → Botón "Guardar" → handleSave()
↓
Extracción de datos del editor:
├─ grapesData = editor.store() (datos completos del proyecto)
├─ html = editor.getHtml() (HTML generado)
└─ css = editor.getCss() (CSS generado)
↓
Validación local básica
↓
HTTP PUT /api/pages/{pageId}
Body: { grapesData: JSON.stringify(grapesData), html, css }
```

#### 7. **Validación en Backend**
```
pageController.ts → updatePage()
↓
Joi schema validation → updatePageSchema
↓
grapesValidator.ts → validateGrapesData()
├─ Validación de estructura JSON
├─ Validación de componentes
├─ Sanitización de seguridad
├─ Límites de recursos
└─ Generación de warnings/errors
↓
¿Validación exitosa?
├─ SÍ → Continuar
└─ NO → Error 400 con detalles
```

#### 8. **Guardado en Base de Datos**
```
Datos validados → pageService.ts → updatePage()
↓
Prisma update query
↓
SQLite database actualizada
├─ grapesData: JSON string completo
├─ html: HTML generado
├─ css: CSS generado
└─ updatedAt: timestamp actual
↓
Respuesta exitosa al frontend
```

#### 9. **Actualización del Estado Frontend**
```
Respuesta 200 OK recibida
↓
setPageData() con nuevos datos
↓
setIsSaving(false)
↓
Notificación de éxito al usuario
↓
Estado local sincronizado con BD
```

### 🛣️ Rutas y Endpoints del Backend

#### Endpoints de Páginas (`/api/pages`)
```typescript
// Obtener todas las páginas
GET /api/pages
→ pageController.getPages()
→ pageService.getPages()

// Obtener página por ID
GET /api/pages/:id
→ pageController.getPageById()
→ pageService.getPageById()

// Obtener página por slug (usado por editor y páginas públicas)
GET /api/pages/slug/:slug
→ pageController.getPageBySlug()
→ pageService.getPageBySlug()

// Crear nueva página
POST /api/pages
→ pageController.createPage()
→ pageService.createPage()
→ Validación: createPageSchema + grapesValidator

// Actualizar página (usado por editor para guardar)
PUT /api/pages/:id
→ pageController.updatePage()
→ pageService.updatePage()
→ Validación: updatePageSchema + grapesValidator

// Guardar solo contenido HTML
POST /api/pages/:id/content
→ pageController.saveContent()
→ pageService.saveContent()

// Cambiar estado de publicación
PATCH /api/pages/:id/toggle-publish
→ pageController.togglePublishStatus()
→ pageService.togglePublishStatus()

// Eliminar página
DELETE /api/pages/:id
→ pageController.deletePage()
→ pageService.deletePage()

// Obtener páginas publicadas
GET /api/pages/published
→ pageController.getPublishedPages()
→ pageService.getPublishedPages()

// Estadísticas de páginas
GET /api/pages/stats
→ pageController.getPageStats()
→ pageService.getPageStats()
```

#### Endpoints de Backups (`/api/pages/:id/backups`)
```typescript
// Crear backup manual
POST /api/pages/:id/backups
→ pageController.createBackup()
→ pageService.createBackup()

// Obtener backups de una página
GET /api/pages/:id/backups
→ pageController.getPageBackups()
→ pageService.getPageBackups()

// Restaurar desde backup
POST /api/pages/:id/backups/:backupId/restore
→ pageController.restoreFromBackup()
→ pageService.restoreFromBackup()
```

### 🗄️ Esquema de Base de Datos - Tabla Pages
```sql
model Page {
  id          String   @id @default(cuid())
  title       String   // Título de la página
  slug        String   @unique // URL slug (ej: "quienes-somos")
  name        String?  // Nombre alternativo
  content     String?  // HTML básico de la página (fallback)
  html        String?  // HTML generado por GrapesJS
  css         String?  // CSS generado por GrapesJS
  grapesData  String?  // ⭐ Datos JSON completos del editor GrapesJS
  isActive    Boolean  @default(true) // Estado de publicación
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relación con backups
  backups     PageBackup[]
}

model PageBackup {
  id          String   @id @default(cuid())
  pageId      String
  title       String
  content     String?
  html        String?
  css         String?
  grapesData  String?
  createdAt   DateTime @default(now())
  
  page        Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
}
```

### 🔒 Sistema de Validación y Seguridad

#### Validación Frontend
- Validación básica de campos requeridos
- Verificación de formato de datos antes de envío
- Manejo de errores de red y timeouts

#### Validación Backend (Multicapa)
1. **Joi Schemas**: Validación de estructura y tipos
2. **GrapesValidator**: Validación específica de GrapesJS
   - Límites de recursos (10MB, 1000 componentes, 20 niveles)
   - Lista blanca de etiquetas HTML permitidas
   - Sanitización de atributos peligrosos
   - Prevención XSS y scripts maliciosos
   - Validación de CSS seguro

#### Características de Seguridad
- Eliminación automática de scripts `<script>`
- Remoción de eventos inline (`onclick`, `onload`, etc.)
- Sanitización de URLs en assets
- Validación de expresiones CSS peligrosas
- Límites de profundidad de componentes anidados

### 🎨 Configuración del Editor GrapesJS

#### Block Manager - Bloques Disponibles
```typescript
// Bloques básicos configurados
- Texto (párrafos, títulos)
- Imagen (con upload y URL)
- Columnas (layouts responsive)
- Botones (con estilos personalizables)
- Contenedores (divs con clases)
- Enlaces (navegación interna/externa)
```

#### Style Manager - Propiedades CSS
```typescript
// Categorías de estilos
- General (display, position, float)
- Dimensiones (width, height, padding, margin)
- Tipografía (font-family, size, weight, color)
- Decoraciones (background, border, shadow)
- Extra (opacity, cursor, overflow)
```

#### Device Manager - Responsive
```typescript
// Dispositivos configurados
- Desktop (1200px+)
- Tablet (768px - 1199px)  
- Mobile (< 768px)
```

### 🚀 Funcionalidades Implementadas

#### ✅ Sistema de Autenticación
- Login administrativo en `/admin`
- Protección de rutas administrativas
- Context de autenticación global
- JWT tokens para API

#### ✅ Panel Administrativo Completo
- Dashboard principal con estadísticas
- Gestión de páginas dinámicas
- Editor GrapesJS completamente integrado
- Sistema de navegación completo
- Gestión de usuarios, facturas, PQR, reportes

#### ✅ Editor GrapesJS Avanzado
- Inicialización inteligente (grapesData → content → plantilla)
- Guardado robusto con validación multicapa
- Vista previa en tiempo real
- Manejo de errores y estados de carga
- Logging detallado para debugging

#### ✅ Páginas Dinámicas
- Renderizado desde base de datos
- Soporte para HTML/CSS personalizado
- Sistema de slugs para URLs amigables
- Fallback automático entre grapesData y content

#### ✅ Sistema de Validación Robusto
- Validador personalizado para GrapesJS
- Sanitización automática de contenido
- Prevención de vulnerabilidades XSS
- Límites de recursos y seguridad

### 🔧 Información de Testing y Debugging

#### URLs de Prueba
- **Editor**: `http://localhost:5173/admin/dashboard/editor/quienes-somos`
- **Dashboard**: `http://localhost:5173/admin/dashboard`
- **Página pública**: `http://localhost:5173/quienes-somos`
- **API de página**: `http://localhost:3001/api/pages/slug/quienes-somos`

#### Credenciales de Prueba
- **Email**: admin@acueducto.com
- **Password**: admin123

#### Estado Actual de las Páginas
- ✅ Página "home" existe en BD con grapesData
- ✅ Página "quienes-somos" existe en BD con grapesData
- ✅ Backend retorna datos correctamente (200 OK)
- ✅ Editor GrapesJS funciona correctamente
- ✅ Guardado de datos implementado y funcional

#### Logging y Debugging
```typescript
// Logs disponibles en consola del navegador
- Carga de datos de página
- Inicialización de GrapesJS
- Proceso de guardado
- Errores de validación
- Estados de carga

// Logs disponibles en consola del servidor
- Validación de datos GrapesJS
- Advertencias de sanitización
- Errores de base de datos
- Requests HTTP detallados
```

### 📋 Próximos Pasos y Mejoras

#### Implementadas ✅
1. **Documentación completa del proyecto**
2. **Análisis exhaustivo del componente GrapesEditor.tsx**
3. **Lógica de inicialización mejorada para grapesData null**
4. **Funcionalidad de guardado robusta con validación**
5. **Sistema de validación y seguridad multicapa**

#### Futuras Mejoras 🔄
1. **Sistema de versionado avanzado** (control de versiones de páginas)
2. **Editor colaborativo** (múltiples usuarios editando)
3. **Plantillas predefinidas** (templates para páginas comunes)
4. **Optimización de rendimiento** (lazy loading, caching)
5. **Integración con CDN** (para assets e imágenes)

### 🎯 Notas Importantes para Troubleshooting

#### Problemas Comunes y Soluciones
1. **Editor en blanco**: Verificar que grapesData sea JSON válido
2. **Error de guardado**: Revisar validación en backend y logs
3. **Página no carga**: Verificar que slug existe en BD
4. **Estilos no se aplican**: Verificar que CSS se guarda correctamente

#### Archivos Clave para Debugging
- `GrapesEditor.tsx`: Lógica del editor y manejo de estados
- `pageController.ts`: Validación y procesamiento de requests
- `grapesValidator.ts`: Validación y sanitización de datos
- `pageService.ts`: Operaciones de base de datos

#### Comandos Útiles
```bash
# Ver logs del backend
cd backend && npm run start:dev

# Ver logs del frontend  
cd frontend && npm run dev

# Acceder a la base de datos
cd backend && npx prisma studio
```

Este documento proporciona una visión completa y detallada del sistema de editor GrapesJS, facilitando el troubleshooting y el desarrollo futuro.