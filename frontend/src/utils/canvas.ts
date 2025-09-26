import { CanvasBlock } from '../types/canvas';

// Utilidades para generar IDs únicos
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Crear un nuevo bloque con valores por defecto
export const createBlock = (type: CanvasBlock['type'], overrides: Partial<CanvasBlock> = {}): CanvasBlock => {
  const baseBlock: CanvasBlock = {
    id: generateId(),
    type,
    content: '',
    style: {
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      backgroundColor: 'transparent',
      textAlign: 'left',
      padding: 10,
      borderRadius: 0,
      opacity: 1,
      rotation: 0,
      zIndex: 1,
    },
    position: { x: 100, y: 100 },
    size: { width: 200, height: 50 },
    locked: false,
    visible: true,
    zIndex: 1,
    ...overrides,
  };

  // Ajustes específicos por tipo
  switch (type) {
    case 'text':
      baseBlock.content = 'Texto de ejemplo';
      baseBlock.size = { width: 200, height: 50 };
      break;
    case 'heading':
      baseBlock.content = 'Título';
      baseBlock.style.fontSize = 24;
      baseBlock.style.fontWeight = 'bold';
      baseBlock.size = { width: 300, height: 60 };
      break;
    case 'button':
      baseBlock.content = 'Botón';
      baseBlock.style.backgroundColor = '#007bff';
      baseBlock.style.color = '#ffffff';
      baseBlock.style.textAlign = 'center';
      baseBlock.style.borderRadius = 5;
      baseBlock.size = { width: 120, height: 40 };
      baseBlock.href = '#';
      break;
    case 'image':
      baseBlock.content = '';
      baseBlock.src = 'https://via.placeholder.com/300x200';
      baseBlock.alt = 'Imagen de ejemplo';
      baseBlock.size = { width: 300, height: 200 };
      break;
    default:
      break;
  }

  return baseBlock;
};

// Duplicar un bloque
export const duplicateBlock = (block: CanvasBlock): CanvasBlock => {
  return {
    ...block,
    id: generateId(),
    position: {
      x: block.position.x + 20,
      y: block.position.y + 20,
    },
  };
};

// Validar que un bloque tenga la estructura correcta
export const validateBlock = (block: unknown): block is CanvasBlock => {
  return (
    typeof block === 'object' &&
    typeof block.id === 'string' &&
    typeof block.type === 'string' &&
    typeof block.style === 'object' &&
    typeof block.position === 'object' &&
    typeof block.size === 'object'
  );
};