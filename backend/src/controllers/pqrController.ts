import { Request, Response, NextFunction } from 'express';
import { PQRService } from '../services/pqrService';

import Joi from 'joi';

// Esquemas de validación
const createPQRSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'El título debe tener al menos 3 caracteres',
    'string.max': 'El título no puede exceder 200 caracteres',
    'any.required': 'El título es requerido',
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.min': 'La descripción debe tener al menos 10 caracteres',
    'string.max': 'La descripción no puede exceder 2000 caracteres',
    'any.required': 'La descripción es requerida',
  }),
  type: Joi.string().valid(..."COMPLAINT", "REQUEST", "SUGGESTION").required().messages({
    'any.required': 'El tipo de PQR es requerido',
    'any.only': 'El tipo de PQR debe ser uno de los valores válidos',
  }),
  priority: Joi.string().valid(..."LOW", "MEDIUM", "HIGH").optional(),
  contactEmail: Joi.string().email().optional().messages({
    'string.email': 'El email de contacto debe ser válido',
  }),
  contactPhone: Joi.string().max(20).optional().messages({
    'string.max': 'El teléfono no puede exceder 20 caracteres',
  }),
});

const updatePQRSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional().messages({
    'string.min': 'El título debe tener al menos 3 caracteres',
    'string.max': 'El título no puede exceder 200 caracteres',
  }),
  description: Joi.string().min(10).max(2000).optional().messages({
    'string.min': 'La descripción debe tener al menos 10 caracteres',
    'string.max': 'La descripción no puede exceder 2000 caracteres',
  }),
  type: Joi.string().valid(..."COMPLAINT", "REQUEST", "SUGGESTION").optional(),
  priority: Joi.string().valid(..."LOW", "MEDIUM", "HIGH").optional(),
  status: Joi.string().valid(..."OPEN", "IN_PROGRESS", "RESOLVED").optional(),
  contactEmail: Joi.string().email().optional().allow('').messages({
    'string.email': 'El email de contacto debe ser válido',
  }),
  contactPhone: Joi.string().max(20).optional().allow('').messages({
    'string.max': 'El teléfono no puede exceder 20 caracteres',
  }),
});

const getPQRsQuerySchema = Joi.object({
  search: Joi.string().optional(),
  type: Joi.string().valid(..."COMPLAINT", "REQUEST", "SUGGESTION").optional(),
  status: Joi.string().valid(..."OPEN", "IN_PROGRESS", "RESOLVED").optional(),
  priority: Joi.string().valid(..."LOW", "MEDIUM", "HIGH").optional(),
  userId: Joi.string().optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const changeStatusSchema = Joi.object({
  status: Joi.string().valid(..."OPEN", "IN_PROGRESS", "RESOLVED").required().messages({
    'any.required': 'El estado es requerido',
    'any.only': 'El estado debe ser uno de los valores válidos',
  }),
});

export class PQRController {
  static async createPQR(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = createPQRSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const pqrData = {
        ...value,
        userId: (req.user as any)?.id
      };
      const pqr = await PQRService.createPQR(pqrData);

      return res.status(201).json({
        success: true,
        message: 'PQR creada exitosamente',
        data: { pqr },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async getPQRs(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = getPQRsQuerySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const result = await PQRService.getPQRs(value);

      return res.json({
        success: true,
        message: 'PQRs obtenidas exitosamente',
        data: result,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async getPQRById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pqr = await PQRService.getPQRById(id);

      return res.json({
        success: true,
        message: 'PQR obtenida exitosamente',
        data: { pqr },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async updatePQR(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = updatePQRSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const pqr = await PQRService.updatePQR(id, value);

      return res.json({
        success: true,
        message: 'PQR actualizada exitosamente',
        data: { pqr },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async deletePQR(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await PQRService.deletePQR(id);

      return res.json({
        success: true,
        message: 'PQR eliminada exitosamente',
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async getPQRStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await PQRService.getPQRStats();

      return res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: { stats },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async changeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = changeStatusSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const pqr = await PQRService.changeStatus(id, value.status);

      return res.json({
        success: true,
        message: 'Estado actualizado exitosamente',
        data: { pqr },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async getUserPQRs(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { error, value } = getPQRsQuerySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const result = await PQRService.getPQRs({ ...value, userId });

      return res.json({
        success: true,
        message: 'PQRs del usuario obtenidas exitosamente',
        data: result,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async getRecentPQRs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const pqrs = await PQRService.getRecentPQRs(limit);

      return res.json({
        success: true,
        message: 'PQRs recientes obtenidas exitosamente',
        data: { pqrs },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async addFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo',
        });
      }

      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: req.file.path,
        pqrId: id,
        uploadedBy: (req.user as any)?.id
      };
      const file = await PQRService.addFile(fileData);

      return res.json({
        success: true,
        message: 'Archivo agregado exitosamente',
        data: { file },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, fileId } = req.params;
      await PQRService.deleteFile(id, fileId);

      return res.json({
        success: true,
        message: 'Archivo eliminado exitosamente',
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }
}