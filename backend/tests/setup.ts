import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Mock de Prisma para tests unitarios
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    page: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    report: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    pqr: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    invoice: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    settings: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  })),
}));

// Mock de winston logger
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
  logRequest: jest.fn(),
  logError: jest.fn(),
  logAuth: jest.fn(),
  logDatabase: jest.fn(),
}));

// Mock de JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-token'),
  verify: jest.fn(() => ({ userId: 1, role: 'admin' })),
  decode: jest.fn(() => ({ userId: 1, role: 'admin' })),
}));

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true)),
  genSalt: jest.fn(() => Promise.resolve('salt')),
}));

// Mock de multer
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req: any, res: any, next: any) => {
      req.file = {
        filename: 'test-file.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        path: '/uploads/test-file.jpg',
      };
      next();
    },
    array: () => (req: any, res: any, next: any) => {
      req.files = [
        {
          filename: 'test-file-1.jpg',
          originalname: 'test1.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          path: '/uploads/test-file-1.jpg',
        },
      ];
      next();
    },
  });
  
  multer.diskStorage = jest.fn(() => ({}));
  multer.memoryStorage = jest.fn(() => ({}));
  
  return multer;
});

// Variables globales para tests
declare global {
  var __MONGO_URI__: string;
  var __MONGO_DB_NAME__: string;
}

// Configuración de variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.BACKEND_URL = 'http://localhost:5000';

// Setup global antes de todos los tests
beforeAll(async () => {
  // Configuración global para todos los tests
  jest.setTimeout(30000);
});

// Cleanup después de todos los tests
afterAll(async () => {
  // Limpiar recursos globales
  jest.clearAllMocks();
});

// Setup antes de cada test
beforeEach(() => {
  // Limpiar mocks antes de cada test
  jest.clearAllMocks();
});

// Cleanup después de cada test
afterEach(() => {
  // Limpiar cualquier estado residual
  jest.restoreAllMocks();
});

// Utilidades para tests
export const createMockRequest = (overrides: any = {}) => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  user: null,
  file: null,
  files: null,
  ip: '127.0.0.1',
  method: 'GET',
  url: '/',
  ...overrides,
});

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.header = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockNext = () => jest.fn();

// Mock de usuario para tests
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock de página para tests
export const mockPage = {
  id: 1,
  title: 'Test Page',
  slug: 'test-page',
  content: '<div>Test content</div>',
  published: true,
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock de reporte para tests
export const mockReport = {
  id: 1,
  title: 'Test Report',
  description: 'Test description',
  status: 'pending',
  priority: 'medium',
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Función para esperar en tests
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función para limpiar base de datos en tests de integración
export const cleanDatabase = async (prisma: PrismaClient) => {
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter(name => name !== '_prisma_migrations')
    .map(name => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
};