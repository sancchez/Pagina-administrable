import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  prisma,
  createTestUser,
  createTestAdmin,
  generateTestToken,
  createAuthHeaders,
  waitForDatabase,
} from './setup';
import { makeRequest } from '../e2e/setup';
import bcrypt from 'bcrypt';

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    await waitForDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await makeRequest()
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user).not.toHaveProperty('password');

      // Verificar que el usuario fue creado en la base de datos
      const createdUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.active).toBe(true);
      expect(createdUser?.role).toBe('user');
    });

    it('should reject registration with existing email', async () => {
      // Crear usuario existente
      await createTestUser({ email: 'existing@example.com' });

      const userData = {
        email: 'existing@example.com',
        name: 'Another User',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await makeRequest()
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('email');
    });

    it('should reject registration with mismatched passwords', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        confirmPassword: 'differentpassword',
      };

      const response = await makeRequest()
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('password');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await makeRequest()
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: '123',
        confirmPassword: '123',
      };

      const response = await makeRequest()
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await createTestUser({
        email: 'login@example.com',
        password: hashedPassword,
      });

      const response = await makeRequest()
        .post('/api/auth/login')
        .send({
          email: user.email,
          password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject login with invalid email', async () => {
      const response = await makeRequest()
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('credenciales');
    });

    it('should reject login with invalid password', async () => {
      const user = await createTestUser({ email: 'test@example.com' });

      const response = await makeRequest()
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('credenciales');
    });

    it('should reject login for inactive user', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await createTestUser({
        email: 'inactive@example.com',
        password: hashedPassword,
        active: false,
      });

      const response = await makeRequest()
        .post('/api/auth/login')
        .send({
          email: user.email,
          password,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('inactiva');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const user = await createTestUser();
      const refreshToken = generateTestToken(user.id, user.role);

      const response = await makeRequest()
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject refresh with invalid token', async () => {
      const response = await makeRequest()
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject refresh without token', async () => {
      const response = await makeRequest()
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user.id, user.role);

      const response = await makeRequest()
        .post('/api/auth/logout')
        .set(createAuthHeaders(token));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('sesión cerrada');
    });

    it('should reject logout without token', async () => {
      const response = await makeRequest()
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user.id, user.role);

      const response = await makeRequest()
        .get('/api/auth/me')
        .set(createAuthHeaders(token));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await makeRequest()
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await makeRequest()
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password with valid current password', async () => {
      const currentPassword = 'currentpassword123';
      const newPassword = 'newpassword123';
      const hashedPassword = await bcrypt.hash(currentPassword, 10);
      
      const user = await createTestUser({
        password: hashedPassword,
      });
      const token = generateTestToken(user.id, user.role);

      const response = await makeRequest()
        .post('/api/auth/change-password')
        .set(createAuthHeaders(token))
        .send({
          currentPassword,
          newPassword,
          confirmNewPassword: newPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('contraseña actualizada');

      // Verificar que la contraseña fue actualizada en la base de datos
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser).toBeTruthy();
      
      // Verificar que la nueva contraseña funciona
      const isNewPasswordValid = await bcrypt.compare(newPassword, updatedUser!.password);
      expect(isNewPasswordValid).toBe(true);
    });

    it('should reject password change with wrong current password', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user.id, user.role);

      const response = await makeRequest()
        .post('/api/auth/change-password')
        .set(createAuthHeaders(token))
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
          confirmNewPassword: 'newpassword123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('actual');
    });

    it('should reject password change with mismatched new passwords', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user.id, user.role);

      const response = await makeRequest()
        .post('/api/auth/change-password')
        .set(createAuthHeaders(token))
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
          confirmNewPassword: 'differentpassword',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject password change without authentication', async () => {
      const response = await makeRequest()
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
          confirmNewPassword: 'newpassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email for existing user', async () => {
      const user = await createTestUser({ email: 'reset@example.com' });

      const response = await makeRequest()
        .post('/api/auth/forgot-password')
        .send({ email: user.email });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('instrucciones');
    });

    it('should return success even for non-existing email (security)', async () => {
      const response = await makeRequest()
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('instrucciones');
    });

    it('should reject request with invalid email format', async () => {
      const response = await makeRequest()
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});