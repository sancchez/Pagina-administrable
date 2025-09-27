import cors from 'cors';
import { Request } from 'express';
import { config } from '../config/env';
import logger from '../utils/logger';
import { networkUtils } from '../utils/helpers';

// Lista de orígenes permitidos
const allowedOrigins = [
  config.frontend.url,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  ...(config.cors?.allowedOrigins || []),
];

// Función para verificar si un origen está permitido
const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true; // Permitir requests sin origen (ej: Postman, curl)
  
  // En desarrollo, permitir localhost con cualquier puerto
  if (config.nodeEnv === 'development') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true;
    }
  }
  
  return allowedOrigins.includes(origin);
};

// Configuración de CORS
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS: Origin not allowed', {
        origin,
        allowedOrigins,
        timestamp: new Date().toISOString(),
      });
      callback(new Error('No permitido por la política CORS'), false);
    }
  },
  credentials: true, // Permitir cookies y headers de autenticación
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-API-Key',
    'X-Client-Version',
    'X-Request-ID',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
  ],
  maxAge: 86400, // 24 horas para preflight cache
  optionsSuccessStatus: 200, // Para compatibilidad con navegadores legacy
};

// Middleware CORS personalizado con logging
export const corsMiddleware = cors(corsOptions);

// Middleware para logging de requests CORS
export const corsLogger = (req: Request, res: any, next: any) => {
  const origin = req.headers.origin;
  const method = req.method;
  
  // Log de requests preflight
  if (method === 'OPTIONS') {
    logger.debug('CORS preflight request', {
      origin,
      method,
      url: req.originalUrl,
      ip: networkUtils.getClientIP(req),
      userAgent: networkUtils.getUserAgent(req),
      requestedMethod: req.headers['access-control-request-method'],
      requestedHeaders: req.headers['access-control-request-headers'],
    });
  }
  
  // Log de requests con origen no permitido
  if (origin && !isOriginAllowed(origin)) {
    logger.warn('CORS: Blocked request from unauthorized origin', {
      origin,
      method,
      url: req.originalUrl,
      ip: networkUtils.getClientIP(req),
      userAgent: networkUtils.getUserAgent(req),
    });
  }
  
  next();
};

// Configuración CORS específica para desarrollo
export const devCorsOptions: cors.CorsOptions = {
  origin: true, // Permitir todos los orígenes en desarrollo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-API-Key',
    'X-Client-Version',
    'X-Request-ID',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
  ],
  maxAge: 86400,
  optionsSuccessStatus: 200,
};

// Configuración CORS específica para producción
export const prodCorsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Client-Version',
    'X-Request-ID',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
  ],
  maxAge: 86400,
  optionsSuccessStatus: 200,
};

// Middleware CORS adaptativo según el entorno
export const adaptiveCors = config.nodeEnv === 'development' 
  ? cors(devCorsOptions)
  : cors(prodCorsOptions);