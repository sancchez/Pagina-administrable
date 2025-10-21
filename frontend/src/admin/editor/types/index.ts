export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data: T;
}

export interface PageData {
  id: string;
  title: string;
  slug: string;
  grapesData?: any;
  content?: string | null;
  html?: string | null;
  css?: string | null;
  gjsHtml?: string | null;
  gjsCss?: string | null;
  gjsComponents?: string | null;
  gjsStyles?: string | null;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SelectedInfo {
  width: number;
  height: number;
  name?: string;
}

export interface EditorState {
  pageData: PageData | null;
  loading: boolean;
  error: any;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  isPublishing: boolean;
  editorReady: boolean;
  canvasReady: boolean;
  contentLoaded: boolean;
  showBlocks: boolean;
  showStyles: boolean;
  showLayers: boolean;
  showTraits: boolean;
  selectedInfo: SelectedInfo | null;
}