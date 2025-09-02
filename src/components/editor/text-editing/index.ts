// Exportaciones principales del sistema de edición de texto
export { TextEditingManager } from './core/TextEditingManager';
export { TextEditingRenderer } from './core/TextEditingRenderer';
export { TextEditingEvents } from './core/TextEditingEvents';
export { TextEditingUtils } from './utils/TextEditingUtils';

// Exportaciones de tipos
export type {
  TextEditingElement,
  TextEditingConfig,
  TextEditingEvents as TextEditingEventsType,
  TextEditingState,
  TextEditingMode,
  TextEditingOptions
} from './types';

// Exportaciones de configuración
export {
  DEFAULT_TEXT_EDITING_CONFIG,
  TITLE_EDITING_CONFIG,
  PARAGRAPH_EDITING_CONFIG,
  BUTTON_EDITING_CONFIG
} from './config/defaults';

// Exportaciones de utilidades
export {
  canEditElement,
  getElementPosition,
  shouldUseMultiline,
  copyComputedStyles,
  sanitizeContent,
  generateEditorId,
  isElementVisible,
  findNearestTextElement
} from './utils';