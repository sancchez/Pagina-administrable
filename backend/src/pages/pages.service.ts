import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PagesService {
  constructor(private databaseService: DatabaseService) {
    console.log('[PagesService] Service initialized');
  }

  // GET /api/pages/:id → devuelve published_json
  async getPublishedPage(id: string) {
    console.log(`[PagesService] getPublishedPage(${id}) - fetching published content`);
    
    try {
      const page = await this.databaseService.findPageById(id);
      
      if (!page) {
        console.log(`[PagesService] getPublishedPage(${id}) - page not found, returning fallback`);
        // Retornar contenido vacío como fallback
        return {
          id,
          published_json: {
            meta: { width: 1200 },
            blocks: []
          },
          status: 'draft'
        };
      }

      let publishedContent;
      try {
        publishedContent = page.published_json ? JSON.parse(page.published_json) : null;
      } catch (parseError) {
        console.warn(`[PagesService] getPublishedPage(${id}) - invalid JSON in published_json:`, parseError.message);
        publishedContent = null;
      }

      // Si no hay contenido publicado, usar fallback
      if (!publishedContent) {
        console.log(`[PagesService] getPublishedPage(${id}) - no published content, using fallback`);
        publishedContent = {
          meta: { width: 1200 },
          blocks: []
        };
      }

      console.log(`[PagesService] getPublishedPage(${id}) - success`, {
        hasBlocks: publishedContent.blocks?.length > 0,
        blockCount: publishedContent.blocks?.length || 0
      });

      return {
        id: page.id,
        title: page.title,
        published_json: publishedContent,
        status: page.status
      };
    } catch (error) {
      console.error(`[PagesService] getPublishedPage(${id}) - error:`, error.message);
      throw error;
    }
  }

  // GET /api/admin/pages/:id → devuelve draft_json y metadatos
  async getAdminPage(id: string) {
    console.log(`[PagesService] getAdminPage(${id}) - fetching draft content`);
    
    try {
      let page = await this.databaseService.findPageById(id);
      
      // Si la página no existe, crearla automáticamente
      if (!page) {
        console.log(`[PagesService] getAdminPage(${id}) - page not found, creating automatically`);
        page = await this.databaseService.createPage({
          id,
          title: this.getDefaultTitle(id),
          draft_json: JSON.stringify({
            meta: { width: 1200 },
            blocks: []
          }),
          published_json: null,
          status: 'draft',
          version: 1
        });
        console.log(`[PagesService] getAdminPage(${id}) - page created automatically`);
      }

      let draftContent;
      try {
        draftContent = page.draft_json ? JSON.parse(page.draft_json) : null;
      } catch (parseError) {
        console.warn(`[PagesService] getAdminPage(${id}) - invalid JSON in draft_json:`, parseError.message);
        draftContent = null;
      }

      // Si no hay draft, crear uno vacío
      if (!draftContent) {
        console.log(`[PagesService] getAdminPage(${id}) - no draft content, creating empty`);
        draftContent = {
          meta: { width: 1200 },
          blocks: []
        };
      }

      console.log(`[PagesService] getAdminPage(${id}) - success`, {
        status: page.status,
        hasBlocks: draftContent.blocks?.length > 0,
        blockCount: draftContent.blocks?.length || 0,
        version: page.version
      });

      return {
        id: page.id,
        title: page.title,
        draft_json: draftContent,
        published_json: page.published_json ? JSON.parse(page.published_json) : null,
        status: page.status,
        version: page.version,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        publishedAt: page.publishedAt
      };
    } catch (error) {
      console.error(`[PagesService] getAdminPage(${id}) - error:`, error.message);
      throw error;
    }
  }

  // PUT /api/admin/pages/:id → actualiza o crea página (draft_json)
  async updateOrCreate(id: string, data: { title?: string; draft_json?: any; status?: string }, userId: number) {
    console.log(`[PagesService] updateOrCreate(${id}) - updating/creating page`, {
      hasTitle: !!data.title,
      hasDraftJson: !!data.draft_json,
      status: data.status
    });
    
    try {
      let page = await this.databaseService.findPageById(id);
      let created = false;
      
      const updateData: any = {};
      
      if (data.title) {
        updateData.title = data.title;
      }
      
      if (data.draft_json) {
        updateData.draft_json = JSON.stringify(data.draft_json);
        console.log(`[PagesService] updateOrCreate(${id}) - draft_json updated with ${data.draft_json.blocks?.length || 0} blocks`);
      }
      
      if (data.status) {
        updateData.status = data.status;
      }
      
      if (!page) {
        // Crear página nueva
        console.log(`[PagesService] updateOrCreate(${id}) - creating new page`);
        page = await this.databaseService.createPage({
          id,
          title: data.title || this.getDefaultTitle(id),
          draft_json: data.draft_json ? JSON.stringify(data.draft_json) : JSON.stringify({
            meta: { width: 1200 },
            blocks: []
          }),
          published_json: null,
          status: data.status || 'draft',
          version: 1
        });
        created = true;
        console.log(`[PagesService] updateOrCreate(${id}) - page created successfully`);
      } else {
        // Actualizar página existente
        console.log(`[PagesService] updateOrCreate(${id}) - updating existing page`);
        page = await this.databaseService.updatePage(id, updateData);
        console.log(`[PagesService] updateOrCreate(${id}) - page updated successfully`);
      }

      return {
        ...page,
        created,
        draft_json: page.draft_json ? JSON.parse(page.draft_json) : null
      };
    } catch (error) {
      console.error(`[PagesService] updateOrCreate(${id}) - error:`, error.message);
      throw error;
    }
  }

  // POST /api/admin/pages/:id/publish → copia draft_json a published_json
  async publishPage(id: string, userId: number) {
    console.log(`[PagesService] publishPage(${id}) - publishing page`);
    
    try {
      const page = await this.databaseService.findPageById(id);
      
      if (!page) {
        console.error(`[PagesService] publishPage(${id}) - page not found`);
        throw new NotFoundException('Página no encontrada');
      }

      if (!page.draft_json) {
        console.error(`[PagesService] publishPage(${id}) - no draft content to publish`);
        throw new Error('No hay contenido draft para publicar');
      }

      // Copiar draft_json a published_json
      const updatedPage = await this.databaseService.updatePage(id, {
        published_json: page.draft_json,
        status: 'published',
        publishedAt: new Date()
      });

      console.log(`[PagesService] publishPage(${id}) - page published successfully`, {
        publishedAt: updatedPage.publishedAt
      });

      return {
        ...updatedPage,
        published_json: JSON.parse(updatedPage.published_json),
        draft_json: JSON.parse(updatedPage.draft_json)
      };
    } catch (error) {
      console.error(`[PagesService] publishPage(${id}) - error:`, error.message);
      throw error;
    }
  }

  // GET /api/admin/pages → lista todas las páginas
  async findAll() {
    console.log('[PagesService] findAll - fetching all pages');
    
    try {
      const pages = await this.databaseService.findAllPages();
      console.log(`[PagesService] findAll - found ${pages.length} pages`);
      
      return pages.map(page => ({
        id: page.id,
        title: page.title,
        status: page.status,
        version: page.version,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        publishedAt: page.publishedAt,
        hasContent: !!(page.draft_json || page.published_json)
      }));
    } catch (error) {
      console.error('[PagesService] findAll - error:', error.message);
      throw error;
    }
  }

  // POST /api/admin/pages → crear nueva página
  async create(createPageDto: any, userId: number) {
    console.log('[PagesService] create - creating new page', {
      title: createPageDto.title,
      slug: createPageDto.slug
    });
    
    try {
      // Generar slug si no se proporciona
      const slug = createPageDto.slug || createPageDto.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'nueva-pagina';
      
      // Generar ID único para la nueva página
      const pageId = `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Preparar datos para la base de datos
      const pageData = {
        id: pageId,
        title: createPageDto.title || 'Nueva Página',
        slug: slug,
        metaDescription: createPageDto.metaDescription || '',
        published: createPageDto.published || false,
        draft_json: createPageDto.content ? JSON.stringify(createPageDto.content) : JSON.stringify({
          blocks: [],
          settings: {
            width: 1200,
            height: 800,
            backgroundColor: '#ffffff',
            padding: { top: 20, right: 20, bottom: 20, left: 20 },
            responsive: true,
            seo: {
              title: createPageDto.title || 'Nueva Página',
              description: createPageDto.metaDescription || '',
              keywords: []
            }
          }
        }),
        published_json: null,
        status: 'draft',
        version: 1
      };
      
      const result = await this.databaseService.createPage(pageData);
      
      console.log('[PagesService] create - page created successfully', { id: result.id });
      return result;
    } catch (error) {
      console.error('[PagesService] create - error:', error.message);
      throw error;
    }
  }

  // DELETE /api/admin/pages/:id
  async delete(id: string, userId: number) {
    console.log(`[PagesService] delete(${id}) - deleting page`);
    
    try {
      const deleted = await this.databaseService.deletePage(id);
      
      if (!deleted) {
        console.error(`[PagesService] delete(${id}) - page not found`);
        throw new NotFoundException('Página no encontrada');
      }

      console.log(`[PagesService] delete(${id}) - page deleted successfully`);
      return { message: 'Página eliminada exitosamente' };
    } catch (error) {
      console.error(`[PagesService] delete(${id}) - error:`, error.message);
      throw error;
    }
  }

  // Método auxiliar para generar títulos por defecto
  private getDefaultTitle(id: string): string {
    const titleMap: { [key: string]: string } = {
      'home': 'Inicio',
      'about': 'Acerca de',
      'contact': 'Contacto',
      'quienes-somos': 'Quiénes Somos',
      'informacion-esal': 'Información ESAL',
      'operacion-gestion': 'Operación y Gestión'
    };
    
    return titleMap[id] || id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
  }

  // Métodos legacy para compatibilidad (si se necesitan)
  async findBySlug(slug: string) {
    console.log(`[PagesService] findBySlug(${slug}) - legacy method, redirecting to getPublishedPage`);
    return this.getPublishedPage(slug);
  }

  async findById(id: string) {
    console.log(`[PagesService] findById(${id}) - legacy method, redirecting to getAdminPage`);
    return this.getAdminPage(id);
  }
}