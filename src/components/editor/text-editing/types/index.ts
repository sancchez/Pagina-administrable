// Tipos para el sistema de edición de texto

export interface TextEditingElement {
  element: HTMLElement;
  originalContent: string;
  isEditing: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TextEditingConfig {
  allowedElements: string[];
  excludedClasses: string[];
  autoSave: boolean;
  autoSaveDelay: number;
  maxLength?: number;
  multiline: boolean;
}

export interface TextEditingEvents {
  onStart?: (element: HTMLElement) => void;
  onSave?: (element: HTMLElement, content: string) => void;
  onCancel?: (element: HTMLElement) => void;
  onChange?: (content: string) => void;
}

export interface TextEditingState {
  activeElement: HTMLElement | null;
  isEditing: boolean;
  isActive: boolean;
  originalContent: string;
  currentContent: string;
  content: string;
}

export type TextEditingMode = 'inline' | 'overlay' | 'modal';

export interface TextEditingOptions {
  autoSave: boolean;
  autoSaveDelay: number;
  multilineThreshold: number;
  config: TextEditingConfig;
  events: TextEditingEvents;
  isActive?: boolean;
  content?: string;
  onContentChange?: (content: string, element: HTMLElement) => void;
  onEditStart?: (element: HTMLElement) => void;
  onEditEnd?: (element: HTMLElement, content: string) => void;
}