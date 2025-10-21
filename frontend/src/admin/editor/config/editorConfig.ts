import { Editor } from 'grapesjs';
import presetWebpage from 'grapesjs-preset-webpage';
import basicBlocks from 'grapesjs-blocks-basic';
import pluginForms from 'grapesjs-plugin-forms';

export const getEditorConfig = () => ({
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
            { value: 'none', className: 'fa fa-times' },
            { value: 'left', className: 'fa fa-align-left' },
            { value: 'right', className: 'fa fa-align-right' }
          ]
        }, {
          property: 'position',
          type: 'select'
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
          toRequire: 1
        }, {
          property: 'margin',
          properties: [
            { name: 'Top', property: 'margin-top' },
            { name: 'Right', property: 'margin-right' },
            { name: 'Bottom', property: 'margin-bottom' },
            { name: 'Left', property: 'margin-left' }
          ]
        }, {
          property: 'padding',
          properties: [
            { name: 'Top', property: 'padding-top' },
            { name: 'Right', property: 'padding-right' },
            { name: 'Bottom', property: 'padding-bottom' },
            { name: 'Left', property: 'padding-left' }
          ]
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
          property: 'color'
        }, {
          property: 'text-align',
          type: 'radio',
          defaults: 'left',
          list: [
            { value: 'left', name: 'Left', className: 'fa fa-align-left' },
            { value: 'center', name: 'Center', className: 'fa fa-align-center' },
            { value: 'right', name: 'Right', className: 'fa fa-align-right' },
            { value: 'justify', name: 'Justify', className: 'fa fa-align-justify' }
          ]
        }, {
          property: 'text-decoration',
          type: 'radio',
          defaults: 'none',
          list: [
            { value: 'none', name: 'None', className: 'fa fa-times' },
            { value: 'underline', name: 'underline', className: 'fa fa-underline' },
            { value: 'line-through', name: 'Line-through', className: 'fa fa-strikethrough' }
          ]
        }, {
          property: 'text-shadow',
          properties: [
            { name: 'X position', property: 'text-shadow-h' },
            { name: 'Y position', property: 'text-shadow-v' },
            { name: 'Blur', property: 'text-shadow-blur' },
            { name: 'Color', property: 'text-shadow-color' }
          ]
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
          min: 0
        }, {
          property: 'border-radius',
          properties: [
            { name: 'Top', property: 'border-top-left-radius' },
            { name: 'Right', property: 'border-top-right-radius' },
            { name: 'Bottom', property: 'border-bottom-left-radius' },
            { name: 'Left', property: 'border-bottom-right-radius' }
          ]
        }, {
          property: 'box-shadow',
          properties: [
            { name: 'X position', property: 'box-shadow-h' },
            { name: 'Y position', property: 'box-shadow-v' },
            { name: 'Blur', property: 'box-shadow-blur' },
            { name: 'Spread', property: 'box-shadow-spread' },
            { name: 'Color', property: 'box-shadow-color' },
            { name: 'Shadow type', property: 'box-shadow-type' }
          ]
        }, {
          property: 'background',
          properties: [
            { name: 'Image', property: 'background-image' },
            { name: 'Repeat', property: 'background-repeat' },
            { name: 'Position', property: 'background-position' },
            { name: 'Attachment', property: 'background-attachment' },
            { name: 'Size', property: 'background-size' }
          ]
        }]
      }, {
        name: 'Extra',
        open: false,
        buildProps: ['transition', 'perspective', 'transform'],
        properties: [{
          property: 'transition',
          properties: [
            { name: 'Property', property: 'transition-property' },
            { name: 'Duration', property: 'transition-duration' },
            { name: 'Easing', property: 'transition-timing-function' }
          ]
        }, {
          property: 'transform',
          properties: [
            { name: 'Rotate X', property: 'transform-rotate-x' },
            { name: 'Rotate Y', property: 'transform-rotate-y' },
            { name: 'Rotate Z', property: 'transform-rotate-z' },
            { name: 'Scale X', property: 'transform-scale-x' },
            { name: 'Scale Y', property: 'transform-scale-y' },
            { name: 'Scale Z', property: 'transform-scale-z' }
          ]
        }]
      }]
    }
  },

  // Configuración del canvas
  canvas: {
    styles: [
      'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'
    ],
    scripts: []
  },

  // Configuración de dispositivos
  deviceManager: {
    devices: [
      {
        name: 'Desktop',
        width: '',
        widthMedia: null
      },
      {
        name: 'Tablet',
        width: '768px',
        widthMedia: '992px'
      },
      {
        name: 'Mobile portrait',
        width: '320px',
        widthMedia: '768px'
      }
    ]
  },

  // Configuración de paneles
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
          keyWidth: 'flex-basis'
        }
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
          keyWidth: 'flex-basis'
        }
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
          keyWidth: 'flex-basis'
        }
      }
    ]
  }
});