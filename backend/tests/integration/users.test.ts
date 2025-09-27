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

describe('Users Integration Tests', () => {
  let user: any;
  let admin: any;
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    await waitForDatabase();
    
    user = await createTestUser();
    admin = await createTestAdmin();
    userToken = generateTestToken(user.id, user.role);
    adminToken = generateTestToken(admin.id, admin.role);
  });

  describe('GET /api/users', () => {
    it('should get all users for admin', async () => {
      // Crear usuarios adicionales
      await createTestUser({ email: 'user1@example.com', name: 'User 1' });
      await createTestUser({ email: 'user2@example.com', name: 'User 2' });

      const response = await makeRequest()
        .get('/api/users')
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.users)).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThanOrEqual(4); // admin + user + 2 adicionales

      // Verificar que no se incluyan las contraseñas
      response.body.data.users.forEach((user: any) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should reject access for non-admin users', async () => {
      const response = await makeRequest()
        .get('/api/users')
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('admin');
    });

    it('should support pagination', async () => {
      // Crear múltiples usuarios
      for (let i = 1; i <= 15; i++) {
        await createTestUser({ 
          email: `user${i}@example.com`, 
          name: `User ${i}` 
        });
      }

      const response = await makeRequest()
        .get('/api/users?page=1&limit=10')
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.data.users.length).toBe(10);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
      expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(17); // admin + user + 15 adicionales
    });

    it('should support search by name or email', async () => {
      await createTestUser({ email: 'john.doe@example.com', name: 'John Doe' });
      await createTestUser({ email: 'jane.smith@example.com', name: 'Jane Smith' });
      await createTestUser({ email: 'bob.johnson@example.com', name: 'Bob Johnson' });

      const response = await makeRequest()
        .get('/api/users?search=john')
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.data.users.length).toBe(2); // John Doe y Bob Johnson
    });

    it('should support filtering by role', async () => {
      await createTestUser({ role: 'user' });
      await createTestUser({ role: 'user' });
      await createTestAdmin({ email: 'admin2@example.com' });

      const response = await makeRequest()
        .get('/api/users?role=admin')
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.data.users.every((user: any) => user.role === 'admin')).toBe(true);
    });

    it('should support filtering by active status', async () => {
      await createTestUser({ active: false });
      await createTestUser({ active: true });

      const response = await makeRequest()
        .get('/api/users?active=false')
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.data.users.every((user: any) => user.active === false)).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await makeRequest()
        .get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get specific user by id for admin', async () => {
      const testUser = await createTestUser({ email: 'specific@example.com' });

      const response = await makeRequest()
        .get(`/api/users/${testUser.id}`)
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should allow user to get their own profile', async () => {
      const response = await makeRequest()
        .get(`/api/users/${user.id}`)
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(user.id);
    });

    it('should reject access to other user\'s profile for non-admin', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });

      const response = await makeRequest()
        .get(`/api/users/${otherUser.id}`)
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await makeRequest()
        .get('/api/users/999999')
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should reject request without authentication', async () => {
      const response = await makeRequest()
        .get(`/api/users/${user.id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users', () => {
    it('should create new user as admin', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
        role: 'user',
        active: true,
      };

      const response = await makeRequest()
        .post('/api/users')
        .set(createAuthHeaders(adminToken))
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user.role).toBe(userData.role);
      expect(response.body.data.user).not.toHaveProperty('password');

      // Verificar que el usuario fue creado en la base de datos
      const createdUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.active).toBe(true);
    });

    it('should reject user creation for non-admin', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };

      const response = await makeRequest()
        .post('/api/users')
        .set(createAuthHeaders(userToken))
        .send(userData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should reject creation with existing email', async () => {
      const userData = {
        email: user.email, // Email ya existente
        name: 'Another User',
        password: 'password123',
      };

      const response = await makeRequest()
        .post('/api/users')
        .set(createAuthHeaders(adminToken))
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('email');
    });

    it('should reject creation with invalid data', async () => {
      const userData = {
        email: 'invalid-email', // Email inválido
        name: '',
        password: '123', // Contraseña muy corta
      };

      const response = await makeRequest()
        .post('/api/users')
        .set(createAuthHeaders(adminToken))
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should create user with default values', async () => {
      const userData = {
        email: 'minimal@example.com',
        name: 'Minimal User',
        password: 'password123',
      };

      const response = await makeRequest()
        .post('/api/users')
        .set(createAuthHeaders(adminToken))
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data.user.role).toBe('user');
      expect(response.body.data.user.active).toBe(true);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user as admin', async () => {
      const testUser = await createTestUser({ email: 'toupdate@example.com' });
      const updateData = {
        name: 'Updated Name',
        role: 'admin',
        active: false,
      };

      const response = await makeRequest()
        .put(`/api/users/${testUser.id}`)
        .set(createAuthHeaders(adminToken))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.role).toBe(updateData.role);
      expect(response.body.data.user.active).toBe(updateData.active);

      // Verificar que el usuario fue actualizado en la base de datos
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(updatedUser?.name).toBe(updateData.name);
      expect(updatedUser?.role).toBe(updateData.role);
      expect(updatedUser?.active).toBe(updateData.active);
    });

    it('should allow user to update their own profile (limited fields)', async () => {
      const updateData = {
        name: 'Self Updated Name',
        // role y active no deberían ser actualizables por el usuario
        role: 'admin',
        active: false,
      };

      const response = await makeRequest()
        .put(`/api/users/${user.id}`)
        .set(createAuthHeaders(userToken))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe(updateData.name);
      // Verificar que role y active no cambiaron
      expect(response.body.data.user.role).toBe(user.role);
      expect(response.body.data.user.active).toBe(user.active);
    });

    it('should reject update of other user for non-admin', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const updateData = {
        name: 'Unauthorized Update',
      };

      const response = await makeRequest()
        .put(`/api/users/${otherUser.id}`)
        .set(createAuthHeaders(userToken))
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const response = await makeRequest()
        .put('/api/users/999999')
        .set(createAuthHeaders(adminToken))
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should reject update with invalid data', async () => {
      const updateData = {
        email: 'invalid-email', // Email inválido
      };

      const response = await makeRequest()
        .put(`/api/users/${user.id}`)
        .set(createAuthHeaders(adminToken))
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject email update to existing email', async () => {
      const otherUser = await createTestUser({ email: 'existing@example.com' });
      const updateData = {
        email: otherUser.email,
      };

      const response = await makeRequest()
        .put(`/api/users/${user.id}`)
        .set(createAuthHeaders(adminToken))
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user as admin', async () => {
      const testUser = await createTestUser({ email: 'todelete@example.com' });

      const response = await makeRequest()
        .delete(`/api/users/${testUser.id}`)
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('eliminado');

      // Verificar que el usuario fue eliminado de la base de datos
      const deletedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(deletedUser).toBeNull();
    });

    it('should reject user deletion for non-admin', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });

      const response = await makeRequest()
        .delete(`/api/users/${otherUser.id}`)
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should prevent admin from deleting themselves', async () => {
      const response = await makeRequest()
        .delete(`/api/users/${admin.id}`)
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('mismo');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await makeRequest()
        .delete('/api/users/999999')
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should reject deletion without authentication', async () => {
      const testUser = await createTestUser({ email: 'test@example.com' });

      const response = await makeRequest()
        .delete(`/api/users/${testUser.id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users/:id/toggle-status', () => {
    it('should toggle user status as admin', async () => {
      const testUser = await createTestUser({ 
        email: 'toggle@example.com',
        active: true 
      });

      const response = await makeRequest()
        .post(`/api/users/${testUser.id}/toggle-status`)
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.active).toBe(false);

      // Verificar cambio en la base de datos
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(updatedUser?.active).toBe(false);

      // Probar toggle de vuelta
      const response2 = await makeRequest()
        .post(`/api/users/${testUser.id}/toggle-status`)
        .set(createAuthHeaders(adminToken));

      expect(response2.body.data.user.active).toBe(true);
    });

    it('should reject status toggle for non-admin', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });

      const response = await makeRequest()
        .post(`/api/users/${otherUser.id}/toggle-status`)
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should prevent admin from toggling their own status', async () => {
      const response = await makeRequest()
        .post(`/api/users/${admin.id}/toggle-status`)
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('propio');
    });
  });

  describe('GET /api/users/stats', () => {
    it('should get user statistics as admin', async () => {
      // Crear usuarios con diferentes estados
      await createTestUser({ active: true, role: 'user' });
      await createTestUser({ active: false, role: 'user' });
      await createTestAdmin({ email: 'admin2@example.com', active: true });

      const response = await makeRequest()
        .get('/api/users/stats')
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toHaveProperty('total');
      expect(response.body.data.stats).toHaveProperty('active');
      expect(response.body.data.stats).toHaveProperty('inactive');
      expect(response.body.data.stats).toHaveProperty('byRole');
      expect(response.body.data.stats.total).toBeGreaterThanOrEqual(5);
      expect(response.body.data.stats.byRole).toHaveProperty('user');
      expect(response.body.data.stats.byRole).toHaveProperty('admin');
    });

    it('should reject stats access for non-admin', async () => {
      const response = await makeRequest()
        .get('/api/users/stats')
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});