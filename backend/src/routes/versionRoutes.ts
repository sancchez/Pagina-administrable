import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';
import { VersionController } from '../controllers/versionController';

const router = Router();

// Crear una versión de página
router.post('/pages/:id/versions', authenticate, authorize('ADMIN','MANAGER'), generalLimiter, VersionController.create);

// Listar versiones de una página
router.get('/pages/:id/versions', authenticate, authorize('ADMIN','MANAGER','USER'), VersionController.list);

// Restaurar una versión
router.post('/pages/:id/versions/:versionId/restore', authenticate, authorize('ADMIN','MANAGER'), generalLimiter, VersionController.restore);

// Comparar dos versiones: /pages/:id/versions/compare?from=<id>&to=<id>
router.get('/pages/:id/versions/compare', authenticate, authorize('ADMIN','MANAGER','USER'), VersionController.compare);

export default router;