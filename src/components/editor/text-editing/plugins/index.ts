// Sistema de plugins principal
export { PluginSystem, BasePlugin } from './PluginSystem';
export type { Plugin } from './PluginSystem';

// Plugins específicos
export { FormattingPlugin } from './FormattingPlugin';
export { AutoSavePlugin } from './AutoSavePlugin';
export { ValidationPlugin } from './ValidationPlugin';
export type { ValidationRule, ValidationResult, ValidationConfig } from './ValidationPlugin';

// Importaciones para uso interno
import { PluginSystem } from './PluginSystem';
import { FormattingPlugin } from './FormattingPlugin';
import { AutoSavePlugin } from './AutoSavePlugin';

// Configuraciones predeterminadas para plugins
export const DEFAULT_PLUGIN_CONFIGS = {
  formatting: {
    enableShortcuts: true,
    enableToolbar: true,
    shortcuts: {
      bold: 'Ctrl+B',
      italic: 'Ctrl+I',
      underline: 'Ctrl+U',
      strikethrough: 'Ctrl+Shift+S'
    },
    toolbar: {
      position: 'top',
      buttons: ['bold', 'italic', 'underline', 'strikethrough', 'color', 'fontSize']
    }
  },
  autosave: {
    enabled: true,
    interval: 3000,
    showIndicator: true,
    maxHistorySize: 50,
    saveOnBlur: true,
    saveOnKeyPause: true,
    keyPauseDelay: 1000,
    storage: {
      type: 'localStorage',
      prefix: 'texteditor_autosave_'
    },
    notifications: {
      showSaveSuccess: true,
      showSaveError: false,
      duration: 2000
    }
  }
};

/**
 * Función helper para inicializar plugins comunes
 */
export async function initializeDefaultPlugins(pluginSystem: PluginSystem): Promise<void> {
  try {
    // Registrar plugin de formateo
    const formattingPlugin = new FormattingPlugin();
    await pluginSystem.registerPlugin(formattingPlugin, DEFAULT_PLUGIN_CONFIGS.formatting);
    
    // AUTOGUARDADO DESHABILITADO - Solo guardado manual
    // const autoSavePlugin = new AutoSavePlugin();
    // await pluginSystem.registerPlugin(autoSavePlugin, DEFAULT_PLUGIN_CONFIGS.autosave);
    
    console.log('🎉 Plugins predeterminados inicializados (sin autoguardado)');
  } catch (error) {
    console.error('Error inicializando plugins predeterminados:', error);
  }
}

/**
 * Función helper para crear una configuración personalizada de plugins
 */
export function createPluginConfig(overrides: Partial<typeof DEFAULT_PLUGIN_CONFIGS>): typeof DEFAULT_PLUGIN_CONFIGS {
  return {
    formatting: {
      ...DEFAULT_PLUGIN_CONFIGS.formatting,
      ...overrides.formatting
    },
    autosave: {
      ...DEFAULT_PLUGIN_CONFIGS.autosave,
      ...overrides.autosave
    }
  };
}