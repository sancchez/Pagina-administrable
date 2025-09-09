import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PageVersion } from '../types/database.types';

@Injectable()
export class PageVersionsService {
  constructor(private databaseService: DatabaseService) {}

  async createOriginalVersions() {
    // Obtener todas las páginas existentes
    const pages = await this.databaseService.findAllPages();
    
    const originalVersions = [];
    
    for (const page of pages) {
      // Verificar si ya existe una versión original para esta página
      const existingOriginal = await this.databaseService.pageVersion.findFirst({
        where: {
          pageId: page.id,
          isOriginal: true
        }
      });
      
      if (!existingOriginal) {
        // Crear versión original
        const originalVersion = await this.databaseService.pageVersion.create({
          data: {
            pageId: page.id,
            title: page.title,
            content: page.content,
            description: '🏠 Versión Original',
            isOriginal: true,
            isActive: false
          }
        });
        originalVersions.push(originalVersion);
      }
    }
    
    return {
      message: `Se crearon ${originalVersions.length} versiones originales`,
      versions: originalVersions
    };
  }

  async createOriginalVersion(pageId: number) {
    const page = await this.databaseService.findPageById(pageId);
    if (!page) {
      throw new NotFoundException('Página no encontrada');
    }

    // Verificar si ya existe una versión original para esta página
    const existingOriginal = await this.databaseService.pageVersion.findFirst({
      where: {
        pageId: pageId,
        isOriginal: true
      }
    });

    if (existingOriginal) {
      return {
        message: 'Ya existe una versión original para esta página',
        version: existingOriginal
      };
    }

    // Crear versión original
    const originalVersion = await this.databaseService.pageVersion.create({
      data: {
        pageId: page.id,
        title: page.title,
        content: page.content,
        description: '🏠 Versión Original',
        isOriginal: true,
        isActive: false
      }
    });

    return {
      message: 'Versión original creada exitosamente',
      version: originalVersion
    };
  }

  async createVersion(pageId: number, description?: string) {
    const page = await this.databaseService.findPageById(pageId);
    if (!page) {
      throw new NotFoundException('Página no encontrada');
    }

    return this.databaseService.pageVersion.create({
      data: {
        pageId: page.id,
        title: page.title,
        content: page.content,
        description: description || 'Versión guardada',
        isOriginal: false,
        isActive: false
      }
    });
  }

  async getVersionsByPageId(pageId: number) {
    return this.databaseService.pageVersion.findMany({
      where: { pageId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async restoreVersion(versionId: number) {
    const version = await this.databaseService.pageVersion.findUnique({
      where: { id: versionId },
      include: { page: true }
    });

    if (!version) {
      throw new NotFoundException('Versión no encontrada');
    }

    // Actualizar la página con el contenido de la versión
    const updatedPage = await this.databaseService.updatePage(version.pageId, {
      title: version.title,
      content: version.content
    });

    // Marcar todas las versiones como inactivas
    await this.databaseService.pageVersion.updateMany({
      where: { pageId: version.pageId },
      data: { isActive: false }
    });

    // Marcar esta versión como activa
    await this.databaseService.pageVersion.update({
      where: { id: versionId },
      data: { isActive: true }
    });

    return updatedPage;
  }

  async setAsOriginal(versionId: number) {
    const version = await this.databaseService.pageVersion.findUnique({
      where: { id: versionId }
    });

    if (!version) {
      throw new NotFoundException('Versión no encontrada');
    }

    // Quitar el estado original de todas las versiones de esta página
    await this.databaseService.pageVersion.updateMany({
      where: { 
        pageId: version.pageId,
        isOriginal: true 
      },
      data: { isOriginal: false }
    });

    // Marcar esta versión como original
    return this.databaseService.pageVersion.update({
      where: { id: versionId },
      data: { 
        isOriginal: true,
        description: version.description.includes('🏠') ? version.description : `🏠 ${version.description}`
      }
    });
  }

  async deleteVersion(versionId: number) {
    const version = await this.databaseService.pageVersion.findUnique({
      where: { id: versionId }
    });

    if (!version) {
      throw new NotFoundException('Versión no encontrada');
    }

    if (version.isOriginal) {
      throw new Error('No se puede eliminar la versión original');
    }

    await this.databaseService.pageVersion.delete({
      where: { id: versionId }
    });

    return { message: 'Versión eliminada exitosamente' };
  }

  async getAllVersions() {
    return this.databaseService.pageVersion.findMany({
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}