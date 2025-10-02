import { Router } from 'express';
import { PQRController } from '../controllers/pqrController';
import { authenticate, authorize } from '../middleware/auth';
import { generalLimiter, uploadLimiter } from '../middleware/rateLimiter';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'pqr');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     PQR:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del PQR
 *         title:
 *           type: string
 *           description: Título del PQR
 *         description:
 *           type: string
 *           description: Descripción detallada del PQR
 *         type:
 *           type: string
 *           enum: [PETITION, COMPLAINT, CLAIM, SUGGESTION]
 *           description: Tipo de PQR
 *         status:
 *           type: string
 *           enum: [RECEIVED, IN_REVIEW, IN_PROGRESS, RESOLVED, CLOSED]
 *           description: Estado del PQR
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           description: Prioridad del PQR
 *         contactEmail:
 *           type: string
 *           description: Email de contacto
 *         contactPhone:
 *           type: string
 *           description: Teléfono de contacto
 *         userId:
 *           type: string
 *           description: ID del usuario que creó el PQR
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
 *         files:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PQRFile'
 *     
 *     PQRFile:
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
 *         pqrId:
 *           type: string
 *           description: ID del PQR
 *         uploadedBy:
 *           type: string
 *           description: ID del usuario que subió el archivo
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de subida
 *     
 *     CreatePQRRequest:
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
 *           description: Título del PQR
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *           description: Descripción detallada del PQR
 *         type:
 *           type: string
 *           enum: [PETITION, COMPLAINT, CLAIM, SUGGESTION]
 *           description: Tipo de PQR
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           description: Prioridad del PQR
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: Email de contacto
 *         contactPhone:
 *           type: string
 *           maxLength: 20
 *           description: Teléfono de contacto
 *     
 *     UpdatePQRRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Título del PQR
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *           description: Descripción detallada del PQR
 *         type:
 *           type: string
 *           enum: [PETITION, COMPLAINT, CLAIM, SUGGESTION]
 *           description: Tipo de PQR
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           description: Prioridad del PQR
 *         status:
 *           type: string
 *           enum: [RECEIVED, IN_REVIEW, IN_PROGRESS, RESOLVED, CLOSED]
 *           description: Estado del PQR
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: Email de contacto
 *         contactPhone:
 *           type: string
 *           maxLength: 20
 *           description: Teléfono de contacto
 *     
 *     ChangeStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [RECEIVED, IN_REVIEW, IN_PROGRESS, RESOLVED, CLOSED]
 *           description: Nuevo estado del PQR
 */

/**
 * @swagger
 * /api/pqr:
 *   post:
 *     summary: Crear un nuevo PQR
 *     tags: [PQR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePQRRequest'
 *     responses:
 *       201:
 *         description: PQR creado exitosamente
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
 *                     pqr:
 *                       $ref: '#/components/schemas/PQR'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticate, generalLimiter, PQRController.createPQR);

/**
 * @swagger
 * /api/pqr:
 *   get:
 *     summary: Obtener lista de PQRs con filtros
 *     tags: [PQR]
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
 *           enum: [PETITION, COMPLAINT, CLAIM, SUGGESTION]
 *         description: Filtrar por tipo de PQR
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [RECEIVED, IN_REVIEW, IN_PROGRESS, RESOLVED, CLOSED]
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
 *         description: Lista de PQRs obtenida exitosamente
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
 *                     pqrs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PQR'
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
router.get('/', authenticate, authorize("ADMIN", "MANAGER", "USER"), PQRController.getPQRs);

/**
 * @swagger
 * /api/pqr/my:
 *   get:
 *     summary: Obtener PQRs del usuario autenticado
 *     tags: [PQR]
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
 *           enum: [PETITION, COMPLAINT, CLAIM, SUGGESTION]
 *         description: Filtrar por tipo de PQR
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [RECEIVED, IN_REVIEW, IN_PROGRESS, RESOLVED, CLOSED]
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
 *         description: PQRs del usuario obtenidos exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/my', authenticate, PQRController.getUserPQRs);

/**
 * @swagger
 * /api/pqr/recent:
 *   get:
 *     summary: Obtener PQRs recientes
 *     tags: [PQR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 5
 *         description: Número de PQRs recientes a obtener
 *     responses:
 *       200:
 *         description: PQRs recientes obtenidos exitosamente
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
 *                     pqrs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PQR'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/recent', authenticate, authorize("ADMIN", "MANAGER"), PQRController.getRecentPQRs);

/**
 * @swagger
 * /api/pqr/stats:
 *   get:
 *     summary: Obtener estadísticas de PQRs
 *     tags: [PQR]
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
 *                         growth:
 *                           type: number
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/stats', authenticate, authorize("ADMIN", "MANAGER"), PQRController.getPQRStats);

/**
 * @swagger
 * /api/pqr/{id}:
 *   get:
 *     summary: Obtener un PQR por ID
 *     tags: [PQR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del PQR
 *     responses:
 *       200:
 *         description: PQR obtenido exitosamente
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
 *                     pqr:
 *                       $ref: '#/components/schemas/PQR'
 *       404:
 *         description: PQR no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', authenticate, authorize("ADMIN", "MANAGER", "USER"), PQRController.getPQRById);

/**
 * @swagger
 * /api/pqr/{id}:
 *   put:
 *     summary: Actualizar un PQR
 *     tags: [PQR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del PQR
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePQRRequest'
 *     responses:
 *       200:
 *         description: PQR actualizado exitosamente
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
 *                     pqr:
 *                       $ref: '#/components/schemas/PQR'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: PQR no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.put('/:id', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, PQRController.updatePQR);

/**
 * @swagger
 * /api/pqr/{id}:
 *   delete:
 *     summary: Eliminar un PQR
 *     tags: [PQR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del PQR
 *     responses:
 *       200:
 *         description: PQR eliminado exitosamente
 *       404:
 *         description: PQR no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.delete('/:id', authenticate, authorize("ADMIN", "MANAGER"), PQRController.deletePQR);

/**
 * @swagger
 * /api/pqr/{id}/status:
 *   patch:
 *     summary: Cambiar estado de un PQR
 *     tags: [PQR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del PQR
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
 *                     pqr:
 *                       $ref: '#/components/schemas/PQR'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: PQR no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.patch('/:id/status', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, PQRController.changeStatus);

/**
 * @swagger
 * /api/pqr/{id}/files:
 *   post:
 *     summary: Subir archivo a un PQR
 *     tags: [PQR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del PQR
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo a subir (máximo 10MB)
 *     responses:
 *       201:
 *         description: Archivo subido exitosamente
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
 *                     file:
 *                       $ref: '#/components/schemas/PQRFile'
 *       400:
 *         description: Archivo no válido o no proporcionado
 *       404:
 *         description: PQR no encontrado
 *       401:
 *         description: No autorizado
 */
router.post('/:id/files', authenticate, uploadLimiter, upload.single('file'), PQRController.addFile);

/**
 * @swagger
 * /api/pqr/files/{fileId}:
 *   delete:
 *     summary: Eliminar archivo de un PQR
 *     tags: [PQR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del archivo
 *     responses:
 *       200:
 *         description: Archivo eliminado exitosamente
 *       404:
 *         description: Archivo no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.delete('/files/:fileId', authenticate, PQRController.deleteFile);

export default router;