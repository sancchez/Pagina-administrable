import dotenv from 'dotenv';
import app from './app';
import { PrismaClient } from '@prisma/client';
import enhancedLogger from './utils/enhancedLogger';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Logger con contexto del servidor
const serverLogger = enhancedLogger.child({ service: 'Server' });

// Función para conectar a la base de datos
async function connectDatabase() {
  const startTime = Date.now();
  
  try {
    await prisma.$connect();
    const duration = Date.now() - startTime;
    
    serverLogger.info('Database connected successfully', {
      duration,
      database: 'PostgreSQL',
      connection: 'Prisma',
    });
    
    serverLogger.database('CONNECT', 'database', duration);
  } catch (error) {
    serverLogger.error('Database connection failed', error as Error, {
      duration: Date.now() - startTime,
      database: 'PostgreSQL',
      connection: 'Prisma',
    });
    process.exit(1);
  }
}

// Función para cerrar conexiones gracefully
async function gracefulShutdown() {
  serverLogger.info('Shutting down gracefully...');
  
  try {
    await prisma.$disconnect();
    serverLogger.info('Database disconnected successfully');
    serverLogger.info('Server shutdown completed');
    process.exit(0);
  } catch (error) {
    serverLogger.error('Error during shutdown', error as Error);
    process.exit(1);
  }
}

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  serverLogger.info('Received SIGTERM signal');
  gracefulShutdown();
});

process.on('SIGINT', () => {
  serverLogger.info('Received SIGINT signal (Ctrl+C)');
  gracefulShutdown();
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  serverLogger.error('Unhandled Promise Rejection', reason as Error, {
    promise: promise.toString(),
    type: 'unhandledRejection',
  });
  gracefulShutdown();
});

process.on('uncaughtException', (error) => {
  serverLogger.error('Uncaught Exception', error, {
    type: 'uncaughtException',
  });
  gracefulShutdown();
});

// Función principal para iniciar el servidor
async function startServer() {
  const startTime = Date.now();
  
  try {
    // Conectar a la base de datos
    await connectDatabase();

    // Iniciar el servidor
    const server = app.listen(PORT, () => {
      const duration = Date.now() - startTime;
      
      serverLogger.info('Server started successfully', {
        port: PORT,
        duration,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        pid: process.pid,
      });
      
      serverLogger.info('Server endpoints available', {
        api: `http://localhost:${PORT}/api`,
        docs: `http://localhost:${PORT}/api-docs`,
        health: `http://localhost:${PORT}/health`,
      });
      
      serverLogger.performance('Server startup', duration, 5000);
    });

    // Configurar timeout del servidor
    server.timeout = 30000; // 30 segundos
    
    serverLogger.debug('Server timeout configured', { timeout: 30000 });

    return server;
  } catch (error) {
    serverLogger.error('Failed to start server', error as Error, {
      duration: Date.now() - startTime,
      port: PORT,
    });
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();

export { prisma };