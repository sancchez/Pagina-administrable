import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import logger from '../utils/logger';
import { networkUtils } from '../utils/helpers';

// Configuración de Helmet para seguridad
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://unpkg.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://unpkg.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'", 'https://unpkg.com'],
      connectSrc: ["'self'", 'https://unpkg.com', 'https://app.grapesjs.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: config.nodeEnv === 'production' ? [] : null,
    },
  },

  // Cross Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Deshabilitado para compatibilidad

  // Cross Origin Opener Policy
  crossOriginOpenerPolicy: { policy: 'same-origin' },

  // Cross Origin Resource Policy
  crossOriginResourcePolicy: { policy: 'cross-origin' },

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // Frame Options
  frameguard: { action: 'deny' },

  // Hide Powered By
  hidePoweredBy: true,

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },

  // IE No Open
  ieNoOpen: true,

  // No Sniff
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Permitted Cross Domain Policies
  permittedCrossDomainPolicies: false,

  // Referrer Policy
  referrerPolicy: { policy: 'no-referrer' },

  // X-XSS-Protection
  xssFilter: true,
});

// Middleware para sanitizar inputs
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      if (typeof obj === 'string') {
        // Remover caracteres peligrosos
        return obj
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      }
      return obj;
    }

    const sanitized: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }

    return sanitized;
  };

  // Sanitizar body, query y params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  return next();
};

// Middleware para detectar patrones sospechosos
export const detectSuspiciousPatterns = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    // SQL Injection
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\'|\"|;|--|\*|\|)/,

    // XSS
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/i,
    /on\w+\s*=/i,

    // Path Traversal
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e%2f/i,
    /%2e%2e%5c/i,

    // Command Injection
    /(\||&|;|\$\(|\`)/,
    /(nc|netcat|wget|curl|chmod|rm|cat|ls|ps|kill)/i,
  ];

  const checkForPatterns = (obj: any, path: string = ''): boolean => {
    if (typeof obj === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(obj));
    }

    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (checkForPatterns(obj[key], currentPath)) {
            return true;
          }
        }
      }
    }

    return false;
  };

  // Verificar body, query y params
  const sources = [
    { data: req.body, name: 'body' },
    { data: req.query, name: 'query' },
    { data: req.params, name: 'params' },
    { data: req.headers, name: 'headers' },
  ];

  for (const source of sources) {
    if (source.data && checkForPatterns(source.data)) {
      logger.warn('Suspicious pattern detected', {
        ip: networkUtils.getClientIP(req),
        userAgent: networkUtils.getUserAgent(req),
        url: req.originalUrl,
        method: req.method,
        source: source.name,
        data: source.data,
        userId: req.user?.userId || 'anonymous',
        timestamp: new Date().toISOString(),
      });

      return res.status(400).json({
        success: false,
        message: 'Solicitud bloqueada por razones de seguridad',
        timestamp: new Date().toISOString(),
      });
    }
  }

  return next();
};

// Middleware para limitar el tamaño de archivos subidos
export const fileSizeLimit = (maxSize: number = 10 * 1024 * 1024) => { // 10MB por defecto
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];

    if (contentLength && parseInt(contentLength) > maxSize) {
      logger.warn('File size limit exceeded', {
        ip: networkUtils.getClientIP(req),
        contentLength,
        maxSize,
        url: req.originalUrl,
        userId: req.user?.userId || 'anonymous',
      });

      return res.status(413).json({
        success: false,
        message: 'Archivo demasiado grande',
        maxSize: `${Math.round(maxSize / 1024 / 1024)}MB`,
        timestamp: new Date().toISOString(),
      });
    }

    return next();
  };
};

// Middleware para validar tipos de archivo permitidos
export const allowedFileTypes = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];

    if (contentType && !allowedTypes.some(type => contentType.includes(type))) {
      logger.warn('File type not allowed', {
        ip: networkUtils.getClientIP(req),
        contentType,
        allowedTypes,
        url: req.originalUrl,
        userId: req.user?.userId || 'anonymous',
      });

      return res.status(415).json({
        success: false,
        message: 'Tipo de archivo no permitido',
        allowedTypes,
        timestamp: new Date().toISOString(),
      });
    }

    return next();
  };
};

// Middleware para agregar headers de seguridad adicionales
export const additionalSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Cache Control para endpoints sensibles
  if (req.path.includes('/auth') || req.path.includes('/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

// Middleware combinado de seguridad
export const securityMiddleware = [
  helmetConfig,
  additionalSecurityHeaders,
  sanitizeInput,
  detectSuspiciousPatterns,
];

// Configuración específica para desarrollo
export const devSecurityMiddleware = [
  helmet({
    contentSecurityPolicy: false, // Más permisivo en desarrollo
    crossOriginEmbedderPolicy: false,
  }),
  additionalSecurityHeaders,
  sanitizeInput,
];

// Middleware de seguridad adaptativo
export const adaptiveSecurity = config.nodeEnv === 'development'
  ? devSecurityMiddleware
  : securityMiddleware;