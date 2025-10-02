import { Report, ReportFile, ReportComment } from '@prisma/client';
import prisma from '../config/database';
import { createError } from '../middleware/errorHandler';

export interface CreateReportData {
  title: string;
  description: string;
  type: string;
  location?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  userId: string;
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  type?: string;
  location?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: string;
}

export interface ReportFilters {
  search?: string;
  type?: string;
  status?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface CreateCommentData {
  content: string;
  userId: string;
  reportId: string;
}

export class ReportService {
  static async createReport(data: CreateReportData): Promise<Report> {
    // Validaciones de entrada
    if (!data.title || data.title.trim().length === 0) {
      throw createError(400, 'El título es requerido');
    }
    
    if (!data.description || data.description.trim().length === 0) {
      throw createError(400, 'La descripción es requerida');
    }
    
    if (!data.userId || data.userId.trim().length === 0) {
      throw createError(400, 'El ID del usuario es requerido');
    }

    // Verificar que el usuario existe
    const userExists = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true }
    });

    if (!userExists) {
      throw createError(404, 'Usuario no encontrado');
    }

    const report = await prisma.report.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        type: data.type,
        priority: data.priority || 'MEDIUM',
        createdBy: data.userId,
        status: "PENDING",
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        files: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return report;
  }

  static async getReportById(id: string): Promise<Report | null> {
    // Validación de entrada
    if (!id || id.trim().length === 0) {
      throw createError(400, 'El ID del reporte es requerido');
    }

    const report = await prisma.report.findUnique({
      where: { id: id.trim() },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        files: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return report;
  }

  static async updateReport(id: string, data: UpdateReportData): Promise<Report> {
    // Validaciones de entrada
    if (!id || id.trim().length === 0) {
      throw createError(400, 'El ID del reporte es requerido');
    }

    // Validar campos si se proporcionan
    if (data.title !== undefined && (!data.title || data.title.trim().length === 0)) {
      throw createError(400, 'El título no puede estar vacío');
    }

    if (data.description !== undefined && (!data.description || data.description.trim().length === 0)) {
      throw createError(400, 'La descripción no puede estar vacía');
    }

    const existingReport = await prisma.report.findUnique({
      where: { id: id.trim() },
    });

    if (!existingReport) {
      throw createError(404, 'Reporte no encontrado');
    }

    // Limpiar datos de entrada
    const cleanData: UpdateReportData = {};
    if (data.title !== undefined) cleanData.title = data.title.trim();
    if (data.description !== undefined) cleanData.description = data.description.trim();
    if (data.location !== undefined) cleanData.location = data.location?.trim();
    if (data.type !== undefined) cleanData.type = data.type;
    if (data.priority !== undefined) cleanData.priority = data.priority;
    if (data.status !== undefined) cleanData.status = data.status;

    const report = await prisma.report.update({
      where: { id: id.trim() },
      data: cleanData,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        files: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return report;
  }

  static async deleteReport(id: string): Promise<void> {
    // Validación de entrada
    if (!id || id.trim().length === 0) {
      throw createError(400, 'El ID del reporte es requerido');
    }

    const existingReport = await prisma.report.findUnique({
      where: { id: id.trim() },
    });

    if (!existingReport) {
      throw createError(404, 'Reporte no encontrado');
    }

    // Eliminar archivos asociados, comentarios y el reporte
    await prisma.$transaction([
      prisma.reportFile.deleteMany({ where: { reportId: id.trim() } }),
      prisma.reportComment.deleteMany({ where: { reportId: id.trim() } }),
      prisma.report.delete({ where: { id: id.trim() } }),
    ]);
  }

  static async getReports(filters: ReportFilters = {}) {
    const {
      search,
      type,
      status,
      priority,
      userId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    // Construir condiciones de filtro
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (userId) {
      where.userId = userId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    // Obtener reportes y total
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          files: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getReportStats() {
    const [total, byStatus, byType, byPriority, recentCount] = await Promise.all([
      prisma.report.count(),
      prisma.report.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
      prisma.report.groupBy({
        by: ['type'],
        _count: {
          id: true,
        },
      }),
      prisma.report.groupBy({
        by: ['priority'],
        _count: {
          id: true,
        },
      }),
      prisma.report.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
          },
        },
      }),
    ]);

    const statusStats = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    const typeStats = byType.reduce((acc: Record<string, number>, item: { type: string; _count: { id: number } }) => {
      acc[item.type] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    const priorityStats = byPriority.reduce((acc: Record<string, number>, item: { priority: string; _count: { id: number } }) => {
      acc[item.priority] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      recent: recentCount,
      byStatus: statusStats,
      byType: typeStats,
      byPriority: priorityStats,
    };
  }

  static async addComment(data: CreateCommentData): Promise<ReportComment> {
    const comment = await prisma.reportComment.create({
      data: {
        content: data.content,
        userId: data.userId,
        reportId: data.reportId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return comment;
  }

  static async updateComment(id: string, content: string, userId: string): Promise<ReportComment> {
    const existingComment = await prisma.reportComment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      throw createError(404, 'Comentario no encontrado');
    }

    if (existingComment.userId !== userId) {
      throw createError(403, 'No tienes permisos para editar este comentario');
    }

    const comment = await prisma.reportComment.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return comment;
  }

  static async deleteComment(id: string, userId: string): Promise<void> {
    const existingComment = await prisma.reportComment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      throw createError(404, 'Comentario no encontrado');
    }

    if (existingComment.userId !== userId) {
      throw createError(403, 'No tienes permisos para eliminar este comentario');
    }

    await prisma.reportComment.delete({
      where: { id },
    });
  }

  static async addFile(reportId: string, fileName: string, filePath: string, fileSize: number, mimeType: string = 'application/octet-stream'): Promise<ReportFile> {
    const file = await prisma.reportFile.create({
      data: {
        fileName,
        filePath,
        fileSize,
        mimeType,
        reportId,
      },
    });

    return file;
  }

  static async deleteFile(id: string): Promise<void> {
    await prisma.reportFile.delete({
      where: { id },
    });
  }

  static async changeStatus(id: string, status: string): Promise<Report> {
    const updatedReport = await prisma.report.update({
      where: { id },
      data: { status },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        files: true,
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return updatedReport;
  }
}