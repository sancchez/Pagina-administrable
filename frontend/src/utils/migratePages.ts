// Script de migración para crear páginas con contenido Canvas completo
import { createPage } from './database';
import { CanvasPage, CanvasBlock } from '../types/canvas';

// Función para crear bloques Canvas más completos
const createRichCanvasBlocks = (pageTitle: string, pageSlug: string): CanvasBlock[] => {
  const blocks: CanvasBlock[] = [
    {
      id: `${pageSlug}-header`,
      type: 'heading',
      content: pageTitle,
      position: { x: 50, y: 50 },
      size: { width: 900, height: 80 },
      style: {
        fontSize: 42,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 'bold',
        color: '#1e40af',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        padding: 20,
        borderRadius: 12
      },
      visible: true,
      locked: false,
      zIndex: 10
    },
    {
      id: `${pageSlug}-intro`,
      type: 'text',
      content: `Bienvenido a ${pageTitle}. Esta página ha sido creada usando nuestro avanzado sistema Canvas Editor, que permite una experiencia de edición visual completa y moderna.`,
      position: { x: 50, y: 160 },
      size: { width: 900, height: 120 },
      style: {
        fontSize: 18,
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#374151',
        lineHeight: 1.6,
        textAlign: 'left',
        padding: 24,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      },
      visible: true,
      locked: false,
      zIndex: 9
    },
    {
      id: `${pageSlug}-features`,
      type: 'text',
      content: `<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-6 bg-blue-50 rounded-lg">
          <h3 class="text-xl font-semibold text-blue-800 mb-3">🎨 Edición Visual</h3>
          <p class="text-blue-700">Edita contenido de forma visual con nuestro editor Canvas avanzado.</p>
        </div>
        <div class="p-6 bg-green-50 rounded-lg">
          <h3 class="text-xl font-semibold text-green-800 mb-3">⚡ Rendimiento</h3>
          <p class="text-green-700">Optimizado para carga rápida y experiencia fluida.</p>
        </div>
        <div class="p-6 bg-purple-50 rounded-lg">
          <h3 class="text-xl font-semibold text-purple-800 mb-3">📱 Responsive</h3>
          <p class="text-purple-700">Diseño adaptable a todos los dispositivos.</p>
        </div>
        <div class="p-6 bg-orange-50 rounded-lg">
          <h3 class="text-xl font-semibold text-orange-800 mb-3">🔧 Personalizable</h3>
          <p class="text-orange-700">Totalmente personalizable según tus necesidades.</p>
        </div>
      </div>`,
      position: { x: 50, y: 320 },
      size: { width: 900, height: 300 },
      style: {
        fontSize: 16,
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#374151',
        padding: 0
      },
      visible: true,
      locked: false,
      zIndex: 8
    },
    {
      id: `${pageSlug}-cta`,
      type: 'button',
      content: 'Explorar más contenido',
      position: { x: 50, y: 660 },
      size: { width: 250, height: 60 },
      style: {
        fontSize: 16,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '600',
        color: '#ffffff',
        backgroundColor: '#3b82f6',
        border: 'none',
        borderRadius: 12,
        padding: 16,
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease-in-out'
      },
      visible: true,
      locked: false,
      zIndex: 7
    }
  ];

  return blocks;
};

// Función para crear una página Canvas completa
const createFullCanvasPage = (title: string, slug: string): CanvasPage => {
  const blocks = createRichCanvasBlocks(title, slug);
  
  return {
    id: `canvas-${slug}`,
    title,
    slug,
    blocks,
    settings: {
      backgroundColor: '#ffffff',
      backgroundImage: '',
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
      maxWidth: 1000,
      centerContent: true
    },
    metadata: {
      description: `Página ${title} creada con Canvas Editor`,
      keywords: [title.toLowerCase(), 'canvas', 'editor'],
      author: 'Canvas Editor System'
    }
  };
};

// Páginas a migrar
const pagesToMigrate = [
  {
    title: 'Inicio',
    slug: 'home',
    metaDescription: 'Página principal de nuestro sitio web con Canvas Editor'
  },
  {
    title: 'Quiénes Somos',
    slug: 'quienes-somos',
    metaDescription: 'Conoce más sobre nuestra organización'
  },
  {
    title: 'Información ESAL',
    slug: 'informacion-esal',
    metaDescription: 'Información sobre nuestra entidad sin ánimo de lucro'
  },
  {
    title: 'Operación y Gestión',
    slug: 'operacion-gestion',
    metaDescription: 'Detalles sobre nuestras operaciones y gestión'
  },
  {
    title: 'Normatividad',
    slug: 'normatividad',
    metaDescription: 'Marco normativo y regulaciones aplicables'
  },
  {
    title: 'Portal del Usuario',
    slug: 'portal-usuario',
    metaDescription: 'Acceso al portal de usuarios'
  },
  {
    title: 'Contacto',
    slug: 'contacto',
    metaDescription: 'Información de contacto y formulario'
  }
];

// Función principal de migración
export const migrateAllPages = async (): Promise<void> => {
  console.log('🚀 [Migration] Iniciando migración de páginas con Canvas...');
  
  try {
    for (const pageInfo of pagesToMigrate) {
      console.log(`📄 [Migration] Creando página: ${pageInfo.title}`);
      
      // Crear página Canvas
      const canvasPage = createFullCanvasPage(pageInfo.title, pageInfo.slug);
      
      // Crear página en la base de datos
      const pageData = {
        title: pageInfo.title,
        slug: pageInfo.slug,
        content: `<h1>${pageInfo.title}</h1><p>Contenido HTML de respaldo para ${pageInfo.title}</p>`,
        metaDescription: pageInfo.metaDescription,
        published: true,
        draftJson: canvasPage,
        publishedJson: canvasPage
      };
      
      try {
        const createdPage = await createPage(pageData);
        console.log(`✅ [Migration] Página creada exitosamente:`, {
          id: createdPage.id,
          title: createdPage.title,
          slug: createdPage.slug
        });
      } catch (error) {
        console.error(`❌ [Migration] Error creando página ${pageInfo.title}:`, error);
      }
    }
    
    console.log('🎉 [Migration] Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ [Migration] Error en migración:', error);
    throw error;
  }
};

// Función para limpiar páginas existentes (opcional)
export const cleanExistingPages = async (): Promise<void> => {
  console.log('🧹 [Migration] Limpiando páginas existentes...');
  // Esta función se puede implementar si es necesario
};

// Exportar para uso en consola del navegador
(window as Window & typeof globalThis & {
  migrateAllPages: typeof migrateAllPages;
  cleanExistingPages: typeof cleanExistingPages;
}).migrateAllPages = migrateAllPages;
(window as Window & typeof globalThis & {
  migrateAllPages: typeof migrateAllPages;
  cleanExistingPages: typeof cleanExistingPages;
}).cleanExistingPages = cleanExistingPages;

export default migrateAllPages;