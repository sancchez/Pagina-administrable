import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { setupSwagger } from './config/swagger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { adaptiveLimiter } from './middleware/rateLimiter';
import { enhancedRequestLogger, developmentLogger, productionLogger } from './middleware/enhancedRequestLogger';
import enhancedLogger from './utils/enhancedLogger';
import path from 'path';
import { config } from './config/env';
import { imageUpload, handleUploadError } from './utils/upload';

// Importar rutas
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import pageRoutes from './routes/pageRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import reportRoutes from './routes/reportRoutes';
import pqrRoutes from './routes/pqrRoutes';
import auditRoutes from './routes/auditRoutes';
import docsRoutes from './routes/docs';
import migrationRoutes from './routes/migrationRoutes';
import versionRoutes from './routes/versionRoutes';

const app: Application = express();

// Logger con contexto de la aplicación
const appLogger = enhancedLogger.child({ service: 'App' });

// Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      // Permitir scripts propios + hash del script inline de checkEditorContext en index.html
      scriptSrc: ["'self'", "'sha256-/Dlwb4aqWCvAqXapUKeexicCb96AxeGubwLr8OUcso='"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  // Deshabilitar COOP para evitar warnings en HTTP
  crossOriginOpenerPolicy: false
}));

// Configuración de CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://adminpanel.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5177', 'http://localhost:5180'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware de compresión
app.use(compression());

// Middleware de logging mejorado
if (process.env.NODE_ENV === 'development') {
  app.use(developmentLogger);
  appLogger.info('Development logging enabled', {
    includeBody: true,
    includeHeaders: true
  });
} else {
  app.use(productionLogger);
  appLogger.info('Production logging enabled', {
    includeBody: false,
    includeHeaders: false
  });
}

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global adaptativo por endpoint
app.use(adaptiveLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    pid: process.pid,
  };

  appLogger.debug('Health check requested', {
    uptime: healthData.uptime,
    memory: healthData.memory,
    ip: req.ip,
  });

  res.status(200).json(healthData);
});

// Servir archivos estáticos de uploads
try {
  const uploadsDir = path.isAbsolute(config.upload.path)
    ? config.upload.path
    : path.join(process.cwd(), config.upload.path);
  // Servir tanto bajo /api/uploads (existente) como /uploads para uso directo en HTML
  app.use('/api/uploads', express.static(uploadsDir));
  app.use('/uploads', express.static(uploadsDir));
} catch (e) {
  appLogger.warn('No se pudo montar estáticos de uploads', { error: (e as any)?.message });
}

// Servir archivos estáticos del frontend (para button-actions.js)
try {
  const frontendPublicDir = path.join(process.cwd(), '..', 'frontend', 'public');
  app.use(express.static(frontendPublicDir));
  appLogger.info('Archivos estáticos del frontend montados', { path: frontendPublicDir });
} catch (e) {
  appLogger.warn('No se pudo montar estáticos del frontend', { error: (e as any)?.message });
}

// API Info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin Panel API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      reports: '/api/reports',
      pqr: '/api/pqr',
      invoices: '/api/invoices',
      pages: '/api/pages',
      auditLogs: '/api/audit-logs'
    }
  });
});

// Configurar documentación Swagger
setupSwagger(app);

// Configurar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/invoices', invoiceRoutes);
// Alias admin para facturas
app.use('/api/admin/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/pqr', pqrRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/admin', migrationRoutes);
app.use('/api', versionRoutes);

// Endpoint de subida de imágenes
app.post('/api/upload', imageUpload.single('file'), (req: any, res: any) => {
  try {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No se recibió archivo', error: 'NO_FILE' });
    }

    // Construir URL pública relativa servida por /api/uploads
    const subdir = 'images';
    const publicUrl = `/api/uploads/${subdir}/${file.filename}`;

    return res.status(201).json({
      success: true,
      message: 'Archivo subido',
      data: {
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        url: publicUrl,
      }
    });
  } catch (error) {
    appLogger.error('Error al procesar subida', { error });
    return res.status(500).json({ success: false, message: 'Error interno', error: 'INTERNAL_ERROR' });
  }
}, handleUploadError);

// Servir el frontend compilado en producción
if (process.env.NODE_ENV === 'production') {
  const frontendDistDir = path.join(process.cwd(), '..', 'frontend', 'dist');

  // Servir archivos estáticos del build de Vite
  app.use(express.static(frontendDistDir));

  // Para rutas que no sean /api/*, devolver el index.html (SPA routing)
  app.get('*', (req, res, next) => {
    // Si es una ruta de API, dejar pasar al siguiente middleware
    if (req.path.startsWith('/api')) {
      return next();
    }
    // Si es otra ruta, servir el index.html del frontend
    res.sendFile(path.join(frontendDistDir, 'index.html'));
  });

  appLogger.info('Frontend build servido desde backend', { path: frontendDistDir });
}

// Middleware para rutas no encontradas
app.use(notFound);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

export default app;