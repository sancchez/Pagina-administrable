import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PagesService } from './pages.service';
import { IsString, IsOptional, IsObject } from 'class-validator';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';

class UpdatePageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsObject()
  content?: any;

  @IsOptional()
  @IsObject()
  draft_json?: any;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  published?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}

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
      const result = await this.pagesService.publishPage(id, req.user.userId);
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
      const result = await this.pagesService.create(createPageDto, req.user.userId);
      console.log('[API] POST /api/admin/pages - success', { id: result.id });
      return result;
    } catch (error) {
      console.error('[API] POST /api/admin/pages - error:', error.message);
      throw error;
    }
  }

  // DELETE /api/admin/pages/:id
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/pages/:id')
  async deletePage(@Param('id') id: string, @Req() req: any) {
    console.log(`[API] DELETE /api/admin/pages/${id} - deleting page`);
    try {
      const result = await this.pagesService.delete(id, req.user.userId);
      console.log(`[API] DELETE /api/admin/pages/${id} - success`);
      return result;
    } catch (error) {
      console.error(`[API] DELETE /api/admin/pages/${id} - error:`, error.message);
      throw error;
    }
  }
}