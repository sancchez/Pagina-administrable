import { Request, Response } from 'express';
import Joi from 'joi';
import { VersionService } from '../services/versionService';
import prisma from '../config/database';

export class VersionController {
  static createSchema = Joi.object({
    note: Joi.string().max(200).optional(),
  });

  static async create(req: Request, res: Response) {
    const { id } = req.params; // pageId
    const { error, value } = this.createSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });
    const version = await VersionService.createVersion(id, value.note);
    return res.status(201).json({ success: true, message: 'Versión creada', data: version });
  }

  static async list(req: Request, res: Response) {
    const { id } = req.params; // pageId
    const versions = await VersionService.listVersions(id);
    res.status(200).json({ success: true, message: 'Versiones obtenidas', data: versions });
  }

  static async restore(req: Request, res: Response) {
    const { id, versionId } = req.params;
    const page = await VersionService.restoreVersion(id, versionId);
    res.status(200).json({ success: true, message: 'Versión revertida', data: page });
  }

  // Comparar dos versiones de una página
  static async compare(req: Request, res: Response) {
    const { id } = req.params;
    const fromId = (req.query.from as string) || '';
    const toId = (req.query.to as string) || '';

    if (!fromId || !toId) {
      return res.status(400).json({ success: false, message: 'Parámetros from y to son requeridos' });
    }

    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) return res.status(404).json({ success: false, message: 'Página no encontrada' });

    const from = await prisma.pageVersion.findUnique({ where: { id: fromId } });
    const to = await prisma.pageVersion.findUnique({ where: { id: toId } });
    if (!from || !to || from.pageId !== id || to.pageId !== id) {
      return res.status(404).json({ success: false, message: 'Versiones no encontradas o no pertenecen a la página' });
    }

    const diffLines = (a: string | null, b: string | null) => {
      const aLines = (a || '').split('\n');
      const bLines = (b || '').split('\n');
      const max = Math.max(aLines.length, bLines.length);
      const diffs: Array<{ index: number; from?: string; to?: string; status: 'equal' | 'changed' | 'added' | 'removed' }> = [];
      for (let i = 0; i < max; i++) {
        const al = aLines[i];
        const bl = bLines[i];
        if (al === undefined && bl !== undefined) {
          diffs.push({ index: i, to: bl, status: 'added' });
        } else if (al !== undefined && bl === undefined) {
          diffs.push({ index: i, from: al, status: 'removed' });
        } else if (al === bl) {
          diffs.push({ index: i, from: al, to: bl, status: 'equal' });
        } else {
          diffs.push({ index: i, from: al, to: bl, status: 'changed' });
        }
      }
      return diffs;
    };

    const result = {
      from,
      to,
      htmlDiff: diffLines(from.html, to.html),
      cssDiff: diffLines(from.css, to.css),
    };

    return res.status(200).json({ success: true, message: 'Comparación generada', data: result });
  }
}