import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Page } from '../types/database.types';

@Injectable()
export class PagesService {
  constructor(private databaseService: DatabaseService) {}

  async findBySlug(slug: string) {
    const page = await this.databaseService.findPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('Página no encontrada');
    }
    return page;
  }

  async findAll() {
    return this.databaseService.findAllPages();
  }

  async findById(id: number) {
    const page = await this.databaseService.findPageById(id);
    if (!page) {
      throw new NotFoundException('Página no encontrada');
    }
    return page;
  }

  async create(data: { 
    title: string; 
    slug: string; 
    content: string;
    metaDescription?: string;
  }, userId: number, req: any) {
    return this.databaseService.createPage({
      ...data,
      published: true
    });
  }

  async update(id: number, data: { 
    title?: string; 
    content?: string; 
    metaDescription?: string;
    published?: boolean;
  }, userId: number, req: any) {
    const page = await this.databaseService.updatePage(id, data);
    if (!page) {
      throw new NotFoundException('Página no encontrada');
    }
    return page;
  }

  async delete(id: number, userId: number, req: any) {
    const deleted = await this.databaseService.deletePage(id);
    if (!deleted) {
      throw new NotFoundException('Página no encontrada');
    }
    return { message: 'Página eliminada exitosamente' };
  }
}