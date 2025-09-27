import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';

// Tipos permitidos de archivos
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
];

export const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

// Configuración de tamaños máximos
export const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  DEFAULT: 2 * 1024 * 1024, // 2MB
};

// Crear directorio si no existe
export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    logger.info(`Created directory: ${dirPath}`);
  }
};

// Generar nombre único para archivo
export const generateUniqueFileName = (originalName: string): string => {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  
  return `${name}_${timestamp}_${uuid}${ext}`;
};

// Validar tipo de archivo
export const validateFileType = (mimetype: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(mimetype);
};

// Validar tamaño de archivo
export const validateFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize;
};

// Configuración de storage para multer
const createStorage = (uploadPath: string) => {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        await ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
      } catch (error) {
        logger.error(`Error creating upload directory: ${error}`);
        cb(error as Error, '');
      }
    },
    filename: (req, file, cb) => {
      const uniqueName = generateUniqueFileName(file.originalname);
      cb(null, uniqueName);
    }
  });
};

// Filtro de archivos para multer
const createFileFilter = (allowedTypes: string[], maxSize: number) => {
  return (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Validar tipo
    if (!validateFileType(file.mimetype, allowedTypes)) {
      const error = new Error(`Tipo de archivo no permitido: ${file.mimetype}`);
      (error as any).code = 'INVALID_FILE_TYPE';
      return cb(error);
    }

    // Validar tamaño (se hace aquí aunque multer también lo valida)
    if (file.size && !validateFileSize(file.size, maxSize)) {
      const error = new Error(`Archivo demasiado grande: ${file.size} bytes`);
      (error as any).code = 'FILE_TOO_LARGE';
      return cb(error);
    }

    cb(null, true);
  };
};

// Configuraciones predefinidas de multer
export const imageUpload = multer({
  storage: createStorage(path.join(process.cwd(), 'uploads', 'images')),
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE.IMAGE),
  limits: {
    fileSize: MAX_FILE_SIZE.IMAGE,
    files: 5 // máximo 5 archivos por request
  }
});

export const documentUpload = multer({
  storage: createStorage(path.join(process.cwd(), 'uploads', 'documents')),
  fileFilter: createFileFilter(ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE.DOCUMENT),
  limits: {
    fileSize: MAX_FILE_SIZE.DOCUMENT,
    files: 3 // máximo 3 documentos por request
  }
});

export const generalUpload = multer({
  storage: createStorage(path.join(process.cwd(), 'uploads', 'general')),
  fileFilter: createFileFilter(ALL_ALLOWED_TYPES, MAX_FILE_SIZE.DEFAULT),
  limits: {
    fileSize: MAX_FILE_SIZE.DEFAULT,
    files: 10 // máximo 10 archivos por request
  }
});

// Función para eliminar archivo
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    await fs.unlink(filePath);
    logger.info(`File deleted: ${filePath}`);
    return true;
  } catch (error) {
    logger.error(`Error deleting file ${filePath}: ${error}`);
    return false;
  }
};

// Función para obtener información de archivo
export const getFileInfo = async (filePath: string) => {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath);
    const name = path.basename(filePath);
    
    return {
      name,
      size: stats.size,
      extension: ext,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    logger.error(`Error getting file info for ${filePath}: ${error}`);
    return null;
  }
};

// Middleware para manejo de errores de upload
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'Archivo demasiado grande',
          error: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Demasiados archivos',
          error: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Campo de archivo inesperado',
          error: 'UNEXPECTED_FILE'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Error en la carga de archivo',
          error: error.code
        });
    }
  }

  if (error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }

  logger.error('Upload error:', error);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'INTERNAL_SERVER_ERROR'
  });
};