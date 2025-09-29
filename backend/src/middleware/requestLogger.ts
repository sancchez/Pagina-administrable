// Middleware para logging de requests HTTP
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import enhancedLogger from '../utils/enhancedLogger';
import { networkUtils, performanceUtils } from '../utils/helpers';

// Extender Request para incluir startTime
declare global {
  namespace Express {
    interface Request {
      startTime?: [number, number];
      requestId?: string;
      logger?: typeof enhancedLogger;
    }
  }
}

// Configuración del logger de requests
interface RequestLoggerOptions {
  // Incluir body en logs (cuidado con datos sensibles)
  includeBody?: boolean;
  // Incluir query parameters
  includeQuery?: boolean;
  // Incluir headers
  includeHeaders?: boolean;
  // Rutas a excluir del logging
  excludePaths?: string[];
  // Solo loggear errores (4xx, 5xx)
  errorsOnly?: boolean;
  // Nivel de log para requests exitosos
  successLevel?: 'info' | 'debug';
}

const defaultOptions: RequestLoggerOptions = {
  includeBody: false,
  includeQuery: true,
  includeHeaders: false,
  excludePaths: ['/health', '/favicon.ico'],
  errorsOnly: false,
  successLevel: 'info',
};

// Campos sensibles que no deben loggearse
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'authorization',
  'cookie',
  'x-api-key',
  'x-auth-token',
];

// Función para sanitizar datos sensibles
const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  
  return sanitized;
};

// Middleware principal de logging
export const requestLogger = (options: RequestLoggerOptions = {}) => {
  const config = { ...defaultOptions, ...options };
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Verificar si la ruta debe ser excluida
    if (config.excludePaths?.some(path => req.path.includes(path))) {
      return next();
    }
    
    // Marcar tiempo de inicio
    req.startTime = process.hrtime();
    
    // Información básica del request
    const requestInfo: any = {
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      ip: networkUtils.getClientIP(req),
      userAgent: networkUtils.getUserAgent(req),
      userId: req.user?.userId || 'anonymous',
      timestamp: new Date().toISOString(),
    };
    
    // Agregar query parameters si está habilitado
    if (config.includeQuery && Object.keys(req.query).length > 0) {
      requestInfo.query = sanitizeData(req.query);
    }
    
    // Agregar body si está habilitado (solo para métodos que lo soportan)
    if (config.includeBody && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      requestInfo.body = sanitizeData(req.body);
    }
    
    // Agregar headers si está habilitado
    if (config.includeHeaders) {
      requestInfo.headers = sanitizeData(req.headers);
    }
    
    // Interceptar el final de la respuesta
    const originalSend = res.send;
    let responseBody: any;
    
    res.send = function(body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };
    
    // Cuando la respuesta termine
    res.on('finish', () => {
      const duration = req.startTime ? 
        process.hrtime(req.startTime)[0] * 1000 + process.hrtime(req.startTime)[1] / 1000000 : 0;
      
      const responseInfo = {
        statusCode: res.statusCode,
        duration: `${duration.toFixed(2)}ms`,
        contentLength: res.get('content-length') || 0,
      };
      
      const logData = {
        ...requestInfo,
        response: responseInfo,
      };
      
      // Determinar nivel de log basado en status code
      const isError = res.statusCode >= 400;
      const isClientError = res.statusCode >= 400 && res.statusCode < 500;
      const isServerError = res.statusCode >= 500;
      
      // Si solo queremos errores y no es error, salir
      if (config.errorsOnly && !isError) {
        return;
      }
      
      // Loggear según el tipo de respuesta
      if (isServerError) {
        logger.error('HTTP Request - Server Error', {
          ...logData,
          responseBody: process.env.NODE_ENV === 'development' ? responseBody : undefined,
        });
      } else if (isClientError) {
        logger.warn('HTTP Request - Client Error', logData);
      } else {
        logger[config.successLevel!]('HTTP Request - Success', logData);
      }
    });
    
    // Manejar errores no capturados
    res.on('error', (error) => {
      logger.error('HTTP Request - Response Error', {
        ...requestInfo,
        error: error.message,
        stack: error.stack,
      });
    });
    
    next();
  };
};

// Middleware específico para APIs
export const apiRequestLogger = requestLogger({
  includeBody: true,
  includeQuery: true,
  includeHeaders: false,
  excludePaths: ['/health', '/metrics', '/favicon.ico'],
  successLevel: 'info',
});

// Middleware para desarrollo (más verbose)
export const devRequestLogger = requestLogger({
  includeBody: true,
  includeQuery: true,
  includeHeaders: true,
  excludePaths: ['/favicon.ico'],
  successLevel: 'debug',
});

// Middleware para producción (menos verbose)
export const prodRequestLogger = requestLogger({
  includeBody: false,
  includeQuery: false,
  includeHeaders: false,
  excludePaths: ['/health', '/metrics', '/favicon.ico'],
  errorsOnly: false,
  successLevel: 'info',
});

// Middleware para monitoreo de performance
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - startTime) / 1000000;
    
    // Loggear requests lentos (más de 1 segundo)
    if (duration > 1000) {
      logger.warn('Slow Request Detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        ip: networkUtils.getClientIP(req),
        userId: req.user?.userId || 'anonymous',
      });
    }
    
    // Loggear requests muy lentos (más de 5 segundos)
    if (duration > 5000) {
      logger.error('Very Slow Request Detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        ip: networkUtils.getClientIP(req),
        userId: req.user?.userId || 'anonymous',
        userAgent: networkUtils.getUserAgent(req),
      });
    }
  });
  
  next();
};

// Middleware para detectar requests sospechosos
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript injection
    /eval\(/i,  // Code injection
  ];
  
  const url = req.originalUrl.toLowerCase();
  const body = JSON.stringify(req.body || {}).toLowerCase();
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(body)
  );
  
  if (isSuspicious) {
    logger.warn('Suspicious Request Detected', {
      method: req.method,
      url: req.originalUrl,
      ip: networkUtils.getClientIP(req),
      userAgent: networkUtils.getUserAgent(req),
      body: req.body,
      headers: sanitizeData(req.headers),
      timestamp: new Date().toISOString(),
    });
  }
  
  next();
};