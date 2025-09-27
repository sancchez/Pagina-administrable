import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/reportService';
import { ReportType, ReportStatus } from '@prisma/client';
import Joi from 'joi';

// Esquemas de validación
const createReportSchema = Joi.object({
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
  type: Joi.string().valid(...Object.values(ReportType)).required().messages({
    'any.required': 'El tipo de reporte es requerido',
    'any.only': 'El tipo de reporte debe ser uno de los valores válidos',
  }),
  location: Joi.string().max(200).optional().allow(''),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
});

const updateReportSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional().messages({
    'string.min': 'El título debe tener al menos 3 caracteres',
    'string.max': 'El título no puede exceder 200 caracteres',
  }),
  description: Joi.string().min(10).max(2000).optional().messages({
    'string.min': 'La descripción debe tener al menos 10 caracteres',
    'string.max': 'La descripción no puede exceder 2000 caracteres',
  }),
  type: Joi.string().valid(...Object.values(ReportType)).optional(),
  location: Joi.string().max(200).optional().allow(''),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
  status: Joi.string().valid(...Object.values(ReportStatus)).optional(),
});

const getReportsQuerySchema = Joi.object({
  search: Joi.string().optional(),
  type: Joi.string().valid(...Object.values(ReportType)).optional(),
  status: Joi.string().valid(...Object.values(ReportStatus)).optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
  userId: Joi.string().optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const addCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'El comentario no puede estar vacío',
    'string.max': 'El comentario no puede exceder 1000 caracteres',
    'any.required': 'El contenido del comentario es requerido',
  }),
});

const changeStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ReportStatus)).required().messages({
    'any.required': 'El estado es requerido',
    'any.only': 'El estado debe ser uno de los valores válidos',
  }),
});

export class ReportController {
  static async createReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = createReportSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const reportData = {
        ...value,
        userId: (req.user as any)?.id
      };
      const report = await ReportService.createReport(reportData);

      return res.status(201).json({
        success: true,
        message: 'Reporte creado exitosamente',
        data: { report },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = getReportsQuerySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const result = await ReportService.getReports(value);

      return res.json({
        success: true,
        message: 'Reportes obtenidos exitosamente',
        data: result,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async getReportById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const report = await ReportService.getReportById(id);

      return res.json({
        success: true,
        message: 'Reporte obtenido exitosamente',
        data: { report },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async updateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = updateReportSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const report = await ReportService.updateReport(id, value);

      return res.json({
        success: true,
        message: 'Reporte actualizado exitosamente',
        data: { report },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async deleteReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ReportService.deleteReport(id);

      return res.json({
        success: true,
        message: 'Reporte eliminado exitosamente',
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async getReportStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ReportService.getReportStats();

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

  static async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = addCommentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const comment = await ReportService.addComment({
        content: value.content,
        userId: (req.user as any)?.id,
        reportId: id
      });

      return res.status(201).json({
        success: true,
        message: 'Comentario agregado exitosamente',
        data: { comment },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, commentId } = req.params;
      const { error, value } = addCommentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const comment = await ReportService.updateComment(commentId, value.content, (req.user as any)?.id);

      return res.json({
        success: true,
        message: 'Comentario actualizado exitosamente',
        data: { comment },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, commentId } = req.params;
      await ReportService.deleteComment(commentId, (req.user as any)?.id);

      return res.json({
        success: true,
        message: 'Comentario eliminado exitosamente',
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

      const report = await ReportService.changeStatus(id, value.status);

      return res.json({
        success: true,
        message: 'Estado actualizado exitosamente',
        data: { report },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  static async getUserReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { error, value } = getReportsQuerySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      // Agregar userId a los filtros para obtener reportes del usuario específico
      const filtersWithUserId = { ...value, userId };
      const result = await ReportService.getReports(filtersWithUserId);

      return res.json({
        success: true,
        message: 'Reportes del usuario obtenidos exitosamente',
        data: result,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }
}