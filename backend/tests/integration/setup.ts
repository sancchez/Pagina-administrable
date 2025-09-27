import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { cleanDatabase } from '../setup';

// Cliente de Prisma para tests de integración
let prisma: PrismaClient;

// Setup antes de todos los tests de integración
beforeAll(async () => {
  // Configurar base de datos de test
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db',
      },
    },
  });

  try {
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos de test');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos de test:', error);
    throw error;
  }

  // Ejecutar migraciones si es necesario
  try {
    await prisma.$executeRaw`SELECT 1`;
  } catch (error) {
    console.error('❌ Error ejecutando query de prueba:', error);
  }
});

// Cleanup después de todos los tests de integración
afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
    console.log('✅ Desconectado de la base de datos de test');
  }
});

// Setup antes de cada test de integración
beforeEach(async () => {
  if (prisma) {
    // Limpiar la base de datos antes de cada test
    await cleanDatabase(prisma);
  }
});

// Cleanup después de cada test de integración
afterEach(async () => {
  // Limpiar cualquier estado residual
  jest.clearAllMocks();
});

// Exportar cliente de Prisma para usar en tests
export { prisma };

// Función para crear datos de prueba
export const createTestUser = async (overrides: any = {}) => {
  return await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: '$2b$10$hashedpassword', // bcrypt hash de "password123"
      role: 'user',
      active: true,
      ...overrides,
    },
  });
};

export const createTestAdmin = async (overrides: any = {}) => {
  return await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: '$2b$10$hashedpassword', // bcrypt hash de "password123"
      role: 'admin',
      active: true,
      ...overrides,
    },
  });
};

export const createTestPage = async (userId: number, overrides: any = {}) => {
  return await prisma.page.create({
    data: {
      title: 'Test Page',
      slug: 'test-page',
      content: '<div>Test content</div>',
      published: true,
      userId,
      ...overrides,
    },
  });
};

export const createTestReport = async (userId: number, overrides: any = {}) => {
  return await prisma.report.create({
    data: {
      title: 'Test Report',
      description: 'Test description',
      status: 'pending',
      priority: 'medium',
      userId,
      ...overrides,
    },
  });
};

export const createTestPQR = async (overrides: any = {}) => {
  return await prisma.pqr.create({
    data: {
      type: 'peticion',
      subject: 'Test PQR',
      description: 'Test PQR description',
      status: 'pending',
      priority: 'medium',
      contactName: 'Test Contact',
      contactEmail: 'contact@example.com',
      contactPhone: '1234567890',
      ...overrides,
    },
  });
};

export const createTestInvoice = async (userId: number, overrides: any = {}) => {
  return await prisma.invoice.create({
    data: {
      number: 'INV-001',
      clientName: 'Test Client',
      clientEmail: 'client@example.com',
      amount: 1000,
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      userId,
      ...overrides,
    },
  });
};

export const createTestSettings = async (overrides: any = {}) => {
  return await prisma.settings.create({
    data: {
      key: 'test_setting',
      value: 'test_value',
      type: 'string',
      description: 'Test setting',
      ...overrides,
    },
  });
};

// Función para generar JWT token para tests
export const generateTestToken = (userId: number, role: string = 'user') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-jwt-secret',
    { expiresIn: '1h' }
  );
};

// Función para crear headers de autorización
export const createAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

// Función para esperar en tests de integración
export const waitForDatabase = async (ms: number = 100) => {
  await new Promise(resolve => setTimeout(resolve, ms));
};