import { Page, PageVersion } from '@prisma/client';
import prisma from '../config/database';
import { createError } from '../middleware/errorHandler';
import { PageDataManager, GrapesJSData } from '../types/pageTypes';

export class VersionService {
  static async createVersion(pageId: string, description?: string): Promise<PageVersion> {
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw createError(404, 'Página no encontrada');

    // Determinar contenido publicado (o borrador) con cascada
    const htmlSnapshot = page.publishedHtml || page.gjsHtml || page.html || page.content || null;
    const cssSnapshot = page.publishedCss || page.gjsCss || page.css || null;

    const version = await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        title: page.title, // Agregar título requerido
        // Snapshot completo de estado de edición (GrapesJS)
        gjsHtml: page.gjsHtml || null,
        gjsCss: page.gjsCss || null,
        gjsComponents: page.gjsComponents || null,
        gjsStyles: page.gjsStyles || null,
        grapesData: page.grapesData || null,
        // Snapshot de HTML/CSS preferentemente publicados
        html: htmlSnapshot,
        css: cssSnapshot,
        // Contenido publicado explícito
        publishedHtml: page.publishedHtml || null,
        publishedCss: page.publishedCss || null,
        // Versión numérica de la página al momento del snapshot
        version: page.version,
        // Nota descriptiva
        note: description || `Versión ${page.version}`,
        createdAt: new Date()
      }
    });

    return version;
  }

  static async listVersions(pageId: string): Promise<PageVersion[]> {
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw createError(404, 'Página no encontrada');

    return prisma.pageVersion.findMany({
      where: { pageId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async restoreVersion(pageId: string, versionId: string): Promise<Page> {
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw createError(404, 'Página no encontrada');

    const version = await prisma.pageVersion.findUnique({ where: { id: versionId } });
    if (!version || version.pageId !== pageId) throw createError(404, 'Versión no encontrada');

    const updated = await prisma.page.update({
      where: { id: pageId },
      data: {
        grapesData: version.grapesData ?? page.grapesData,
        gjsHtml: version.gjsHtml ?? page.gjsHtml,
        gjsCss: version.gjsCss ?? page.gjsCss,
        html: version.html ?? page.html,
        css: version.css ?? page.css,
        publishedHtml: version.publishedHtml ?? page.publishedHtml,
        publishedCss: version.publishedCss ?? page.publishedCss,
        updatedAt: new Date(),
      },
    });

    return updated;
  }
}