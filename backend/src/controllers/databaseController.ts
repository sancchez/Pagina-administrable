import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import enhancedLogger from '../utils/enhancedLogger';

const logger = enhancedLogger.child({ service: 'DatabaseController' });

export class DatabaseController {
    /**
     * Descarga la base de datos SQLite actual
     */
    public static async downloadDatabase(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as any).user;
            const dbPath = path.join(process.cwd(), 'prisma', 'db.sqlite');

            const tempDir = os.tmpdir();
            const tempFilename = `db_backup_${uuidv4()}.sqlite`;
            const tempPath = path.join(tempDir, tempFilename);

            logger.info('Solicitud de descarga de base de datos', {
                email: user?.email,
                role: user?.role,
                userId: user?.userId, // Keep original userId logging
                dbPath,
                tempPath
            });

            if (!fs.existsSync(dbPath)) {
                logger.error('Base de datos no encontrada', { path: dbPath });
                res.status(404).json({
                    success: false,
                    message: 'Archivo de base de datos no encontrado'
                });
                return;
            }

            // Realizar una copia para evitar bloqueos de archivos en Windows
            try {
                fs.copyFileSync(dbPath, tempPath);
                logger.info('Copia temporal creada exitosamente', { tempPath });
            } catch (copyError: any) {
                logger.error('Error al copiar el archivo de base de datos', { error: copyError.message });
                res.status(500).json({
                    success: false,
                    message: 'Error al preparar el archivo para descarga'
                });
                return;
            }

            // Nombre del archivo final para el usuario
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const downloadName = `database_backup_${timestamp}.sqlite`;

            // Servir el archivo usando res.download que es más robusto
            res.download(tempPath, downloadName, (err) => {
                if (err) {
                    logger.error('Error durante la descarga del archivo', { error: err.message });
                    if (!res.headersSent) {
                        res.status(500).send('Error al descargar el archivo');
                    }
                } else {
                    logger.info('Descarga completada exitosamente', { downloadName });
                }

                // Limpiar archivo temporal
                try {
                    if (fs.existsSync(tempPath)) {
                        fs.unlinkSync(tempPath);
                        logger.info('Archivo temporal eliminado', { tempPath });
                    }
                } catch (unlinkError: any) {
                    logger.error('Error al eliminar archivo temporal', { error: unlinkError.message });
                }
            });

        } catch (error: any) {
            logger.error('Error inesperado en downloadDatabase', { error: error.message });
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error interno al intentar descargar la base de datos'
                });
            }
        }
    }
}
