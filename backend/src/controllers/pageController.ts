/**
 * @swagger
 * /api/pages:
 *   get:
 *     summary: Obtener todas las páginas
 *     description: Devuelve una lista paginada de páginas del usuario autenticado
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Buscar páginas por título
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de publicación
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Lista de páginas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Páginas obtenidas exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Page'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   post:
 *     summary: Crear nueva página
 *     description: Crea una nueva página para el usuario autenticado
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePageRequest'
 *           example:
 *             title: "Mi Nueva Página"
 *             slug: "mi-nueva-pagina"
 *             content: "<h1>Contenido de la página</h1>"
 *             metaTitle: "Mi Nueva Página - Sitio Web"
 *             metaDescription: "Descripción de mi nueva página"
 *             isPublished: false
 *     responses:
 *       201:
 *         description: Página creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Página creada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Page'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: El slug ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/pages/published:
 *   get:
 *     summary: Obtener páginas publicadas
 *     description: Devuelve una lista de páginas publicadas (acceso público)
 *     tags: [Pages]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Buscar páginas por título
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Lista de páginas publicadas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Páginas publicadas obtenidas exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Page'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/pages/{id}:
 *   get:
 *     summary: Obtener página por ID
 *     description: Devuelve una página específica por su ID
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la página
 *     responses:
 *       200:
 *         description: Página obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Página obtenida exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Page'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   put:
 *     summary: Actualizar página
 *     description: Actualiza una página existente
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la página
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePageRequest'
 *           example:
 *             title: "Página Actualizada"
 *             content: "<h1>Contenido actualizado</h1>"
 *             isPublished: true
 *     responses:
 *       200:
 *         description: Página actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Página actualizada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Page'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: El slug ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     summary: Eliminar página
 *     description: Elimina una página existente
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la página
 *     responses:
 *       200:
 *         description: Página eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/pages/slug/{slug}:
 *   get:
 *     summary: Obtener página por slug
 *     description: Devuelve una página específica por su slug (acceso público para páginas publicadas)
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug de la página
 *     responses:
 *       200:
 *         description: Página obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Página obtenida exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Page'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/pages/{id}/grapes-data:
 *   post:
 *     summary: Guardar datos de GrapesJS
 *     description: Guarda los datos del editor GrapesJS para una página
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la página
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [grapesData]
 *             properties:
 *               grapesData:
 *                 type: string
 *                 description: Datos JSON del editor GrapesJS
 *           example:
 *             grapesData: '{"components":[{"type":"text","content":"Hello World"}]}'
 *     responses:
 *       200:
 *         description: Datos de GrapesJS guardados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/pages/{id}/content:
 *   post:
 *     summary: Guardar contenido HTML
 *     description: Guarda el contenido HTML generado para una página
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la página
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 description: Contenido HTML de la página
 *           example:
 *             content: "<h1>Mi Página</h1><p>Contenido de la página</p>"
 *     responses:
 *       200:
 *         description: Contenido guardado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/pages/{id}/toggle-publish:
 *   post:
 *     summary: Cambiar estado de publicación
 *     description: Alterna el estado de publicación de una página
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la página
 *     responses:
 *       200:
 *         description: Estado de publicación cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estado de publicación actualizado"
 *                 data:
 *                   $ref: '#/components/schemas/Page'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/pages/stats:
 *   get:
 *     summary: Obtener estadísticas de páginas
 *     description: Devuelve estadísticas de las páginas del usuario autenticado
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estadísticas obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total de páginas
 *                       example: 25
 *                     published:
 *                       type: integer
 *                       description: Páginas publicadas
 *                       example: 15
 *                     draft:
 *                       type: integer
 *                       description: Páginas en borrador
 *                       example: 10
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

import { Request, Response } from 'express';
import Joi from 'joi';
import { PageService } from '../services/pageService';
import { GrapesValidator } from '../utils/grapesValidator';

export class PageController {
  // Esquemas de validación
  static createPageSchema = Joi.object({
    title: Joi.string().min(3).max(200).required().messages({
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede exceder 200 caracteres',
      'any.required': 'El título es requerido'
    }),
    slug: Joi.string().min(3).max(100).pattern(/^[a-z0-9-]+$/).required().messages({
      'string.min': 'El slug debe tener al menos 3 caracteres',
      'string.max': 'El slug no puede exceder 100 caracteres',
      'string.pattern.base': 'El slug solo puede contener letras minúsculas, números y guiones',
      'any.required': 'El slug es requerido'
    }),
    content: Joi.string().allow('').optional(),
    grapesData: Joi.string().allow('').optional().custom((value, helpers) => {
      if (value && value.trim() !== '') {
        const validation = GrapesValidator.validateGrapesData(value);
        if (!validation.isValid) {
          return helpers.error('any.invalid', { 
            message: `Datos de GrapesJS inválidos: ${validation.errors.join(', ')}` 
          });
        }
        if (validation.warnings.length > 0) {
          console.warn('Advertencias en datos GrapesJS al crear página:', validation.warnings);
        }
        return JSON.stringify(validation.sanitizedData);
      }
      return value;
    }),
    metaTitle: Joi.string().max(60).optional().messages({
      'string.max': 'El meta título no puede exceder 60 caracteres'
    }),
    metaDescription: Joi.string().max(160).optional().messages({
      'string.max': 'La meta descripción no puede exceder 160 caracteres'
    }),
    isPublished: Joi.boolean().optional()
  });

  static updatePageSchema = Joi.object({
    title: Joi.string().min(3).max(200).optional().messages({
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede exceder 200 caracteres'
    }),
    slug: Joi.string().min(3).max(100).pattern(/^[a-z0-9-]+$/).optional().messages({
      'string.min': 'El slug debe tener al menos 3 caracteres',
      'string.max': 'El slug no puede exceder 100 caracteres',
      'string.pattern.base': 'El slug solo puede contener letras minúsculas, números y guiones'
    }),
    content: Joi.string().allow('').optional(),
    grapesData: Joi.string().allow('').optional().custom((value, helpers) => {
      if (value && value.trim() !== '') {
        const validation = GrapesValidator.validateGrapesData(value);
        if (!validation.isValid) {
          return helpers.error('any.invalid', { 
            message: `Datos de GrapesJS inválidos: ${validation.errors.join(', ')}` 
          });
        }
        if (validation.warnings.length > 0) {
          console.warn('Advertencias en datos GrapesJS al actualizar página:', validation.warnings);
        }
        return JSON.stringify(validation.sanitizedData);
      }
      return value;
    }),
    html: Joi.string().allow('').optional().custom((value, helpers) => {
      if (value && value.trim() !== '') {
        try {
          // Validación básica de HTML
          if (value.length > 1000000) { // 1MB límite
            return helpers.error('any.invalid', { message: 'El HTML es demasiado largo' });
          }
        } catch (error) {
          return helpers.error('any.invalid', { message: 'HTML inválido' });
        }
      }
      return value;
    }),
    css: Joi.string().allow('').optional().custom((value, helpers) => {
      if (value && value.trim() !== '') {
        try {
          // Validación básica de CSS
          if (value.length > 500000) { // 500KB límite
            return helpers.error('any.invalid', { message: 'El CSS es demasiado largo' });
          }
        } catch (error) {
          return helpers.error('any.invalid', { message: 'CSS inválido' });
        }
      }
      return value;
    }),
    metaTitle: Joi.string().max(60).optional().messages({
      'string.max': 'El meta título no puede exceder 60 caracteres'
    }),
    metaDescription: Joi.string().max(160).optional().messages({
      'string.max': 'La meta descripción no puede exceder 160 caracteres'
    }),
    isPublished: Joi.boolean().optional()
  });

  static querySchema = Joi.object({
    search: Joi.string().max(100).optional(),
    isPublished: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  });

  static saveGrapesDataSchema = Joi.object({
    grapesData: Joi.string().required().custom((value, helpers) => {
      // Validación robusta de datos GrapesJS
      const validation = GrapesValidator.validateGrapesData(value);
      
      if (!validation.isValid) {
        return helpers.error('any.invalid', { 
          message: `Datos de GrapesJS inválidos: ${validation.errors.join(', ')}` 
        });
      }

      if (validation.warnings.length > 0) {
        console.warn('Advertencias en datos GrapesJS:', validation.warnings);
      }

      // Retornar datos sanitizados
      return JSON.stringify(validation.sanitizedData);
    }).messages({
      'any.required': 'Los datos de GrapesJS son requeridos',
      'any.invalid': 'Los datos de GrapesJS no son válidos'
    }),
    html: Joi.string().optional().custom((value, helpers) => {
      if (value) {
        const validation = GrapesValidator.validateGeneratedHTML(value);
        if (!validation.isValid) {
          return helpers.error('any.invalid', { 
            message: `HTML inválido: ${validation.errors.join(', ')}` 
          });
        }
        if (validation.warnings.length > 0) {
          console.warn('Advertencias en HTML:', validation.warnings);
        }
      }
      return value;
    }),
    css: Joi.string().optional().custom((value, helpers) => {
      if (value) {
        const validation = GrapesValidator.validateGeneratedCSS(value);
        if (!validation.isValid) {
          return helpers.error('any.invalid', { 
            message: `CSS inválido: ${validation.errors.join(', ')}` 
          });
        }
        if (validation.warnings.length > 0) {
          console.warn('Advertencias en CSS:', validation.warnings);
        }
      }
      return value;
    }),
    gjsHtml: Joi.string().optional(),
    gjsCss: Joi.string().optional(),
    gjsComponents: Joi.string().optional(),
    gjsStyles: Joi.string().optional()
  });

  static saveContentSchema = Joi.object({
    content: Joi.string().required().messages({
      'any.required': 'El contenido HTML es requerido'
    })
  });

  /**
   * Crear una nueva página
   */
  static async createPage(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = PageController.createPageSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
        return;
      }
      
      const page = await PageService.createPage(value);

      res.status(201).json({
        success: true,
        message: 'Página creada exitosamente',
        data: { page }
      });
    } catch (error: unknown) {
      const err = error as any;
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener páginas con filtros
   */
  static async getPages(req: Request, res: Response) {
    try {
      const { error, value } = PageController.querySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
      }
      
      const result = await PageService.getPages(value);      console.log('[PageController.publishPage] done', { id: req.params.id });      console.log('[PageController.publishPageBySlug] done', { slug: req.params.slug });      console.log('[PageController.getPageStats] done');      console.log('[PageController.getPageBackups] done', { id: req.params.id });      console.log('[PageController.restoreFromBackup] done', { id: req.params.id, backupId: req.params.backupId });      console.log('[PageController.createManualBackup] done', { id: req.params.id });







      return res.json({
        success: true,
        message: 'Páginas obtenidas exitosamente',
        data: result
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener páginas publicadas (para frontend público)
   */
  static async getPublishedPages(req: Request, res: Response) {
    try {
      const { error, value } = PageController.querySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
      }
      
      const result = await PageService.getPublishedPages();

      return res.json({
        success: true,
        message: 'Páginas publicadas obtenidas exitosamente',
        data: result
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener página por ID
   */
  static async getPageById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const page = await PageService.getPageById(id);

      return res.json({
        success: true,
        message: 'Página obtenida exitosamente',
        data: { page }
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener página por slug (para frontend público)
   */
  static async getPageBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const page = await PageService.getPageBySlug(slug);
      
      if (!page) {
        return res.status(404).json({
          success: false,
          message: 'Página no encontrada'
        });
      }

      // Log temporal para debugging
      console.log('🔍 Backend - Página encontrada:', {
        id: page.id,
        title: page.title,
        slug: page.slug,
        hasGrapesData: !!page.grapesData,
        hasHtml: !!page.html,
        hasCss: !!page.css,
        hasGjsHtml: !!page.gjsHtml,
        hasGjsCss: !!page.gjsCss,
        hasGjsComponents: !!page.gjsComponents,
        hasGjsStyles: !!page.gjsStyles
      });

      return res.json({
        success: true,
        message: 'Página obtenida exitosamente',
        data: page // Cambiar de { page } a page directamente
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar página
   */
  static async updatePage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error, value } = PageController.updatePageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
      }
      
      const page = await PageService.updatePage(id, value);

      return res.json({
        success: true,
        message: 'Página actualizada exitosamente',
        data: { page }
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar página
   */
  static async deletePage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await PageService.deletePage(id);

      return res.json({
        success: true,
        message: 'Página eliminada exitosamente'
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Guardar datos de GrapesJS
   */
  static async saveGrapesData(req: Request, res: Response) {
    try {
      console.log('[PageController.saveGrapesData] start', { id: req.params.id });
      const { id } = req.params;
      const { error, value } = PageController.saveGrapesDataSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
      }
      
      const page = await PageService.saveGrapesData(
        id, 
        value.grapesData, 
        value.gjsHtml || value.html, 
        value.gjsCss || value.css,
        value.gjsComponents,
        value.gjsStyles
      );

      console.log('[PageController.saveGrapesData] done', { id: req.params.id });
      return res.json({
        success: true,
        message: 'Datos de GrapesJS guardados exitosamente',
        data: { page }
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener datos de GrapesJS
   */
  static async getGrapesData(req: Request, res: Response) {
    try {
      console.log('[PageController.getGrapesData] start', { id: req.params.id });
      const { id } = req.params;
      
      const page = await PageService.getPageById(id);
      if (!page) {
        return res.status(404).json({
          success: false,
          message: 'Página no encontrada'
        });
      }

      return res.json({
        success: true,
        message: 'Datos de GrapesJS obtenidos exitosamente',
        data: {
          grapesData: page.grapesData,
          html: page.html,
          css: page.css
        }
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor al obtener los datos de GrapesJS'
      });
    }
  }

  /**
   * Guardar contenido HTML
   */
  static async saveContent(req: Request, res: Response) {
    try {
      console.log('[PageController.saveContent] start', { id: req.params.id });
      const { id } = req.params;
      const { error, value } = PageController.saveContentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }))
        });
      }
      
      const page = await PageService.saveContent(id, value.content);

      console.log('[PageController.saveContent] done', { id: req.params.id });
      return res.json({
        success: true,
        message: 'Contenido guardado exitosamente',
        data: { page }
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Publicar página: genera y guarda publishedHtml/Css
   */
  static async publishPage(req: Request, res: Response) {
    try {
      console.log('[PageController.publishPage] start', { id: req.params.id });
      const { id } = req.params;
      console.log('Publicando página (publishPage):', id);
      // Aceptar id o slug: intentar por ID, si falla intentar por slug
      let targetPage: any = null;
      try {
        targetPage = await PageService.getPageById(id);
      } catch (e) {
        // Ignorar error y probar por slug
      }

      if (!targetPage) {
        targetPage = await PageService.getPageBySlug(id);
      }

      if (!targetPage) {
        return res.status(404).json({
          success: false,
          message: 'Página no encontrada'
        });
      }

      const page = await PageService.publishPage(targetPage.slug);
      console.log('HTML length:', (page.publishedHtml || page.html || '').length);
      console.log('CSS length:', (page.publishedCss || page.css || '').length);
      console.log('Página actualizada en BD');
      return res.json({
        success: true,
        message: 'Página publicada exitosamente',
        data: page
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Publicar página por slug directamente
   */
  static async publishPageBySlug(req: Request, res: Response) {
    try {
      console.log('[PageController.publishPageBySlug] start', { slug: req.params.slug });
      const { slug } = req.params as any;
      if (!slug) {
        return res.status(400).json({ success: false, message: 'Slug requerido' });
      }
      const existing = await PageService.getPageBySlug(slug);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Página no encontrada' });
      }
      const page = await PageService.publishPage(slug);
      return res.json({ success: true, message: 'Página publicada exitosamente', data: page });
    } catch (error: any) {
      return res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno del servidor' });
    }
  }

  /**
   * Cambiar estado de publicación
   */
  static async togglePublishStatus(req: Request, res: Response) {
    try {
      console.log('[PageController.togglePublishStatus] start', { id: req.params.id });
      const { id } = req.params;
      const page = await PageService.togglePublishStatus(id);

      console.log('[PageController.togglePublishStatus] done', { id: req.params.id });
      return res.json({
        success: true,
        message: `Página ${page.isActive ? 'publicada' : 'despublicada'} exitosamente`,
        data: { page }
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas de páginas
   */
  static async getPageStats(req: Request, res: Response) {
    try {
      console.log('[PageController.getPageStats] start');
      const stats = await PageService.getPageStats();

      return res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: { stats }
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener backups de una página
   */
  static async getPageBackups(req: Request, res: Response) {
    try {
      console.log('[PageController.getPageBackups] start', { id: req.params.id, limit: req.query.limit });
      const { id } = req.params;
      const { limit } = req.query;

      const backups = await PageService.getPageBackups(
        id, 
        limit ? parseInt(limit as string) : 10
      );

      return res.json({
        success: true,
        message: 'Backups obtenidos exitosamente',
        data: backups
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Restaurar página desde backup
   */
  static async restoreFromBackup(req: Request, res: Response) {
    try {
      console.log('[PageController.restoreFromBackup] start', { id: req.params.id, backupId: req.params.backupId });
      const { id, backupId } = req.params;

      const restoredPage = await PageService.restoreFromBackup(id, backupId);

      return res.json({
        success: true,
        message: 'Página restaurada exitosamente',
        data: restoredPage
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear backup manual de una página
   */
  static async createManualBackup(req: Request, res: Response) {
    try {
      console.log('[PageController.createManualBackup] start', { id: req.params.id });
      const { id } = req.params;

      // Obtener la página actual
      const page = await PageService.getPageById(id);
      
      // Crear backup
      const backup = await PageService.createBackup(page);

      return res.json({
        success: true,
        message: 'Backup creado exitosamente',
        data: backup
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }
} 