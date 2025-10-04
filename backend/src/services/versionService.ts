import { Page, PageVersion } from '@prisma/client';
import prisma from '../config/database';
import { createError } from '../middleware/errorHandler';
import { PageDataManager, GrapesJSData } from '../types/pageTypes';

export class VersionService {
  static async createVersion(pageId: string, note?: string): Promise<PageVersion> {
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw createError(404, 'Página no encontrada');

    let grapesJson: string | null = null;
    let renderedHtml: string | null = null;
    let renderedCss: string | null = null;

    try {
      if (page.grapesData) {
        grapesJson = page.grapesData;
        try {
          const parsed: GrapesJSData = JSON.parse(page.grapesData);
          const generated = PageDataManager.generatePublicContent(parsed);
          renderedHtml = generated?.html || null;
          renderedCss = generated?.css || null;
        } catch {
          renderedHtml = null;
          renderedCss = null;
        }
      }
    } catch {}

    // Resolver html/css directos o gjs
    if (!renderedHtml) renderedHtml = page.gjsHtml || page.html || null;
    if (!renderedCss) renderedCss = page.gjsCss || page.css || null;

    const version = await prisma.pageVersion.create({
      data: {
        pageId,
        grapesJson,
        renderedHtml,
        renderedCss,
        note: note || 'snapshot',
      },
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
        grapesData: version.grapesJson ?? page.grapesData,
        gjsHtml: version.renderedHtml ?? page.gjsHtml,
        gjsCss: version.renderedCss ?? page.gjsCss,
        html: version.renderedHtml ?? page.html,
        css: version.renderedCss ?? page.css,
        updatedAt: new Date(),
      },
    });

    return updated;
  }
}