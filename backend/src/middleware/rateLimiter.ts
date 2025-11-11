import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import logger from '../utils/logger';
import { networkUtils } from '../utils/helpers';

// Función para crear mensajes de error personalizados
const createRateLimitMessage = (message: string, retryAfter?: number) => ({
  success: false,
  message,
  retryAfter: retryAfter ? Math.ceil(retryAfter / 1000) : undefined,
  timestamp: new Date().toISOString(),
});

// Función para logging de rate limit hits
const logRateLimit = (req: Request, message: string) => {
  logger.warn('Rate limit exceeded', {
    ip: networkUtils.getClientIP(req),
    userAgent: networkUtils.getUserAgent(req),
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.userId || 'anonymous',
    message,
    headers: {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
    },
  });
};

// Rate limiter general
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: (req: Request) => {
    logRateLimit(req, 'General rate limit exceeded');
    return createRateLimitMessage(
      'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Usar IP real considerando proxies
    return networkUtils.getClientIP(req);
  },
});

// Rate limiter para autenticación (más restrictivo)
const isDev = (process.env.NODE_ENV || 'development') !== 'production';
export const authLimiter = rateLimit({
  windowMs: isDev ? (5 * 60 * 1000) : (15 * 60 * 1000), // 5 min en dev, 15 min prod
  max: isDev ? 30 : 10, // más permisivo en dev
  message: (req: Request) => {
    logRateLimit(req, 'Authentication rate limit exceeded');
    return createRateLimitMessage(
      isDev
        ? 'Demasiados intentos de inicio de sesión, intenta de nuevo en 5 minutos.'
        : 'Demasiados intentos de inicio de sesión, intenta de nuevo en 15 minutos.',
      isDev ? (5 * 60) : (15 * 60)
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos
  keyGenerator: (req: Request) => {
    // Combinar IP y email para granularidad (evita bloquear por IP compartida)
    try {
      const ip = networkUtils.getClientIP(req);
      const email = (req.body && typeof req.body.email === 'string') ? req.body.email.toLowerCase().trim() : '';
      return email ? `login:${email}@${ip}` : ip;
    } catch {
      return networkUtils.getClientIP(req);
    }
  },
});

// Rate limiter para registro de usuarios
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por IP por hora
  message: (req: Request) => {
    logRateLimit(req, 'Registration rate limit exceeded');
    return createRateLimitMessage(
      'Demasiados registros desde esta IP, intenta de nuevo en una hora.',
      60 * 60
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return networkUtils.getClientIP(req);
  },
});

// Rate limiter para endpoints de archivos
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 uploads por IP
  message: (req: Request) => {
    logRateLimit(req, 'Upload rate limit exceeded');
    return createRateLimitMessage(
      'Demasiadas subidas de archivos, intenta de nuevo más tarde.',
      15 * 60
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return networkUtils.getClientIP(req);
  },
});

// Rate limiter para API endpoints críticos
export const criticalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // máximo 20 requests por IP
  message: (req: Request) => {
    logRateLimit(req, 'Critical API rate limit exceeded');
    return createRateLimitMessage(
      'Demasiadas solicitudes a endpoints críticos, intenta de nuevo más tarde.',
      5 * 60
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return networkUtils.getClientIP(req);
  },
});

// Rate limiter para búsquedas y consultas pesadas
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // máximo 30 búsquedas por minuto
  message: (req: Request) => {
    logRateLimit(req, 'Search rate limit exceeded');
    return createRateLimitMessage(
      'Demasiadas búsquedas, intenta de nuevo en un momento.',
      60
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return networkUtils.getClientIP(req);
  },
});

// Rate limiter para endpoints públicos (más permisivo)
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // máximo 200 requests por IP
  message: (req: Request) => {
    logRateLimit(req, 'Public API rate limit exceeded');
    return createRateLimitMessage(
      'Demasiadas solicitudes, intenta de nuevo más tarde.',
      15 * 60
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return networkUtils.getClientIP(req);
  },
});

// Rate limiter dinámico basado en el usuario autenticado
export const createUserBasedLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: (req: Request) => {
      logRateLimit(req, `User-based rate limit exceeded: ${message}`);
      return createRateLimitMessage(message, Math.ceil(windowMs / 1000));
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      // Si hay usuario autenticado, usar su ID, sino usar IP
      const userId = req.user?.userId;
      const ip = networkUtils.getClientIP(req);
      return userId ? `user:${userId}` : `ip:${ip}`;
    },
  });
};

// Middleware para aplicar diferentes limiters según el endpoint
export const adaptiveLimiter = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path.toLowerCase();
  const method = req.method.toLowerCase();
  
  // Determinar qué limiter aplicar basado en la ruta
  if (path.includes('/auth/login') || path.includes('/auth/signin')) {
    return authLimiter(req, res, next);
  }
  
  if (path.includes('/auth/register') || path.includes('/auth/signup')) {
    return registerLimiter(req, res, next);
  }
  
  if (path.includes('/upload') || (method === 'post' && path.includes('/files'))) {
    return uploadLimiter(req, res, next);
  }
  
  if (path.includes('/search') || path.includes('/query')) {
    return searchLimiter(req, res, next);
  }
  
  if (path.startsWith('/public') || path.startsWith('/api/public')) {
    return publicLimiter(req, res, next);
  }
  
  if (path.includes('/admin') || path.includes('/critical')) {
    return criticalLimiter(req, res, next);
  }
  
  // Limiter general por defecto
  return generalLimiter(req, res, next);
};