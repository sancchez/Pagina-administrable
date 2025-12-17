// Utilidades helper generales para el backend
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request } from 'express';

// Utilidades de encriptación y hashing
export const security = {
  // Hash de contraseña
  hashPassword: async (password: string): Promise<string> => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  },
  
  // Verificar contraseña
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
  },
  
  // Generar token aleatorio
  generateToken: (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
  },
  
  // Generar UUID v4
  generateUUID: (): string => {
    return crypto.randomUUID();
  },
  
  // Hash MD5
  md5: (data: string): string => {
    return crypto.createHash('md5').update(data).digest('hex');
  },
  
  // Hash SHA256
  sha256: (data: string): string => {
    return crypto.createHash('sha256').update(data).digest('hex');
  },
  
  // Encriptar datos sensibles
  encrypt: (text: string, key: string): string => {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  },
  
  // Desencriptar datos
  decrypt: (encryptedData: string, key: string): string => {
    const algorithm = 'aes-256-cbc';
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher(algorithm, key);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  },
};

// Utilidades JWT
export const jwtUtils = {
  // Generar access token
  generateAccessToken: (payload: object, expiresIn: string = '15m'): string => {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  },
  
  // Generar refresh token
  generateRefreshToken: (payload: object, expiresIn: string = '7d'): string => {
    const secret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  },
  
  // Verificar token
  verifyToken: (token: string, isRefresh: boolean = false): any => {
    const secret = isRefresh 
      ? process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
      : process.env.JWT_SECRET || 'fallback-secret';
    
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Token inválido');
    }
  },
  
  // Decodificar token sin verificar
  decodeToken: (token: string): any => {
    return jwt.decode(token);
  },
  
  // Extraer token del header Authorization
  extractTokenFromHeader: (authHeader: string | undefined): string | null => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  },
};

// Utilidades de arrays y objetos
export const dataUtils = {
  // Remover duplicados de array
  removeDuplicates: <T>(array: T[], key?: keyof T): T[] => {
    if (!key) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },
  
  // Agrupar array por propiedad
  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },
  
  // Ordenar array por propiedad
  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },
  
  // Paginar array
  paginate: <T>(array: T[], page: number, limit: number): { data: T[], total: number, pages: number } => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: array.slice(startIndex, endIndex),
      total: array.length,
      pages: Math.ceil(array.length / limit),
    };
  },
  
  // Limpiar objeto de propiedades undefined/null
  cleanObject: (obj: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    }
    
    return cleaned;
  },
  
  // Seleccionar propiedades específicas de objeto
  pick: <T extends Record<string, any>, K extends keyof T>(
    obj: T, 
    keys: K[]
  ): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },
  
  // Omitir propiedades específicas de objeto
  omit: <T extends Record<string, any>, K extends keyof T>(
    obj: T, 
    keys: K[]
  ): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },
};

// Utilidades de tiempo y fechas
export const timeUtils = {
  // Agregar tiempo a fecha
  addTime: (date: Date, amount: number, unit: 'minutes' | 'hours' | 'days' | 'months'): Date => {
    const newDate = new Date(date);
    
    switch (unit) {
      case 'minutes':
        newDate.setMinutes(newDate.getMinutes() + amount);
        break;
      case 'hours':
        newDate.setHours(newDate.getHours() + amount);
        break;
      case 'days':
        newDate.setDate(newDate.getDate() + amount);
        break;
      case 'months':
        newDate.setMonth(newDate.getMonth() + amount);
        break;
    }
    
    return newDate;
  },
  
  // Verificar si fecha está en rango
  isInRange: (date: Date, start: Date, end: Date): boolean => {
    return date >= start && date <= end;
  },
  
  // Obtener inicio del día
  startOfDay: (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  },
  
  // Obtener fin del día
  endOfDay: (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  },
  
  // Diferencia en días
  daysDifference: (date1: Date, date2: Date): number => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
  
  // Verificar si es fin de semana
  isWeekend: (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Domingo o Sábado
  },
};

// Utilidades de red y requests
export const networkUtils = {
  // Obtener IP del cliente
  getClientIP: (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIP = req.headers['x-real-ip'] as string;
    const remoteAddress = req.connection?.remoteAddress || req.socket?.remoteAddress;
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return remoteAddress || 'unknown';
  },
  
  // Obtener User Agent
  getUserAgent: (req: Request): string => {
    return req.headers['user-agent'] || 'unknown';
  },
  
  // Verificar si es request AJAX
  isAjaxRequest: (req: Request): boolean => {
    return req.headers['x-requested-with'] === 'XMLHttpRequest';
  },
  
  // Obtener protocolo (http/https)
  getProtocol: (req: Request): string => {
    return req.protocol || (req.headers['x-forwarded-proto'] as string) || 'http';
  },
  
  // Construir URL completa
  getFullUrl: (req: Request): string => {
    const protocol = networkUtils.getProtocol(req);
    const host = req.get('host');
    return `${protocol}://${host}${req.originalUrl}`;
  },
};

// Utilidades de archivos y paths
export const fileUtils = {
  // Obtener extensión de archivo
  getFileExtension: (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  },
  
  // Verificar si es imagen
  isImage: (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const extension = fileUtils.getFileExtension(filename);
    return imageExtensions.includes(extension);
  },
  
  // Verificar si es documento
  isDocument: (filename: string): boolean => {
    const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    const extension = fileUtils.getFileExtension(filename);
    return docExtensions.includes(extension);
  },
  
  // Generar nombre único para archivo
  generateUniqueFilename: (originalName: string): string => {
    const extension = fileUtils.getFileExtension(originalName);
    const nameWithoutExt = originalName.replace(`.${extension}`, '');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    
    return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
  },
  
  // Sanitizar nombre de archivo
  sanitizeFilename: (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  },
};

// Utilidades de validación
export const validationUtils = {
  // Verificar si string está vacío o solo espacios
  isEmpty: (str: string | null | undefined): boolean => {
    return !str || str.trim().length === 0;
  },
  
  // Verificar si es número válido
  isValidNumber: (value: any): boolean => {
    return !isNaN(value) && isFinite(value);
  },
  
  // Verificar si es entero positivo
  isPositiveInteger: (value: any): boolean => {
    return Number.isInteger(value) && value > 0;
  },
  
  // Verificar si array no está vacío
  isNonEmptyArray: (arr: any): boolean => {
    return Array.isArray(arr) && arr.length > 0;
  },
  
  // Verificar si objeto no está vacío
  isNonEmptyObject: (obj: any): boolean => {
    return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
  },
};

// Utilidades de performance
export const performanceUtils = {
  // Medir tiempo de ejecución
  measureTime: async <T>(fn: () => Promise<T>, label?: string): Promise<{ result: T, duration: number }> => {
    const start = process.hrtime.bigint();
    const result = await fn();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convertir a milisegundos

    return { result, duration };
  },
  
  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
  
  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
};

// Utilidades de error handling
export const errorUtils = {
  // Crear error personalizado
  createError: (message: string, code: string, statusCode: number = 500) => {
    const error = new Error(message) as any;
    error.code = code;
    error.statusCode = statusCode;
    return error;
  },
  
  // Verificar si es error operacional
  isOperationalError: (error: any): boolean => {
    return error.isOperational === true;
  },
  
  // Extraer información útil del error
  extractErrorInfo: (error: any) => {
    return {
      message: error.message || 'Error desconocido',
      code: error.code || 'UNKNOWN_ERROR',
      statusCode: error.statusCode || 500,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
  },
};

// Exportación para compatibilidad con CommonJS
module.exports = {
  security,
  jwtUtils,
  dataUtils,
  objectUtils: dataUtils, // Alias para compatibilidad
  timeUtils,
  networkUtils,
  fileUtils,
  validationUtils,
  performanceUtils,
  errorUtils,
};