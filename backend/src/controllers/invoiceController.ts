import { Request, Response } from 'express';
import Joi from 'joi';
import { InvoiceService } from '../services/invoiceService';

// Esquemas de validación
const createInvoiceSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'string.uuid': 'El ID del usuario debe ser un UUID válido',
    'any.required': 'El ID del usuario es requerido'
  }),
  dueDate: Joi.date().min('now').required().messages({
    'date.min': 'La fecha de vencimiento debe ser futura',
    'any.required': 'La fecha de vencimiento es requerida'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Las notas no pueden exceder 500 caracteres'
  }),
  items: Joi.array().min(1).items(
    Joi.object({
      description: Joi.string().min(3).max(200).required().messages({
        'string.min': 'La descripción debe tener al menos 3 caracteres',
        'string.max': 'La descripción no puede exceder 200 caracteres',
        'any.required': 'La descripción es requerida'
      }),
      quantity: Joi.number().positive().required().messages({
        'number.positive': 'La cantidad debe ser un número positivo',
        'any.required': 'La cantidad es requerida'
      }),
      unitPrice: Joi.number().positive().required().messages({
        'number.positive': 'El precio unitario debe ser un número positivo',
        'any.required': 'El precio unitario es requerido'
      }),
      category: Joi.string().max(100).optional().messages({
        'string.max': 'La categoría no puede exceder 100 caracteres'
      })
    })
  ).required().messages({
    'array.min': 'Debe incluir al menos un elemento en la factura',
    'any.required': 'Los elementos de la factura son requeridos'
  })
});

const updateInvoiceSchema = Joi.object({
  dueDate: Joi.date().min('now').optional().messages({
    'date.min': 'La fecha de vencimiento debe ser futura'
  }),
  status: Joi.string().valid('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED').optional(),
  notes: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Las notas no pueden exceder 500 caracteres'
  }),
  items: Joi.array().min(1).items(
    Joi.object({
      id: Joi.string().uuid().optional(),
      description: Joi.string().min(3).max(200).required().messages({
        'string.min': 'La descripción debe tener al menos 3 caracteres',
        'string.max': 'La descripción no puede exceder 200 caracteres',
        'any.required': 'La descripción es requerida'
      }),
      quantity: Joi.number().positive().required().messages({
        'number.positive': 'La cantidad debe ser un número positivo',
        'any.required': 'La cantidad es requerida'
      }),
      unitPrice: Joi.number().positive().required().messages({
        'number.positive': 'El precio unitario debe ser un número positivo',
        'any.required': 'El precio unitario es requerido'
      }),
      category: Joi.string().max(100).optional().messages({
        'string.max': 'La categoría no puede exceder 100 caracteres'
      })
    })
  ).optional().messages({
    'array.min': 'Debe incluir al menos un elemento en la factura'
  })
});

const queryInvoicesSchema = Joi.object({
  search: Joi.string().max(100).optional(),
  userId: Joi.string().uuid().optional(),
  status: Joi.string().valid('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED').optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  dueDateFrom: Joi.date().optional(),
  dueDateTo: Joi.date().optional(),
  minAmount: Joi.number().min(0).optional(),
  maxAmount: Joi.number().min(0).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

const createPaymentSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.positive': 'El monto debe ser un número positivo',
    'any.required': 'El monto es requerido'
  }),
  method: Joi.string().valid('CASH', 'CARD', 'TRANSFER', 'CHECK', 'OTHER').required().messages({
    'any.required': 'El método de pago es requerido'
  }),
  reference: Joi.string().max(100).optional().messages({
    'string.max': 'La referencia no puede exceder 100 caracteres'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Las notas no pueden exceder 500 caracteres'
  })
});

const queryPaymentsSchema = Joi.object({
  search: Joi.string().max(100).optional(),
  invoiceId: Joi.string().uuid().optional(),
  userId: Joi.string().uuid().optional(),
  status: Joi.string().valid('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED').optional(),
  method: Joi.string().valid('CASH', 'CARD', 'TRANSFER', 'CHECK', 'OTHER').optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  minAmount: Joi.number().min(0).optional(),
  maxAmount: Joi.number().min(0).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

export class InvoiceController {
  /**
   * Crear nueva factura
   */
  static async createInvoice(req: Request, res: Response) {
    try {
      const { error, value } = createInvoiceSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
      }
      
      const invoice = await InvoiceService.createInvoice(value);

      return res.status(201).json({
        success: true,
        message: 'Factura creada exitosamente',
        data: { invoice }
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener facturas con filtros
   */
  static async getInvoices(req: Request, res: Response) {
    try {
      const { error, value } = queryInvoicesSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
      }
      
      const result = await InvoiceService.getInvoices(value);

      return res.json({
        success: true,
        message: 'Facturas obtenidas exitosamente',
        data: result
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener factura por ID
   */
  static async getInvoiceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const invoice = await InvoiceService.getInvoiceById(id);

      return res.json({
        success: true,
        message: 'Factura obtenida exitosamente',
        data: { invoice }
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar factura
   */
  static async updateInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error, value } = updateInvoiceSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
      }
      
      const invoice = await InvoiceService.updateInvoice(id, value);

      return res.json({
        success: true,
        message: 'Factura actualizada exitosamente',
        data: { invoice }
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar factura
   */
  static async deleteInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await InvoiceService.deleteInvoice(id);

      return res.json({
        success: true,
        message: 'Factura eliminada exitosamente'
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear pago para factura
   */
  static async createPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error, value } = createPaymentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
      }
      
      const payment = await InvoiceService.createPayment({
        invoiceId: id,
        ...value
      });

      return res.status(201).json({
        success: true,
        message: 'Pago registrado exitosamente',
        data: { payment }
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener pagos con filtros
   */
  static async getPayments(req: Request, res: Response) {
    try {
      const { error, value } = queryPaymentsSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
      }
      
      const result = await InvoiceService.getPayments(value);

      return res.json({
        success: true,
        message: 'Pagos obtenidos exitosamente',
        data: result
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas de facturas
   */
  static async getInvoiceStats(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const stats = await InvoiceService.getInvoiceStats();

      return res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: { stats }
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener facturas de un usuario específico
   */
  static async getUserInvoices(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { error, value } = queryInvoicesSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
      }
      
      const result = await InvoiceService.getUserInvoices(userId, value);

      return res.json({
        success: true,
        message: 'Facturas del usuario obtenidas exitosamente',
        data: result
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener facturas del usuario autenticado
   */
  static async getMyInvoices(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const { error, value } = queryInvoicesSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
      }
      
      const result = await InvoiceService.getUserInvoices(userId, value);

      return res.json({
        success: true,
        message: 'Mis facturas obtenidas exitosamente',
        data: result
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener facturas vencidas
   */
  static async getOverdueInvoices(req: Request, res: Response) {
    try {
      const { error, value } = queryInvoicesSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
      }
      
      const result = await InvoiceService.getOverdueInvoices(value);

      return res.json({
        success: true,
        message: 'Facturas vencidas obtenidas exitosamente',
        data: result
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }
}

export default InvoiceController;