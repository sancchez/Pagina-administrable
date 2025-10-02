import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del reporte
 *         title:
 *           type: string
 *           description: Título del reporte
 *         description:
 *           type: string
 *           description: Descripción detallada del reporte
 *         type:
 *           type: string
 *           enum: [WATER_LEAK, PIPE_DAMAGE, PRESSURE_ISSUE, QUALITY_ISSUE, BILLING_ISSUE, MAINTENANCE_REQUEST, OTHER]
 *           description: Tipo de reporte
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, RESOLVED, CLOSED]
 *           description: Estado del reporte
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           description: Prioridad del reporte
 *         location:
 *           type: string
 *           description: Ubicación del problema reportado
 *         userId:
 *           type: string
 *           description: ID del usuario que creó el reporte
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         user:
 *           $ref: '#/components/schemas/User'
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReportComment'
 *         files:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReportFile'
 *     
 *     ReportComment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del comentario
 *         content:
 *           type: string
 *           description: Contenido del comentario
 *         userId:
 *           type: string
 *           description: ID del usuario que hizo el comentario
 *         reportId:
 *           type: string
 *           description: ID del reporte
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         user:
 *           $ref: '#/components/schemas/User'
 *     
 *     ReportFile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del archivo
 *         filename:
 *           type: string
 *           description: Nombre del archivo
 *         originalName:
 *           type: string
 *           description: Nombre original del archivo
 *         mimeType:
 *           type: string
 *           description: Tipo MIME del archivo
 *         size:
 *           type: integer
 *           description: Tamaño del archivo en bytes
 *         url:
 *           type: string
 *           description: URL del archivo
 *         reportId:
 *           type: string
 *           description: ID del reporte
 *         uploadedBy:
 *           type: string
 *           description: ID del usuario que subió el archivo
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de subida
 *     
 *     CreateReportRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Título del reporte
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *           description: Descripción detallada del reporte
 *         type:
 *           type: string
 *           enum: [WATER_LEAK, PIPE_DAMAGE, PRESSURE_ISSUE, QUALITY_ISSUE, BILLING_ISSUE, MAINTENANCE_REQUEST, OTHER]
 *           description: Tipo de reporte
 *         location:
 *           type: string
 *           maxLength: 200
 *           description: Ubicación del problema
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           description: Prioridad del reporte
 *     
 *     UpdateReportRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Título del reporte
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *           description: Descripción detallada del reporte
 *         type:
 *           type: string
 *           enum: [WATER_LEAK, PIPE_DAMAGE, PRESSURE_ISSUE, QUALITY_ISSUE, BILLING_ISSUE, MAINTENANCE_REQUEST, OTHER]
 *           description: Tipo de reporte
 *         location:
 *           type: string
 *           maxLength: 200
 *           description: Ubicación del problema
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           description: Prioridad del reporte
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, RESOLVED, CLOSED]
 *           description: Estado del reporte
 *     
 *     AddCommentRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 1000
 *           description: Contenido del comentario
 *     
 *     ChangeStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, RESOLVED, CLOSED]
 *           description: Nuevo estado del reporte
 */

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Crear un nuevo reporte
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReportRequest'
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente
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
 *                     report:
 *                       $ref: '#/components/schemas/Report'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticate, generalLimiter, ReportController.createReport);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Obtener lista de reportes con filtros
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en título y descripción
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [WATER_LEAK, PIPE_DAMAGE, PRESSURE_ISSUE, QUALITY_ISSUE, BILLING_ISSUE, MAINTENANCE_REQUEST, OTHER]
 *         description: Filtrar por tipo de reporte
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, RESOLVED, CLOSED]
 *         description: Filtrar por estado
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         description: Filtrar por prioridad
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filtrar por usuario (solo admin/manager)
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta
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
 *         description: Lista de reportes obtenida exitosamente
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
 *                     reports:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Report'
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
 */
router.get('/', authenticate, authorize("ADMIN", "MANAGER", "USER"), ReportController.getReports);

/**
 * @swagger
 * /api/reports/my:
 *   get:
 *     summary: Obtener reportes del usuario autenticado
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en título y descripción
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [WATER_LEAK, PIPE_DAMAGE, PRESSURE_ISSUE, QUALITY_ISSUE, BILLING_ISSUE, MAINTENANCE_REQUEST, OTHER]
 *         description: Filtrar por tipo de reporte
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, RESOLVED, CLOSED]
 *         description: Filtrar por estado
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         description: Filtrar por prioridad
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta
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
 *         description: Reportes del usuario obtenidos exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/my', authenticate, ReportController.getUserReports);

/**
 * @swagger
 * /api/reports/stats:
 *   get:
 *     summary: Obtener estadísticas de reportes
 *     tags: [Reports]
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
 *                         byStatus:
 *                           type: object
 *                         byType:
 *                           type: object
 *                         byPriority:
 *                           type: object
 *                         thisMonth:
 *                           type: integer
 *                         lastMonth:
 *                           type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/stats', authenticate, authorize("ADMIN", "MANAGER"), ReportController.getReportStats);

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Obtener un reporte por ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del reporte
 *     responses:
 *       200:
 *         description: Reporte obtenido exitosamente
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
 *                     report:
 *                       $ref: '#/components/schemas/Report'
 *       404:
 *         description: Reporte no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', authenticate, authorize("ADMIN", "MANAGER", "USER"), ReportController.getReportById);

/**
 * @swagger
 * /api/reports/{id}:
 *   put:
 *     summary: Actualizar un reporte
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del reporte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReportRequest'
 *     responses:
 *       200:
 *         description: Reporte actualizado exitosamente
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
 *                     report:
 *                       $ref: '#/components/schemas/Report'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Reporte no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.put('/:id', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, ReportController.updateReport);

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Eliminar un reporte
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del reporte
 *     responses:
 *       200:
 *         description: Reporte eliminado exitosamente
 *       404:
 *         description: Reporte no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.delete('/:id', authenticate, authorize("ADMIN", "MANAGER"), ReportController.deleteReport);

/**
 * @swagger
 * /api/reports/{id}/comments:
 *   post:
 *     summary: Agregar comentario a un reporte
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del reporte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCommentRequest'
 *     responses:
 *       201:
 *         description: Comentario agregado exitosamente
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
 *                     comment:
 *                       $ref: '#/components/schemas/ReportComment'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Reporte no encontrado
 *       401:
 *         description: No autorizado
 */
router.post('/:id/comments', authenticate, generalLimiter, ReportController.addComment);

/**
 * @swagger
 * /api/reports/{id}/status:
 *   patch:
 *     summary: Cambiar estado de un reporte
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del reporte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeStatusRequest'
 *     responses:
 *       200:
 *         description: Estado cambiado exitosamente
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
 *                     report:
 *                       $ref: '#/components/schemas/Report'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Reporte no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.patch('/:id/status', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, ReportController.changeStatus);

/**
 * @swagger
 * /api/reports/comments/{commentId}:
 *   put:
 *     summary: Actualizar un comentario
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del comentario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCommentRequest'
 *     responses:
 *       200:
 *         description: Comentario actualizado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Comentario no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.put('/comments/:commentId', authenticate, generalLimiter, ReportController.updateComment);

/**
 * @swagger
 * /api/reports/comments/{commentId}:
 *   delete:
 *     summary: Eliminar un comentario
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del comentario
 *     responses:
 *       200:
 *         description: Comentario eliminado exitosamente
 *       404:
 *         description: Comentario no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.delete('/comments/:commentId', authenticate, ReportController.deleteComment);

export default router;