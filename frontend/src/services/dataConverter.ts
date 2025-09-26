import { SerializedNodes, SerializedNode } from '@craftjs/core';
import { BlockStyles } from '../types/blocks';

// Specific content types for legacy blocks
type LegacyBlockContent = 
  | { text?: string; html?: string } // Text content
  | { src?: string; alt?: string; caption?: string } // Image content
  | { url?: string; title?: string; description?: string } // Link content
  | { items?: string[]; type?: 'ordered' | 'unordered' } // List content
  | { columns?: string[]; rows?: string[][] } // Table content
  | Record<string, unknown>; // Fallback for unknown content

// Tipos para el formato actual
interface LegacyBlock {
  id: string;
  type: string;
  content?: LegacyBlockContent;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  style?: BlockStyles;
  visible?: boolean;
  locked?: boolean;
  children?: LegacyBlock[];
}

interface LegacyPageData {
  id?: string;
  title?: string;
  slug?: string;
  settings?: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  blocks: LegacyBlock[];
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Specific props types for Craft.js nodes
type CraftNodeProps = 
  | { text?: string; fontSize?: string; color?: string } // Text props
  | { src?: string; alt?: string; width?: number; height?: number } // Image props
  | { title?: string; subtitle?: string; backgroundColor?: string } // Block props
  | { layout?: string; columns?: number; gap?: string } // Container props
  | Record<string, unknown>; // Fallback for unknown props

// Custom data for Craft.js nodes
interface CraftNodeCustom {
  displayName?: string;
  craftNodeId?: string;
  isSelected?: boolean;
  isDragging?: boolean;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    version?: string;
  };
}

// Tipos para Craft.js
interface CraftNode {
  type: { resolvedName: string };
  isCanvas?: boolean;
  props: CraftNodeProps;
  displayName?: string;
  custom?: CraftNodeCustom;
  parent?: string;
  nodes?: string[];
  linkedNodes?: Record<string, string>;
  hidden?: boolean;
}

/**
 * Convierte datos del formato legacy al formato Craft.js
 */
export function convertLegacyToCraft(legacyData: LegacyPageData): SerializedNodes {
  const craftData: SerializedNodes = {
    ROOT: {
      type: { resolvedName: 'ContainerComponent' },
      isCanvas: true,
      props: {
        backgroundColor: legacyData.settings?.backgroundColor || '#ffffff',
        padding: '0px',
        margin: '0px',
        minHeight: '100vh',
        width: '100%'
      },
      displayName: 'Container',
      custom: {},
      nodes: [],
      hidden: false
    }
  };

  // Convertir cada bloque legacy a nodos Craft.js
  legacyData.blocks.forEach((block, index) => {
    const nodeId = `node_${block.id || index}`;
    const craftNode = convertLegacyBlockToCraftNode(block);
    
    if (craftNode) {
      craftData[nodeId] = craftNode;
      craftData.ROOT.nodes!.push(nodeId);
    }
  });

  return craftData;
}

/**
 * Convierte un bloque legacy individual a un nodo Craft.js
 */
function convertLegacyBlockToCraftNode(block: LegacyBlock): CraftNode | null {
  switch (block.type) {
    case 'text':
    case 'TextBlock':
      return {
        type: { resolvedName: 'TextComponent' },
        props: {
          text: block.content || 'Texto',
          fontSize: block.style?.fontSize || 16,
          color: block.style?.color || '#000000',
          fontFamily: block.style?.fontFamily || 'Arial',
          fontWeight: block.style?.fontWeight || 'normal',
          textAlign: block.style?.textAlign || 'left',
          margin: '16px 0'
        },
        displayName: 'Text',
        hidden: false
      };

    case 'heading':
    case 'HeadingBlock':
      return {
        type: { resolvedName: 'TextComponent' },
        props: {
          text: block.content || 'Título',
          fontSize: block.style?.fontSize || 32,
          color: block.style?.color || '#000000',
          fontFamily: block.style?.fontFamily || 'Arial',
          fontWeight: block.style?.fontWeight || 'bold',
          textAlign: block.style?.textAlign || 'left',
          margin: '24px 0 16px 0'
        },
        displayName: 'Heading',
        hidden: false
      };

    case 'image':
    case 'ImageBlock':
      return {
        type: { resolvedName: 'ImageComponent' },
        props: {
          src: block.content?.src || '',
          alt: block.content?.alt || 'Imagen',
          width: block.size?.width || 'auto',
          height: block.size?.height || 'auto',
          borderRadius: '0px',
          margin: '16px 0'
        },
        displayName: 'Image',
        hidden: false
      };

    case 'button':
    case 'ButtonBlock':
      return {
        type: { resolvedName: 'ButtonComponent' },
        props: {
          text: block.content?.text || 'Botón',
          backgroundColor: block.style?.backgroundColor || '#3b82f6',
          textColor: block.style?.color || '#ffffff',
          padding: '12px 24px',
          borderRadius: '6px',
          fontSize: block.style?.fontSize || 16,
          fontWeight: block.style?.fontWeight || 'normal',
          href: block.content?.href || '',
          target: '_self'
        },
        displayName: 'Button',
        hidden: false
      };

    case 'hero':
    case 'HeroBlock':
      // Para bloques complejos como Hero, creamos un contenedor con múltiples elementos
      return {
        type: { resolvedName: 'ContainerComponent' },
        isCanvas: true,
        props: {
          backgroundColor: 'linear-gradient(135deg, #3b82f6, #10b981)',
          padding: '80px 20px',
          margin: '0px',
          minHeight: '500px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        },
        displayName: 'Hero Section',
        nodes: [], // Los nodos hijos se agregarían aquí
        hidden: false
      };

    default:
      console.warn(`Tipo de bloque no soportado: ${block.type}`);
      return null;
  }
}

/**
 * Convierte datos de Craft.js al formato legacy
 */
export function convertCraftToLegacy(craftData: SerializedNodes): LegacyPageData {
  const legacyData: LegacyPageData = {
    blocks: [],
    settings: {
      width: 1200,
      height: 800,
      backgroundColor: '#ffffff'
    },
    version: 1
  };

  // Obtener el nodo ROOT
  const rootNode = craftData.ROOT;
  if (!rootNode || !rootNode.nodes) {
    return legacyData;
  }

  // Extraer configuraciones del ROOT
  if (rootNode.props?.backgroundColor) {
    legacyData.settings!.backgroundColor = rootNode.props.backgroundColor;
  }

  // Convertir cada nodo hijo a bloque legacy
  rootNode.nodes.forEach((nodeId, index) => {
    const node = craftData[nodeId];
    if (node) {
      const legacyBlock = convertCraftNodeToLegacyBlock(node, nodeId, index);
      if (legacyBlock) {
        legacyData.blocks.push(legacyBlock);
      }
    }
  });

  return legacyData;
}

/**
 * Convierte un nodo Craft.js individual a un bloque legacy
 */
function convertCraftNodeToLegacyBlock(node: SerializedNode, nodeId: string, index: number): LegacyBlock | null {
  const resolvedName = node.type.resolvedName;
  
  switch (resolvedName) {
    case 'TextComponent':
      return {
        id: nodeId,
        type: node.props.fontSize > 24 ? 'heading' : 'text',
        content: node.props.text || '',
        position: { x: 0, y: index * 100 },
        size: { width: 600, height: 100 },
        style: {
          fontSize: node.props.fontSize || 16,
          color: node.props.color || '#000000',
          fontFamily: node.props.fontFamily || 'Arial',
          fontWeight: node.props.fontWeight || 'normal',
          textAlign: node.props.textAlign || 'left'
        },
        visible: true
      };

    case 'ImageComponent':
      return {
        id: nodeId,
        type: 'image',
        content: {
          src: node.props.src || '',
          alt: node.props.alt || 'Imagen'
        },
        position: { x: 0, y: index * 200 },
        size: {
          width: typeof node.props.width === 'number' ? node.props.width : 400,
          height: typeof node.props.height === 'number' ? node.props.height : 300
        },
        visible: true
      };

    case 'ButtonComponent':
      return {
        id: nodeId,
        type: 'button',
        content: {
          text: node.props.text || 'Botón',
          href: node.props.href || ''
        },
        position: { x: 0, y: index * 80 },
        size: { width: 200, height: 50 },
        style: {
          backgroundColor: node.props.backgroundColor || '#3b82f6',
          color: node.props.textColor || '#ffffff',
          fontSize: node.props.fontSize || 16,
          fontWeight: node.props.fontWeight || 'normal'
        },
        visible: true
      };

    case 'ContainerComponent':
      return {
        id: nodeId,
        type: 'container',
        content: {},
        position: { x: 0, y: index * 300 },
        size: { width: 1200, height: 300 },
        style: {
          backgroundColor: node.props.backgroundColor || 'transparent',
          padding: node.props.padding || '16px',
          margin: node.props.margin || '0px'
        },
        visible: true,
        children: [] // Los hijos se procesarían recursivamente
      };

    default:
      console.warn(`Tipo de nodo Craft.js no soportado: ${resolvedName}`);
      return null;
  }
}

/**
 * Detecta si los datos están en formato legacy o Craft.js
 */
export function detectDataFormat(data: unknown): 'legacy' | 'craft' | 'unknown' {
  if (!data || typeof data !== 'object') {
    return 'unknown';
  }

  // Formato Craft.js tiene nodo ROOT
  if (data.ROOT && typeof data.ROOT === 'object') {
    return 'craft';
  }

  // Formato legacy tiene array de blocks
  if (data.blocks && Array.isArray(data.blocks)) {
    return 'legacy';
  }

  return 'unknown';
}

/**
 * Función principal para convertir datos automáticamente
 */
export function convertToFormat(data: unknown, targetFormat: 'legacy' | 'craft'): unknown {
  const currentFormat = detectDataFormat(data);
  
  if (currentFormat === 'unknown') {
    throw new Error('Formato de datos no reconocido');
  }

  if (currentFormat === targetFormat) {
    return data; // Ya está en el formato correcto
  }

  if (currentFormat === 'legacy' && targetFormat === 'craft') {
    return convertLegacyToCraft(data as LegacyPageData);
  }

  if (currentFormat === 'craft' && targetFormat === 'legacy') {
    return convertCraftToLegacy(data as SerializedNodes);
  }

  throw new Error(`Conversión no soportada: ${currentFormat} -> ${targetFormat}`);
}