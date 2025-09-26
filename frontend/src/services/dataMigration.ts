// Servicio de migración automática de datos legacy a Craft.js
import { convertToFormat, detectDataFormat } from './dataConverter';
import { BackupService } from './backupService';
import { SerializedNodes } from '@craftjs/core';

// Specific page metadata interface
interface PageMetadata {
  published?: boolean;
  layoutType?: string;
  sidebarEnabled?: boolean;
  sidebarPosition?: 'left' | 'right';
  metaDescription?: string;
  headerColor?: string;
  headerTextColor?: string;
  customCSS?: string;
  backgroundColor?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: string;
  author?: string;
}

interface PageData {
  id: number;
  title: string;
  slug: string;
  content?: string;
  draftJson?: SerializedNodes | unknown;
  publishedJson?: SerializedNodes | unknown;
  metadata?: PageMetadata;
}

interface MigrationResult {
  success: boolean;
  migrated: boolean;
  originalFormat: 'legacy' | 'craft' | 'unknown';
  data: unknown;
  error?: string;
}

/**
 * Migra automáticamente los datos de una página al formato Craft.js
 * @param pageData - Datos de la página desde la base de datos
 * @param createBackup - Si crear respaldo antes de migrar
 * @returns Resultado de la migración con datos en formato Craft.js
 */
export const migratePageData = async (pageData: PageData, createBackup: boolean = true): Promise<MigrationResult> => {
  console.log('🔄 [DataMigration] Iniciando migración para página:', pageData.slug);
  
  // Crear respaldo antes de migrar si se solicita
  if (createBackup && (pageData.draftJson || pageData.publishedJson)) {
    await BackupService.createPageBackup(pageData);
    console.log('📦 [DataMigration] Respaldo creado para página:', pageData.slug);
  }
  
  try {
    // Priorizar published_json, luego draft_json, finalmente content HTML
    let sourceData = pageData.publishedJson || pageData.draftJson;
    
    // Si no hay datos JSON, usar content HTML como fallback
    if (!sourceData && pageData.content) {
      sourceData = {
        blocks: [{
          id: 'html-content',
          type: 'html',
          content: pageData.content,
          position: { x: 0, y: 0 },
          size: { width: '100%', height: 'auto' },
          styles: {
            backgroundColor: 'transparent',
            padding: '20px',
            margin: '0'
          }
        }]
      };
      console.log('📄 [DataMigration] Usando content HTML como fuente');
    }
    
    if (!sourceData) {
      // Crear página vacía si no hay datos
      console.log('📝 [DataMigration] Creando página vacía');
      return {
        success: true,
        migrated: true,
        originalFormat: 'unknown',
        data: createEmptyCraftPage()
      };
    }
    
    // Detectar formato de los datos
    const dataFormat = detectDataFormat(sourceData);
    console.log('🔍 [DataMigration] Formato detectado:', dataFormat);
    
    if (dataFormat === 'craft') {
      // Ya está en formato Craft.js
      console.log('✅ [DataMigration] Datos ya en formato Craft.js');
      return {
        success: true,
        migrated: false,
        originalFormat: 'craft',
        data: sourceData
      };
    }
    
    if (dataFormat === 'legacy') {
      // Convertir de legacy a Craft.js
      console.log('🔄 [DataMigration] Convirtiendo de legacy a Craft.js');
      const craftData = convertToFormat(sourceData, 'craft');
      
      return {
        success: true,
        migrated: true,
        originalFormat: 'legacy',
        data: craftData
      };
    }
    
    // Formato desconocido, crear página vacía
    console.warn('⚠️ [DataMigration] Formato desconocido, creando página vacía');
    return {
      success: true,
      migrated: true,
      originalFormat: 'unknown',
      data: createEmptyCraftPage()
    };
    
  } catch (error) {
    console.error('❌ [DataMigration] Error durante migración:', error);
    return {
      success: false,
      migrated: false,
      originalFormat: 'unknown',
      data: createEmptyCraftPage(),
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Crea una página vacía en formato Craft.js
 */
const createEmptyCraftPage = () => {
  return {
    ROOT: {
      type: { resolvedName: 'ContainerComponent' },
      isCanvas: true,
      props: { className: 'min-h-screen p-8' },
      displayName: 'Container',
      custom: {},
      hidden: false,
      nodes: ['welcome-node'],
      linkedNodes: {}
    },
    'welcome-node': {
      type: { resolvedName: 'TextComponent' },
      isCanvas: false,
      props: {
        text: 'Página en construcción',
        fontSize: '24',
        textAlign: 'center',
        color: '#6B7280'
      },
      displayName: 'Text',
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
      parent: 'ROOT'
    }
  };
};

/**
 * Procesa múltiples páginas para migración
 * @param pages - Array de páginas desde la base de datos
 * @param createBackup - Si crear respaldo antes de migrar
 * @returns Array de resultados de migración
 */
export const migrateMultiplePages = async (pages: PageData[], createBackup: boolean = true): Promise<MigrationResult[]> => {
  console.log('🔄 [DataMigration] Iniciando migración masiva de', pages.length, 'páginas');
  
  // Crear respaldo en lote antes de migrar
  if (createBackup) {
    await BackupService.createBulkBackup(pages);
    console.log('📦 [DataMigration] Respaldo masivo creado para', pages.length, 'páginas');
  }
  
  const results = await Promise.all(pages.map(page => migratePageData(page, false))); // No crear respaldo individual en migración en lote
  
  const stats = {
    total: results.length,
    successful: results.filter(r => r.success).length,
    migrated: results.filter(r => r.migrated).length,
    errors: results.filter(r => !r.success).length
  };
  
  console.log('📊 [DataMigration] Estadísticas de migración:', stats);
  
  return results;
};

/**
 * Verifica si una página necesita migración
 * @param pageData - Datos de la página
 * @returns true si necesita migración
 */
export const needsMigration = (pageData: PageData): boolean => {
  const sourceData = pageData.publishedJson || pageData.draftJson;
  
  if (!sourceData) {
    return true; // Necesita migración si no hay datos JSON
  }
  
  const format = detectDataFormat(sourceData);
  return format !== 'craft';
};

/**
 * Crea un respaldo de los datos originales antes de la migración
 * @param pageData - Datos originales de la página
 * @returns Objeto de respaldo
 */
export const createBackup = (pageData: PageData) => {
  return {
    timestamp: new Date().toISOString(),
    pageId: pageData.id,
    slug: pageData.slug,
    originalData: {
      content: pageData.content,
      draftJson: pageData.draftJson,
      publishedJson: pageData.publishedJson
    },
    migrationVersion: '1.0.0'
  };
};

export default {
  migratePageData,
  migrateMultiplePages,
  needsMigration,
  createBackup
};