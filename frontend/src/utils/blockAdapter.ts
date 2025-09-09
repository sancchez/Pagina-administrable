import { BlockData as MigratorBlockData } from '../types/blocks';
import { BlockData as EditorBlockData } from '../components/editor/VisualEditor';

// Adapter to convert migrator blocks to editor format
export function adaptMigratorBlocksToEditor(migratorBlocks: MigratorBlockData[]): EditorBlockData[] {
  return migratorBlocks.map((block, index) => {
    const baseBlock: EditorBlockData = {
      id: block.id || `block_${Date.now()}_${index}`,
      type: mapBlockType(block.type),
      content: extractContent(block),
      styles: block.styles || {},
      position: { x: 0, y: index * 100 },
      size: { width: 300, height: 100 }
    };

    return baseBlock;
  });
}

// Map migrator block types to editor block types
function mapBlockType(migratorType: string): EditorBlockData['type'] {
  switch (migratorType.toLowerCase()) {
    case 'richtext':
    case 'text':
      return 'text';
    case 'heading':
      return 'heading';
    case 'image':
      return 'image';
    case 'button':
      return 'button';
    case 'container':
      return 'container';
    case 'divider':
      return 'divider';
    case 'list':
      return 'list';
    default:
      return 'text';
  }
}

// Extract content from migrator block
function extractContent(block: MigratorBlockData): string {
  if (block.props) {
    // Handle RichText blocks
    if (block.props.content) {
      if (typeof block.props.content === 'string') {
        return block.props.content;
      }
      if (block.props.content.html) {
        return block.props.content.html;
      }
      // Handle TipTap JSON format
      if (block.props.content.type) {
        // Special case: if it's just a text node, return the text directly
        if (block.props.content.type === 'text' && block.props.content.text) {
          return `<p>${block.props.content.text}</p>`;
        }
        return convertTipTapToHTML(block.props.content);
      }
    }
    
    // Handle Image blocks
    if (block.props.src) {
      return `<img src="${block.props.src}" alt="${block.props.alt || ''}" />`;
    }
    
    // Handle Button blocks
    if (block.props.text) {
      return block.props.text;
    }
    
    // Handle Video blocks
    if (block.props.url) {
      return `<iframe src="${block.props.url}" frameborder="0" allowfullscreen></iframe>`;
    }
  }
  
  return block.content || '';
}

// Convert TipTap JSON to HTML
function convertTipTapToHTML(content: any): string {
  if (!content) return '';
  
  if (content.type === 'doc' && content.content) {
    return content.content.map((node: any) => convertNodeToHTML(node)).join('');
  }
  
  return convertNodeToHTML(content);
}

function convertNodeToHTML(node: any): string {
  if (!node) return '';
  
  switch (node.type) {
    case 'paragraph':
      const pContent = node.content ? node.content.map((child: any) => convertNodeToHTML(child)).join('') : '';
      return `<p>${pContent}</p>`;
      
    case 'heading':
      const level = node.attrs?.level || 1;
      const hContent = node.content ? node.content.map((child: any) => convertNodeToHTML(child)).join('') : '';
      return `<h${level}>${hContent}</h${level}>`;
      
    case 'text':
      let text = node.text || '';
      if (node.marks) {
        node.marks.forEach((mark: any) => {
          switch (mark.type) {
            case 'bold':
              text = `<strong>${text}</strong>`;
              break;
            case 'italic':
              text = `<em>${text}</em>`;
              break;
            case 'underline':
              text = `<u>${text}</u>`;
              break;
          }
        });
      }
      return text;
      
    case 'bulletList':
      const listItems = node.content ? node.content.map((item: any) => convertNodeToHTML(item)).join('') : '';
      return `<ul>${listItems}</ul>`;
      
    case 'listItem':
      const itemContent = node.content ? node.content.map((child: any) => convertNodeToHTML(child)).join('') : '';
      return `<li>${itemContent}</li>`;
      
    default:
      if (node.content) {
        return node.content.map((child: any) => convertNodeToHTML(child)).join('');
      }
      return node.text || '';
  }
}

// Extract styles from migrator block
export function extractStyles(block: MigratorBlockData): EditorBlockData['styles'] {
  const styles: EditorBlockData['styles'] = {};
  
  if (block.styles) {
    // Map common styles
    if (block.styles.color) styles.color = block.styles.color;
    if (block.styles.backgroundColor) styles.backgroundColor = block.styles.backgroundColor;
    if (block.styles.fontSize) styles.fontSize = block.styles.fontSize;
    if (block.styles.fontWeight) styles.fontWeight = block.styles.fontWeight;
    if (block.styles.fontFamily) styles.fontFamily = block.styles.fontFamily;
    if (block.styles.textAlign) styles.textAlign = block.styles.textAlign as 'left' | 'center' | 'right';
    if (block.styles.padding) styles.padding = block.styles.padding;
    if (block.styles.margin) styles.margin = block.styles.margin;
    if (block.styles.borderRadius) styles.borderRadius = block.styles.borderRadius;
    if (block.styles.border) styles.border = block.styles.border;
    if (block.styles.width) styles.width = block.styles.width;
    if (block.styles.height) styles.height = block.styles.height;
  }
  
  return styles;
}