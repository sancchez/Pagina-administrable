import app from './app';
import { PrismaClient } from '@prisma/client';
import enhancedLogger from './utils/enhancedLogger';
import { config } from './config/env';
import { Server } from 'http';

const PORT = config.port;
const prisma = new PrismaClient();

// Logger con contexto del servidor
const serverLogger = enhancedLogger.child({ service: 'Server' });

// Referencia a la instancia del servidor para cierre controlado
let httpServer: Server | null = null;

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
    if (httpServer) {
      await new Promise<void>((resolve) => {
        httpServer!.close(() => {
          serverLogger.info('HTTP server closed');
          resolve();
        });
      });
      httpServer = null;
    }

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

// Manejo específico para reinicio de nodemon
process.once('SIGUSR2', () => {
  serverLogger.info('Received SIGUSR2 (nodemon restart), closing server first');
  if (httpServer) {
    httpServer.close(() => {
      serverLogger.info('HTTP server closed for restart');
      prisma.$disconnect().finally(() => {
        // Reemitir la señal para que nodemon reinicie
        process.kill(process.pid, 'SIGUSR2');
      });
    });
  } else {
    // No hay servidor, solo reemitimos la señal
    process.kill(process.pid, 'SIGUSR2');
  }
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
    // Escuchar en 0.0.0.0 para permitir conexiones externas (IPv4)
    httpServer = app.listen(PORT, '0.0.0.0', () => {
      const duration = Date.now() - startTime;
      
      serverLogger.info('Server started successfully', {
        port: PORT,
        duration,
        environment: config.nodeEnv,
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

    // Capturar errores del servidor (por ejemplo EADDRINUSE)
    httpServer.on('error', (err: any) => {
      if (err && err.code === 'EADDRINUSE') {
        serverLogger.error('Port already in use', err, { port: PORT, code: 'EADDRINUSE' });
        // Salida controlada para evitar crash loops
        process.exit(1);
      } else {
        serverLogger.error('HTTP Server error', err);
      }
    });

    // Configurar timeout del servidor
    httpServer.timeout = 30000; // 30 segundos
    
    serverLogger.debug('Server timeout configured', { timeout: 30000 });

    return httpServer;
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