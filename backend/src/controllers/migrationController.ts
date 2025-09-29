import { Request, Response } from 'express';
import { MigrationService } from '../services/migrationService';
import { errorUtils } from '../utils/helpers';

export class MigrationController {
  /**
   * Migra HTML estático a formato GrapesJS
   */
  static async migrateHtmlToGrapes(req: Request, res: Response): Promise<void> {
    try {
      const { html } = req.body;

      if (!html || typeof html !== 'string') {
        throw errorUtils.createError('Contenido HTML requerido', 'INVALID_INPUT', 400);
      }

      const grapesData = await MigrationService.migrateHtmlToGrapes(html);

      res.json({
        success: true,
        data: grapesData,
        message: 'HTML migrado exitosamente a formato GrapesJS'
      });
    } catch (error: any) {
      console.error('Error in migrateHtmlToGrapes:', error);
      
      const status = error.status || 500;
      const message = error.message || 'Error interno del servidor';
      
      res.status(status).json({
        success: false,
        error: message
      });
    }
  }

  /**
   * Convierte datos de GrapesJS a HTML y CSS
   */
  static async generateHtmlCss(req: Request, res: Response): Promise<void> {
    try {
      const { grapesData } = req.body;

      if (!grapesData) {
        throw errorUtils.createError('Datos de GrapesJS requeridos', 'INVALID_INPUT', 400);
      }

      const result = await MigrationService.generateHtmlCssFromGrapes(grapesData);

      res.json({
        success: true,
        data: result,
        message: 'HTML y CSS generados exitosamente desde GrapesJS'
      });
    } catch (error: any) {
      console.error('Error in generateHtmlCss:', error);
      
      const status = error.status || 500;
      const message = error.message || 'Error interno del servidor';
      
      res.status(status).json({
        success: false,
        error: message
      });
    }
  }
}