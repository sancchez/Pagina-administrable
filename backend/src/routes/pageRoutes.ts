import { Router } from 'express';
import prisma from '../config/database';
import { PageController } from '../controllers/pageController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';


const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Page:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la página
 *         title:
 *           type: string
 *           description: Título de la página
 *         slug:
 *           type: string
 *           description: Slug único de la página
 *         content:
 *           type: string
 *           description: Contenido HTML de la página
 *         grapesData:
 *           type: string
 *           description: Datos JSON de GrapesJS
 *         metaTitle:
 *           type: string
 *           description: Meta título para SEO
 *         metaDescription:
 *           type: string
 *           description: Meta descripción para SEO
 *         isPublished:
 *           type: boolean
 *           description: Estado de publicación
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     
 *     CreatePageRequest:
 *       type: object
 *       required:
 *         - title
 *         - slug
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Título de la página
 *         slug:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           pattern: '^[a-z0-9-]+$'
 *           description: Slug único (solo letras minúsculas, números y guiones)
 *         content:
 *           type: string
 *           description: Contenido HTML de la página
 *         grapesData:
 *           type: string
 *           description: Datos JSON de GrapesJS
 *         metaTitle:
 *           type: string
 *           maxLength: 60
 *           description: Meta título para SEO
 *         metaDescription:
 *           type: string
 *           maxLength: 160
 *           description: Meta descripción para SEO
 *         isPublished:
 *           type: boolean
 *           description: Estado de publicación
 *     
 *     UpdatePageRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Título de la página
 *         slug:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           pattern: '^[a-z0-9-]+$'
 *           description: Slug único (solo letras minúsculas, números y guiones)
 *         content:
 *           type: string
 *           description: Contenido HTML de la página
 *         grapesData:
 *           type: string
 *           description: Datos JSON de GrapesJS
 *         metaTitle:
 *           type: string
 *           maxLength: 60
 *           description: Meta título para SEO
 *         metaDescription:
 *           type: string
 *           maxLength: 160
 *           description: Meta descripción para SEO
 *         isPublished:
 *           type: boolean
 *           description: Estado de publicación
 *     
 *     SaveGrapesDataRequest:
 *       type: object
 *       required:
 *         - grapesData
 *       properties:
 *         grapesData:
 *           type: string
 *           description: Datos JSON de GrapesJS
 *     
 *     SaveContentRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: Contenido HTML de la página
 */

/**
 * @swagger
 * /api/pages:
 *   post:
 *     summary: Crear una nueva página
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePageRequest'
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       $ref: '#/components/schemas/Page'
 *       400:
 *         description: Datos de entrada inválidos o slug ya existe
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, PageController.createPage);

/**
 * @swagger
 * /api/pages:
 *   get:
 *     summary: Obtener páginas con filtros (admin/manager)
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en título, slug o contenido
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
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Páginas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     pages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Page'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/', authenticate, authorize("ADMIN", "MANAGER", "USER"), PageController.getPages);

/**
 * @swagger
 * /api/pages/published:
 *   get:
 *     summary: Obtener páginas publicadas (público)
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: Páginas publicadas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     pages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           content:
 *                             type: string
 *                           metaTitle:
 *                             type: string
 *                           metaDescription:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 */
router.get('/published', PageController.getPublishedPages);

// Ruta pública para obtener página por slug priorizando contenido publicado
router.get('/public/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    console.log(`📥 [/pages/public/:slug] start: ${slug}`);

    const page = await prisma.page.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        name: true,
        // Campos prioritarios
        publishedHtml: true,
        publishedCss: true,
        // Fallbacks
        gjsHtml: true,
        gjsCss: true,
        html: true,
        css: true,
        content: true,
        // Metadata
        isPublished: true,
        publishedAt: true,
        updatedAt: true,
      }
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Página no encontrada'
      });
    }

    // CASCADA DE PRIORIDADES para HTML
    const html = page.publishedHtml
      || page.gjsHtml
      || page.html
      || page.content
      || '';

    // CASCADA DE PRIORIDADES para CSS
    const css = page.publishedCss
      || page.gjsCss
      || page.css
      || '';

    // LOG para debugging
    console.log(`📤 [${slug}] Enviando:`);
    console.log(`  publishedHtml: ${page.publishedHtml?.length || 0}`);
    console.log(`  gjsHtml: ${page.gjsHtml?.length || 0}`);
    console.log(`  html: ${page.html?.length || 0}`);
    console.log(`  content: ${page.content?.length || 0}`);
    console.log(`  → Usando HTML: ${html.length} chars`);
    console.log(`  → Usando CSS: ${css.length} chars`);

    res.json({
      success: true,
      data: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        name: page.name,
        html,
        css,
        isPublished: page.isPublished,
        publishedAt: page.publishedAt,
        updatedAt: page.updatedAt,
      }
    });
  } catch (error: any) {
    console.error('❌ Error en /pages/public/:slug:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/pages/stats:
 *   get:
 *     summary: Obtener estadísticas de páginas
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         published:
 *                           type: integer
 *                         unpublished:
 *                           type: integer
 *                         thisMonth:
 *                           type: integer
 *                         lastMonth:
 *                           type: integer
 *                         growth:
 *                           type: number
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/stats', authenticate, authorize("ADMIN", "MANAGER"), PageController.getPageStats);

/**
 * @swagger
 * /api/pages/slug/{slug}:
 *   get:
 *     summary: Obtener página por slug
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       $ref: '#/components/schemas/Page'
 *       404:
 *         description: Página no encontrada
 */
router.get('/slug/:slug', optionalAuth, PageController.getPageBySlug);

/**
 * @swagger
 * /api/pages/{id}:
 *   get:
 *     summary: Obtener página por ID
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       $ref: '#/components/schemas/Page'
 *       404:
 *         description: Página no encontrada
 *       401:
 *         description: No autorizado
 */
router.get('/:id', authenticate, authorize("ADMIN", "MANAGER", "USER"), PageController.getPageById);

/**
 * @swagger
 * /api/pages/{id}:
 *   put:
 *     summary: Actualizar una página
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la página
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePageRequest'
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       $ref: '#/components/schemas/Page'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Página no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.put('/:id', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, PageController.updatePage);

/**
 * @swagger
 * /api/pages/{id}:
 *   delete:
 *     summary: Eliminar una página
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la página
 *     responses:
 *       200:
 *         description: Página eliminada exitosamente
 *       404:
 *         description: Página no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.delete('/:id', authenticate, authorize("ADMIN", "MANAGER"), PageController.deletePage);

/**
 * @swagger
 * /api/pages/{id}/grapes-data:
 *   post:
 *     summary: Guardar datos de GrapesJS
 *     tags: [Pages, GrapesJS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la página
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaveGrapesDataRequest'
 *     responses:
 *       200:
 *         description: Datos de GrapesJS guardados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       $ref: '#/components/schemas/Page'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Página no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/:id/grapes-data', authenticate, authorize("ADMIN", "MANAGER", "USER"), PageController.getGrapesData);
router.post('/:id/grapes-data', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, PageController.saveGrapesData);

/**
 * @swagger
 * /api/pages/{id}/content:
 *   post:
 *     summary: Guardar contenido HTML
 *     tags: [Pages, GrapesJS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la página
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaveContentRequest'
 *     responses:
 *       200:
 *         description: Contenido HTML guardado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       $ref: '#/components/schemas/Page'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Página no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/:id/content', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, PageController.saveContent);

/**
 * @swagger
 * /api/pages/{id}/publish:
 *   post:
 *     summary: Publicar una página generando y guardando publishedHtml/Css
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
 *         description: Página publicada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Página no encontrada
 */
router.post('/:id/publish', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, PageController.publishPage);
router.post('/:slug/publish', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, PageController.publishPageBySlug);

/**
 * @swagger
 * /api/pages/{id}/toggle-publish:
 *   patch:
 *     summary: Cambiar estado de publicación
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       $ref: '#/components/schemas/Page'
 *       404:
 *         description: Página no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.patch('/:id/toggle-publish', authenticate, authorize("ADMIN", "MANAGER"), PageController.togglePublishStatus);

/**
 * @swagger
 * /api/pages/{id}/backups:
 *   get:
 *     summary: Obtener backups de una página
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de backups a obtener
 *     responses:
 *       200:
 *         description: Backups obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PageBackup'
 *       404:
 *         description: Página no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/:id/backups', authenticate, authorize("ADMIN", "MANAGER"), PageController.getPageBackups);

/**
 * @swagger
 * /api/pages/{id}/backups:
 *   post:
 *     summary: Crear backup manual de una página
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la página
 *     responses:
 *       200:
 *         description: Backup creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PageBackup'
 *       404:
 *         description: Página no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/:id/backups', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, PageController.createManualBackup);

/**
 * @swagger
 * /api/pages/{id}/restore/{backupId}:
 *   post:
 *     summary: Restaurar página desde backup
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la página
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del backup
 *     responses:
 *       200:
 *         description: Página restaurada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Page'
 *       404:
 *         description: Página o backup no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/:id/restore/:backupId', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, PageController.restoreFromBackup);

/**
 * @swagger
 * /api/pages/{id}/backups/{backupId}:
 *   delete:
 *     summary: Eliminar backup específico
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la página
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del backup
 *     responses:
 *       200:
 *         description: Backup eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Página o backup no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.delete('/:id/backups/:backupId', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, PageController.deleteBackup);


export default router;