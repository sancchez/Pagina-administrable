import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { PagesService } from './pages.service';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Page } from '../types/database.types';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';

class CreatePageDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;
}

class UpdatePageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

@Controller()
export class PagesController {
  constructor(private pagesService: PagesService) {}

  // Ruta pública para obtener página por slug
  @Get('pages/:slug')
  async getPage(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  // Rutas administrativas protegidas
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/pages')
  async getAllPages() {
    return this.pagesService.findAll();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/pages/:id')
  async getPageById(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.findById(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/pages')
  async createPage(@Body() createPageDto: CreatePageDto, @Req() req: any) {
    return this.pagesService.create(createPageDto, req.user.userId, req);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('admin/pages/:id')
  async updatePage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePageDto: UpdatePageDto,
    @Req() req: any
  ) {
    return this.pagesService.update(id, updatePageDto, req.user.userId, req);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/pages/:id')
  async deletePage(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any
  ) {
    return this.pagesService.delete(id, req.user.userId, req);
  }
}