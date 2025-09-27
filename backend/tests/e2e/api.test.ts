import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  makeRequest,
  createUserAndGetToken,
  createAdminAndGetToken,
  createFullTestData,
  expectApiResponse,
  expectPaginatedResponse,
} from './setup';

describe('API End-to-End Tests', () => {
  describe('Complete User Journey', () => {
    it('should complete full user registration and page management flow', async () => {
      // 1. Registro de usuario
      const userData = {
        email: 'journey@example.com',
        name: 'Journey User',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const registerResponse = await makeRequest()
        .post('/api/auth/register')
        .send(userData);

      expectApiResponse(registerResponse, 201);
      expect(registerResponse.body.data).toHaveProperty('accessToken');
      expect(registerResponse.body.data).toHaveProperty('refreshToken');

      const { accessToken } = registerResponse.body.data;

      // 2. Verificar perfil del usuario
      const profileResponse = await makeRequest()
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expectApiResponse(profileResponse, 200);
      expect(profileResponse.body.data.user.email).toBe(userData.email);

      // 3. Crear primera página
      const pageData = {
        title: 'Mi Primera Página',
        content: '<div><h1>Bienvenido</h1><p>Esta es mi primera página.</p></div>',
        description: 'Página de bienvenida',
        status: 'draft',
      };

      const createPageResponse = await makeRequest()
        .post('/api/pages')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(pageData);

      expectApiResponse(createPageResponse, 201);
      expect(createPageResponse.body.data.page.title).toBe(pageData.title);

      const pageId = createPageResponse.body.data.page.id;

      // 4. Actualizar la página
      const updateData = {
        title: 'Mi Primera Página - Actualizada',
        content: '<div><h1>Bienvenido</h1><p>Esta es mi primera página actualizada.</p></div>',
        status: 'published',
      };

      const updatePageResponse = await makeRequest()
        .put(`/api/pages/${pageId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData);

      expectApiResponse(updatePageResponse, 200);
      expect(updatePageResponse.body.data.page.title).toBe(updateData.title);
      expect(updatePageResponse.body.data.page.status).toBe('published');

      // 5. Obtener lista de páginas
      const pagesResponse = await makeRequest()
        .get('/api/pages')
        .set('Authorization', `Bearer ${accessToken}`);

      expectPaginatedResponse(pagesResponse, 200);
      expect(pagesResponse.body.data.pages.length).toBe(1);
      expect(pagesResponse.body.data.pages[0].id).toBe(pageId);

      // 6. Duplicar la página
      const duplicateResponse = await makeRequest()
        .post(`/api/pages/${pageId}/duplicate`)
        .set('Authorization', `Bearer ${accessToken}`);

      expectApiResponse(duplicateResponse, 201);
      expect(duplicateResponse.body.data.page.title).toContain('Copia de');
      expect(duplicateResponse.body.data.page.id).not.toBe(pageId);

      // 7. Verificar que ahora hay 2 páginas
      const finalPagesResponse = await makeRequest()
        .get('/api/pages')
        .set('Authorization', `Bearer ${accessToken}`);

      expectPaginatedResponse(finalPagesResponse, 200);
      expect(finalPagesResponse.body.data.pages.length).toBe(2);

      // 8. Cambiar contraseña
      const changePasswordResponse = await makeRequest()
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
          confirmNewPassword: 'newpassword123',
        });

      expectApiResponse(changePasswordResponse, 200);

      // 9. Cerrar sesión
      const logoutResponse = await makeRequest()
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expectApiResponse(logoutResponse, 200);

      // 10. Iniciar sesión con nueva contraseña
      const loginResponse = await makeRequest()
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'newpassword123',
        });

      expectApiResponse(loginResponse, 200);
      expect(loginResponse.body.data).toHaveProperty('accessToken');
    });

    it('should handle admin user management flow', async () => {
      // 1. Crear admin
      const { user: admin, token: adminToken } = await createAdminAndGetToken();

      // 2. Crear usuario regular
      const { user: regularUser, token: userToken } = await createUserAndGetToken();

      // 3. Admin obtiene lista de usuarios
      const usersResponse = await makeRequest()
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expectPaginatedResponse(usersResponse, 200);
      expect(usersResponse.body.data.users.length).toBeGreaterThanOrEqual(2);

      // 4. Admin crea nuevo usuario
      const newUserData = {
        email: 'admin-created@example.com',
        name: 'Admin Created User',
        password: 'password123',
        role: 'user',
        active: true,
      };

      const createUserResponse = await makeRequest()
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUserData);

      expectApiResponse(createUserResponse, 201);
      expect(createUserResponse.body.data.user.email).toBe(newUserData.email);

      const newUserId = createUserResponse.body.data.user.id;

      // 5. Admin actualiza el usuario creado
      const updateUserResponse = await makeRequest()
        .put(`/api/users/${newUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
          role: 'admin',
        });

      expectApiResponse(updateUserResponse, 200);
      expect(updateUserResponse.body.data.user.name).toBe('Updated Name');
      expect(updateUserResponse.body.data.user.role).toBe('admin');

      // 6. Admin desactiva el usuario
      const toggleStatusResponse = await makeRequest()
        .post(`/api/users/${newUserId}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`);

      expectApiResponse(toggleStatusResponse, 200);
      expect(toggleStatusResponse.body.data.user.active).toBe(false);

      // 7. Admin obtiene estadísticas
      const statsResponse = await makeRequest()
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expectApiResponse(statsResponse, 200);
      expect(statsResponse.body.data.stats).toHaveProperty('total');
      expect(statsResponse.body.data.stats).toHaveProperty('byRole');

      // 8. Usuario regular no puede acceder a gestión de usuarios
      const unauthorizedResponse = await makeRequest()
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(unauthorizedResponse.status).toBe(403);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle rate limiting correctly', async () => {
      const { token } = await createUserAndGetToken();

      // Hacer múltiples requests rápidos para activar rate limiting
      const requests = [];
      for (let i = 0; i < 25; i++) {
        requests.push(
          makeRequest()
            .get('/api/pages')
            .set('Authorization', `Bearer ${token}`)
        );
      }

      const responses = await Promise.all(requests);
      
      // Algunos requests deberían ser exitosos
      const successfulRequests = responses.filter(r => r.status === 200);
      expect(successfulRequests.length).toBeGreaterThan(0);

      // Algunos requests deberían ser limitados
      const rateLimitedRequests = responses.filter(r => r.status === 429);
      expect(rateLimitedRequests.length).toBeGreaterThan(0);

      if (rateLimitedRequests.length > 0) {
        expect(rateLimitedRequests[0].body.error.message).toContain('límite');
      }
    });

    it('should handle validation errors consistently', async () => {
      const { token } = await createUserAndGetToken();

      // Test con datos inválidos en diferentes endpoints
      const invalidPageData = {
        title: '', // Título vacío
        content: '', // Contenido vacío
        status: 'invalid-status', // Estado inválido
      };

      const pageResponse = await makeRequest()
        .post('/api/pages')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidPageData);

      expect(pageResponse.status).toBe(400);
      expect(pageResponse.body.success).toBe(false);
      expect(pageResponse.body.error).toHaveProperty('code');
      expect(pageResponse.body.error).toHaveProperty('details');

      // Test con datos de registro inválidos
      const invalidRegisterData = {
        email: 'invalid-email',
        name: '',
        password: '123',
        confirmPassword: '456',
      };

      const registerResponse = await makeRequest()
        .post('/api/auth/register')
        .send(invalidRegisterData);

      expect(registerResponse.status).toBe(400);
      expect(registerResponse.body.success).toBe(false);
      expect(registerResponse.body.error).toHaveProperty('details');
    });

    it('should handle authentication and authorization correctly', async () => {
      const { user, token } = await createUserAndGetToken();

      // 1. Request sin token
      const noTokenResponse = await makeRequest()
        .get('/api/pages');

      expect(noTokenResponse.status).toBe(401);
      expect(noTokenResponse.body.success).toBe(false);

      // 2. Request con token inválido
      const invalidTokenResponse = await makeRequest()
        .get('/api/pages')
        .set('Authorization', 'Bearer invalid-token');

      expect(invalidTokenResponse.status).toBe(401);
      expect(invalidTokenResponse.body.success).toBe(false);

      // 3. Request con token válido pero sin permisos
      const unauthorizedResponse = await makeRequest()
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(unauthorizedResponse.status).toBe(403);
      expect(unauthorizedResponse.body.success).toBe(false);

      // 4. Request con token válido y permisos correctos
      const authorizedResponse = await makeRequest()
        .get('/api/pages')
        .set('Authorization', `Bearer ${token}`);

      expect(authorizedResponse.status).toBe(200);
      expect(authorizedResponse.body.success).toBe(true);
    });

    it('should handle database constraints and conflicts', async () => {
      // 1. Intentar registrar usuario con email duplicado
      const userData = {
        email: 'duplicate@example.com',
        name: 'First User',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const firstRegisterResponse = await makeRequest()
        .post('/api/auth/register')
        .send(userData);

      expectApiResponse(firstRegisterResponse, 201);

      const secondRegisterResponse = await makeRequest()
        .post('/api/auth/register')
        .send({
          ...userData,
          name: 'Second User',
        });

      expect(secondRegisterResponse.status).toBe(400);
      expect(secondRegisterResponse.body.success).toBe(false);
      expect(secondRegisterResponse.body.error.message).toContain('email');

      // 2. Intentar acceder a recurso inexistente
      const { token } = await createUserAndGetToken();

      const notFoundResponse = await makeRequest()
        .get('/api/pages/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(notFoundResponse.status).toBe(404);
      expect(notFoundResponse.body.success).toBe(false);
    });
  });

  describe('Performance and Pagination', () => {
    it('should handle large datasets with pagination', async () => {
      const { user, token } = await createUserAndGetToken();

      // Crear múltiples páginas
      const pagePromises = [];
      for (let i = 1; i <= 25; i++) {
        pagePromises.push(
          makeRequest()
            .post('/api/pages')
            .set('Authorization', `Bearer ${token}`)
            .send({
              title: `Test Page ${i}`,
              content: `<div>Content for page ${i}</div>`,
              status: 'draft',
            })
        );
      }

      await Promise.all(pagePromises);

      // Test paginación
      const page1Response = await makeRequest()
        .get('/api/pages?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expectPaginatedResponse(page1Response, 200);
      expect(page1Response.body.data.pages.length).toBe(10);
      expect(page1Response.body.data.pagination.page).toBe(1);
      expect(page1Response.body.data.pagination.total).toBe(25);
      expect(page1Response.body.data.pagination.pages).toBe(3);

      const page2Response = await makeRequest()
        .get('/api/pages?page=2&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expectPaginatedResponse(page2Response, 200);
      expect(page2Response.body.data.pages.length).toBe(10);
      expect(page2Response.body.data.pagination.page).toBe(2);

      const page3Response = await makeRequest()
        .get('/api/pages?page=3&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expectPaginatedResponse(page3Response, 200);
      expect(page3Response.body.data.pages.length).toBe(5);
      expect(page3Response.body.data.pagination.page).toBe(3);
    });

    it('should handle search and filtering efficiently', async () => {
      const { token } = await createUserAndGetToken();

      // Crear páginas con diferentes títulos y estados
      const testPages = [
        { title: 'Home Page', status: 'published' },
        { title: 'About Us', status: 'draft' },
        { title: 'Contact Page', status: 'published' },
        { title: 'Services', status: 'draft' },
        { title: 'Blog Home', status: 'published' },
      ];

      for (const pageData of testPages) {
        await makeRequest()
          .post('/api/pages')
          .set('Authorization', `Bearer ${token}`)
          .send({
            ...pageData,
            content: `<div>Content for ${pageData.title}</div>`,
          });
      }

      // Test búsqueda por título
      const searchResponse = await makeRequest()
        .get('/api/pages?search=Home')
        .set('Authorization', `Bearer ${token}`);

      expectPaginatedResponse(searchResponse, 200);
      expect(searchResponse.body.data.pages.length).toBe(2);
      expect(searchResponse.body.data.pages.every((page: any) => 
        page.title.toLowerCase().includes('home')
      )).toBe(true);

      // Test filtro por estado
      const publishedResponse = await makeRequest()
        .get('/api/pages?status=published')
        .set('Authorization', `Bearer ${token}`);

      expectPaginatedResponse(publishedResponse, 200);
      expect(publishedResponse.body.data.pages.every((page: any) => 
        page.status === 'published'
      )).toBe(true);

      // Test combinación de búsqueda y filtro
      const combinedResponse = await makeRequest()
        .get('/api/pages?search=Page&status=published')
        .set('Authorization', `Bearer ${token}`);

      expectPaginatedResponse(combinedResponse, 200);
      expect(combinedResponse.body.data.pages.every((page: any) => 
        page.title.toLowerCase().includes('page') && page.status === 'published'
      )).toBe(true);
    });
  });

  describe('Security and Data Integrity', () => {
    it('should prevent unauthorized access to other users\' data', async () => {
      const { user: user1, token: token1 } = await createUserAndGetToken();
      const { user: user2, token: token2 } = await createUserAndGetToken();

      // Usuario 1 crea una página
      const pageResponse = await makeRequest()
        .post('/api/pages')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Private Page',
          content: '<div>Private content</div>',
          status: 'draft',
        });

      const pageId = pageResponse.body.data.page.id;

      // Usuario 2 no debe poder acceder a la página del usuario 1
      const unauthorizedResponse = await makeRequest()
        .get(`/api/pages/${pageId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(unauthorizedResponse.status).toBe(403);

      // Usuario 2 no debe poder actualizar la página del usuario 1
      const updateResponse = await makeRequest()
        .put(`/api/pages/${pageId}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ title: 'Hacked Title' });

      expect(updateResponse.status).toBe(403);

      // Usuario 2 no debe poder eliminar la página del usuario 1
      const deleteResponse = await makeRequest()
        .delete(`/api/pages/${pageId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(deleteResponse.status).toBe(403);
    });

    it('should sanitize and validate all inputs', async () => {
      const { token } = await createUserAndGetToken();

      // Test con contenido potencialmente peligroso
      const maliciousData = {
        title: '<script>alert("XSS")</script>',
        content: '<div onclick="alert(\'XSS\')">Content</div>',
        description: 'javascript:alert("XSS")',
      };

      const response = await makeRequest()
        .post('/api/pages')
        .set('Authorization', `Bearer ${token}`)
        .send(maliciousData);

      if (response.status === 201) {
        // Si se crea la página, verificar que el contenido fue sanitizado
        expect(response.body.data.page.title).not.toContain('<script>');
        expect(response.body.data.page.content).not.toContain('onclick');
        expect(response.body.data.page.description).not.toContain('javascript:');
      } else {
        // O que fue rechazado por validación
        expect(response.status).toBe(400);
      }
    });
  });
});