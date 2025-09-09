// Migrador de HTML a JSON para el sistema de bloques
import { BlockData, PageData, RichTextProps, ImageProps, VideoProps, ButtonProps, ContainerProps, HTMLFallbackProps } from '../types/blocks';
import { JSONContent } from '@tiptap/core';

interface MigrationOptions {
  preserveStyles?: boolean;
  convertToTipTap?: boolean;
  groupSimilarElements?: boolean;
  extractButtons?: boolean;
  extractImages?: boolean;
  extractVideos?: boolean;
}

export function migrateHtmlToJson(html: string, options: MigrationOptions = {}): BlockData[] {
  const {
    preserveStyles = true,
    convertToTipTap = true,
    groupSimilarElements = true,
    extractButtons = true,
    extractImages = true,
    extractVideos = true
  } = options;

  const blocks: BlockData[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  
  const container = doc.querySelector('div');
  if (!container) return blocks;
  
  let blockIndex = 0;
  
  const processElement = (element: Element): BlockData | null => {
    const tagName = element.tagName.toLowerCase();
    const styles = preserveStyles ? extractStyles(element) : {};
    
    switch (tagName) {
      case 'img':
        if (extractImages) {
          return createImageBlock(element as HTMLImageElement, styles, blockIndex++);
        }
        break;
        
      case 'video':
      case 'iframe':
        if (extractVideos) {
          return createVideoBlock(element, styles, blockIndex++);
        }
        break;
        
      case 'button':
      case 'a':
        if (extractButtons && isButtonLike(element)) {
          return createButtonBlock(element, styles, blockIndex++);
        }
        // Si no es un botón, procesar como texto
        return createRichTextBlock(element, styles, blockIndex++, convertToTipTap);
        
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
      case 'p':
      case 'div':
      case 'span':
      case 'section':
      case 'article':
        if (hasTextContent(element)) {
          return createRichTextBlock(element, styles, blockIndex++, convertToTipTap);
        } else if (hasChildElements(element)) {
          return createContainerBlock(element, styles, blockIndex++);
        }
        break;
        
      case 'ul':
      case 'ol':
        return createListBlock(element, styles, blockIndex++);
        
      case 'table':
        return createTableBlock(element, styles, blockIndex++);
        
      case 'hr':
        return createDividerBlock(element, styles, blockIndex++);
        
      default:
        // Elementos no reconocidos se convierten en HTML fallback
        return createHTMLFallbackBlock(element, styles, blockIndex++);
    }
    
    return null;
  };
  
  const processNode = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const block = processElement(element);
      if (block) {
        blocks.push(block);
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        blocks.push({
          id: generateBlockId(blockIndex++),
          type: 'RichText',
          props: {
            content: convertToTipTap ? htmlToTipTapJSON(`<p>${text}</p>`) : { html: `<p>${text}</p>` }
          } as RichTextProps
        });
      }
    }
  };
  
  // Procesar todos los nodos hijos
  container.childNodes.forEach(processNode);
  
  return groupSimilarElements ? groupBlocks(blocks) : blocks;
}

// Funciones auxiliares
function generateBlockId(index: number): string {
  return `block_${Date.now()}_${index}`;
}

function extractStyles(element: Element): Record<string, any> {
  const styles: Record<string, any> = {};
  const computedStyle = window.getComputedStyle(element);
  
  // Extraer estilos importantes
  const importantStyles = [
    'color', 'backgroundColor', 'fontSize', 'fontWeight', 'fontFamily',
    'textAlign', 'padding', 'margin', 'border', 'borderRadius',
    'width', 'height', 'display', 'position', 'top', 'left', 'right', 'bottom'
  ];
  
  importantStyles.forEach(prop => {
    const value = computedStyle.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
    if (value && value !== 'initial' && value !== 'inherit') {
      styles[prop] = value;
    }
  });
  
  return styles;
}

function isButtonLike(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'button') return true;
  if (tagName === 'a' && element.getAttribute('href')) return true;
  
  // Verificar si tiene clases o estilos que sugieren que es un botón
  const className = element.className.toLowerCase();
  const buttonKeywords = ['btn', 'button', 'cta', 'action'];
  return buttonKeywords.some(keyword => className.includes(keyword));
}

function hasTextContent(element: Element): boolean {
  return Boolean(element.textContent?.trim());
}

function hasChildElements(element: Element): boolean {
  return element.children.length > 0;
}

function htmlToTipTapJSON(html: string): JSONContent {
  // Conversión básica de HTML a formato TipTap
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const convertElement = (element: Element): JSONContent => {
    const tagName = element.tagName.toLowerCase();
    
    switch (tagName) {
      case 'p':
        return {
          type: 'paragraph',
          content: Array.from(element.childNodes).map(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              return { type: 'text', text: node.textContent || '' };
            }
            return convertElement(node as Element);
          }).filter(Boolean)
        };
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return {
          type: 'heading',
          attrs: { level: parseInt(tagName.charAt(1)) },
          content: [{ type: 'text', text: element.textContent || '' }]
        };
      case 'strong':
      case 'b':
        return {
          type: 'text',
          text: element.textContent || '',
          marks: [{ type: 'bold' }]
        };
      case 'em':
      case 'i':
        return {
          type: 'text',
          text: element.textContent || '',
          marks: [{ type: 'italic' }]
        };
      default:
        return {
          type: 'text',
          text: element.textContent || ''
        };
    }
  };
  
  const body = doc.body.firstElementChild;
  if (body) {
    return convertElement(body);
  }
  
  return {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [{ type: 'text', text: html }]
    }]
  };
}

function createImageBlock(img: HTMLImageElement, styles: Record<string, any>, index: number): BlockData {
  return {
    id: generateBlockId(index),
    type: 'Image',
    props: {
      src: img.src || '',
      alt: img.alt || '',
      width: img.width || undefined,
      height: img.height || undefined
    } as ImageProps,
    styles
  };
}

function createVideoBlock(element: Element, styles: Record<string, any>, index: number): BlockData {
  const isIframe = element.tagName.toLowerCase() === 'iframe';
  const src = element.getAttribute('src') || '';
  
  return {
    id: generateBlockId(index),
    type: 'Video',
    props: {
      src,
      autoplay: element.hasAttribute('autoplay'),
      controls: element.hasAttribute('controls'),
      loop: element.hasAttribute('loop'),
      muted: element.hasAttribute('muted')
    } as VideoProps,
    styles
  };
}

function createButtonBlock(element: Element, styles: Record<string, any>, index: number): BlockData {
  const isLink = element.tagName.toLowerCase() === 'a';
  
  return {
    id: generateBlockId(index),
    type: 'Button',
    props: {
      text: element.textContent || '',
      href: isLink ? element.getAttribute('href') || undefined : undefined,
      target: isLink ? element.getAttribute('target') || undefined : undefined,
      variant: 'primary'
    } as ButtonProps,
    styles
  };
}

function createRichTextBlock(element: Element, styles: Record<string, any>, index: number, convertToTipTap: boolean): BlockData {
  return {
    id: generateBlockId(index),
    type: 'RichText',
    props: {
      content: convertToTipTap ? htmlToTipTapJSON(element.outerHTML) : { html: element.outerHTML }
    } as RichTextProps,
    styles
  };
}

function createContainerBlock(element: Element, styles: Record<string, any>, index: number): BlockData {
  return {
    id: generateBlockId(index),
    type: 'Container',
    props: {
      tag: element.tagName.toLowerCase()
    } as ContainerProps,
    styles,
    children: [] // Los hijos se procesarán por separado
  };
}

function createListBlock(element: Element, styles: Record<string, any>, index: number): BlockData {
  const items = Array.from(element.querySelectorAll('li')).map(li => li.textContent || '');
  
  return {
    id: generateBlockId(index),
    type: 'List',
    props: {
      items,
      ordered: element.tagName.toLowerCase() === 'ol'
    },
    styles
  };
}

function createTableBlock(element: Element, styles: Record<string, any>, index: number): BlockData {
  const rows = Array.from(element.querySelectorAll('tr')).map(tr => 
    Array.from(tr.querySelectorAll('td, th')).map(cell => cell.textContent || '')
  );
  
  return {
    id: generateBlockId(index),
    type: 'Table',
    props: {
      rows,
      headers: element.querySelector('thead') ? rows[0] : undefined
    },
    styles
  };
}

function createDividerBlock(element: Element, styles: Record<string, any>, index: number): BlockData {
  return {
    id: generateBlockId(index),
    type: 'Divider',
    props: {},
    styles
  };
}

function createHTMLFallbackBlock(element: Element, styles: Record<string, any>, index: number): BlockData {
  return {
    id: generateBlockId(index),
    type: 'HTMLFallback',
    props: {
      html: element.outerHTML
    } as HTMLFallbackProps,
    styles
  };
}

function groupBlocks(blocks: BlockData[]): BlockData[] {
  // Agrupar bloques similares consecutivos
  const grouped: BlockData[] = [];
  let currentGroup: BlockData[] = [];
  let currentType: string | null = null;
  
  blocks.forEach(block => {
    if (block.type === currentType && canGroupType(block.type)) {
      currentGroup.push(block);
    } else {
      if (currentGroup.length > 0) {
        grouped.push(...(currentGroup.length > 1 ? mergeBlocks(currentGroup) : currentGroup));
      }
      currentGroup = [block];
      currentType = block.type;
    }
  });
  
  if (currentGroup.length > 0) {
    grouped.push(...(currentGroup.length > 1 ? mergeBlocks(currentGroup) : currentGroup));
  }
  
  return grouped;
}

function canGroupType(type: string): boolean {
  return ['RichText'].includes(type);
}

function mergeBlocks(blocks: BlockData[]): BlockData[] {
  if (blocks.length <= 1) return blocks;
  
  const firstBlock = blocks[0];
  if (firstBlock.type === 'RichText') {
    // Combinar contenido de texto
    const combinedContent = blocks.map(block => {
      const props = block.props as RichTextProps;
      return typeof props.content === 'object' && 'html' in props.content 
        ? props.content.html 
        : props.content;
    }).join('\n');
    
    return [{
      ...firstBlock,
      props: {
        content: { html: combinedContent }
      } as RichTextProps
    }];
  }
  
  return blocks;
}

export function migratePageDataToBlocks(pageData: PageData): BlockData[] {
  if (!pageData.blocks || pageData.blocks.length === 0) return [];
  return pageData.blocks;
}

export function validateMigration(originalHtml: string, blocks: BlockData[]): boolean {
  // Validación básica para asegurar que la migración fue exitosa
  const originalLength = originalHtml.replace(/\s+/g, '').length;
  const blocksLength = blocks.reduce((acc, block) => {
    if (block.type === 'richtext') {
      const content = (block.props as any)?.content;
      return acc + (content?.text || content?.html || '').replace(/\s+/g, '').length;
    } else if (block.type === 'html') {
      const html = (block.props as any)?.html || '';
      return acc + html.replace(/\s+/g, '').length;
    }
    return acc;
  }, 0);
  
  // Permitir una diferencia del 10% debido a cambios en el formato
  return Math.abs(originalLength - blocksLength) / originalLength < 0.1;
}