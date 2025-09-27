import winston from 'winston';
import path from 'path';

// Configuración de niveles de log personalizados
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Formato para archivos (sin colores)
const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Configuración de transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
  }),
  
  // Error log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: fileLogFormat,
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: fileLogFormat,
  }),
];

// Crear el logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels: logLevels,
  transports,
});

// Función helper para logging de requests HTTP
export const logRequest = (req: any, res: any, responseTime?: number) => {
  const { method, url, ip, headers } = req;
  const { statusCode } = res;
  const userAgent = headers['user-agent'] || 'Unknown';
  
  const logMessage = `${method} ${url} - ${statusCode} - ${ip} - ${userAgent}${
    responseTime ? ` - ${responseTime}ms` : ''
  }`;
  
  if (statusCode >= 400) {
    logger.error(logMessage);
  } else {
    logger.http(logMessage);
  }
};

// Función helper para logging de errores
export const logError = (error: Error, context?: string) => {
  const message = context 
    ? `[${context}] ${error.message}` 
    : error.message;
  
  logger.error(message, {
    stack: error.stack,
    context,
  });
};

// Función helper para logging de operaciones de base de datos
export const logDatabase = (operation: string, table: string, duration?: number) => {
  const message = `DB ${operation} on ${table}${duration ? ` - ${duration}ms` : ''}`;
  logger.debug(message);
};

// Función helper para logging de autenticación
export const logAuth = (action: string, userId?: string, success: boolean = true) => {
  const message = `Auth ${action}${userId ? ` for user ${userId}` : ''} - ${success ? 'SUCCESS' : 'FAILED'}`;
  
  if (success) {
    logger.info(message);
  } else {
    logger.warn(message);
  }
};

export default logger;