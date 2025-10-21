import { useCallback, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

// Plugins esenciales
import presetWebpage from 'grapesjs-preset-webpage';
import basicBlocks from 'grapesjs-blocks-basic';
import pluginForms from 'grapesjs-plugin-forms';

interface UseGrapesInitProps {
  editorContainerRef: React.RefObject<HTMLDivElement>;
  editorInstanceRef: React.RefObject<Editor | null>;
  onEditorReady: () => void;
  onCanvasReady: () => void;
  onContentChange: () => void;
}

export const useGrapesInit = ({
  editorContainerRef,
  editorInstanceRef,
  onEditorReady,
  onCanvasReady,
  onContentChange
}: UseGrapesInitProps) => {

  const initializeEditor = useCallback(() => {
    if (!editorContainerRef.current || editorInstanceRef.current) {
      return;
    }

    console.log('🚀 Inicializando GrapesJS Editor...');

    try {
      const editor = grapesjs.init({
        container: editorContainerRef.current,
        height: '100%',
        width: 'auto',
        storageManager: false,
        
        // Configuración de plugins
        plugins: [presetWebpage, basicBlocks, pluginForms],
        pluginsOpts: {
          [presetWebpage]: {
            modalImportTitle: 'Importar',
            modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Pega aquí tu código HTML/CSS</div>',
            modalImportContent: function(editor: Editor) {
              return editor.getHtml() + '<style>' + editor.getCss() + '</style>';
            },
            filestackOpts: null,
            aviaryOpts: false,
            blocksBasicOpts: {
              blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video'],
              flexGrid: 1,
            },
            customStyleManager: [{
              name: 'General',
              buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
              properties: [{
                name: 'Alignment',
                property: 'float',
                type: 'radio',
                defaults: 'none',
                list: [
                  { value: 'none', className: 'fa fa-times'},
                  { value: 'left', className: 'fa fa-align-left'},
                  { value: 'right', className: 'fa fa-align-right'}
                ],
              }, {
                property: 'position',
                type: 'select',
              }]
            }, {
              name: 'Dimension',
              open: false,
              buildProps: ['width', 'min-height', 'padding'],
              properties: [{
                id: 'flex-width',
                type: 'integer',
                name: 'Width',
                units: ['px', '%'],
                property: 'flex-basis',
                toRequire: 1,
              }, {
                property: 'margin',
                properties: [
                  { name: 'Top', property: 'margin-top'},
                  { name: 'Right', property: 'margin-right'},
                  { name: 'Bottom', property: 'margin-bottom'},
                  { name: 'Left', property: 'margin-left'}
                ],
              }, {
                property: 'padding',
                properties: [
                  { name: 'Top', property: 'padding-top'},
                  { name: 'Right', property: 'padding-right'},
                  { name: 'Bottom', property: 'padding-bottom'},
                  { name: 'Left', property: 'padding-left'}
                ],
              }]
            }, {
              name: 'Typography',
              open: false,
              buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow'],
              properties: [{
                name: 'Font',
                property: 'font-family'
              }, {
                name: 'Weight',
                property: 'font-weight'
              }, {
                name: 'Font color',
                property: 'color',
              }, {
                property: 'text-align',
                type: 'radio',
                defaults: 'left',
                list: [
                  { value: 'left', name: 'Left', className: 'fa fa-align-left'},
                  { value: 'center', name: 'Center', className: 'fa fa-align-center' },
                  { value: 'right', name: 'Right', className: 'fa fa-align-right'},
                  { value: 'justify', name: 'Justify', className: 'fa fa-align-justify'}
                ],
              }, {
                property: 'text-decoration',
                type: 'radio',
                defaults: 'none',
                list: [
                  { value: 'none', name: 'None', className: 'fa fa-times'},
                  { value: 'underline', name: 'underline', className: 'fa fa-underline' },
                  { value: 'line-through', name: 'Line-through', className: 'fa fa-strikethrough'}
                ],
              }, {
                property: 'text-shadow',
                properties: [
                  { name: 'X position', property: 'text-shadow-h'},
                  { name: 'Y position', property: 'text-shadow-v'},
                  { name: 'Blur', property: 'text-shadow-blur'},
                  { name: 'Color', property: 'text-shadow-color'}
                ],
              }]
            }, {
              name: 'Decorations',
              open: false,
              buildProps: ['opacity', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
              properties: [{
                type: 'slider',
                property: 'opacity',
                defaults: 1,
                step: 0.01,
                max: 1,
                min: 0,
              }, {
                property: 'border-radius',
                properties: [
                  { name: 'Top', property: 'border-top-left-radius'},
                  { name: 'Right', property: 'border-top-right-radius'},
                  { name: 'Bottom', property: 'border-bottom-left-radius'},
                  { name: 'Left', property: 'border-bottom-right-radius'}
                ],
              }, {
                property: 'box-shadow',
                properties: [
                  { name: 'X position', property: 'box-shadow-h'},
                  { name: 'Y position', property: 'box-shadow-v'},
                  { name: 'Blur', property: 'box-shadow-blur'},
                  { name: 'Spread', property: 'box-shadow-spread'},
                  { name: 'Color', property: 'box-shadow-color'},
                  { name: 'Shadow type', property: 'box-shadow-type'}
                ],
              }, {
                property: 'background',
                properties: [
                  { name: 'Image', property: 'background-image'},
                  { name: 'Repeat', property: 'background-repeat'},
                  { name: 'Position', property: 'background-position'},
                  { name: 'Attachment', property: 'background-attachment'},
                  { name: 'Size', property: 'background-size'}
                ],
              }]
            }, {
              name: 'Extra',
              open: false,
              buildProps: ['transition', 'perspective', 'transform'],
              properties: [{
                property: 'transition',
                properties: [
                  { name: 'Property', property: 'transition-property'},
                  { name: 'Duration', property: 'transition-duration'},
                  { name: 'Easing', property: 'transition-timing-function'}
                ],
              }, {
                property: 'transform',
                properties: [
                  { name: 'Rotate X', property: 'transform-rotate-x'},
                  { name: 'Rotate Y', property: 'transform-rotate-y'},
                  { name: 'Rotate Z', property: 'transform-rotate-z'},
                  { name: 'Scale X', property: 'transform-scale-x'},
                  { name: 'Scale Y', property: 'transform-scale-y'},
                  { name: 'Scale Z', property: 'transform-scale-z'}
                ],
              }]
            }]
          }
        },

        // Configuración de paneles
        panels: {
          defaults: [
            {
              id: 'layers',
              el: '#layers-container',
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
              el: '#styles-panel',
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
              el: '#traits-container',
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
              el: '#blocks-panel',
              resizable: {
                maxDim: 350,
                minDim: 200,
                tc: 0,
                cl: 0,
                cr: 1,
                bc: 0,
                keyWidth: 'flex-basis',
              },
            }
          ]
        },

        // Configuración de dispositivos
        deviceManager: {
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
            }
          ]
        },

        // Configuración del administrador de bloques
        blockManager: {
          appendTo: '#blocks-panel',
          blocks: [
            {
              id: 'section',
              label: '<b>Section</b>',
              attributes: { class: 'gjs-block-section' },
              content: `<section>
                <h1>Insert title here</h1>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
              </section>`
            }, {
              id: 'text',
              label: 'Text',
              content: '<div data-gjs-type="text">Insert your text here</div>',
            }, {
              id: 'image',
              label: 'Image',
              select: true,
              content: { type: 'image' },
              activate: true,
            }
          ]
        },

        // Configuración del administrador de estilos
        styleManager: {
          appendTo: '#styles-panel',
          sectors: [{
            name: 'Dimension',
            open: false,
            buildProps: ['width', 'min-height', 'padding'],
            properties: [{
              type: 'integer',
              name: 'The width',
              property: 'width',
              units: ['px', '%'],
              defaults: 'auto',
              min: 0,
            }]
          }]
        },

        // Configuración del administrador de capas
        layerManager: {
          appendTo: '#layers-container',
        },

        // Configuración del administrador de traits
        traitManager: {
          appendTo: '#traits-container',
        },

        // Configuración del canvas
        canvas: {
          styles: [
            'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'
          ],
          scripts: []
        }
      });

      // Configurar eventos del editor
      editor.on('load', () => {
        console.log('✅ Editor cargado correctamente');
        onEditorReady();
      });

      editor.on('canvas:ready', () => {
        console.log('✅ Canvas listo');
        onCanvasReady();
      });

      // Eventos de cambios
      editor.on('component:add component:remove component:update style:property:update', () => {
          onContentChange();
        });

      // Guardar referencia del editor
      editorInstanceRef.current = editor;

      console.log('✅ Editor inicializado exitosamente');

    } catch (error) {
      console.error('❌ Error al inicializar el editor:', error);
    }
  }, [editorContainerRef, editorInstanceRef, onEditorReady, onCanvasReady, onContentChange]);

  return { initializeEditor };



};