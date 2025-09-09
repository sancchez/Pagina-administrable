import { CanvasBlock, CanvasPage } from '../types/canvas';

// Función para convertir páginas públicas existentes a bloques de canvas
export function convertPublicPageToCanvas(pageId: string): CanvasPage {
  console.log('🔄 [PageToCanvas] Converting public page to canvas:', pageId);
  
  let blocks: CanvasBlock[] = [];
  
  switch (pageId) {
    case 'home':
    case 'inicio':
    case 'home-test':
      blocks = convertHomePageToBlocks();
      break;
    case 'quienes-somos':
      blocks = convertQuienesSomosToBlocks();
      break;
    case 'contacto':
      blocks = convertContactoToBlocks();
      break;
    case 'informacion-esal':
      blocks = convertInformacionESALToBlocks();
      break;
    case 'operacion-gestion':
      blocks = convertOperacionGestionToBlocks();
      break;
    case 'normatividad':
      blocks = convertNormatividadToBlocks();
      break;
    default:
      console.warn('⚠️ [PageToCanvas] Unknown page:', pageId);
      blocks = createDefaultBlocks();
  }
  
  const canvasPage: CanvasPage = {
    id: pageId,
    title: getPageTitle(pageId),
    slug: pageId,
    blocks,
    settings: {
      width: 1200,
      height: 800,
      backgroundColor: '#ffffff'
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.log('✅ [PageToCanvas] Converted page to canvas:', {
    pageId,
    blocksCount: blocks.length,
    blocks: blocks.map(b => ({ id: b.id, type: b.type, content: b.content?.substring(0, 30) }))
  });
  
  return canvasPage;
}

function convertHomePageToBlocks(): CanvasBlock[] {
  return [
    // Hero Section - Título principal
    {
      id: 'hero-title-1',
      type: 'heading',
      content: 'Agua Pura para',
      position: { x: 100, y: 80 },
      size: { width: 600, height: 80 },
      style: {
        fontSize: 48,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: 'transparent',
        textAlign: 'center'
      },
      visible: true,
      locked: false,
      zIndex: 2
    },
    {
      id: 'hero-title-2',
      type: 'heading',
      content: 'Tu Comunidad',
      position: { x: 100, y: 160 },
      size: { width: 600, height: 80 },
      style: {
        fontSize: 48,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#bfdbfe',
        backgroundColor: 'transparent',
        textAlign: 'center'
      },
      visible: true,
      locked: false,
      zIndex: 2
    },
    // Hero Section - Subtítulo
    {
      id: 'hero-subtitle',
      type: 'text',
      content: 'Más de 25 años garantizando el suministro de agua potable de la más alta calidad para nuestra comunidad, con tecnología de vanguardia y un compromiso inquebrantable con la excelencia.',
      position: { x: 150, y: 260 },
      size: { width: 500, height: 100 },
      style: {
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        color: '#bfdbfe',
        backgroundColor: 'transparent',
        textAlign: 'center'
      },
      visible: true,
      locked: false,
      zIndex: 2
    },
    // Hero Background
    {
      id: 'hero-background',
      type: 'background',
      content: '',
      position: { x: 0, y: 0 },
      size: { width: 800, height: 400 },
      style: {
        backgroundColor: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #10b981 100%)',
        borderRadius: 0
      },
      visible: true,
      locked: false,
      zIndex: 1
    },
    // Stats Cards Section
    {
      id: 'stats-title',
      type: 'heading',
      content: 'Nuestros Números Hablan',
      position: { x: 100, y: 450 },
      size: { width: 600, height: 60 },
      style: {
        fontSize: 32,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#1f2937',
        backgroundColor: 'transparent',
        textAlign: 'center'
      },
      visible: true,
      locked: false,
      zIndex: 2
    },
    // Stat Card 1
    {
      id: 'stat-card-1',
      type: 'card',
      content: 'Servicio 24/7\n365 días\nDisponibilidad continua',
      position: { x: 50, y: 530 },
      size: { width: 180, height: 120 },
      style: {
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        color: '#ffffff',
        backgroundColor: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        textAlign: 'center',
        borderRadius: 12,
        padding: 16
      },
      visible: true,
      locked: false,
      zIndex: 2
    },
    // Stat Card 2
    {
      id: 'stat-card-2',
      type: 'card',
      content: 'Calidad Certificada\n99.8%\nAgua potable garantizada',
      position: { x: 250, y: 530 },
      size: { width: 180, height: 120 },
      style: {
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        color: '#ffffff',
        backgroundColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        textAlign: 'center',
        borderRadius: 12,
        padding: 16
      },
      visible: true,
      locked: false,
      zIndex: 2
    },
    // Stat Card 3
    {
      id: 'stat-card-3',
      type: 'card',
      content: 'Usuarios Conectados\n15,000+\nFamilias beneficiadas',
      position: { x: 450, y: 530 },
      size: { width: 180, height: 120 },
      style: {
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        color: '#ffffff',
        backgroundColor: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        textAlign: 'center',
        borderRadius: 12,
        padding: 16
      },
      visible: true,
      locked: false,
      zIndex: 2
    }
  ];
}

function convertQuienesSomosToBlocks(): CanvasBlock[] {
  return [
    {
      id: 'quienes-somos-title',
      type: 'heading',
      content: 'Quiénes Somos',
      position: { x: 100, y: 50 },
      size: { width: 600, height: 80 },
      style: {
        fontSize: 42,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#1f2937',
        backgroundColor: 'transparent',
        textAlign: 'center'
      },
      visible: true,
      locked: false,
      zIndex: 1
    },
    {
      id: 'quienes-somos-content',
      type: 'text',
      content: 'Somos una empresa de servicios públicos comprometida con el bienestar de nuestra comunidad. Con más de 25 años de experiencia, nos dedicamos a garantizar el suministro de agua potable de la más alta calidad.',
      position: { x: 100, y: 150 },
      size: { width: 600, height: 120 },
      style: {
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        color: '#4b5563',
        backgroundColor: 'transparent',
        textAlign: 'left'
      },
      visible: true,
      locked: false,
      zIndex: 1
    }
  ];
}

function convertContactoToBlocks(): CanvasBlock[] {
  return [
    {
      id: 'contacto-title',
      type: 'heading',
      content: 'Contacto',
      position: { x: 100, y: 50 },
      size: { width: 600, height: 80 },
      style: {
        fontSize: 42,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#1f2937',
        backgroundColor: 'transparent',
        textAlign: 'center'
      },
      visible: true,
      locked: false,
      zIndex: 1
    },
    {
      id: 'contacto-info',
      type: 'text',
      content: 'Estamos aquí para atenderte. Contáctanos a través de nuestros diferentes canales de comunicación.',
      position: { x: 100, y: 150 },
      size: { width: 600, height: 80 },
      style: {
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        color: '#4b5563',
        backgroundColor: 'transparent',
        textAlign: 'center'
      },
      visible: true,
      locked: false,
      zIndex: 1
    }
  ];
}

function convertInformacionESALToBlocks(): CanvasBlock[] {
  return [
    {
      id: 'esal-title',
      type: 'heading',
      content: 'Información ESAL',
      position: { x: 100, y: 50 },
      size: { width: 600, height: 80 },
      style: {
        fontSize: 42,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#1f2937',
        backgroundColor: 'transparent',
        textAlign: 'center'
      },
      visible: true,
      locked: false,
      zIndex: 1
    },
    {
      id: 'esal-content',
      type: 'text',
      content: 'Como Entidad Sin Ánimo de Lucro (ESAL), estamos comprometidos con la transparencia y el servicio a la comunidad.',
      position: { x: 100, y: 150 },
      size: { width: 600, height: 100 },
      style: {
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        color: '#4b5563',
        backgroundColor: 'transparent',
        textAlign: 'left'
      },
      visible: true,
      locked: false,
      zIndex: 1
    }
  ];
}

function convertOperacionGestionToBlocks(): CanvasBlock[] {
  return [
    {
      id: 'operacion-title',
      type: 'heading',
      content: 'Operación y Gestión',
      position: { x: 100, y: 50 },
      size: { width: 600, height: 80 },
      style: {
        fontSize: 42,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#1f2937',
        backgroundColor: 'transparent',
        textAlign: 'center'
      },
      visible: true,
      locked: false,
      zIndex: 1
    },
    {
      id: 'operacion-content',
      type: 'text',
      content: 'Nuestros procesos operativos están diseñados para garantizar la máxima eficiencia y calidad en el servicio.',
      position: { x: 100, y: 150 },
      size: { width: 600, height: 100 },
      style: {
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        color: '#4b5563',
        backgroundColor: 'transparent',
        textAlign: 'left'
      },
      visible: true,
      locked: false,
      zIndex: 1
    }
  ];
}

function convertNormatividadToBlocks(): CanvasBlock[] {
  return [
    {
      id: 'normatividad-title',
      type: 'heading',
      content: 'Normatividad',
      position: { x: 100, y: 50 },
      size: { width: 600, height: 80 },
      style: {
        fontSize: 42,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#1f2937',
        backgroundColor: 'transparent',
        textAlign: 'center'
      },
      visible: true,
      locked: false,
      zIndex: 1
    },
    {
      id: 'normatividad-content',
      type: 'text',
      content: 'Marco normativo, leyes y regulaciones del sector de acueducto y alcantarillado que rigen nuestras operaciones.',
      position: { x: 100, y: 150 },
      size: { width: 600, height: 100 },
      style: {
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        color: '#4b5563',
        backgroundColor: 'transparent',
        textAlign: 'left'
      },
      visible: true,
      locked: false,
      zIndex: 1
    }
  ];
}

function createDefaultBlocks(): CanvasBlock[] {
  return [
    {
      id: 'default-title',
      type: 'heading',
      content: 'Página en Construcción',
      position: { x: 100, y: 100 },
      size: { width: 600, height: 80 },
      style: {
        fontSize: 32,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#1f2937',
        backgroundColor: 'transparent',
        textAlign: 'center'
      },
      visible: true,
      locked: false,
      zIndex: 1
    }
  ];
}

function getPageTitle(pageId: string): string {
  const titles: Record<string, string> = {
    'home': 'Inicio',
    'inicio': 'Inicio',
    'home-test': 'Inicio - Prueba Editor',
    'quienes-somos': 'Quiénes Somos',
    'contacto': 'Contacto',
    'informacion-esal': 'Información ESAL',
    'operacion-gestion': 'Operación y Gestión',
    'normatividad': 'Normatividad'
  };
  
  return titles[pageId] || 'Página';
}