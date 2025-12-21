import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import enhancedLogger from '../utils/enhancedLogger';

// Extender la interfaz Request para incluir logging context
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: [number, number];
      logger?: typeof enhancedLogger;
    }
  }
}

interface RequestLoggerOptions {
  includeBody?: boolean;
  includeQuery?: boolean;
  includeHeaders?: boolean;
  sensitiveFields?: string[];
  maxBodySize?: number;
  skipPaths?: string[];
  skipMethods?: string[];
}

const defaultOptions: RequestLoggerOptions = {
  includeBody: true,
  includeQuery: true,
  includeHeaders: false,
  sensitiveFields: ['password', 'token', 'authorization', 'cookie', 'x-api-key'],
  maxBodySize: 1024, // 1KB
  skipPaths: ['/health', '/favicon.ico', '/api/pages'],
  skipMethods: [],
};

// Función para sanitizar datos sensibles
const sanitizeData = (data: any, sensitiveFields: string[]): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  
  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key], sensitiveFields);
    }
  }
  
  return sanitized;
};

// Función para truncar body si es muy grande
const truncateBody = (body: any, maxSize: number): any => {
  const bodyStr = JSON.stringify(body);
  if (bodyStr.length > maxSize) {
    // NO incluir el body original, solo un preview
    return {
      _truncated: true,
      _originalSize: bodyStr.length,
      _maxSize: maxSize,
      _preview: bodyStr.substring(0, Math.min(200, maxSize)) + '...'
    };
  }
  return body;
};

// Middleware principal de logging mejorado
export const enhancedRequestLogger = (options: RequestLoggerOptions = {}) => {
  const opts = { ...defaultOptions, ...options };
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Generar ID único para el request
    req.requestId = uuidv4();
    req.startTime = process.hrtime();
    
    // Crear logger con contexto del request
    req.logger = enhancedLogger.child({
      requestId: req.requestId,
      service: 'HTTP',
    });

    // Verificar si debemos omitir este path
    if (opts.skipPaths?.some(path => req.path.includes(path))) {
      return next();
    }

    // Verificar si debemos omitir este método
    if (opts.skipMethods?.includes(req.method)) {
      return next();
    }

    // Preparar metadata del request
    const requestMetadata: any = {
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.userId,
    };

    // Incluir query parameters si está habilitado
    if (opts.includeQuery && Object.keys(req.query).length > 0) {
      requestMetadata.query = sanitizeData(req.query, opts.sensitiveFields!);
    }

    // Incluir headers si está habilitado
    if (opts.includeHeaders) {
      requestMetadata.headers = sanitizeData(req.headers, opts.sensitiveFields!);
    }

    // Incluir body si está habilitado y existe
    if (opts.includeBody && req.body && Object.keys(req.body).length > 0) {
      let sanitizedBody = sanitizeData(req.body, opts.sensitiveFields!);
      sanitizedBody = truncateBody(sanitizedBody, opts.maxBodySize!);
      requestMetadata.body = sanitizedBody;
    }

    // Log del inicio del request
    req.logger.http('Request started', requestMetadata);

    // Interceptar la respuesta
    const originalSend = res.send;
    const originalJson = res.json;
    let responseBody: any;

    res.send = function(body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.json = function(body: any) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    // Manejar el final de la respuesta
    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(req.startTime!);
      const duration = seconds * 1000 + nanoseconds / 1000000; // Convertir a milisegundos
      const { statusCode } = res;
      
      const responseMetadata: any = {
        statusCode,
        duration,
        contentLength: res.get('content-length') || 0,
      };

      // Incluir response body para errores o en desarrollo
      if (statusCode >= 400 || process.env.NODE_ENV === 'development') {
        if (responseBody) {
          let sanitizedResponse = sanitizeData(responseBody, opts.sensitiveFields!);
          sanitizedResponse = truncateBody(sanitizedResponse, opts.maxBodySize!);
          responseMetadata.response = sanitizedResponse;
        }
      }

      // Log según el status code
      if (statusCode >= 500) {
        req.logger!.error('Request completed with server error', null, {
          ...requestMetadata,
          ...responseMetadata,
        });
      } else if (statusCode >= 400) {
        req.logger!.warn('Request completed with client error', {
          ...requestMetadata,
          ...responseMetadata,
        });
      } else {
        req.logger!.http('Request completed successfully', {
          ...requestMetadata,
          ...responseMetadata,
        });
      }

      // Log de performance si es lento
      if (duration > 1000) {
        req.logger!.performance(`${req.method} ${req.path}`, duration, 1000, {
          slow: true,
          threshold: 1000,
        });
      }
    });

    // Manejar errores en el request
    res.on('error', (error) => {
      const [seconds, nanoseconds] = process.hrtime(req.startTime!);
      const duration = seconds * 1000 + nanoseconds / 1000000; // Convertir a milisegundos
      req.logger!.error('Request error', error, {
        ...requestMetadata,
        duration,
      });
    });

    next();
  };
};

// Middleware específico para diferentes entornos
export const developmentLogger = enhancedRequestLogger({
  includeBody: true,
  includeQuery: true,
  includeHeaders: true,
  maxBodySize: 2048,
  skipPaths: ['/health', '/favicon.ico', '/api/pages'],
});

export const productionLogger = enhancedRequestLogger({
  includeBody: false,
  includeQuery: true,
  includeHeaders: false,
  maxBodySize: 512,
  skipPaths: ['/health', '/metrics', '/favicon.ico', '/api/pages'],
});

export const apiLogger = enhancedRequestLogger({
  includeBody: true,
  includeQuery: true,
  includeHeaders: false,
  maxBodySize: 1024,
});

export const securityLogger = enhancedRequestLogger({
  includeBody: true,
  includeQuery: true,
  includeHeaders: true,
  maxBodySize: 2048,
  skipPaths: [], // No omitir nada para seguridad
});

// Middleware para logging de performance específico
export const performanceLogger = (threshold: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      if (duration > threshold) {
        enhancedLogger
          .setContext({ requestId: req.requestId, service: 'Performance' })
          .performance(`${req.method} ${req.path}`, duration, threshold, {
            url: req.originalUrl,
            statusCode: res.statusCode,
            userId: (req as any).user?.userId,
          });
      }
    });
    
    next();
  };
};

export default enhancedRequestLogger;