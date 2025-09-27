import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del log de auditoría
 *         action:
 *           type: string
 *           description: Acción realizada (create, update, delete, publish, etc.)
 *         entity:
 *           type: string
 *           description: Tipo de entidad afectada (page, user, invoice, etc.)
 *         entity_id:
 *           type: string
 *           description: ID de la entidad afectada
 *         user_id:
 *           type: string
 *           description: ID del usuario que realizó la acción
 *         details:
 *           type: object
 *           description: Detalles adicionales de la acción
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación del log
 *       example:
 *         id: "audit_123"
 *         action: "create"
 *         entity: "page"
 *         entity_id: "page_456"
 *         user_id: "user_789"
 *         details: { title: "Nueva página" }
 *         createdAt: "2024-01-15T10:30:00Z"
 */

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Obtener logs de auditoría
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de logs a retornar
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de logs a omitir
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de acción
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de entidad
 *     responses:
 *       200:
 *         description: Lista de logs de auditoría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const action = req.query.action as string;
    const entity = req.query.entity as string;

    // Por ahora, devolvemos datos simulados para que el dashboard funcione
    // En una implementación real, esto consultaría la base de datos
    const mockLogs = [
      {
        id: 'audit_1',
        action: 'create',
        entity: 'page',
        entity_id: 'page_1',
        user_id: req.user?.userId,
        details: { title: 'Nueva página creada' },
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutos atrás
      },
      {
        id: 'audit_2',
        action: 'update',
        entity: 'page',
        entity_id: 'page_2',
        user_id: req.user?.userId,
        details: { title: 'Página actualizada' },
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hora atrás
      },
      {
        id: 'audit_3',
        action: 'publish',
        entity: 'page',
        entity_id: 'page_3',
        user_id: req.user?.userId,
        details: { title: 'Página publicada' },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 horas atrás
      },
      {
        id: 'audit_4',
        action: 'create',
        entity: 'user',
        entity_id: 'user_4',
        user_id: req.user?.userId,
        details: { email: 'nuevo@usuario.com' },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() // 3 horas atrás
      }
    ];

    // Aplicar filtros si se proporcionan
    let filteredLogs = mockLogs;
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    if (entity) {
      filteredLogs = filteredLogs.filter(log => log.entity === entity);
    }

    // Aplicar paginación
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    res.json({
      success: true,
      logs: paginatedLogs,
      total: filteredLogs.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;