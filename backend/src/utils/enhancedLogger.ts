import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env';

// Crear directorio de logs si no existe
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Niveles de log extendidos
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  trace: 5,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan',
  trace: 'gray',
};

winston.addColors(logColors);

// Formato para consola con más información
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, service, userId, requestId, duration, ...meta } = info;
    
    let logMessage = `${timestamp} [${level}]`;
    
    if (service) logMessage += ` [${service}]`;
    if (requestId) logMessage += ` [${requestId}]`;
    if (userId) logMessage += ` [User:${userId}]`;
    
    logMessage += `: ${message}`;
    
    if (duration) logMessage += ` (${duration}ms)`;
    
    // Agregar metadata adicional si existe
    if (Object.keys(meta).length > 0) {
      logMessage += `\n  Meta: ${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

// Formato para archivos con estructura JSON completa
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    return JSON.stringify({
      ...info,
      environment: config.nodeEnv,
      pid: process.pid,
      hostname: require('os').hostname(),
    });
  })
);

// Configuración de transports mejorada
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: config.nodeEnv === 'development' ? 'trace' : 'info',
  }),
  
  // Error log file (solo errores)
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Combined log file (todos los niveles)
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: fileFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 10,
  }),
  
  // HTTP requests log
  new winston.transports.File({
    filename: path.join(logsDir, 'http.log'),
    level: 'http',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 3,
  }),
  
  // Debug log (solo en desarrollo)
  ...(config.nodeEnv === 'development' ? [
    new winston.transports.File({
      filename: path.join(logsDir, 'debug.log'),
      level: 'debug',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 2,
    })
  ] : []),
];

// Crear el logger principal
const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'trace' : 'info',
  levels: logLevels,
  transports,
  // Manejar excepciones no capturadas
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: fileFormat,
    })
  ],
  // Manejar rechazos de promesas no capturados
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: fileFormat,
    })
  ],
});

// Contexto de logging para requests
interface LogContext {
  requestId?: string;
  userId?: string;
  service?: string;
  operation?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

// Logger mejorado con contexto
class EnhancedLogger {
  private context: LogContext = {};

  // Establecer contexto para el logger
  setContext(context: Partial<LogContext>) {
    this.context = { ...this.context, ...context };
    return this;
  }

  // Limpiar contexto
  clearContext() {
    this.context = {};
    return this;
  }

  // Métodos de logging con contexto
  error(message: string, error?: Error | any, metadata?: Record<string, any>) {
    logger.error(message, {
      ...this.context,
      ...metadata,
      ...(error && {
        error: error.message || error,
        stack: error.stack,
        code: error.code,
      }),
    });
  }

  warn(message: string, metadata?: Record<string, any>) {
    logger.warn(message, { ...this.context, ...metadata });
  }

  info(message: string, metadata?: Record<string, any>) {
    logger.info(message, { ...this.context, ...metadata });
  }

  http(message: string, metadata?: Record<string, any>) {
    logger.http(message, { ...this.context, ...metadata });
  }

  debug(message: string, metadata?: Record<string, any>) {
    logger.debug(message, { ...this.context, ...metadata });
  }

  trace(message: string, metadata?: Record<string, any>) {
    logger.log('trace', message, { ...this.context, ...metadata });
  }

  // Logging específico para operaciones de base de datos
  database(operation: string, table: string, duration?: number, metadata?: Record<string, any>) {
    this.debug(`DB ${operation.toUpperCase()} on ${table}`, {
      operation,
      table,
      duration,
      ...metadata,
    });
  }

  // Logging específico para autenticación
  auth(action: string, userId?: string, success: boolean = true, metadata?: Record<string, any>) {
    const message = `Auth ${action}${userId ? ` for user ${userId}` : ''} - ${success ? 'SUCCESS' : 'FAILED'}`;
    
    if (success) {
      this.info(message, { action, userId, success, ...metadata });
    } else {
      this.warn(message, { action, userId, success, ...metadata });
    }
  }

  // Logging específico para requests HTTP
  request(req: any, res: any, duration?: number) {
    const { method, originalUrl, ip, headers } = req;
    const { statusCode } = res;
    const userAgent = headers['user-agent'] || 'Unknown';
    const contentLength = res.get('content-length') || 0;
    
    const metadata = {
      method,
      url: originalUrl,
      statusCode,
      ip,
      userAgent,
      contentLength,
      duration,
      userId: req.user?.userId,
    };

    const message = `${method} ${originalUrl} - ${statusCode} - ${ip}${duration ? ` - ${duration}ms` : ''}`;
    
    if (statusCode >= 500) {
      this.error(`HTTP Server Error: ${message}`, null, metadata);
    } else if (statusCode >= 400) {
      this.warn(`HTTP Client Error: ${message}`, metadata);
    } else {
      this.http(`HTTP Request: ${message}`, metadata);
    }
  }

  // Logging de performance
  performance(operation: string, duration: number, threshold: number = 1000, metadata?: Record<string, any>) {
    const message = `Performance: ${operation} took ${duration}ms`;
    
    if (duration > threshold) {
      this.warn(`Slow Operation: ${message}`, { operation, duration, threshold, ...metadata });
    } else {
      this.debug(message, { operation, duration, ...metadata });
    }
  }

  // Logging de seguridad
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', metadata?: Record<string, any>) {
    const message = `Security Event: ${event}`;
    
    switch (severity) {
      case 'critical':
        this.error(`CRITICAL - ${message}`, null, { severity, event, ...metadata });
        break;
      case 'high':
        this.error(`HIGH - ${message}`, null, { severity, event, ...metadata });
        break;
      case 'medium':
        this.warn(`MEDIUM - ${message}`, { severity, event, ...metadata });
        break;
      case 'low':
        this.info(`LOW - ${message}`, { severity, event, ...metadata });
        break;
    }
  }

  // Crear un logger con contexto específico
  child(context: Partial<LogContext>) {
    const childLogger = new EnhancedLogger();
    childLogger.context = { ...this.context, ...context };
    return childLogger;
  }
}

// Instancia principal del logger
const enhancedLogger = new EnhancedLogger();

// Funciones helper para compatibilidad con el logger anterior
export const logRequest = (req: any, res: any, responseTime?: number) => {
  enhancedLogger.request(req, res, responseTime);
};

export const logError = (error: Error, context?: string) => {
  enhancedLogger.setContext({ service: context }).error(error.message, error);
};

export const logDatabase = (operation: string, table: string, duration?: number) => {
  enhancedLogger.database(operation, table, duration);
};

export const logAuth = (action: string, userId?: string, success: boolean = true) => {
  enhancedLogger.auth(action, userId, success);
};

// Exportar tanto el logger original como el mejorado
export { logger as originalLogger, enhancedLogger };
export default enhancedLogger;