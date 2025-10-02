import { createError } from '../middleware/errorHandler';
import prisma from '../config/database';

interface CreatePQRData {
  title: string;
  description: string;
  type: string;
  priority?: string;
  userId: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface UpdatePQRData {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface PQRFilters {
  search?: string;
  type?: string;
  status?: string;
  priority?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

interface AddCommentData {
  content: string;
  userId: string;
  pqrId: string;
}

export class PQRService {
  static async createPQR(data: CreatePQRData) {
    try {
      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw createError(404, 'Usuario no encontrado');
      }

      const pqr = await prisma.pQR.create({
        data: {
          subject: data.title,
          description: data.description,
          type: data.type,
          priority: data.priority || 'MEDIUM',
          status: 'RECEIVED',
          createdBy: data.userId,
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
        },
      });

      return pqr;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw createError(500, 'Error al crear PQR');
    }
  }

  static async getPQRs(filters: PQRFilters) {
    try {
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

      const count = await prisma.pQR.count({
        where,
      });

      const [pqrs, total] = await Promise.all([
        prisma.pQR.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' },
          ],
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            _count: {
              select: {
                files: true,
              },
            },
          },
        }),
        prisma.pQR.count({ where }),
      ]);

      return {
        pqrs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw createError(500, 'Error al obtener PQRs');
    }
  }

  static async getPQRById(id: string) {
    try {
      const pqr = await prisma.pQR.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          files: {
            orderBy: { uploadedAt: 'desc' },
          },
        },
      });

      if (!pqr) {
        throw createError(404, 'PQR no encontrado');
      }

      return pqr;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw createError(500, 'Error al obtener PQR');
    }
  }

  static async updatePQR(id: string, data: UpdatePQRData) {
    try {
      // Verificar que el PQR existe
      const existingPQR = await prisma.pQR.findUnique({
        where: { id },
      });

      if (!existingPQR) {
        throw createError(404, 'PQR no encontrado');
      }

      const pqr = await prisma.pQR.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
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
        },
      });

      return pqr;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw createError(500, 'Error al actualizar PQR');
    }
  }

  static async deletePQR(id: string) {
    try {
      // Verificar que el PQR existe
      const existingPQR = await prisma.pQR.findUnique({
        where: { id },
      });

      if (!existingPQR) {
        throw createError(404, 'PQR no encontrado');
      }

      // Eliminar archivos asociados primero
      await prisma.pQRFile.deleteMany({
        where: { pqrId: id },
      });

      // Eliminar el PQR
      await prisma.pQR.delete({
        where: { id },
      });

      return { message: 'PQR eliminado exitosamente' };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw createError(500, 'Error al eliminar PQR');
    }
  }

  static async getPQRStats() {
    try {
      const [
        total,
        byStatus,
        byType,
        byPriority,
        thisMonth,
        lastMonth,
      ] = await Promise.all([
        // Total de PQRs
        prisma.pQR.count(),
        
        // Por estado
        prisma.pQR.groupBy({
          by: ['status'],
          _count: true,
        }),
        
        // Por tipo
        prisma.pQR.groupBy({
          by: ['type'],
          _count: true,
        }),
        
        // Por prioridad
        prisma.pQR.groupBy({
          by: ['priority'],
          _count: true,
        }),
        
        // Este mes
        prisma.pQR.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        
        // Mes pasado
        prisma.pQR.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ]);

      // Formatear resultados
      const statusStats = byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>);

      const typeStats = byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>);

      const priorityStats = byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        byStatus: statusStats,
        byType: typeStats,
        byPriority: priorityStats,
        thisMonth,
        lastMonth,
        growth: lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0,
      };
    } catch (error: any) {
      throw createError(500, 'Error al obtener estadísticas de PQRs');
    }
  }

  static async changeStatus(id: string, status: string) {
    try {
      // Verificar que el PQR existe
      const existingPQR = await prisma.pQR.findUnique({
        where: { id },
      });

      if (!existingPQR) {
        throw createError(404, 'PQR no encontrado');
      }

      const pqr = await prisma.pQR.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date(),
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
        },
      });

      return pqr;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw createError(500, 'Error al cambiar estado del PQR');
    }
  }

  static async addFile(data: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    pqrId: string;
    uploadedBy: string;
  }) {
    try {
      // Verificar que el PQR existe
      const existingPQR = await prisma.pQR.findUnique({
        where: { id: data.pqrId },
      });

      if (!existingPQR) {
        throw createError(404, 'PQR no encontrado');
      }

      const file = await prisma.pQRFile.create({
        data: {
          fileName: data.filename,
          filePath: data.url,
          fileSize: data.size,
          mimeType: data.mimeType,
          pqrId: data.pqrId,
        },
      });

      return file;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw createError(500, 'Error al agregar archivo');
    }
  }

  static async deleteFile(fileId: string, userId: string) {
    try {
      // Verificar que el archivo existe y pertenece al usuario o es admin/manager
      const file = await prisma.pQRFile.findUnique({
        where: { id: fileId },
        include: {
          pqr: {
            include: {
              creator: true,
            },
          },
        },
      });

      if (!file) {
        throw createError(404, 'Archivo no encontrado');
      }

      // Verificar permisos
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createError(404, 'Usuario no encontrado');
      }

      const canDelete = 
        file.pqr.createdBy === userId || 
        user.role === 'ADMIN' || 
        user.role === 'MANAGER';

      if (!canDelete) {
        throw createError(403, 'No tienes permisos para eliminar este archivo');
      }

      await prisma.pQRFile.delete({
        where: { id: fileId },
      });

      return { message: 'Archivo eliminado exitosamente' };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw createError(500, 'Error al eliminar archivo');
    }
  }

  static async getRecentPQRs(limit: number = 5) {
    try {
      const pqrs = await prisma.pQR.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return pqrs;
    } catch (error: any) {
      throw createError(500, 'Error al obtener PQRs recientes');
    }
  }

  static async getPQRsByUser(userId: string, filters: Omit<PQRFilters, 'userId'>) {
    try {
      return await this.getPQRs({ ...filters, userId });
    } catch (error: any) {
      throw createError(500, 'Error al obtener PQRs del usuario');
    }
  }
}