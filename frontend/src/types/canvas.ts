export interface CanvasBlock {
  id: string;
  type: 'text' | 'heading' | 'button' | 'image' | 'container' | 'card' | 'background' | 'video';
  content?: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  style?: {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    borderRadius?: number;
    padding?: number;
    margin?: number;
    border?: string;
    boxShadow?: string;
    opacity?: number;
    zIndex?: number;
    rotation?: number;
  };
  // Propiedades específicas para diferentes tipos de bloques
  src?: string; // Para image y video
  alt?: string; // Para image
  href?: string; // Para button
  target?: string; // Para button
  zIndex?: number;
  rotation?: number;
  locked?: boolean;
  visible?: boolean;
  children?: string[]; // IDs de bloques hijos
  parentId?: string;
  metadata?: {
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
  };
}

export interface CanvasPage {
  id: string;
  title: string;
  slug: string;
  blocks: CanvasBlock[];
  settings: {
    width: number;
    height: number;
    backgroundColor: string;
    backgroundImage?: string;
    padding?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    responsive?: boolean;
    seo?: {
      title: string;
      description: string;
      keywords: string[];
      ogImage?: string;
    };
  };
  status?: 'draft' | 'published' | 'archived';
  version: number;
  metadata?: {
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    createdBy: string;
    lastEditedBy: string;
  };
  // Propiedades adicionales para compatibilidad con migrador
  createdAt?: string;
  updatedAt?: string;
}

export interface CanvasHistory {
  id: string;
  pageId: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'resize' | 'style';
  blockId?: string;
  previousState?: unknown;
  newState?: unknown;
  timestamp: string;
  userId?: string;
}

export interface CanvasViewport {
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface CanvasSelection {
  selectedBlocks: string[];
  selectionBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CanvasClipboard {
  blocks: CanvasBlock[];
  operation: 'copy' | 'cut';
  timestamp: string;
}

// Tipos para las herramientas del editor
export type CanvasTool = 
  | 'select'
  | 'text'
  | 'heading'
  | 'button'
  | 'image'
  | 'container'
  | 'card'
  | 'background'
  | 'video'
  | 'hand'
  | 'zoom';

// Tipos para los eventos del canvas
export interface CanvasEvent {
  type: string;
  blockId?: string;
  data?: unknown;
  timestamp: string;
}

// Configuración del editor
export interface CanvasEditorConfig {
  maxZoom: number;
  minZoom: number;
  zoomStep: number;
  gridSize: number;
  snapThreshold: number;
  historyLimit: number;
  autoSave: boolean;
  autoSaveInterval: number;
}

// Tipos para la exportación
export interface CanvasExportOptions {
  format: 'json' | 'react' | 'vue';
  includeStyles: boolean;
  minify: boolean;
  responsive: boolean;
}

// Tipos para los templates
export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  blocks: CanvasBlock[];
  settings: CanvasPage['settings'];
  tags: string[];
  isPremium: boolean;
}

// Tipos para los componentes personalizados
export interface CustomComponent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  props: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'color' | 'image' | 'select';
      default: unknown;
      options?: unknown[];
      required?: boolean;
    };
  };
  template: CanvasBlock[];
}

// Utilidades de tipo
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type BlockUpdate = DeepPartial<CanvasBlock>;

export type PageUpdate = DeepPartial<CanvasPage>;

// Tipos auxiliares para el migrador
export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasStyle {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  borderRadius?: number;
  padding?: number;
  margin?: number;
  border?: string;
  boxShadow?: string;
  opacity?: number;
  zIndex?: number;
  rotation?: number;
}

export interface MigrationResult {
  success: boolean;
  page?: CanvasPage;
  errors?: string[];
}