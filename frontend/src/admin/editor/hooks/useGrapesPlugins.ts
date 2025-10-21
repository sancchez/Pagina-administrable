import { useCallback } from 'react';
import { Editor, EditorConfig } from 'grapesjs';
import presetWebpage from 'grapesjs-preset-webpage';
import basicBlocks from 'grapesjs-blocks-basic';
import pluginForms from 'grapesjs-plugin-forms';

interface PluginConfig {
  plugins: any[];
  pluginsOpts: Record<string, any>;
}

export const useGrapesPlugins = () => {
  
  // Configuración de plugins
  const getPluginConfig = useCallback((): PluginConfig => {
    // Normalizar plugins por compatibilidad CJS/ESM
    const pluginBasic = (basicBlocks as any)?.default ?? basicBlocks;
    const pluginPreset = (presetWebpage as any)?.default ?? presetWebpage;
    const pluginFormsFn = (pluginForms as any)?.default ?? pluginForms;

    return {
      plugins: [
        (ed: Editor) => pluginBasic(ed, {
          blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image'],
          flexGrid: 1
        }),
        (ed: Editor) => pluginFormsFn(ed, {
          blocks: ['form', 'input', 'textarea', 'select', 'button', 'label']
        }),
        (ed: Editor) => pluginPreset(ed, {
          blocks: ['link-block', 'quote', 'text-basic'],
          modalImportTitle: 'Importar código',
          modalImportContent: (editor: Editor) => editor.getHtml() + '<style>' + editor.getCss() + '</style>'
        })
      ],
      pluginsOpts: {}
    };
  }, []);

  // Configuración de dispositivos
  const getDeviceManagerConfig = useCallback(() => {
    return {
      devices: [
        {
          name: 'Desktop',
          width: '',
        },
        {
          name: 'Tablet',
          width: '768px',
          widthMedia: '992px',
        },
        {
          name: 'Mobile portrait',
          width: '320px',
          widthMedia: '575px',
        },
      ]
    };
  }, []);

  // Configuración del canvas
  const getCanvasConfig = useCallback(() => {
    return {
      styles: [
        'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap',
        'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css',
        'https://cdn.tailwindcss.com',
      ],
      scripts: []
    };
  }, []);

  // Configuración del selector manager
  const getSelectorManagerConfig = useCallback(() => {
    return {
      appendTo: '.styles-container',
      escapeName: 1,
    };
  }, []);

  // Configuración del style manager
  const getStyleManagerConfig = useCallback(() => {
    return {
      appendTo: '.styles-container',
      sectors: [
        {
          name: '🎨 Apariencia',
          open: false,
          buildProps: [
            'background-color', 'background', 'border-radius', 'border', 'box-shadow', 'gradient'
          ],
          properties: [
            {
              type: 'gradient',
              property: 'background',
              name: 'Gradiente de fondo'
            }
          ]
        },
        {
          name: '📐 Dimensiones',
          open: false,
          buildProps: ['width', 'min-height', 'padding', 'margin'],
          properties: [
            {
              property: 'padding',
              properties: [
                { name: 'Top', property: 'padding-top' },
                { name: 'Right', property: 'padding-right' },
                { name: 'Bottom', property: 'padding-bottom' },
                { name: 'Left', property: 'padding-left' }
              ],
            },
            {
              property: 'margin',
              properties: [
                { name: 'Top', property: 'margin-top' },
                { name: 'Right', property: 'margin-right' },
                { name: 'Bottom', property: 'margin-bottom' },
                { name: 'Left', property: 'margin-left' }
              ],
            },
          ]
        },
        {
          name: '📝 Texto',
          open: false,
          buildProps: [
            'font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height',
            'text-align', 'text-decoration', 'text-shadow'
          ],
          properties: [
            {
              name: 'Alineación',
              property: 'text-align',
              type: 'align',
              defaults: 'left',
              list: [
                { value: 'left', name: 'Izquierda', className: 'fa fa-align-left' },
                { value: 'center', name: 'Centro', className: 'fa fa-align-center' },
                { value: 'right', name: 'Derecha', className: 'fa fa-align-right' },
                { value: 'justify', name: 'Justificado', className: 'fa fa-align-justify' }
              ]
            },
            {
              type: 'gradient',
              property: 'color',
              name: 'Gradiente de texto'
            }
          ]
        },
        {
          name: '🔧 Posición',
          open: false,
          buildProps: [
            'position', 'top', 'right', 'left', 'bottom', 'transform', 'z-index'
          ],
        },
        {
          name: '🎭 Efectos',
          open: false,
          buildProps: ['opacity', 'transition', 'perspective', 'transform'],
        },
        {
          name: '📱 Flexbox',
          open: false,
          buildProps: [
            'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'order', 'flex-basis', 'flex-grow', 'flex-shrink', 'align-self'
          ],
        }
      ]
    };
  }, []);

  // Configuración del block manager
  const getBlockManagerConfig = useCallback(() => {
    return {
      appendTo: '.blocks-container',
    };
  }, []);

  // Configuración del layer manager
  const getLayerManagerConfig = useCallback(() => {
    return {
      appendTo: '.layers-container',
    };
  }, []);

  // Configuración del trait manager
  const getTraitManagerConfig = useCallback(() => {
    return {
      appendTo: '.traits-container',
    };
  }, []);

  // Configuración de almacenamiento
  const getStorageManagerConfig = useCallback(() => {
    return {
      id: 'gjs-',
      type: 'local',
      autosave: true,
      autoload: true,
      stepsBeforeSave: 1,
    };
  }, []);

  // Configuración completa del editor
  const getEditorConfig = useCallback((container: string): Partial<EditorConfig> => {
    const pluginConfig = getPluginConfig();
    
    return {
      container,
      height: '100vh',
      width: 'auto',
      storageManager: getStorageManagerConfig(),
      blockManager: getBlockManagerConfig(),
      layerManager: getLayerManagerConfig(),
      selectorManager: getSelectorManagerConfig(),
      styleManager: getStyleManagerConfig(),
      traitManager: getTraitManagerConfig(),
      deviceManager: getDeviceManagerConfig(),
      canvas: getCanvasConfig(),
      plugins: pluginConfig.plugins,
      pluginsOpts: pluginConfig.pluginsOpts,
      
      // Configuración adicional
      showOffsets: true,
      noticeOnUnload: false,
      showRulers: true,
      colorPicker: {
        appendTo: 'parent',
        offset: { top: 26, left: -166 },
      },
      
      // Configuración de comandos
      commands: {
        defaults: [
          {
            id: 'save-db',
            run: function(editor: Editor) {
              // Esta función será sobrescrita por el componente principal
              console.log('Comando save-db ejecutado');
            }
          }
        ]
      },
      
      // Configuración de keymaps
      keymaps: {
        defaults: {
          'core:undo': 'ctrl+z',
          'core:redo': 'ctrl+shift+z',
          'core:copy': 'ctrl+c',
          'core:paste': 'ctrl+v',
        }
      },
      
      // Configuración de modal
      modal: {
        custom: true,
      },
      
      // Configuración de panels
      panels: {
        defaults: [
          {
            id: 'layers',
            el: '.panel__right',
            resizable: {
              maxDim: 350,
              minDim: 200,
              tc: 0,
              cl: 1,
              cr: 0,
              bc: 0,
              keyWidth: 'flex-basis',
            },
          },
          {
            id: 'styles',
            el: '.panel__right',
            resizable: {
              maxDim: 350,
              minDim: 200,
              tc: 0,
              cl: 1,
              cr: 0,
              bc: 0,
              keyWidth: 'flex-basis',
            },
          },
          {
            id: 'traits',
            el: '.panel__right',
            resizable: {
              maxDim: 350,
              minDim: 200,
              tc: 0,
              cl: 1,
              cr: 0,
              bc: 0,
              keyWidth: 'flex-basis',
            },
          },
          {
            id: 'blocks',
            el: '.panel__left',
            resizable: {
              maxDim: 350,
              minDim: 200,
              tc: 0,
              cl: 0,
              cr: 1,
              bc: 0,
              keyWidth: 'flex-basis',
            },
          },
          {
            id: 'panel-switcher',
            el: '.panel__switcher',
            buttons: [
              {
                id: 'show-layers',
                active: true,
                label: 'Capas',
                command: 'show-layers',
                togglable: false,
              },
              {
                id: 'show-style',
                active: true,
                label: 'Estilos',
                command: 'show-styles',
                togglable: false,
              },
              {
                id: 'show-traits',
                active: true,
                label: 'Propiedades',
                command: 'show-traits',
                togglable: false,
              },
            ],
          },
          {
            id: 'panel-devices',
            el: '.panel__devices',
            buttons: [
              {
                id: 'device-desktop',
                label: 'Desktop',
                command: 'set-device-desktop',
                active: true,
                togglable: false,
              },
              {
                id: 'device-tablet',
                label: 'Tablet',
                command: 'set-device-tablet',
                togglable: false,
              },
              {
                id: 'device-mobile',
                label: 'Mobile',
                command: 'set-device-mobile',
                togglable: false,
              },
            ],
          },
          {
            id: 'panel-top',
            el: '.panel__top',
          },
        ]
      },
      
      // Configuración de rich text editor
      richTextEditor: {
        actions: ['bold', 'italic', 'underline', 'strikethrough', 'link'],
      },
      
      // Configuración de asset manager
      assetManager: {
        embedAsBase64: true,
        assets: [],
        noAssets: 'No hay assets disponibles',
        upload: false,
        uploadName: 'files',
        multiUpload: true,
      },
      
      // Configuración de drag mode
      dragMode: 'absolute',
      
      // Configuración de protección CSS
      protectedCss: '* { box-sizing: border-box; } body {margin: 0;}',
      
      // Configuración de canvas personalizada
      canvasCss: `
        .gjs-dashed *[data-gjs-highlightable] {
          outline: 1px dashed rgba(170, 170, 170, 0.7);
          outline-offset: -1px;
        }
        .gjs-selected {
          outline: 2px solid #3b82f6 !important;
          outline-offset: -1px;
        }
        .gjs-selected-parent {
          outline: 1px solid rgba(59, 130, 246, 0.3) !important;
        }
        .gjs-freezed {
          opacity: 0.5;
          pointer-events: none;
        }
      `,
    };
  }, []);

  return {
    getEditorConfig,
    getPluginConfig,
    getDeviceManagerConfig,
    getCanvasConfig,
    getSelectorManagerConfig,
    getStyleManagerConfig,
    getBlockManagerConfig,
    getLayerManagerConfig,
    getTraitManagerConfig,
    getStorageManagerConfig,
  };
};