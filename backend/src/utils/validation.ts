import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Esquemas de validación comunes
export const commonSchemas = {
  // ID válido (CUID)
  id: z.string().cuid('ID inválido'),
  
  // Email válido
  email: z.string().email('Email inválido'),
  
  // Password seguro
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  // Teléfono
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Número de teléfono inválido')
    .optional(),
  
  // Slug para URLs
  slug: z.string()
    .min(1, 'Slug requerido')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug debe contener solo letras minúsculas, números y guiones'),
  
  // Paginación
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  
  // Fechas
  dateString: z.string().datetime('Fecha inválida'),
  
  // Prioridad
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  
  // Estado booleano
  isActive: z.boolean().default(true),
};

// Esquemas para autenticación
export const authSchemas = {
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Contraseña requerida'),
  }),
  
  register: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    firstName: z.string().min(1, 'Nombre requerido').max(50, 'Nombre muy largo'),
    lastName: z.string().min(1, 'Apellido requerido').max(50, 'Apellido muy largo'),
    phone: commonSchemas.phone,
  }),
  
  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token requerido'),
  }),
  
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Contraseña actual requerida'),
    newPassword: commonSchemas.password,
  }),
};

// Esquemas para usuarios
export const userSchemas = {
  create: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    firstName: z.string().min(1, 'Nombre requerido').max(50),
    lastName: z.string().min(1, 'Apellido requerido').max(50),
    phone: commonSchemas.phone,
    role: z.enum(['ADMIN', 'MANAGER', 'USER']).default('USER'),
  }),
  
  update: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phone: commonSchemas.phone,
    role: z.enum(['ADMIN', 'MANAGER', 'USER']).optional(),
    isActive: commonSchemas.isActive.optional(),
  }),
  
  updateProfile: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phone: commonSchemas.phone,
  }),
};

// Esquemas para páginas
export const pageSchemas = {
  create: z.object({
    name: z.string().min(1, 'Nombre requerido').max(100),
    slug: commonSchemas.slug,
    title: z.string().min(1, 'Título requerido').max(200),
    content: z.any(), // JSON content from GrapesJS
    html: z.string().optional(),
    css: z.string().optional(),
  }),
  
  update: z.object({
    name: z.string().min(1).max(100).optional(),
    title: z.string().min(1).max(200).optional(),
    content: z.any().optional(),
    html: z.string().optional(),
    css: z.string().optional(),
    isActive: commonSchemas.isActive.optional(),
  }),
};

// Esquemas para reportes
export const reportSchemas = {
  create: z.object({
    title: z.string().min(1, 'Título requerido').max(200),
    description: z.string().min(1, 'Descripción requerida'),
    type: z.enum(['MAINTENANCE', 'BILLING', 'SERVICE', 'COMPLAINT', 'OTHER']),
    priority: commonSchemas.priority.default('MEDIUM'),
  }),
  
  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    status: z.enum(['RECEIVED', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    priority: commonSchemas.priority.optional(),
    assignedTo: commonSchemas.id.optional(),
  }),
  
  addComment: z.object({
    content: z.string().min(1, 'Comentario requerido'),
  }),
};

// Esquemas para PQR
export const pqrSchemas = {
  create: z.object({
    type: z.enum(['PETITION', 'COMPLAINT', 'CLAIM', 'SUGGESTION']),
    subject: z.string().min(1, 'Asunto requerido').max(200),
    description: z.string().min(1, 'Descripción requerida'),
    priority: commonSchemas.priority.default('MEDIUM'),
  }),
  
  update: z.object({
    status: z.enum(['RECEIVED', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    priority: commonSchemas.priority.optional(),
    assignedTo: commonSchemas.id.optional(),
    responseText: z.string().optional(),
  }),
};

// Esquemas para facturas
export const invoiceSchemas = {
  create: z.object({
    userId: commonSchemas.id,
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Período debe tener formato YYYY-MM'),
    issueDate: z.string().datetime(),
    dueDate: z.string().datetime(),
    amount: z.number().positive('Monto debe ser positivo'),
    notes: z.string().optional(),
    items: z.array(z.object({
      description: z.string().min(1, 'Descripción requerida'),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })).min(1, 'Debe incluir al menos un item'),
  }),
  
  update: z.object({
    status: z.enum(['PENDING', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
    paymentDate: z.string().datetime().optional(),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
  }),
};

// Esquemas para configuraciones
export const settingSchemas = {
  create: z.object({
    key: z.string().min(1, 'Clave requerida'),
    value: z.string().min(1, 'Valor requerido'),
    type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON']).default('STRING'),
    description: z.string().optional(),
  }),
  
  update: z.object({
    value: z.string().min(1, 'Valor requerido'),
    description: z.string().optional(),
  }),
};

// Middleware de validación
export const validate = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Error de validación interno',
      });
    }
  };
};

// Validación de parámetros de URL
export const validateParams = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          success: false,
          message: 'Parámetros inválidos',
          errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Error de validación interno',
      });
    }
  };
};

// Validación de query parameters
export const validateQuery = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Error de validación interno',
      });
    }
  };
};