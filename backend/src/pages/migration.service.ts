import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MigrationService {
  constructor(private databaseService: DatabaseService) {}

  // Mapeo de páginas públicas existentes
  private readonly PUBLIC_PAGES = {
    'portal-usuario': {
      title: 'Portal del Usuario',
      blocks: [
        {
          id: 'hero-section',
          type: 'container',
          position: { x: 0, y: 0 },
          size: { width: 1200, height: 400 },
          style: {
            backgroundColor: '#1e40af',
            padding: '60px 20px',
            textAlign: 'center'
          },
          children: [
            {
              id: 'hero-title',
              type: 'text',
              content: 'Portal del Usuario',
              position: { x: 0, y: 0 },
              size: { width: 800, height: 80 },
              style: {
                fontSize: 48,
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: '20px'
              }
            },
            {
              id: 'hero-subtitle',
              type: 'text',
              content: 'Accede a todos los servicios en línea del acueducto',
              position: { x: 0, y: 100 },
              size: { width: 600, height: 60 },
              style: {
                fontSize: 20,
                color: '#e5e7eb',
                textAlign: 'center'
              }
            }
          ],
          visible: true
        },
        {
          id: 'services-grid',
          type: 'container',
          position: { x: 0, y: 400 },
          size: { width: 1200, height: 600 },
          style: {
            padding: '60px 20px',
            backgroundColor: '#f8fafc'
          },
          children: [
            {
              id: 'services-title',
              type: 'text',
              content: 'Servicios Disponibles',
              position: { x: 0, y: 0 },
              size: { width: 800, height: 60 },
              style: {
                fontSize: 32,
                fontWeight: 'bold',
                color: '#1f2937',
                textAlign: 'center',
                marginBottom: '40px'
              }
            },
            {
              id: 'service-card-1',
              type: 'card',
              position: { x: 50, y: 80 },
              size: { width: 350, height: 200 },
              style: {
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '30px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              },
              content: {
                title: 'Consulta de Facturas',
                description: 'Consulta y descarga tus facturas de agua',
                icon: 'FileText'
              },
              visible: true
            },
            {
              id: 'service-card-2',
              type: 'card',
              position: { x: 425, y: 80 },
              size: { width: 350, height: 200 },
              style: {
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '30px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              },
              content: {
                title: 'Pago en Línea',
                description: 'Paga tus facturas de forma segura',
                icon: 'CreditCard'
              },
              visible: true
            },
            {
              id: 'service-card-3',
              type: 'card',
              position: { x: 800, y: 80 },
              size: { width: 350, height: 200 },
              style: {
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '30px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              },
              content: {
                title: 'Solicitudes PQR',
                description: 'Presenta peticiones, quejas y reclamos',
                icon: 'MessageCircle'
              },
              visible: true
            }
          ],
          visible: true
        }
      ]
    },
    'home': {
      title: 'Inicio',
      blocks: [
        {
          id: 'welcome-section',
          type: 'container',
          position: { x: 0, y: 0 },
          size: { width: 1200, height: 500 },
          style: {
            backgroundColor: '#0ea5e9',
            padding: '80px 20px',
            textAlign: 'center'
          },
          children: [
            {
              id: 'welcome-title',
              type: 'text',
              content: 'Bienvenido al Acueducto',
              position: { x: 0, y: 0 },
              size: { width: 800, height: 80 },
              style: {
                fontSize: 52,
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center'
              }
            },
            {
              id: 'welcome-description',
              type: 'text',
              content: 'Servicios de agua potable y saneamiento para nuestra comunidad',
              position: { x: 0, y: 100 },
              size: { width: 700, height: 60 },
              style: {
                fontSize: 22,
                color: '#e0f2fe',
                textAlign: 'center'
              }
            }
          ],
          visible: true
        }
      ]
    },
    'quienes-somos': {
      title: 'Quiénes Somos',
      blocks: [
        {
          id: 'about-header',
          type: 'text',
          content: 'Quiénes Somos',
          position: { x: 0, y: 0 },
          size: { width: 800, height: 80 },
          style: {
            fontSize: 42,
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
            padding: '40px 20px'
          },
          visible: true
        },
        {
          id: 'about-content',
          type: 'text',
          content: 'Somos una empresa comprometida con el suministro de agua potable de calidad y servicios de saneamiento para nuestra comunidad.',
          position: { x: 0, y: 120 },
          size: { width: 800, height: 200 },
          style: {
            fontSize: 18,
            color: '#4b5563',
            textAlign: 'left',
            padding: '20px',
            lineHeight: '1.6'
          },
          visible: true
        }
      ]
    }
  };

  async migratePageToJson(slug: string, customData?: any): Promise<any> {
    console.log(`[MigrationService] migratePageToJson(${slug}) - starting migration`);
    
    try {
      // Obtener configuración de la página
      const pageConfig = this.PUBLIC_PAGES[slug] || customData;
      
      if (!pageConfig) {
        throw new NotFoundException(`No se encontró configuración para la página: ${slug}`);
      }

      // Crear estructura JSON de Craft.js
      const canvasPage = {
        id: slug,
        title: pageConfig.title,
        slug: slug,
        settings: {
          width: 1200,
          height: 'auto',
          backgroundColor: '#ffffff'
        },
        blocks: pageConfig.blocks || [],
        version: 1
      };

      // Verificar si la página ya existe en la base de datos
      const existingPage = await this.databaseService.findPageById(slug);
      
      if (existingPage) {
        // Actualizar página existente
        const updatedPage = await this.databaseService.updatePage(slug, {
          title: pageConfig.title,
          draft_json: JSON.stringify(canvasPage),
          published_json: JSON.stringify(canvasPage),
          status: 'PUBLISHED'
        });
        
        console.log(`[MigrationService] migratePageToJson(${slug}) - page updated`);
        return {
          success: true,
          action: 'updated',
          page: {
            ...updatedPage,
            draft_json: canvasPage,
            published_json: canvasPage
          }
        };
      } else {
        // Crear nueva página
        const newPage = await this.databaseService.createPage({
          id: slug,
          title: pageConfig.title,
          draft_json: JSON.stringify(canvasPage),
          published_json: JSON.stringify(canvasPage),
          status: 'PUBLISHED'
        });
        
        console.log(`[MigrationService] migratePageToJson(${slug}) - page created`);
        return {
          success: true,
          action: 'created',
          page: {
            ...newPage,
            draft_json: canvasPage,
            published_json: canvasPage
          }
        };
      }
    } catch (error) {
      console.error(`[MigrationService] migratePageToJson(${slug}) - error:`, error.message);
      throw error;
    }
  }

  async migrateAllPublicPages(): Promise<any> {
    console.log('[MigrationService] migrateAllPublicPages - starting bulk migration');
    
    const results = [];
    const errorList = [];
    
    for (const slug of Object.keys(this.PUBLIC_PAGES)) {
      try {
        const result = await this.migratePageToJson(slug);
        results.push({ slug, ...result });
      } catch (error) {
        errorList.push({ slug, error: error.message });
      }
    }
    
    console.log(`[MigrationService] migrateAllPublicPages - completed: ${results.length} success, ${errorList.length} errors`);
    
    return {
      success: true,
      migrated: results.length,
      errorsCount: errorList.length,
      results,
      errors: errorList
    };
  }
}