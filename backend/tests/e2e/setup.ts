import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { cleanDatabase } from '../setup';
import request from 'supertest';
import app from '../../src/app';

// Cliente de Prisma para tests E2E
let prisma: PrismaClient;
let server: any;

// Setup antes de todos los tests E2E
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
    console.log('✅ Conectado a la base de datos para tests E2E');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos para tests E2E:', error);
    throw error;
  }

  // Iniciar servidor para tests E2E
  const PORT = process.env.TEST_PORT || 5001;
  server = app.listen(PORT, () => {
    console.log(`✅ Servidor de test iniciado en puerto ${PORT}`);
  });
});

// Cleanup después de todos los tests E2E
afterAll(async () => {
  if (server) {
    server.close();
    console.log('✅ Servidor de test cerrado');
  }
  
  if (prisma) {
    await prisma.$disconnect();
    console.log('✅ Desconectado de la base de datos de test E2E');
  }
});

// Setup antes de cada test E2E
beforeEach(async () => {
  if (prisma) {
    // Limpiar la base de datos antes de cada test
    await cleanDatabase(prisma);
  }
});

// Cleanup después de cada test E2E
afterEach(async () => {
  // Limpiar cualquier estado residual
  jest.clearAllMocks();
});

// Exportar cliente de Prisma y app para usar en tests
export { prisma, app };

// Función para hacer requests HTTP en tests E2E
export const makeRequest = () => request(app);

// Función para crear un usuario completo y obtener token
export const createUserAndGetToken = async (userData: any = {}) => {
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: '$2b$10$hashedpassword', // bcrypt hash de "password123"
      role: 'user',
      active: true,
      ...userData,
    },
  });

  // Simular login para obtener token
  const response = await makeRequest()
    .post('/api/auth/login')
    .send({
      email: user.email,
      password: 'password123',
    });

  return {
    user,
    token: response.body.data.accessToken,
    refreshToken: response.body.data.refreshToken,
  };
};

// Función para crear un admin completo y obtener token
export const createAdminAndGetToken = async (userData: any = {}) => {
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: '$2b$10$hashedpassword', // bcrypt hash de "password123"
      role: 'admin',
      active: true,
      ...userData,
    },
  });

  // Simular login para obtener token
  const response = await makeRequest()
    .post('/api/auth/login')
    .send({
      email: admin.email,
      password: 'password123',
    });

  return {
    user: admin,
    token: response.body.data.accessToken,
    refreshToken: response.body.data.refreshToken,
  };
};

// Función para hacer request autenticado
export const authenticatedRequest = (token: string) => {
  return makeRequest().set('Authorization', `Bearer ${token}`);
};

// Función para crear datos de prueba completos
export const createFullTestData = async () => {
  // Crear usuarios
  const { user: regularUser, token: userToken } = await createUserAndGetToken();
  const { user: adminUser, token: adminToken } = await createAdminAndGetToken({
    email: 'admin2@example.com',
  });

  // Crear páginas
  const page1 = await prisma.page.create({
    data: {
      title: 'Test Page 1',
      slug: 'test-page-1',
      content: '<div>Test content 1</div>',
      published: true,
      userId: regularUser.id,
    },
  });

  const page2 = await prisma.page.create({
    data: {
      title: 'Test Page 2',
      slug: 'test-page-2',
      content: '<div>Test content 2</div>',
      published: false,
      userId: adminUser.id,
    },
  });

  // Crear reportes
  const report1 = await prisma.report.create({
    data: {
      title: 'Test Report 1',
      description: 'Test description 1',
      status: 'pending',
      priority: 'high',
      userId: regularUser.id,
    },
  });

  const report2 = await prisma.report.create({
    data: {
      title: 'Test Report 2',
      description: 'Test description 2',
      status: 'in_progress',
      priority: 'medium',
      userId: adminUser.id,
    },
  });

  // Crear PQRs
  const pqr1 = await prisma.pqr.create({
    data: {
      type: 'peticion',
      subject: 'Test PQR 1',
      description: 'Test PQR description 1',
      status: 'pending',
      priority: 'high',
      contactName: 'Test Contact 1',
      contactEmail: 'contact1@example.com',
      contactPhone: '1234567890',
    },
  });

  // Crear facturas
  const invoice1 = await prisma.invoice.create({
    data: {
      number: 'INV-001',
      clientName: 'Test Client 1',
      clientEmail: 'client1@example.com',
      amount: 1000,
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userId: regularUser.id,
    },
  });

  // Crear configuraciones
  const setting1 = await prisma.settings.create({
    data: {
      key: 'site_title',
      value: 'Test Site',
      type: 'string',
      description: 'Site title setting',
    },
  });

  return {
    users: { regularUser, adminUser },
    tokens: { userToken, adminToken },
    pages: { page1, page2 },
    reports: { report1, report2 },
    pqrs: { pqr1 },
    invoices: { invoice1 },
    settings: { setting1 },
  };
};

// Función para verificar respuesta de API
export const expectApiResponse = (response: any, status: number, success: boolean = true) => {
  expect(response.status).toBe(status);
  expect(response.body).toHaveProperty('success', success);
  if (success) {
    expect(response.body).toHaveProperty('data');
  } else {
    expect(response.body).toHaveProperty('error');
  }
};

// Función para verificar respuesta paginada
export const expectPaginatedResponse = (response: any, status: number = 200) => {
  expectApiResponse(response, status);
  expect(response.body.data).toHaveProperty('items');
  expect(response.body.data).toHaveProperty('pagination');
  expect(response.body.data.pagination).toHaveProperty('page');
  expect(response.body.data.pagination).toHaveProperty('limit');
  expect(response.body.data.pagination).toHaveProperty('total');
  expect(response.body.data.pagination).toHaveProperty('totalPages');
};

// Función para esperar en tests E2E
export const waitForServer = async (ms: number = 500) => {
  await new Promise(resolve => setTimeout(resolve, ms));
};