import { Router } from 'express';
import { DatabaseController } from '../controllers/databaseController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/database/download:
 *   get:
 *     summary: Descarga el archivo de base de datos SQLite
 *     tags: [Database]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archivo SQLite servido exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores pueden realizar esta acción
 *       404:
 *         description: Archivo de base de datos no encontrado
 */
router.get('/download', authenticate, authorize('ADMIN'), DatabaseController.downloadDatabase);

export default router;
