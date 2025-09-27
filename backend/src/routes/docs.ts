import { Router } from 'express';
import { setupSwagger } from '../config/swagger';

const router = Router();

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Documentación de la API
 *     description: Redirige a la documentación interactiva de Swagger UI
 *     tags: [Docs]
 *     responses:
 *       302:
 *         description: Redirección a Swagger UI
 */
router.get('/', (req, res) => {
  res.redirect('/api/docs/swagger');
});

export default router;