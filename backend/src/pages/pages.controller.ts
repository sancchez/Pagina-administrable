import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Res } from '@nestjs/common';
import { PagesService, PageStatus } from './pages.service';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';

@Controller()
export class PagesController {
  constructor(private pagesService: PagesService) {
    console.log('[PagesController] Controller initialized');
  }

  // GET /api/pages/:id → devuelve published_json
  @Get('pages/:id')
  async getPublishedPage(@Param('id') id: string) {
    console.log(`[API] GET /api/pages/${id} - fetching published page`);
    try {
      const result = await this.pagesService.getPublishedPage(id);
      console.log(`[API] GET /api/pages/${id} - success`, { hasContent: !!result });
      return result;
    } catch (error) {
      console.error(`[API] GET /api/pages/${id} - error:`, error.message);
      throw error;
    }
  }

  // GET /api/admin/pages → lista todas las páginas
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/pages')
  async getAllPages() {
    console.log('[API] GET /api/admin/pages - fetching all pages');
    try {
      const result = await this.pagesService.findAll();
      console.log(`[API] GET /api/admin/pages - success, found ${result.length} pages`);
      return result;
    } catch (error) {
      console.error('[API] GET /api/admin/pages - error:', error.message);
      throw error;
    }
  }

  // GET /api/admin/pages/:id → devuelve draft_json y metadatos
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/pages/:id')
  async getAdminPage(@Param('id') id: string) {
    console.log(`[API] GET /api/admin/pages/${id} - fetching draft page`);
    try {
      const result = await this.pagesService.getAdminPage(id);
      console.log(`[API] GET /api/admin/pages/${id} - success`, { 
        hasContent: !!result, 
        status: result?.status 
      });
      return result;
    } catch (error) {
      console.error(`[API] GET /api/admin/pages/${id} - error:`, error.message);
      throw error;
    }
  }

  // GET /api/admin/pages/by-slug/:slug → devuelve draft_json, published_json y metadatos por slug
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/pages/by-slug/:slug')
  async getAdminPageBySlug(@Param('slug') slug: string) {
    console.log(`[API] GET /api/admin/pages/by-slug/${slug} - fetching page by slug`);
    try {
      const result = await this.pagesService.getAdminPage(slug); // id = slug en nuestro modelo
      console.log(`[API] GET /api/admin/pages/by-slug/${slug} - success`, { 
        hasContent: !!result, 
        status: result?.status,
        hasDraft: !!result?.draft_json,
        hasPublished: !!result?.published_json
      });
      return result;
    } catch (error) {
      console.error(`[API] GET /api/admin/pages/by-slug/${slug} - error:`, error.message);
      throw error;
    }
  }

  // PUT /api/admin/pages/:id → actualiza o crea página (draft_json)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('admin/pages/:id')
  async updatePage(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
    @Req() req: any
  ) {
    console.log(`[API] PUT /api/admin/pages/${id} - updating page`, {
      hasTitle: !!updatePageDto.title,
      hasDraftJson: !!updatePageDto.draft_json,
      status: updatePageDto.status
    });
    try {
      const result = await this.pagesService.updateOrCreate(id, updatePageDto, req.user.userId);
      console.log(`[API] PUT /api/admin/pages/${id} - success`, { 
        action: result.created ? 'created' : 'updated' 
      });
      return result;
    } catch (error) {
      console.error(`[API] PUT /api/admin/pages/${id} - error:`, error.message);
      throw error;
    }
  }

  // POST /api/admin/pages/:id/publish → copia draft_json a published_json
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/pages/:id/publish')
  async publishPage(@Param('id') id: string, @Req() req: any) {
    console.log(`[API] POST /api/admin/pages/${id}/publish - publishing page`);
    try {
      const result = await this.pagesService.publishPage(id);
      console.log(`[API] POST /api/admin/pages/${id}/publish - success`, {
        publishedAt: result.publishedAt
      });
      return result;
    } catch (error) {
      console.error(`[API] POST /api/admin/pages/${id}/publish - error:`, error.message);
      throw error;
    }
  }

  // POST /api/admin/pages → crear nueva página
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/pages')
  async createPage(
    @Body() createPageDto: UpdatePageDto,
    @Req() req: any
  ) {
    console.log('[API] POST /api/admin/pages - creating new page', {
      title: createPageDto.title,
      slug: createPageDto.slug
    });
    try {
      const result = await this.pagesService.updateOrCreate(createPageDto.slug, createPageDto, req.user.userId);
      console.log('[API] POST /api/admin/pages - success', { id: result.page.id });
      return result.page;
    } catch (error) {
      console.error('[API] POST /api/admin/pages - error:', error.message);
      throw error;
    }
  }

  // POST /api/admin/pages/by-slug/:slug → crear/actualizar página por slug con draft_json
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/pages/by-slug/:slug')
  async createOrUpdatePageBySlug(
    @Param('slug') slug: string,
    @Body() updatePageDto: UpdatePageDto,
    @Req() req: any
  ) {
    console.log(`[API] POST /api/admin/pages/by-slug/${slug} - creating/updating page`, {
      hasTitle: !!updatePageDto.title,
      hasDraftJson: !!updatePageDto.draft_json,
      shouldPublish: updatePageDto.status === 'PUBLISHED',
      status: updatePageDto.status
    });
    try {
      // Asegurar que el slug coincida
      const pageData = { ...updatePageDto, slug };
      const result = await this.pagesService.updateOrCreate(slug, pageData, req.user.userId);
      
      // Si se solicita publicar inmediatamente
      if (updatePageDto.status === 'PUBLISHED' && result.page.draft_json) {
        const publishedPage = await this.pagesService.publishPage(slug);
        console.log(`[API] POST /api/admin/pages/by-slug/${slug} - success and published`, { 
          action: result.created ? 'created' : 'updated',
          publishedAt: publishedPage.publishedAt
        });
        return publishedPage;
      }
      
      console.log(`[API] POST /api/admin/pages/by-slug/${slug} - success`, { 
        action: result.created ? 'created' : 'updated' 
      });
      return result.page;
    } catch (error) {
      console.error(`[API] POST /api/admin/pages/by-slug/${slug} - error:`, error.message);
      throw error;
    }
  }

  // DELETE /api/admin/pages/:id
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/pages/:id')
  async deletePage(@Param('id') id: string, @Req() req: any) {
    console.log(`[API] DELETE /api/admin/pages/${id} - deleting page`);
    try {
      const result = await this.pagesService.remove(id, req.user.userId);
      console.log(`[API] DELETE /api/admin/pages/${id} - success`);
      return result;
    } catch (error) {
      console.error(`[API] DELETE /api/admin/pages/${id} - error:`, error.message);
      throw error;
    }
  }

  // POST /api/admin/backup → crear backup del sistema
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/backup')
  async createBackup(@Req() req: any, @Res() res: Response) {
    console.log('[API] POST /api/admin/backup - creating system backup');
    try {
      const backup = await this.pagesService.createBackup('system', req.user.userId);
      console.log('[API] POST /api/admin/backup - success', {
        timestamp: backup.timestamp,
        size: backup.size
      });

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="backup-${backup.timestamp}.json"`);
      return res.send(backup.data);
    } catch (error) {
      console.error('[API] POST /api/admin/backup - error:', error.message);
      throw error;
    }
  }

  // POST /api/admin/restore → restaurar backup del sistema
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/restore')
  async restoreBackup(@Body() backupData: any, @Req() req: any) {
    console.log('[API] POST /api/admin/restore - restoring system backup');
    try {
      const result = await this.pagesService.restoreBackup(backupData, req.user.userId);
      console.log('[API] POST /api/admin/restore - success', {
        pagesRestored: result.pagesRestored,
        timestamp: result.timestamp
      });
      return result;
    } catch (error) {
      console.error('[API] POST /api/admin/restore - error:', error.message);
      throw error;
    }
  }

  // POST /api/admin/migrate-html \u2192 convierte HTML a JSON de Craft.js
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/pages/:id/revert-to-published')
  async revertToPublished(@Param('id') id: string, @Req() req: any) {
    console.log(`[API] POST /api/admin/pages/${id}/revert-to-published - reverting page to published`);
    try {
      const result = await this.pagesService.revertToPublished(id);
      console.log(`[API] POST /api/admin/pages/${id}/revert-to-published - success`, { id: result.id });
      return result;
    } catch (error) {
      console.error(`[API] POST /api/admin/pages/${id}/revert-to-published - error:`, error.message);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/migrate-html')
  async migrateHtmlToCraftJs(@Body('htmlContent') htmlContent: string, @Req() req: any) {
    console.log('[API] POST /api/admin/migrate-html - migrating HTML to Craft.js JSON');
    try {
      const result = await this.pagesService.migrateHtmlToCraftJs(htmlContent, req.user.userId);
      console.log('[API] POST /api/admin/migrate-html - success');
      return result;
    } catch (error) {
      console.error('[API] POST /api/admin/migrate-html - error:', error.message);
      throw error;
    }
  }
}