// Utilidades para crear y manejar bloques
import { BlockData, RichTextProps, ImageProps, HTMLFallbackProps } from '../types/blocks';

export function createRichTextBlock(content: any, id?: string): BlockData {
  return {
    id: id || generateBlockId(),
    type: 'richtext',
    props: {
      content: content
    } as RichTextProps
  };
}

export function createImageBlock(src: string, alt: string, id?: string): BlockData {
  return {
    id: id || generateBlockId(),
    type: 'image',
    props: {
      src,
      alt
    } as ImageProps
  };
}

export function createHTMLFallbackBlock(html: string, id?: string): BlockData {
  return {
    id: id || generateBlockId(),
    type: 'html',
    props: {
      html
    } as HTMLFallbackProps
  };
}

function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}