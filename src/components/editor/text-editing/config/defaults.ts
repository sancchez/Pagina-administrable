import { TextEditingConfig } from '../types';

// Configuración por defecto para el sistema de edición de texto
export const DEFAULT_TEXT_EDITING_CONFIG: TextEditingConfig = {
  // Elementos HTML que pueden ser editados
  allowedElements: [
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'P', 'DIV', 'SPAN', 'BUTTON', 'A',
    'LI', 'BLOCKQUOTE', 'LABEL'
  ],
  
  // Clases CSS que excluyen elementos de la edición
  excludedClasses: [
    'floating-toolbar',
    'context-menu',
    'positioning-guide',
    'edit-button',
    'text-editor',
    'system-element',
    'no-edit'
  ],
  
  // Configuración de guardado automático
  autoSave: true,
  autoSaveDelay: 1000, // 1 segundo
  
  // Longitud máxima del texto (opcional)
  maxLength: 1000,
  
  // Permitir texto multilínea
  multiline: true
};

// Configuración específica para elementos de título
export const TITLE_EDITING_CONFIG: TextEditingConfig = {
  ...DEFAULT_TEXT_EDITING_CONFIG,
  allowedElements: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
  multiline: false,
  maxLength: 100
};

// Configuración específica para párrafos
export const PARAGRAPH_EDITING_CONFIG: TextEditingConfig = {
  ...DEFAULT_TEXT_EDITING_CONFIG,
  allowedElements: ['P', 'DIV', 'BLOCKQUOTE'],
  multiline: true,
  maxLength: 2000
};

// Configuración específica para botones y enlaces
export const BUTTON_EDITING_CONFIG: TextEditingConfig = {
  ...DEFAULT_TEXT_EDITING_CONFIG,
  allowedElements: ['BUTTON', 'A', 'SPAN'],
  multiline: false,
  maxLength: 50
};