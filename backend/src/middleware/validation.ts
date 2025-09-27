import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { z } from 'zod';
import logger from '../utils/logger';
import { networkUtils } from '../utils/helpers';

// Tipo para errores de validación
interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Función helper para formatear errores de Joi
const formatJoiErrors = (error: Joi.ValidationError): ValidationError[] => {
  return error.details.map((detail: Joi.ValidationErrorItem) => ({
    field: detail.path.join('.'),
    message: detail.message.replace(/"/g, ''),
    value: detail.context?.value,
  }));
};

// Función helper para formatear errores de Zod
const formatZodErrors = (error: z.ZodError): ValidationError[] => {
  return error.issues.map((err: z.ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
    value: err.code === 'invalid_type' ? (err as any).received : undefined,
  }));
};

// Función de validación de entrada genérica
export const validateInput = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errors = formatJoiErrors(error);
      logger.warn(`Validation error: ${JSON.stringify(errors)}`);
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors,
      });
    }
    return next();
  };
};

// Middleware de validación con Joi (legacy support)
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const validationErrors = formatJoiErrors(error);
      
      logger.warn('Validation error - Body', {
        url: req.originalUrl,
        method: req.method,
        ip: networkUtils.getClientIP(req),
        userId: req.user?.userId || 'anonymous',
        errors: validationErrors,
        body: req.body,
      });
      
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: validationErrors,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Reemplazar req.body con los datos validados y sanitizados
    req.body = value;
    return next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const validationErrors = formatJoiErrors(error);
      
      logger.warn('Validation error - Query', {
        url: req.originalUrl,
        method: req.method,
        ip: networkUtils.getClientIP(req),
        userId: req.user?.userId || 'anonymous',
        errors: validationErrors,
        query: req.query,
      });
      
      return res.status(400).json({
        success: false,
        message: 'Parámetros de consulta inválidos',
        errors: validationErrors,
        timestamp: new Date().toISOString(),
      });
    }
    
    req.query = value;
    return next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, { 
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const validationErrors = formatJoiErrors(error);
      
      logger.warn('Validation error - Params', {
        url: req.originalUrl,
        method: req.method,
        ip: networkUtils.getClientIP(req),
        userId: req.user?.userId || 'anonymous',
        errors: validationErrors,
        params: req.params,
      });
      
      return res.status(400).json({
        success: false,
        message: 'Parámetros de ruta inválidos',
        errors: validationErrors,
        timestamp: new Date().toISOString(),
      });
    }
    
    req.params = value;
    return next();
  };
};

// Nuevos middlewares con Zod (recomendado)
export const validateBodyWithZod = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = formatZodErrors(error);
        logger.warn('Validation error in query', {
          errors,
          query: req.query,
          userId: req.user?.userId,
          ip: networkUtils.getClientIP(req),
          userAgent: req.get('User-Agent')
        });
        
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
        return;
      }
      next(error);
    }
  };
};

export const validateQueryWithZod = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.query);
      req.query = result as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = formatZodErrors(error);
        logger.warn('Validation error in query', {
          errors,
          query: req.query,
          userId: req.user?.userId,
          ip: networkUtils.getClientIP(req),
          userAgent: req.get('User-Agent')
        });
        
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
        return;
      }
      next(error);
    }
  };
};

export const validateParamsWithZod = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.params);
      req.params = result as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = formatZodErrors(error);
        logger.warn('Validation error in params', {
          errors,
          params: req.params,
          userId: req.user?.userId,
          ip: networkUtils.getClientIP(req),
          userAgent: req.get('User-Agent')
        });
        
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
        return;
      }
      next(error);
    }
  };
};

// Middleware combinado que valida múltiples partes del request
export const validateRequest = (schemas: {
  body?: z.ZodType | Joi.ObjectSchema;
  query?: z.ZodType | Joi.ObjectSchema;
  params?: z.ZodType | Joi.ObjectSchema;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];
    
    try {
      // Validar body
      if (schemas.body) {
        if (schemas.body instanceof z.ZodType) {
          req.body = schemas.body.parse(req.body);
        } else {
          const { error, value } = schemas.body.validate(req.body, { 
            abortEarly: false,
            stripUnknown: true,
          });
          if (error) {
            errors.push(...formatJoiErrors(error));
          } else {
            req.body = value;
          }
        }
      }
      
      // Validar query
      if (schemas.query) {
        if (schemas.query instanceof z.ZodType) {
          req.query = schemas.query.parse(req.query) as any;
        } else {
          const { error, value } = schemas.query.validate(req.query, { 
            abortEarly: false,
            stripUnknown: true,
          });
          if (error) {
            errors.push(...formatJoiErrors(error));
          } else {
            req.query = value;
          }
        }
      }
      
      // Validar params
      if (schemas.params) {
        if (schemas.params instanceof z.ZodType) {
          req.params = schemas.params.parse(req.params) as any;
        } else {
          const { error, value } = schemas.params.validate(req.params, { 
            abortEarly: false,
            stripUnknown: true,
          });
          if (error) {
            errors.push(...formatJoiErrors(error));
          } else {
            req.params = value;
          }
        }
      }
      
      if (errors.length > 0) {
        logger.warn('Validation errors in request', {
          errors,
          url: req.originalUrl,
          method: req.method,
          userId: req.user?.userId,
          ip: networkUtils.getClientIP(req)
        });
        
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors
        });
        return;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodErrors = formatZodErrors(error);
        logger.warn('Zod validation error in request', {
          errors: zodErrors,
          url: req.originalUrl,
          method: req.method,
          userId: req.user?.userId,
          ip: networkUtils.getClientIP(req)
        });
        
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: zodErrors
        });
        return;
      }
      
      next(error);
    }
  };
};