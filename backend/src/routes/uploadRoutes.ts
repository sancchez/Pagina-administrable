import { Router } from 'express';
import { documentUpload, imageUpload, handleUploadError } from '../utils/upload';
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
    documentUpload.any(),
    (req, res) => {
        try {
            // Con .any(), los archivos vienen en req.files como array
            const files = req.files as Express.Multer.File[];
            const file = files && files.length > 0 ? files[0] : null;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se recibió ningún archivo'
                });
            }

            // Construir URL pública del archivo
            // app.ts sirve 'uploads' en '/api/uploads'
            // documentUpload está configurado para guardar en 'uploads/documents'
            const fileUrl = `/api/uploads/documents/${file.filename}`;

            return res.json({
                success: true,
                message: 'Archivo subido exitosamente',
                data: {
                    filename: file.filename,
                    originalName: file.originalname,
                    url: fileUrl,
                    size: file.size,
                    mimetype: file.mimetype
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

/**
 * POST /api/upload/image
 * Sube imágenes para el Asset Manager de GrapesJS
 */
router.post(
    '/image',
    authenticate,
    authorize('ADMIN', 'MANAGER'),
    imageUpload.any(),
    (req, res) => {
        try {
            const files = req.files as Express.Multer.File[];
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se recibieron imágenes'
                });
            }

            // GrapesJS Asset Manager espera un array con url o un objeto { data: [...] }
            const uploadedFiles = files.map(file => {
                const fileUrl = `/api/uploads/images/${file.filename}`;
                return {
                    src: fileUrl,
                    type: 'image'
                };
            });

            // Formato estándar de respuesta para GrapesJS Asset Manager
            return res.json({ data: uploadedFiles });
        } catch (error: any) {
            console.error('Error uploading images:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al subir las imágenes',
                error: error.message
            });
        }
    }
);

// Middleware de manejo de errores específico para esta ruta
router.use(handleUploadError);

export default router;
