// Script para poblar la base de datos con páginas de ejemplo
import { createPage } from './database';
import { CanvasPage, CanvasBlock } from '../types/canvas';

// Función para crear bloques de ejemplo
const createSampleBlocks = (pageTitle: string): CanvasBlock[] => {
  return [
    {
      id: 'block-1',
      type: 'heading',
      content: pageTitle,
      position: { x: 100, y: 50 },
      size: { width: 800, height: 60 },
      style: {
        fontSize: 36,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        color: '#1e40af',
        textAlign: 'center'
      },
      visible: true,
      locked: false,
      zIndex: 1
    },
    {
      id: 'block-2',
      type: 'text',
      content: `Bienvenido a la página de ${pageTitle.toLowerCase()}. Este contenido ha sido creado usando el nuevo sistema Canvas Editor que permite una edición visual avanzada.`,
      position: { x: 100, y: 150 },
      size: { width: 800, height: 100 },
      style: {
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#374151',
        textAlign: 'left',
        padding: 20
      },
      visible: true,
      locked: false,
      zIndex: 2
    },
    {
      id: 'block-3',
      type: 'button',
      content: 'Más información',
      position: { x: 100, y: 300 },
      size: { width: 200, height: 50 },
      style: {
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#3b82f6',
        textAlign: 'center',
        borderRadius: 8,
        padding: 10
      },
      visible: true,
      locked: false,
      zIndex: 3,
      href: '#contacto',
      target: '_self'
    }
  ];
};

// Función para crear una página Canvas
const createCanvasPage = (title: string, slug: string): CanvasPage => {
  return {
    id: `canvas-${slug}`,
    title,
    slug,
    blocks: createSampleBlocks(title),
    settings: {
      width: 1200,
      height: 800,
      backgroundColor: '#ffffff'
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Páginas de ejemplo
const samplePages = [
  {
    title: 'Inicio',
    slug: 'home',
    metaDescription: 'Página principal de nuestro sitio web'
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

// Función principal para poblar la base de datos
export const seedPages = async (): Promise<void> => {
  console.log('🌱 [SeedPages] Iniciando población de páginas...');
  
  try {
    for (const pageData of samplePages) {
      console.log(`📄 [SeedPages] Creando página: ${pageData.title}`);
      
      // Crear página Canvas
      const canvasPage = createCanvasPage(pageData.title, pageData.slug);
      
      // Crear página en la base de datos
      const newPage = await createPage({
        title: pageData.title,
        slug: pageData.slug,
        content: `<h1>${pageData.title}</h1><p>Esta página está siendo migrada al nuevo sistema Canvas Editor.</p>`,
        metaDescription: pageData.metaDescription,
        published: true,
        draftJson: canvasPage,
        publishedJson: canvasPage
      });
      
      console.log(`✅ [SeedPages] Página creada: ${newPage.title} (ID: ${newPage.id})`);
    }
    
    console.log('🎉 [SeedPages] Población completada exitosamente!');
  } catch (error) {
    console.error('❌ [SeedPages] Error poblando páginas:', error);
    throw error;
  }
};

// Función para ejecutar desde la consola del navegador
(window as Window & typeof globalThis & {
  seedPages: typeof seedPages;
}).seedPages = seedPages;

export default seedPages;