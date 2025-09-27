import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  prisma,
  createTestUser,
  createTestAdmin,
  createTestPage,
  generateTestToken,
  createAuthHeaders,
  waitForDatabase,
} from './setup';
import { makeRequest } from '../e2e/setup';

describe('Pages Integration Tests', () => {
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

  describe('GET /api/pages', () => {
    it('should get all pages for authenticated user', async () => {
      // Crear algunas páginas de prueba
      await createTestPage({ userId: user.id, title: 'Page 1' });
      await createTestPage({ userId: user.id, title: 'Page 2' });
      await createTestPage({ userId: admin.id, title: 'Admin Page' });

      const response = await makeRequest()
        .get('/api/pages')
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pages');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.pages)).toBe(true);
      
      // El usuario solo debe ver sus propias páginas
      const userPages = response.body.data.pages.filter((page: any) => page.userId === user.id);
      expect(userPages.length).toBe(2);
    });

    it('should get all pages for admin', async () => {
      await createTestPage({ userId: user.id, title: 'User Page' });
      await createTestPage({ userId: admin.id, title: 'Admin Page' });

      const response = await makeRequest()
        .get('/api/pages')
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pages.length).toBeGreaterThanOrEqual(2);
    });

    it('should support pagination', async () => {
      // Crear múltiples páginas
      for (let i = 1; i <= 15; i++) {
        await createTestPage({ userId: user.id, title: `Page ${i}` });
      }

      const response = await makeRequest()
        .get('/api/pages?page=1&limit=10')
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(200);
      expect(response.body.data.pages.length).toBe(10);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
      expect(response.body.data.pagination.total).toBe(15);
      expect(response.body.data.pagination.pages).toBe(2);
    });

    it('should support search by title', async () => {
      await createTestPage({ userId: user.id, title: 'Home Page' });
      await createTestPage({ userId: user.id, title: 'About Us' });
      await createTestPage({ userId: user.id, title: 'Contact Page' });

      const response = await makeRequest()
        .get('/api/pages?search=Page')
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(200);
      expect(response.body.data.pages.length).toBe(2);
      expect(response.body.data.pages.every((page: any) => 
        page.title.toLowerCase().includes('page')
      )).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await makeRequest()
        .get('/api/pages');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/pages/:id', () => {
    it('should get specific page by id for owner', async () => {
      const page = await createTestPage({ userId: user.id });

      const response = await makeRequest()
        .get(`/api/pages/${page.id}`)
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.page.id).toBe(page.id);
      expect(response.body.data.page.title).toBe(page.title);
      expect(response.body.data.page.content).toBe(page.content);
    });

    it('should get any page for admin', async () => {
      const page = await createTestPage({ userId: user.id });

      const response = await makeRequest()
        .get(`/api/pages/${page.id}`)
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.page.id).toBe(page.id);
    });

    it('should reject access to other user\'s page', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const page = await createTestPage({ userId: otherUser.id });

      const response = await makeRequest()
        .get(`/api/pages/${page.id}`)
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent page', async () => {
      const response = await makeRequest()
        .get('/api/pages/999999')
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should reject request without authentication', async () => {
      const page = await createTestPage({ userId: user.id });

      const response = await makeRequest()
        .get(`/api/pages/${page.id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/pages', () => {
    it('should create new page with valid data', async () => {
      const pageData = {
        title: 'New Test Page',
        content: '<div>Test content</div>',
        description: 'Test description',
        status: 'draft',
      };

      const response = await makeRequest()
        .post('/api/pages')
        .set(createAuthHeaders(userToken))
        .send(pageData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.page.title).toBe(pageData.title);
      expect(response.body.data.page.content).toBe(pageData.content);
      expect(response.body.data.page.userId).toBe(user.id);
      expect(response.body.data.page.status).toBe(pageData.status);

      // Verificar que la página fue creada en la base de datos
      const createdPage = await prisma.page.findUnique({
        where: { id: response.body.data.page.id },
      });
      expect(createdPage).toBeTruthy();
      expect(createdPage?.title).toBe(pageData.title);
    });

    it('should create page with default values', async () => {
      const pageData = {
        title: 'Minimal Page',
        content: '<div>Content</div>',
      };

      const response = await makeRequest()
        .post('/api/pages')
        .set(createAuthHeaders(userToken))
        .send(pageData);

      expect(response.status).toBe(201);
      expect(response.body.data.page.status).toBe('draft');
      expect(response.body.data.page.description).toBe('');
    });

    it('should reject page creation with invalid data', async () => {
      const pageData = {
        title: '', // Título vacío
        content: '<div>Content</div>',
      };

      const response = await makeRequest()
        .post('/api/pages')
        .set(createAuthHeaders(userToken))
        .send(pageData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject page creation without authentication', async () => {
      const pageData = {
        title: 'Test Page',
        content: '<div>Content</div>',
      };

      const response = await makeRequest()
        .post('/api/pages')
        .send(pageData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/pages/:id', () => {
    it('should update page with valid data', async () => {
      const page = await createTestPage({ userId: user.id });
      const updateData = {
        title: 'Updated Title',
        content: '<div>Updated content</div>',
        description: 'Updated description',
        status: 'published',
      };

      const response = await makeRequest()
        .put(`/api/pages/${page.id}`)
        .set(createAuthHeaders(userToken))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.page.title).toBe(updateData.title);
      expect(response.body.data.page.content).toBe(updateData.content);
      expect(response.body.data.page.status).toBe(updateData.status);

      // Verificar que la página fue actualizada en la base de datos
      const updatedPage = await prisma.page.findUnique({
        where: { id: page.id },
      });
      expect(updatedPage?.title).toBe(updateData.title);
      expect(updatedPage?.updatedAt).not.toEqual(page.updatedAt);
    });

    it('should allow admin to update any page', async () => {
      const page = await createTestPage({ userId: user.id });
      const updateData = {
        title: 'Admin Updated Title',
      };

      const response = await makeRequest()
        .put(`/api/pages/${page.id}`)
        .set(createAuthHeaders(adminToken))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.page.title).toBe(updateData.title);
    });

    it('should reject update of other user\'s page', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const page = await createTestPage({ userId: otherUser.id });
      const updateData = {
        title: 'Unauthorized Update',
      };

      const response = await makeRequest()
        .put(`/api/pages/${page.id}`)
        .set(createAuthHeaders(userToken))
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent page', async () => {
      const updateData = {
        title: 'Updated Title',
      };

      const response = await makeRequest()
        .put('/api/pages/999999')
        .set(createAuthHeaders(userToken))
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should reject update with invalid data', async () => {
      const page = await createTestPage({ userId: user.id });
      const updateData = {
        title: '', // Título vacío
      };

      const response = await makeRequest()
        .put(`/api/pages/${page.id}`)
        .set(createAuthHeaders(userToken))
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/pages/:id', () => {
    it('should delete page successfully', async () => {
      const page = await createTestPage({ userId: user.id });

      const response = await makeRequest()
        .delete(`/api/pages/${page.id}`)
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('eliminada');

      // Verificar que la página fue eliminada de la base de datos
      const deletedPage = await prisma.page.findUnique({
        where: { id: page.id },
      });
      expect(deletedPage).toBeNull();
    });

    it('should allow admin to delete any page', async () => {
      const page = await createTestPage({ userId: user.id });

      const response = await makeRequest()
        .delete(`/api/pages/${page.id}`)
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject deletion of other user\'s page', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const page = await createTestPage({ userId: otherUser.id });

      const response = await makeRequest()
        .delete(`/api/pages/${page.id}`)
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent page', async () => {
      const response = await makeRequest()
        .delete('/api/pages/999999')
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should reject deletion without authentication', async () => {
      const page = await createTestPage({ userId: user.id });

      const response = await makeRequest()
        .delete(`/api/pages/${page.id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/pages/:id/duplicate', () => {
    it('should duplicate page successfully', async () => {
      const originalPage = await createTestPage({ 
        userId: user.id,
        title: 'Original Page',
        content: '<div>Original content</div>',
      });

      const response = await makeRequest()
        .post(`/api/pages/${originalPage.id}/duplicate`)
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.page.title).toContain('Copia de');
      expect(response.body.data.page.content).toBe(originalPage.content);
      expect(response.body.data.page.userId).toBe(user.id);
      expect(response.body.data.page.id).not.toBe(originalPage.id);

      // Verificar que la página duplicada fue creada
      const duplicatedPage = await prisma.page.findUnique({
        where: { id: response.body.data.page.id },
      });
      expect(duplicatedPage).toBeTruthy();
    });

    it('should allow admin to duplicate any page', async () => {
      const page = await createTestPage({ userId: user.id });

      const response = await makeRequest()
        .post(`/api/pages/${page.id}/duplicate`)
        .set(createAuthHeaders(adminToken));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should reject duplication of other user\'s page', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const page = await createTestPage({ userId: otherUser.id });

      const response = await makeRequest()
        .post(`/api/pages/${page.id}/duplicate`)
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/pages/:id/preview', () => {
    it('should get page preview', async () => {
      const page = await createTestPage({ 
        userId: user.id,
        status: 'published',
      });

      const response = await makeRequest()
        .get(`/api/pages/${page.id}/preview`)
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.page.id).toBe(page.id);
      expect(response.body.data.page.content).toBe(page.content);
    });

    it('should allow preview of draft pages for owner', async () => {
      const page = await createTestPage({ 
        userId: user.id,
        status: 'draft',
      });

      const response = await makeRequest()
        .get(`/api/pages/${page.id}/preview`)
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject preview of draft pages for non-owners', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const page = await createTestPage({ 
        userId: otherUser.id,
        status: 'draft',
      });

      const response = await makeRequest()
        .get(`/api/pages/${page.id}/preview`)
        .set(createAuthHeaders(userToken));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});