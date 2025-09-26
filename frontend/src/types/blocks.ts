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
  // Campo Craft.js
  craftData?: string;
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

// Union type for all possible block props
type BlockPropsUnion = 
  | RichTextProps
  | ImageProps
  | VideoProps
  | HeroProps
  | ButtonProps
  | ContainerProps
  | GridProps
  | SpacerProps
  | DividerProps
  | CardProps
  | ListProps
  | TableProps
  | EmbedProps
  | HTMLFallbackProps
  | StatsBlockProps
  | ServicesBlockProps
  | TeamBlockProps
  | ContactBlockProps
  | GalleryBlockProps
  | SliderBlockProps
  | MapBlockProps
  | DocumentsBlockProps
  | FormBlockProps;

// Specific styles interface
export interface BlockStyles {
  margin?: string;
  padding?: string;
  backgroundColor?: string;
  borderRadius?: string;
  border?: string;
  boxShadow?: string;
  width?: string;
  height?: string;
  display?: string;
  flexDirection?: 'row' | 'column';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  opacity?: number;
  transform?: string;
  transition?: string;
}

// Custom data interface for blocks
export interface BlockCustomData {
  craftNodeId?: string;
  isSelected?: boolean;
  isDragging?: boolean;
  parentId?: string;
  index?: number;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    version?: string;
    author?: string;
  };
}

// Estructura base de bloque
export interface BlockData {
  id: string;
  type: BlockType;
  props: BlockPropsUnion;
  children?: BlockData[];
  styles?: BlockStyles;
  custom?: BlockCustomData;
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
  | 'HTMLFallback'
  | 'Stats'
  | 'Services'
  | 'Team'
  | 'Contact'
  | 'Gallery'
  | 'Slider'
  | 'Map'
  | 'Documents'
  | 'Form';

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

// Interfaces para bloques adicionales
export interface Stat {
  number: string;
  label: string;
  icon: string;
}

export interface StatsBlockProps {
  title?: string;
  subtitle?: string;
  stats?: Stat[];
  backgroundColor?: string;
}

export interface Service {
  title: string;
  description: string;
  icon: string;
  color?: string | 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo';
}

export interface ServicesBlockProps {
  title?: string;
  subtitle?: string;
  services?: Service[];
  layout?: 'grid' | 'list';
}

export interface TeamMember {
  name: string;
  position: string;
  bio?: string;
  image?: string;
}

export interface TeamBlockProps {
  title?: string;
  subtitle?: string;
  members?: TeamMember[];
  layout?: 'grid' | 'list';
  backgroundColor?: string;
  showBio?: boolean;
}

export interface ContactBlockProps {
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  submitText?: string;
  showMap?: boolean;
  mapEmbedUrl?: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryBlockProps {
  title?: string;
  subtitle?: string;
  items?: GalleryItem[];
  layout?: 'grid' | 'masonry' | 'carousel';
}

export interface SlideItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  title?: string;
  description?: string;
}

export interface SliderBlockProps {
  slides?: SlideItem[];
  autoplay?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
}

export interface MapBlockProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
}

export interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: string;
  size?: string;
}

export interface DocumentsBlockProps {
  title?: string;
  subtitle?: string;
  documents?: DocumentItem[];
  layout?: 'grid' | 'list';
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface FormBlockProps {
  title?: string;
  subtitle?: string;
  fields?: FormField[];
  submitText?: string;
  successMessage?: string;
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
  onBlockUpdate?: (blockId: string, props: unknown) => void;
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