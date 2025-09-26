import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { User, Page, Invoice } from '../types/database.types';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    console.log('📊 Base de datos SQLite conectada');
    
    // Verificar si ya existen datos
    const userCount = await this.user.count();
    if (userCount === 0) {
      console.log('📝 Base de datos vacía, creando datos iniciales...');
      await this.seedDatabase();
    } else {
      console.log('✅ Base de datos ya tiene datos:', {
        usuarios: await this.user.count(),
        páginas: await this.page.count(),
        facturas: await this.invoice.count()
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async seedDatabase() {
    console.log('Creando usuario admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Usuario admin
    await this.user.create({
      data: {
        email: 'admin@acueducto.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin'
      }
    });

    // Páginas iniciales con estructura JSON
    console.log('Creating initial pages with JSON structure...');
    
    const defaultPageStructure = {
      meta: { width: 1200 },
      blocks: []
    };

    const homePageContent = {
      meta: { width: 1200 },
      blocks: [
        {
          id: 'hero1',
          type: 'text',
          content: '<h1>Bienvenido al Acueducto Municipal</h1><p>Agua pura para tu comunidad</p>',
          x: 100,
          y: 50,
          width: 800,
          height: 200
        }
      ]
    };

    await this.page.create({
      data: {
        id: 'home',
        title: 'Inicio',
        draft_json: JSON.stringify(homePageContent),
        published_json: JSON.stringify(homePageContent),
        status: 'published',
        version: 1
      }
    });

    const aboutPageContent = {
      meta: { width: 1200 },
      blocks: [
        {
          id: 'about1',
          type: 'text',
          content: '<h1>Quiénes Somos</h1><p>Información sobre el acueducto municipal</p>',
          x: 100,
          y: 50,
          width: 800,
          height: 200
        }
      ]
    };

    await this.page.create({
      data: {
        id: 'about',
        title: 'Acerca de',
        draft_json: JSON.stringify(aboutPageContent),
        published_json: JSON.stringify(aboutPageContent),
        status: 'published',
        version: 1
      }
    });

    const contactPageContent = {
      meta: { width: 1200 },
      blocks: [
        {
          id: 'contact1',
          type: 'text',
          content: '<h1>Contacto</h1><p>Información de contacto del acueducto municipal</p>',
          x: 100,
          y: 50,
          width: 800,
          height: 200
        }
      ]
    };

    await this.page.create({
      data: {
        id: 'contact',
        title: 'Contacto',
        draft_json: JSON.stringify(contactPageContent),
        published_json: JSON.stringify(contactPageContent),
        status: 'published',
        version: 1
      }
    });

    // Páginas adicionales específicas del acueducto
    await this.page.create({
      data: {
        id: 'quienes-somos',
        title: 'Quiénes Somos',
        draft_json: JSON.stringify(aboutPageContent),
        published_json: JSON.stringify(aboutPageContent),
        status: 'published',
        version: 1
      }
    });

    await this.page.create({
      data: {
        id: 'informacion-esal',
        title: 'Información ESAL',
        draft_json: JSON.stringify({
          meta: { width: 1200 },
          blocks: [
            {
              id: 'esal1',
              type: 'text',
              content: '<h1>Información ESAL</h1><p>Información sobre la Entidad de Servicios de Acueducto y Alcantarillado</p>',
              x: 100,
              y: 50,
              width: 800,
              height: 200
            }
          ]
        }),
        published_json: JSON.stringify({
          meta: { width: 1200 },
          blocks: [
            {
              id: 'esal1',
              type: 'text',
              content: '<h1>Información ESAL</h1><p>Información sobre la Entidad de Servicios de Acueducto y Alcantarillado</p>',
              x: 100,
              y: 50,
              width: 800,
              height: 200
            }
          ]
        }),
        status: 'published',
        version: 1
      }
    });

    await this.page.create({
      data: {
        id: 'operacion-gestion',
        title: 'Operación y Gestión',
        draft_json: JSON.stringify({
          meta: { width: 1200 },
          blocks: [
            {
              id: 'operacion1',
              type: 'text',
              content: '<h1>Operación y Gestión</h1><p>Información sobre la operación y gestión del acueducto</p>',
              x: 100,
              y: 50,
              width: 800,
              height: 200
            }
          ]
        }),
        published_json: JSON.stringify({
          meta: { width: 1200 },
          blocks: [
            {
              id: 'operacion1',
              type: 'text',
              content: '<h1>Operación y Gestión</h1><p>Información sobre la operación y gestión del acueducto</p>',
              x: 100,
              y: 50,
              width: 800,
              height: 200
            }
          ]
        }),
        status: 'published',
        version: 1
      }
    });

    await this.page.create({
      data: {
        id: 'normatividad',
        title: 'Normatividad',
        draft_json: JSON.stringify({
          blocks: [{
            id: 'block1',
            type: 'text',
            content: '<h1>Normatividad</h1><p>Marco normativo y regulatorio del acueducto municipal</p>',
            x: 50,
            y: 50,
            width: 400,
            height: 200
          }]
        }),
        status: 'published',
        version: 1
      }
    });

    await this.page.create({
      data: {
        id: 'portal-usuario',
        title: 'Portal Usuario',
        draft_json: JSON.stringify({
          blocks: [{
            id: 'block1',
            type: 'text',
            content: '<h1>Portal del Usuario</h1><p>Acceso al portal de usuarios para consultas y servicios</p>',
            x: 50,
            y: 50,
            width: 400,
            height: 200
          }]
        }),
        status: 'published',
        version: 1
      }
    });

    // Facturas de ejemplo
    await this.invoice.createMany({
      data: [
        {
          accountNumber: '12345',
          customerName: 'Juan Pérez',
          amount: 45000,
          description: 'Factura de agua - Enero 2024',
          status: 'paid',
          dueDate: '2024-01-31'
        },
        {
          accountNumber: '12346',
          customerName: 'María González',
          amount: 52000,
          description: 'Factura de agua - Enero 2024',
          status: 'pending',
          dueDate: '2024-01-31'
        }
      ]
    });

    console.log('Base de datos SQLite inicializada con datos de ejemplo');
    console.log('Usuario admin creado con email: admin@acueducto.com');
  }

  // Métodos para usuarios
  async findUserByEmail(email: string): Promise<User | null> {
    return this.user.findUnique({
      where: { email }
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.user.findUnique({
      where: { id }
    });
  }

  // Métodos para páginas con nuevo esquema
  async findPageById(id: string) {
    console.log(`[DatabaseService] findPageById(${id}) - searching for page`);
    try {
      const page = await this.page.findUnique({
        where: { id }
      });
      console.log(`[DatabaseService] findPageById(${id}) - ${page ? 'found' : 'not found'}`);
      return page;
    } catch (error) {
      console.error(`[DatabaseService] findPageById(${id}) - error:`, error.message);
      throw error;
    }
  }

  async findAllPages() {
    console.log('[DatabaseService] findAllPages - fetching all pages');
    try {
      const pages = await this.page.findMany({
        orderBy: { createdAt: 'desc' }
      });
      console.log(`[DatabaseService] findAllPages - found ${pages.length} pages`);
      return pages;
    } catch (error) {
      console.error('[DatabaseService] findAllPages - error:', error.message);
      throw error;
    }
  }

  async findAllPagesWithContent() {
    console.log('[DatabaseService] findAllPagesWithContent - fetching all pages with full content');
    try {
      const pages = await this.page.findMany({
        orderBy: { createdAt: 'desc' }
      });
      console.log(`[DatabaseService] findAllPagesWithContent - found ${pages.length} pages`);
      return pages;
    } catch (error) {
      console.error('[DatabaseService] findAllPagesWithContent - error:', error.message);
      throw error;
    }
  }

  async createPage(pageData: {
    id: string;
    title: string;
    draft_json?: string;
    published_json?: string;
    status?: string;
    version?: number;
  }) {
    console.log(`[DatabaseService] createPage(${pageData.id}) - creating new page`, {
      title: pageData.title,
      status: pageData.status,
      hasDraft: !!pageData.draft_json,
      hasPublished: !!pageData.published_json
    });
    
    try {
      const page = await this.page.create({
        data: {
          id: pageData.id,
          title: pageData.title,
          draft_json: pageData.draft_json || null,
          published_json: pageData.published_json || null,
          status: pageData.status || 'draft',
          version: pageData.version || 1
        }
      });
      console.log(`[DatabaseService] createPage(${pageData.id}) - page created successfully`);
      return page;
    } catch (error) {
      console.error(`[DatabaseService] createPage(${pageData.id}) - error:`, error.message);
      throw error;
    }
  }

  async updatePage(id: string, pageData: {
    title?: string;
    draft_json?: string;
    published_json?: string;
    status?: string;
    publishedAt?: Date;
  }) {
    console.log(`[DatabaseService] updatePage(${id}) - updating page`, {
      hasTitle: !!pageData.title,
      hasDraft: !!pageData.draft_json,
      hasPublished: !!pageData.published_json,
      status: pageData.status,
      publishedAt: pageData.publishedAt
    });
    
    try {
      const updateData: any = { ...pageData };
      
      // Si se está publicando, actualizar publishedAt
      if (pageData.status === 'published' && !pageData.publishedAt) {
        updateData.publishedAt = new Date();
      }
      
      const page = await this.page.update({
        where: { id },
        data: updateData
      });
      console.log(`[DatabaseService] updatePage(${id}) - page updated successfully`);
      return page;
    } catch (error) {
      console.error(`[DatabaseService] updatePage(${id}) - error:`, error.message);
      throw error;
    }
  }

  async deletePage(id: string): Promise<boolean> {
    console.log(`[DatabaseService] deletePage(${id}) - deleting page`);
    try {
      await this.page.delete({
        where: { id }
      });
      console.log(`[DatabaseService] deletePage(${id}) - page deleted successfully`);
      return true;
    } catch (error) {
      console.error(`[DatabaseService] deletePage(${id}) - error:`, error.message);
      return false;
    }
  }

  async upsertPage(pageData: {
    id: string;
    title: string;
    slug?: string;
    draft_json?: any;
    published_json?: any;
    status?: string;
    version?: number;
    publishedAt?: Date;
    updatedBy: number;
  }) {
    console.log(`[DatabaseService] upsertPage(${pageData.id}) - creating or updating page`);
    
    try {
      const existingPage = await this.findPageById(pageData.id);
      
      const data = {
        title: pageData.title,
        draft_json: pageData.draft_json ? JSON.stringify(pageData.draft_json) : null,
        published_json: pageData.published_json ? JSON.stringify(pageData.published_json) : null,
        craftData: pageData.draft_json ? JSON.stringify(pageData.draft_json) : '{}',
        status: pageData.status || 'draft',
        version: pageData.version || 1,
        publishedAt: pageData.publishedAt
      };
      
      let page;
      if (existingPage) {
        // Actualizar página existente
        page = await this.page.update({
          where: { id: pageData.id },
          data
        });
        console.log(`[DatabaseService] upsertPage(${pageData.id}) - page updated`);
      } else {
        // Crear nueva página
        page = await this.page.create({
          data: {
            id: pageData.id,
            ...data
          }
        });
        console.log(`[DatabaseService] upsertPage(${pageData.id}) - page created`);
      }
      
      return page;
    } catch (error) {
      console.error(`[DatabaseService] upsertPage(${pageData.id}) - error:`, error.message);
      throw error;
    }
  }

  // Métodos legacy para compatibilidad
  async findPageBySlug(slug: string) {
    console.log(`[DatabaseService] findPageBySlug(${slug}) - legacy method, redirecting to findPageById`);
    return this.findPageById(slug);
  }

  // Métodos para facturas
  async findInvoiceByAccount(accountNumber: string): Promise<Invoice | null> {
    return this.invoice.findUnique({
      where: { accountNumber }
    });
  }

  async findAllInvoices(): Promise<Invoice[]> {
    return this.invoice.findMany();
  }
}