import { CanvasPage, CanvasBlock, CanvasPosition, CanvasSize, CanvasStyle, MigrationResult } from '../types/canvas';
import { htmlToTipTapJSON } from './htmlToJsonMigrator';

// Migrar página del formato actual al formato Canvas
export function migrateToCanvasFormat(pageData: any): MigrationResult {
  try {
    const canvasPage: CanvasPage = {
      id: pageData.id?.toString() || 'page-1',
      title: pageData.title || 'Página sin título',
      slug: pageData.slug || 'untitled',
      blocks: [],
      settings: {
        width: 1200,
        height: 800,
        backgroundColor: '#ffffff'
      },
      version: 1,
      createdAt: pageData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Si existe draftJson con bloques, migrarlos
    if (pageData.draftJson?.blocks) {
      canvasPage.blocks = migrateBlocks(pageData.draftJson.blocks);
    }
    // Si no hay draftJson pero sí content HTML, convertirlo
    else if (pageData.content) {
      canvasPage.blocks = migrateFromHTML(pageData.content);
    }
    
    const result = {
      success: true,
      page: canvasPage
    };

    return result;
  } catch (error) {
    const errorResult = {
      success: false,
      errors: [`Error migrando página: ${error}`]
    };
    
    return errorResult;
  }
}

// Migrar bloques existentes al formato Canvas
function migrateBlocks(blocks: any[]): CanvasBlock[] {
  const canvasBlocks: CanvasBlock[] = [];
  let yOffset = 50;

  blocks.forEach((block, index) => {
    const canvasBlock = migrateBlock(block, index, yOffset);
    if (canvasBlock) {
      canvasBlocks.push(canvasBlock);
      yOffset += canvasBlock.size.height + 20; // Espaciado entre bloques
    }
  });

  return canvasBlocks;
}

// Migrar un bloque individual
function migrateBlock(block: any, index: number, yOffset: number): CanvasBlock | null {
  const baseId = block.id || `migrated-block-${index}`;
  
  // Determinar tipo de bloque
  let type: CanvasBlock['type'] = 'text';
  let content = '';
  let size: CanvasSize = { width: 400, height: 60 };
  
  switch (block.type) {
    case 'RichText':
      type = 'text';
      content = extractTextContent(block.props?.content);
      size = { width: 600, height: calculateTextHeight(content) };
      break;
      
    case 'Heading':
      type = 'heading';
      content = extractTextContent(block.props?.content);
      size = { width: 500, height: 80 };
      break;
      
    case 'Image':
      type = 'image';
      size = { width: 300, height: 200 };
      break;
      
    case 'Video':
      type = 'video';
      size = { width: 400, height: 300 };
      break;
      
    case 'Button':
      type = 'button';
      content = block.props?.text || 'Botón';
      size = { width: 150, height: 40 };
      break;
      
    default:
      type = 'text';
      content = block.content || 'Contenido';
  }

  // Extraer estilos existentes
  const style: CanvasStyle = {
    fontSize: 16,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    color: '#333333',
    textAlign: 'left',
    ...extractStyles(block.styles)
  };

  // Ajustar estilos según el tipo
  if (type === 'heading') {
    style.fontSize = 32;
    style.fontWeight = 'bold';
  }

  const canvasBlock: CanvasBlock = {
    id: baseId,
    type,
    content,
    style,
    position: { x: 50, y: yOffset },
    size,
    visible: true,
    locked: false
  };

  // Agregar propiedades específicas según el tipo
  if (type === 'image' && block.props?.src) {
    canvasBlock.src = block.props.src;
    canvasBlock.alt = block.props.alt || '';
  }
  
  if (type === 'video' && block.props?.url) {
    canvasBlock.src = block.props.url;
  }
  
  if (type === 'button' && block.props?.href) {
    canvasBlock.href = block.props.href;
  }

  return canvasBlock;
}

// Migrar desde HTML puro
function migrateFromHTML(htmlContent: string): CanvasBlock[] {
  const blocks: CanvasBlock[] = [];
  let yOffset = 50;

  // Parsear HTML básico y crear bloques
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html');
  const elements = doc.body.firstChild?.childNodes || [];

  elements.forEach((element, index) => {
    if (element.nodeType === Node.ELEMENT_NODE) {
      const htmlElement = element as HTMLElement;
      const block = createBlockFromHTMLElement(htmlElement, index, yOffset);
      if (block) {
        blocks.push(block);
        yOffset += block.size.height + 20;
      }
    }
  });

  return blocks;
}

// Crear bloque desde elemento HTML
function createBlockFromHTMLElement(element: HTMLElement, index: number, yOffset: number): CanvasBlock | null {
  const tagName = element.tagName.toLowerCase();
  let type: CanvasBlock['type'] = 'text';
  let size: CanvasSize = { width: 600, height: 60 };
  
  switch (tagName) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      type = 'heading';
      size = { width: 700, height: 80 };
      break;
    case 'img':
      type = 'image';
      size = { width: 300, height: 200 };
      break;
    case 'video':
    case 'iframe':
      type = 'video';
      size = { width: 400, height: 300 };
      break;
    case 'button':
    case 'a':
      if (element.textContent && element.textContent.length < 50) {
        type = 'button';
        size = { width: 150, height: 40 };
      }
      break;
  }

  const style: CanvasStyle = {
    fontSize: type === 'heading' ? 32 : 16,
    fontFamily: 'Arial, sans-serif',
    fontWeight: type === 'heading' ? 'bold' : 'normal',
    color: '#333333',
    textAlign: 'left'
  };

  const block: CanvasBlock = {
    id: `html-block-${index}`,
    type,
    content: element.textContent || '',
    style,
    position: { x: 50, y: yOffset },
    size,
    visible: true,
    locked: false
  };

  // Propiedades específicas
  if (type === 'image') {
    block.src = element.getAttribute('src') || '';
    block.alt = element.getAttribute('alt') || '';
  }
  
  if (type === 'video' && element.getAttribute('src')) {
    block.src = element.getAttribute('src') || '';
  }
  
  if (type === 'button' && element.getAttribute('href')) {
    block.href = element.getAttribute('href') || '';
  }

  return block;
}

// Extraer contenido de texto de diferentes formatos
function extractTextContent(content: any): string {
  if (typeof content === 'string') {
    return content;
  }
  
  if (content?.html) {
    // Remover tags HTML para obtener solo el texto
    return content.html.replace(/<[^>]*>/g, '');
  }
  
  if (content?.text) {
    return content.text;
  }
  
  if (content?.type === 'text') {
    return content.text || '';
  }
  
  return '';
}

// Calcular altura aproximada del texto
function calculateTextHeight(text: string, fontSize: number = 16): number {
  const lines = Math.ceil(text.length / 50); // Aproximadamente 50 caracteres por línea
  const lineHeight = fontSize * 1.4;
  return Math.max(60, lines * lineHeight + 20); // Mínimo 60px, más padding
}

// Extraer estilos existentes
function extractStyles(styles: any): Partial<CanvasStyle> {
  if (!styles) return {};
  
  const canvasStyle: Partial<CanvasStyle> = {};
  
  if (styles.fontSize) canvasStyle.fontSize = parseInt(styles.fontSize);
  if (styles.fontFamily) canvasStyle.fontFamily = styles.fontFamily;
  if (styles.fontWeight) canvasStyle.fontWeight = styles.fontWeight;
  if (styles.color) canvasStyle.color = styles.color;
  if (styles.backgroundColor) canvasStyle.backgroundColor = styles.backgroundColor;
  if (styles.textAlign) canvasStyle.textAlign = styles.textAlign;
  if (styles.padding) canvasStyle.padding = parseInt(styles.padding);
  if (styles.margin) canvasStyle.margin = parseInt(styles.margin);
  if (styles.borderRadius) canvasStyle.borderRadius = parseInt(styles.borderRadius);
  if (styles.border) canvasStyle.border = styles.border;
  
  return canvasStyle;
}

// Convertir página Canvas de vuelta a formato público
export function convertCanvasToPublicHTML(page: CanvasPage): string {
  let html = '';
  
  // Ordenar bloques por posición Y para mantener el orden visual
  const sortedBlocks = [...page.blocks].sort((a, b) => a.position.y - b.position.y);
  
  sortedBlocks.forEach(block => {
    if (!block.visible) return;
    
    const styles = generateCSSStyles(block);
    
    switch (block.type) {
      case 'text':
        html += `<p style="${styles}">${block.content || ''}</p>`;
        break;
      case 'heading':
        html += `<h2 style="${styles}">${block.content || ''}</h2>`;
        break;
      case 'image':
        html += `<img src="${block.src || ''}" alt="${block.alt || ''}" style="${styles}" />`;
        break;
      case 'video':
        html += `<iframe src="${block.src || ''}" style="${styles}" frameborder="0" allowfullscreen></iframe>`;
        break;
      case 'button':
        const href = block.href || '#';
        html += `<a href="${href}" style="${styles}">${block.content || 'Botón'}</a>`;
        break;
    }
  });
  
  return html;
}

// Generar estilos CSS desde el objeto de estilo Canvas
function generateCSSStyles(block: CanvasBlock): string {
  const styles: string[] = [];
  const { style, position, size } = block;
  
  // Posición absoluta para mantener el layout del canvas
  styles.push(`position: absolute`);
  styles.push(`left: ${position.x}px`);
  styles.push(`top: ${position.y}px`);
  styles.push(`width: ${size.width}px`);
  styles.push(`height: ${size.height}px`);
  
  // Estilos de texto y apariencia
  if (style.fontSize) styles.push(`font-size: ${style.fontSize}px`);
  if (style.fontFamily) styles.push(`font-family: ${style.fontFamily}`);
  if (style.fontWeight) styles.push(`font-weight: ${style.fontWeight}`);
  if (style.color) styles.push(`color: ${style.color}`);
  if (style.backgroundColor) styles.push(`background-color: ${style.backgroundColor}`);
  if (style.textAlign) styles.push(`text-align: ${style.textAlign}`);
  if (style.padding) styles.push(`padding: ${style.padding}px`);
  if (style.margin) styles.push(`margin: ${style.margin}px`);
  if (style.borderRadius) styles.push(`border-radius: ${style.borderRadius}px`);
  if (style.border) styles.push(`border: ${style.border}`);
  if (style.opacity !== undefined) styles.push(`opacity: ${style.opacity}`);
  if (style.rotation) styles.push(`transform: rotate(${style.rotation}deg)`);
  if (style.zIndex !== undefined) styles.push(`z-index: ${style.zIndex}`);
  
  return styles.join('; ');
}