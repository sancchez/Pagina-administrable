// Convertidor de JSON para datos de páginas
import { PageData, BlockData } from '../types/blocks';
import { createRichTextBlock, createImageBlock, createHTMLFallbackBlock } from './blockUtils';

export function convertCraftJsonToPageData(craftJson: any): PageData {
  // Función básica para convertir datos de Craft.js a PageData
  return {
    title: craftJson.title || 'Página sin título',
    slug: craftJson.slug || 'pagina-sin-slug',
    blocks: craftJson.blocks || [],
    published: craftJson.published !== undefined ? craftJson.published : true,
    layoutType: craftJson.layoutType || 'default',
    sidebarEnabled: craftJson.sidebarEnabled || false,
    sidebarPosition: craftJson.sidebarPosition || 'left'
  };
}

export function convertHtmlToBlocks(html: string): BlockData[] {
  const blocks: BlockData[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Convertir elementos HTML a bloques
  const elements = doc.body.children;
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    
    if (element.tagName === 'IMG') {
      const img = element as HTMLImageElement;
      blocks.push(createImageBlock(img.src, img.alt || ''));
    } else if (element.tagName === 'P' || element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3') {
      blocks.push(createRichTextBlock(element.outerHTML));
    } else {
      blocks.push(createHTMLFallbackBlock(element.outerHTML));
    }
  }
  
  return blocks;
}

export function convertBlocksToHtml(blocks: BlockData[]): string {
  return blocks.map(block => {
    switch (block.type) {
      case 'richtext':
        return (block.props as any)?.content?.html || '';
      case 'image':
        const imageProps = block.props as any;
        return `<img src="${imageProps?.src || ''}" alt="${imageProps?.alt || ''}" />`;
      case 'html':
        return (block.props as any)?.html || '';
      default:
        return '';
    }
  }).join('');
}