import { Router } from 'express';
import { MigrationController } from '../controllers/migrationController';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Esquema de validación para migración HTML
const migrateHtmlSchema = {
  body: z.object({
    html: z.string().min(1, 'Contenido HTML requerido')
  })
};

// Esquema de validación para generación HTML/CSS
const generateHtmlCssSchema = {
  body: z.object({
    grapesData: z.object({
      components: z.array(z.any()),
      styles: z.array(z.any()).optional()
    })
  })
};

/**
 * @swagger
 * /api/admin/migrate-html:
 *   post:
 *     summary: Migra HTML estático a formato GrapesJS
 *     tags: [Migration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - html
 *             properties:
 *               html:
 *                 type: string
 *                 description: Contenido HTML a migrar
 *                 example: "<div><h1>Título</h1><p>Contenido</p></div>"
 *     responses:
 *       200:
 *         description: HTML migrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     components:
 *                       type: array
 *                       description: Componentes GrapesJS
 *                     styles:
 *                       type: array
 *                       description: Estilos GrapesJS
 *                 message:
 *                   type: string
 *                   example: "HTML migrado exitosamente a formato GrapesJS"
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/migrate-html', validateRequest(migrateHtmlSchema), MigrationController.migrateHtmlToGrapes);

/**
 * @swagger
 * /api/admin/generate-html-css:
 *   post:
 *     summary: Genera HTML y CSS desde datos de GrapesJS
 *     tags: [Migration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grapesData
 *             properties:
 *               grapesData:
 *                 type: object
 *                 properties:
 *                   components:
 *                     type: array
 *                     description: Componentes GrapesJS
 *                   styles:
 *                     type: array
 *                     description: Estilos GrapesJS
 *     responses:
 *       200:
 *         description: HTML y CSS generados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     html:
 *                       type: string
 *                       description: HTML generado
 *                     css:
 *                       type: string
 *                       description: CSS generado
 *                 message:
 *                   type: string
 *                   example: "HTML y CSS generados exitosamente desde GrapesJS"
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/generate-html-css', validateRequest(generateHtmlCssSchema), MigrationController.generateHtmlCss);

export default router;