import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../utils/logger';
import { networkUtils } from '../utils/helpers';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
  details?: any;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Error interno del servidor';
  let code = error.code || 'INTERNAL_ERROR';

  // Información del request para logging
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: networkUtils.getClientIP(req),
    userAgent: networkUtils.getUserAgent(req),
    userId: (req as any).user?.userId || 'anonymous',
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
  };

  // Manejo de errores específicos de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Ya existe un registro con estos datos únicos';
        code = 'DUPLICATE_ENTRY';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Registro no encontrado';
        code = 'NOT_FOUND';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Violación de restricción de clave foránea';
        code = 'FOREIGN_KEY_CONSTRAINT';
        break;
      case 'P2014':
        statusCode = 400;
        message = 'Los datos proporcionados violan una restricción de relación';
        code = 'RELATION_CONSTRAINT';
        break;
      case 'P2021':
        statusCode = 404;
        message = 'La tabla especificada no existe';
        code = 'TABLE_NOT_EXISTS';
        break;
      case 'P2022':
        statusCode = 404;
        message = 'La columna especificada no existe';
        code = 'COLUMN_NOT_EXISTS';
        break;
      default:
        statusCode = 400;
        message = 'Error en la base de datos';
        code = 'DATABASE_ERROR';
    }
    
    logger.error('Prisma error', {
      error: error.message,
      code: error.code,
      meta: error.meta,
      request: requestInfo,
    });
  }
  // Manejo de errores de validación de Prisma
  else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Datos de entrada inválidos';
    code = 'VALIDATION_ERROR';
    
    logger.error('Prisma validation error', {
      error: error.message,
      request: requestInfo,
    });
  }
  // Manejo de errores de conexión de Prisma
  else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message = 'Error de conexión con la base de datos';
    code = 'DATABASE_CONNECTION_ERROR';
    
    logger.error('Prisma connection error', {
      error: error.message,
      request: requestInfo,
    });
  }
  // Manejo de errores JWT
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token JWT inválido';
    code = 'INVALID_TOKEN';
    
    logger.warn('JWT error', {
      error: error.message,
      request: requestInfo,
    });
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token JWT expirado';
    code = 'EXPIRED_TOKEN';
    
    logger.warn('JWT expired', {
      error: error.message,
      request: requestInfo,
    });
  }
  // Manejo de errores de validación (Zod, Joi, etc.)
  else if (error.name === 'ZodError') {
    statusCode = 400;
    message = 'Datos de entrada inválidos';
    code = 'VALIDATION_ERROR';
    
    logger.warn('Validation error', {
      error: error.message,
      details: (error as any).errors,
      request: requestInfo,
    });
  }
  // Manejo de errores de multer (uploads)
  else if (error.name === 'MulterError') {
    statusCode = 400;
    code = 'UPLOAD_ERROR';
    
    switch ((error as any).code) {
      case 'LIMIT_FILE_SIZE':
        message = 'El archivo es demasiado grande';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Demasiados archivos';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Campo de archivo inesperado';
        break;
      default:
        message = 'Error al subir archivo';
    }
    
    logger.warn('Upload error', {
      error: error.message,
      code: (error as any).code,
      request: requestInfo,
    });
  }
  // Errores operacionales (creados por la aplicación)
  else if (error.isOperational) {
    logger.warn('Operational error', {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      request: requestInfo,
    });
  }
  // Errores no manejados (bugs del sistema)
  else {
    logger.error('Unhandled error', {
      error: error.message,
      stack: error.stack,
      request: requestInfo,
    });
  }

  // Respuesta al cliente
  const response: any = {
    success: false,
    message,
    error: {
      code,
      timestamp: new Date().toISOString(),
    },
  };

  // Agregar detalles adicionales en desarrollo
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack;
    response.error.details = error.details;
    response.request = requestInfo;
  }

  res.status(statusCode).json(response);
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error: AppError = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const createError = (statusCode: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};