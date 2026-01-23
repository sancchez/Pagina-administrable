import { Page, PageBackup, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { createError } from '../middleware/errorHandler';
import { PageDataManager, GrapesJSData } from '../types/pageTypes';
import { MigrationService } from './migrationService';
import DOMPurify from 'isomorphic-dompurify';
import { VersionService } from './versionService';

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
      // ELIMINADO: else { where.isActive = true; } para mostrar todas las páginas por defecto (petición usuario)

      // Filter by isPublished if provided (dragging logic from controller flexibility)
      if ('isPublished' in filters && typeof (filters as any).isPublished === 'boolean') {
        where.isPublished = (filters as any).isPublished;
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
      const page = await prisma.page.findFirst({
        where: {
          slug,
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

      // Hard delete solicitado por el usuario
      await prisma.page.delete({
        where: { id }
      });

      // Optimizar espacio
      await this.optimizeDatabase();
    } catch (error: any) {
      if (error.status) throw error;
      console.error('Error deleting page:', error);
      throw createError(500, 'Error interno del servidor al eliminar la página');
    }
  }

  /**
   * Guardar datos de GrapesJS (JSON) junto con HTML y CSS generados automáticamente
   */
  static async saveGrapesData(
    id: string,
    grapesDataString: string,
    html?: string,
    css?: string,
    gjsComponents?: string,
    gjsStyles?: string,
    isAutoSave?: boolean
  ): Promise<Page> {
    try {
      const page = await prisma.page.findUnique({
        where: { id }
      });

      if (!page) {
        throw createError(404, 'Página no encontrada');
      }

      // Crear backup antes de guardar (solo si hay contenido previo)
      if (page.gjsHtml || page.gjsCss || page.gjsComponents || page.gjsStyles) {
        await this.createBackup(page);
      }

      // Modo flexible: aceptar cualquier formato sin rechazar el payload
      let grapesData: any = {};
      try {
        grapesData = typeof grapesDataString === 'string' ? JSON.parse(grapesDataString) : grapesDataString;
      } catch {
        grapesData = {};
      }

      // Intentar generar contenido de forma tolerante
      let generatedContent: { html: string; css: string } | null = null;
      try {
        generatedContent = PageDataManager.generatePublicContent(grapesData as GrapesJSData);
      } catch {
        console.warn('[PageService.saveGrapesData] generatePublicContent failed, continuing');

        generatedContent = null;
      }

      // Resolver HTML/CSS con múltiples claves posibles
      let htmlToSave = html ?? grapesData['gjs-html'] ?? grapesData.html ?? generatedContent?.html ?? '';
      let cssToSave = css ?? grapesData['gjs-css'] ?? grapesData.css ?? generatedContent?.css ?? '';

      // Fallback robusto: si el CSS está vacío pero existen components/styles, generar CSS
      if ((!cssToSave || cssToSave.trim() === '') && (grapesData?.components || grapesData?.['gjs-components'])) {
        try {
          const comps = grapesData?.components ?? grapesData?.['gjs-components'] ?? [];
          const stylesArr = grapesData?.styles ?? grapesData?.['gjs-styles'] ?? [];
          const gen = await MigrationService.generateHtmlCssFromGrapes({ components: comps, styles: stylesArr });
          cssToSave = gen?.css || cssToSave || '';
        } catch (e) {
          console.warn('[PageService.saveGrapesData] CSS fallback generation failed', e);
        }
      }

      const updateData = {
        grapesData: grapesDataString, // Guardar los datos completos para el frontend
        gjsHtml: htmlToSave,
        gjsCss: cssToSave,
        gjsComponents: gjsComponents ?? JSON.stringify(grapesData['gjs-components'] ?? grapesData.gjsComponents ?? []),
        gjsStyles: gjsStyles ?? JSON.stringify(grapesData['gjs-styles'] ?? grapesData.gjsStyles ?? []),
        updatedAt: new Date()
      };

      const updatedPage = await prisma.page.update({
        where: { id },
        data: updateData
      });

      // Log memory usage to help diagnose memory pressure
      try {
        console.log('[PageService.saveGrapesData] memoryUsage', process.memoryUsage());
      } catch (e) { /* ignore */ }

      // Crear versión automática tras guardar (omitir para autosaves)
      if (!isAutoSave) {
        try {
          await VersionService.createVersion(id, 'auto-save');
        } catch (e) {
          console.warn('[PageService] auto version creation failed', e);
        }
      } else {
        console.log('[PageService.saveGrapesData] autosave detected - skipping version creation');
      }

      // Ya no publicamos automáticamente para separar las funcionalidades de guardar y publicar
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
   * Publicar página por slug priorizando gjsHtml/gjsCss
   */
  static async publishPage(slug: string): Promise<any> {
    const page = await prisma.page.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        gjsHtml: true,
        gjsCss: true,
        html: true,
        css: true,
        content: true
      }
    });

    if (!page) {
      throw new Error('Página no encontrada');
    }

    // CASCADA: Usar gjsHtml primero, sino html legacy y luego content
    let htmlToPublish = page.gjsHtml || page.html || page.content || '';
    let cssToPublish = page.gjsCss || page.css || '';

    if (!htmlToPublish) {
      throw new Error('No hay contenido para publicar');
    }

    // Fallback robusto: si el CSS está vacío, intentar generarlo desde grapesData
    if ((!cssToPublish || cssToPublish.trim() === '') && page.id) {
      try {
        const full = await prisma.page.findUnique({ where: { slug }, select: { grapesData: true } });
        if (full?.grapesData) {
          const gd = JSON.parse(full.grapesData);
          const comps = gd?.components ?? gd?.['gjs-components'] ?? [];
          const stylesArr = gd?.styles ?? gd?.['gjs-styles'] ?? [];
          const gen = await MigrationService.generateHtmlCssFromGrapes({ components: comps, styles: stylesArr });
          cssToPublish = gen?.css || cssToPublish || '';
        }
      } catch (e) {
        console.warn('[PageService.publishPage] CSS fallback generation failed', e);
      }
    }

    // Limpiar solo los scripts inline de GrapesJS que contienen handleClick
    // pero preservar los atributos data-action-type de los elementos HTML
    htmlToPublish = htmlToPublish.replace(/<script[^>]*>\s*[\s\S]*?function\s+handleClick[\s\S]*?<\/script>/g, '');

    // Inyectar script de botones si la página contiene botones con data-action-type
    if (htmlToPublish.includes('data-action-type')) {
      const buttonScript = '<script src="/button-actions.js" defer></script>';

      // Buscar la etiqueta </body> o </html> para insertar el script
      if (htmlToPublish.includes('</body>')) {
        htmlToPublish = htmlToPublish.replace('</body>', `${buttonScript}\n</body>`);
      } else if (htmlToPublish.includes('</html>')) {
        htmlToPublish = htmlToPublish.replace('</html>', `${buttonScript}\n</html>`);
      } else {
        // Si no hay etiquetas de cierre, agregar al final
        htmlToPublish += `\n${buttonScript}`;
      }
    }

    const published = await prisma.page.update({
      where: { id: page.id },
      data: {
        publishedHtml: htmlToPublish,
        publishedCss: cssToPublish,
        publishedAt: new Date(),
        isPublished: true,
        updatedAt: new Date()
      }
    });

    return published;
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
          isPublished: !page.isPublished,
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
        where: {
          isActive: true,
          isPublished: true
        },
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
        prisma.page.count({ where: { isActive: true } }), // Total active
        prisma.page.count({ where: { isActive: true, isPublished: true } }), // Active and Published
        prisma.page.count({ where: { isActive: true, isPublished: false } }) // Active and Draft
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
          gjsHtml: page.gjsHtml || '',
          gjsCss: page.gjsCss || '',
          gjsComponents: page.gjsComponents || '[]',
          gjsStyles: page.gjsStyles || '[]'
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

      // Restaurar desde el backup y publicar los cambios
      const restoredPage = await prisma.page.update({
        where: { id: pageId },
        data: {
          title: backup.title,
          gjsHtml: backup.gjsHtml,
          gjsCss: backup.gjsCss,
          gjsComponents: backup.gjsComponents,
          gjsStyles: backup.gjsStyles,
          // Actualizar también los campos de publicación para que se refleje en la página pública
          publishedHtml: backup.gjsHtml,
          publishedCss: backup.gjsCss,
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
   * Eliminar un backup específico
   */
  static async deleteBackup(pageId: string, backupId: string): Promise<void> {
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

      // Eliminar el backup
      await prisma.pageBackup.delete({
        where: { id: backupId }
      });
    } catch (error: any) {
      if (error.status) throw error;
      console.error('Error deleting backup:', error);
      throw createError(500, 'Error interno del servidor al eliminar backup');
    }
  }

  /**
   * Eliminar múltiples backups
   */
  static async deleteMultipleBackups(pageId: string, backupIds: string[]): Promise<number> {
    try {
      // Eliminar backups en lote que pertenezcan a la página especificada
      const result = await prisma.pageBackup.deleteMany({
        where: {
          id: { in: backupIds },
          pageId: pageId
        }
      });

      return result.count;
    } catch (error: any) {
      console.error('Error deleting multiple backups:', error);
      throw createError(500, 'Error interno del servidor al eliminar backups');
    }
  }

  /**
   * Optimizar base de datos (reclamar espacio en disco)
   * Especialmente útil para SQLite después de eliminaciones masivas
   */
  static async optimizeDatabase(): Promise<void> {
    try {
      // VACUUM reconstruye la base de datos y reclama espacio no utilizado
      await prisma.$executeRawUnsafe('VACUUM');
      console.log('Database optimized (VACUUM executed)');
    } catch (error: any) {
      console.warn('Error optimizing database:', error);
      // No lanzar error para no interrumpir flujos principales
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