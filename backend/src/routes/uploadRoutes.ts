import { Router } from 'express';
import { documentUpload, handleUploadError } from '../utils/upload';
import path from 'path';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * POST /api/upload/button-file
 * Sube un archivo para ser usado en un botón (PDF, Word, Excel, etc.)
 */
router.post(
    '/button-file',
    authenticate,
    authorize('ADMIN', 'MANAGER'),
    documentUpload.single('file'),
    (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se recibió ningún archivo'
                });
            }

            // Construir URL pública del archivo
            // app.ts sirve 'uploads' en '/api/uploads'
            // documentUpload está configurado para guardar en 'uploads/documents'
            const fileUrl = `/api/uploads/documents/${req.file.filename}`;

            return res.json({
                success: true,
                message: 'Archivo subido exitosamente',
                data: {
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    url: fileUrl,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                }
            });
        } catch (error: any) {
            console.error('Error uploading button file:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al subir el archivo',
                error: error.message
            });
        }
    }
);

// Middleware de manejo de errores específico para esta ruta
router.use(handleUploadError);

export default router;
