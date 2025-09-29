import { Page, PageBackup, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { createError } from '../middleware/errorHandler';
import { PageDataManager, GrapesJSData } from '../types/pageTypes';

export interface CreatePageData {
  title: string;
  slug: string;
  content?: string;
  html?: string;
  css?: string;
  isActive?: boolean;
}

export interface UpdatePageData {
  title?: string;
  slug?: string;
  content?: string;
  grapesData?: string;
  html?: string;
  css?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished?: boolean;
  isActive?: boolean;
}

export interface PageFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class PageService {
  /**
   * Crear una nueva página
   */
  static async createPage(data: CreatePageData): Promise<Page> {
    try {
      // Verificar si ya existe una página con el mismo slug
      const existingPage = await prisma.page.findUnique({
        where: { slug: data.slug }
      });

      if (existingPage) {
        throw createError(400, 'Ya existe una página con este slug');
      }

      const page = await prisma.page.create({
        data: {
          title: data.title,
          slug: data.slug,
          name: data.title, // Use title as name for backward compatibility
          content: data.content || '',
          html: data.html,
          css: data.css,
          isActive: data.isActive !== undefined ? data.isActive : true
        }
      });

      return page;
    } catch (error: any) {
      if (error.status) throw error;
      console.error('Error creating page:', error);
      throw createError(500, 'Error interno del servidor al crear la página');
    }
  }

  /**
   * Obtener páginas con filtros y paginación
   */
  static async getPages(filters: PageFilters = {}) {
    try {
      const {
        search,
        isActive,
        page = 1,
        limit = 10
      } = filters;

      const skip = (page - 1) * limit;

      // Construir condiciones de filtro
      const where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (typeof isActive === 'boolean') {
        where.isActive = isActive;
      }

      // Obtener páginas con paginación
      const [pages, total] = await Promise.all([
        prisma.page.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' }
        }),
        prisma.page.count({ where })
      ]);

      return {
        pages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      console.error('Error getting pages:', error);
      throw createError(500, 'Error interno del servidor al obtener las páginas');
    }
  }

  /**
   * Obtener una página por ID
   */
  static async getPageById(id: string): Promise<Page> {
    try {
      const page = await prisma.page.findUnique({
        where: { id }
      });

      if (!page) {
        throw createError(404, 'Página no encontrada');
      }

      return page;
    } catch (error: any) {
      if (error.status) throw error;
      console.error('Error getting page by ID:', error);
      throw createError(500, 'Error interno del servidor al obtener la página');
    }
  }

  /**
   * Obtener página por slug (público) con manejo estandarizado de datos
   */
  static async getPageBySlug(slug: string): Promise<Page | null> {
    try {
      const page = await prisma.page.findUnique({
        where: { 
          slug,
          isPublished: true,
          isActive: true
        }
      });

      if (!page) {
        return null;
      }

      // Si la página tiene datos legacy en content pero no grapesData, migrar
      if (!page.grapesData && page.content) {
        const migratedData = PageDataManager.migrateLegacyContent(page.content);
        if (migratedData) {
          const generatedContent = PageDataManager.generatePublicContent(migratedData);
          
          // Actualizar la página con los datos migrados
          const updatedPage = await prisma.page.update({
            where: { id: page.id },
            data: {
              grapesData: JSON.stringify(migratedData),
              html: generatedContent.html,
              css: generatedContent.css
            }
          });
          
          return updatedPage;
        }
      }

      return page;
    } catch (error: any) {
      console.error('Error getting page by slug:', error);
      throw createError(500, 'Error interno del servidor al obtener la página');
    }
  }

  /**
   * Actualizar una página
   */
  /**
   * Actualizar una página (con backup automático)
   */
  static async updatePage(id: string, data: UpdatePageData): Promise<Page> {
    try {
      // Verificar que la página existe
      const existingPage = await prisma.page.findUnique({
        where: { id }
      });

      if (!existingPage) {
        throw createError(404, 'Página no encontrada');
      }

      // Si se está actualizando el slug, verificar que no exista otro con el mismo slug
      if (data.slug && data.slug !== existingPage.slug) {
        const pageWithSlug = await prisma.page.findUnique({
          where: { slug: data.slug }
        });

        if (pageWithSlug) {
          throw createError(400, 'Ya existe una página con este slug');
        }
      }

      // Crear backup antes de actualizar (solo si hay cambios significativos)
      const hasContentChanges = data.content !== undefined || 
                                data.html !== undefined || 
                                data.css !== undefined ||
                                data.title !== undefined;

      if (hasContentChanges) {
        await this.createBackup(existingPage);
      }

      const updatedPage = await prisma.page.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      return updatedPage;
    } catch (error: any) {
      if (error.status) throw error;
      console.error('Error updating page:', error);
      throw createError(500, 'Error interno del servidor al actualizar la página');
    }
  }

  /**
   * Eliminar una página
   */
  static async deletePage(id: string): Promise<void> {
    try {
      const page = await prisma.page.findUnique({
        where: { id }
      });

      if (!page) {
        throw createError(404, 'Página no encontrada');
      }

      await prisma.page.delete({
        where: { id }
      });
    } catch (error: any) {
      if (error.status) throw error;
      console.error('Error deleting page:', error);
      throw createError(500, 'Error interno del servidor al eliminar la página');
    }
  }

  /**
   * Guardar datos de GrapesJS (JSON) junto con HTML y CSS generados automáticamente
   */
  static async saveGrapesData(id: string, grapesDataString: string, html?: string, css?: string): Promise<Page> {
    try {
      const page = await prisma.page.findUnique({
        where: { id }
      });
  
      if (!page) {
        throw createError(404, 'Página no encontrada');
      }

      // Crear backup antes de guardar (solo si hay contenido previo)
      if (page.grapesData || page.html || page.css || page.content) {
        await this.createBackup(page);
      }

      // Parsear y validar los datos de GrapesJS
      let grapesData: GrapesJSData;
      try {
        grapesData = JSON.parse(grapesDataString);
        if (!PageDataManager.validateGrapesData(grapesData)) {
          throw new Error('Estructura de datos GrapesJS inválida');
        }
      } catch (parseError) {
        throw createError(400, 'Datos de GrapesJS inválidos');
      }

      // Generar HTML y CSS automáticamente si no se proporcionan
      const generatedContent = PageDataManager.generatePublicContent(grapesData);
      
      const updateData = {
        grapesData: grapesDataString, // Guardar como string JSON
        html: html || generatedContent.html,
        css: css || generatedContent.css,
        updatedAt: new Date()
      };
  
      const updatedPage = await prisma.page.update({
        where: { id },
        data: updateData
      });
  
      return updatedPage;
    } catch (error: any) {
      if (error.status) throw error;
      console.error('Error saving GrapesJS data:', error);
      throw createError(500, 'Error interno del servidor al guardar los datos de GrapesJS');
    }
  }

  /**
   * Guardar contenido HTML
   */
  static async saveContent(id: string, content: string): Promise<Page> {
    try {
      const page = await prisma.page.findUnique({
        where: { id }
      });

      if (!page) {
        throw createError(404, 'Página no encontrada');
      }

      const updatedPage = await prisma.page.update({
        where: { id },
        data: {
          content,
          updatedAt: new Date()
        }
      });

      return updatedPage;
    } catch (error: any) {
      if (error.status) throw error;
      console.error('Error saving content:', error);
      throw createError(500, 'Error interno del servidor al guardar el contenido');
    }
  }

  /**
   * Publicar/despublicar una página
   */
  static async togglePublishStatus(id: string): Promise<Page> {
    try {
      const page = await prisma.page.findUnique({
        where: { id }
      });

      if (!page) {
        throw createError(404, 'Página no encontrada');
      }

      const updatedPage = await prisma.page.update({
        where: { id },
        data: {
          isActive: !page.isActive,
          updatedAt: new Date()
        }
      });

      return updatedPage;
    } catch (error: any) {
      if (error.status) throw error;
      console.error('Error toggling publish status:', error);
      throw createError(500, 'Error interno del servidor al cambiar el estado de publicación');
    }
  }

  /**
   * Obtener páginas publicadas (para el frontend público)
   */
  static async getPublishedPages() {
    try {
      const pages = await prisma.page.findMany({
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' }
      });

      return pages;
    } catch (error: any) {
      console.error('Error getting published pages:', error);
      throw createError(500, 'Error interno del servidor al obtener las páginas publicadas');
    }
  }

  /**
   * Obtener estadísticas de páginas
   */
  static async getPageStats() {
    try {
      const [total, published, unpublished] = await Promise.all([
        prisma.page.count(),
        prisma.page.count({ where: { isActive: true } }),
        prisma.page.count({ where: { isActive: false } })
      ]);

      // Páginas creadas este mes
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const thisMonthCount = await prisma.page.count({
        where: {
          createdAt: {
            gte: thisMonth
          }
        }
      });

      // Páginas creadas el mes pasado
      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const lastMonthEnd = new Date(thisMonth);
      lastMonthEnd.setMilliseconds(-1);

      const lastMonthCount = await prisma.page.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: lastMonthEnd
          }
        }
      });

      // Calcular crecimiento
      const growth = lastMonthCount > 0 
        ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 
        : thisMonthCount > 0 ? 100 : 0;

      return {
        total,
        published,
        unpublished,
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        growth: Math.round(growth * 100) / 100
      };
    } catch (error: any) {
      console.error('Error getting page stats:', error);
      throw createError(500, 'Error interno del servidor al obtener las estadísticas');
    }
  }

  /**
   * Crear backup de una página
   */
  static async createBackup(page: Page): Promise<PageBackup> {
    try {
      const backup = await prisma.pageBackup.create({
        data: {
          pageId: page.id,
          title: page.title,
          content: page.content,
          grapesData: page.grapesData as any,
          html: page.html,
          css: page.css
        }
      });

      return backup;
    } catch (error: any) {
      console.error('Error creating backup:', error);
      throw createError(500, 'Error interno del servidor al crear backup');
    }
  }

  /**
   * Obtener backups de una página
   */
  static async getPageBackups(pageId: string, limit: number = 10): Promise<PageBackup[]> {
    try {
      const backups = await prisma.pageBackup.findMany({
        where: { pageId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return backups;
    } catch (error: any) {
      console.error('Error getting page backups:', error);
      throw createError(500, 'Error interno del servidor al obtener backups');
    }
  }

  /**
   * Restaurar página desde un backup
   */
  static async restoreFromBackup(pageId: string, backupId: string): Promise<Page> {
    try {
      // Verificar que la página existe
      const page = await prisma.page.findUnique({
        where: { id: pageId }
      });

      if (!page) {
        throw createError(404, 'Página no encontrada');
      }

      // Verificar que el backup existe y pertenece a la página
      const backup = await prisma.pageBackup.findFirst({
        where: { 
          id: backupId,
          pageId: pageId
        }
      });

      if (!backup) {
        throw createError(404, 'Backup no encontrado');
      }

      // Crear backup del estado actual antes de restaurar
      await this.createBackup(page);

      // Restaurar desde el backup
      const restoredPage = await prisma.page.update({
        where: { id: pageId },
        data: {
          title: backup.title,
          content: backup.content,
          grapesData: backup.grapesData as any,
          html: backup.html,
          css: backup.css,
          updatedAt: new Date()
        }
      });

      return restoredPage;
    } catch (error: any) {
      if (error.status) throw error;
      console.error('Error restoring from backup:', error);
      throw createError(500, 'Error interno del servidor al restaurar backup');
    }
  }

  /**
   * Eliminar backups antiguos (mantener solo los últimos N)
   */
  static async cleanupOldBackups(pageId: string, keepCount: number = 20): Promise<void> {
    try {
      const backups = await prisma.pageBackup.findMany({
        where: { pageId },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      });

      if (backups.length > keepCount) {
        const backupsToDelete = backups.slice(keepCount);
        const idsToDelete = backupsToDelete.map(b => b.id);

        await prisma.pageBackup.deleteMany({
          where: {
            id: { in: idsToDelete }
          }
        });
      }
    } catch (error: any) {
      console.error('Error cleaning up old backups:', error);
      // No lanzar error aquí, es una operación de limpieza
    }
  }
}