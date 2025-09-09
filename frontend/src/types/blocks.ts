// Tipos para el nuevo sistema de bloques JSON con TipTap y Craft.js
import { JSONContent } from '@tiptap/core';

// Datos de página actualizados para JSON
export interface PageData {
  id?: number;
  title: string;
  slug: string;
  // Nuevos campos JSON
  draftJson?: BlockData[];
  publishedJson?: BlockData[];
  // Campo legacy para migración
  content?: string;
  published: boolean;
  layoutType: string;
  sidebarEnabled?: boolean;
  sidebarPosition?: 'left' | 'right';
  metaDescription?: string;
  headerColor?: string;
  headerTextColor?: string;
  customCSS?: string;
  backgroundColor?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Estructura base de bloque
export interface BlockData {
  id: string;
  type: BlockType;
  props: Record<string, any>;
  children?: BlockData[];
  styles?: {
    margin?: string;
    padding?: string;
    backgroundColor?: string;
    borderRadius?: string;
    border?: string;
    boxShadow?: string;
    [key: string]: any;
  };
  custom?: Record<string, any>;
}

// Tipos de bloques disponibles
export type BlockType = 
  | 'RichText'
  | 'Image'
  | 'Video'
  | 'Hero'
  | 'Button'
  | 'Container'
  | 'Grid'
  | 'Spacer'
  | 'Divider'
  | 'Card'
  | 'List'
  | 'Table'
  | 'Embed'
  | 'HTMLFallback';

// Props específicos para cada tipo de bloque
export interface RichTextProps {
  content: JSONContent; // TipTap JSON content
  placeholder?: string;
  editable?: boolean;
}

export interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  className?: string;
  style?: React.CSSProperties;
}

export interface VideoProps {
  src?: string;
  url?: string;
  provider?: 'youtube' | 'vimeo' | 'local';
  videoId?: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export interface HeroProps {
  title: JSONContent;
  subtitle?: JSONContent;
  backgroundImage?: string;
  backgroundColor?: string;
  backgroundOverlay?: string;
  textAlign?: 'left' | 'center' | 'right';
  minHeight?: string;
  buttons?: ButtonProps[];
}

export interface ButtonProps {
  text: string;
  url?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  target?: '_self' | '_blank' | '_parent' | '_top';
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface ContainerProps {
  blocks?: BlockData[];
  layout?: 'column' | 'row' | 'wrap';
  gap?: string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  maxWidth?: string;
  minHeight?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  borderRadius?: string;
  border?: string;
  shadow?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface GridProps {
  columns?: number;
  gap?: string;
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
  style?: React.CSSProperties;
}

export interface SpacerProps {
  height: string;
  backgroundColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface DividerProps {
  dividerStyle?: 'solid' | 'dashed' | 'dotted';
  color?: string;
  thickness?: string;
  width?: string;
  margin?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface CardProps {
  title?: JSONContent;
  content?: JSONContent;
  image?: ImageProps;
  imagePosition?: 'top' | 'bottom' | 'left' | 'right';
  buttons?: ButtonProps[];
  backgroundColor?: string;
  borderRadius?: string;
  border?: string;
  shadow?: string;
  padding?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface ListProps {
  items: (JSONContent | string)[];
  type?: 'ordered' | 'unordered' | 'bullet' | 'numbered' | 'checklist';
  listStyle?: string;
  spacing?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface TableProps {
  headers: string[];
  rows: string[][];
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  responsive?: boolean;
  caption?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface EmbedProps {
  url?: string;
  code?: string;
  type?: 'iframe' | 'embed' | 'object';
  provider?: string;
  width?: string;
  height?: string;
  allowFullscreen?: boolean;
  sandbox?: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface HTMLFallbackProps {
  html: string;
  sanitize?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  warning?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Interfaces para el editor
export interface EditorState {
  blocks: BlockData[];
  selectedBlockId?: string;
  isDragging: boolean;
  history: {
    past: BlockData[][];
    present: BlockData[];
    future: BlockData[][];
  };
}

export interface PageRendererProps {
  blocks: BlockData[];
  isEditing?: boolean;
  onBlockUpdate?: (blockId: string, props: any) => void;
  onBlockDelete?: (blockId: string) => void;
  onBlockMove?: (blockId: string, newIndex: number) => void;
  onBlockSelect?: (blockId: string) => void;
}

// Utilidades para validación
export interface BlockValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Configuración del editor
export interface EditorConfig {
  enabledBlocks: BlockType[];
  maxNestingLevel: number;
  autoSave: boolean;
  autoSaveInterval: number;
  allowCustomCSS: boolean;
  allowHTMLFallback: boolean;
}

// Tipos para migración
export interface MigrationResult {
  success: boolean;
  blocks: BlockData[];
  warnings: string[];
  errors: string[];
  unmappedHTML?: string[];
}