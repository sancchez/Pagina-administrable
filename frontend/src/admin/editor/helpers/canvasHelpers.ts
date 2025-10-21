import { Editor } from 'grapesjs';

/**
 * Inyecta Tailwind CSS en el canvas del editor
 */
export const injectTailwindIntoCanvas = (editor: Editor | null, maxRetries: number = 20) => {
  try {
    if (!editor) {
      if (maxRetries > 0) {
        setTimeout(() => injectTailwindIntoCanvas(editor, maxRetries - 1), 120);
      } else {
        console.warn('⚠️ Editor no disponible para inyectar Tailwind');
      }
      return;
    }

    const frame = editor.Canvas.getFrameEl();
    const doc = frame?.contentDocument || editor.Canvas.getDocument();
    
    if (!doc) {
      if (maxRetries > 0) {
        setTimeout(() => injectTailwindIntoCanvas(editor, maxRetries - 1), 120);
      } else {
        console.warn('⚠️ Documento del canvas no disponible para estilos');
      }
      return;
    }

    const href = '/tailwind.css';
    if (!doc.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
      const link = doc.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      doc.head.appendChild(link);
      console.log('🎨 Tailwind CSS inyectado en canvas');
    }
  } catch (e) {
    console.warn('No se pudo inyectar Tailwind en canvas:', e);
  }
};

/**
 * Inyecta estilos de página externos en el canvas
 */
export const injectPageStyles = (editor: Editor | null, html: string, maxRetries: number = 20) => {
  try {
    if (!editor) {
      if (maxRetries > 0) {
        setTimeout(() => injectPageStyles(editor, html, maxRetries - 1), 120);
      } else {
        console.warn('⚠️ Editor no disponible para inyectar estilos');
      }
      return;
    }

    const frame = editor.Canvas.getFrameEl();
    const doc = frame?.contentDocument || editor.Canvas.getDocument();
    
    if (!doc) {
      if (maxRetries > 0) {
        setTimeout(() => injectPageStyles(editor, html, maxRetries - 1), 120);
      } else {
        console.warn('⚠️ Documento del canvas no disponible para estilos externos');
      }
      return;
    }

    if (!html) return;

    const parser = new DOMParser();
    const parsed = parser.parseFromString(html, 'text/html');
    
    parsed.querySelectorAll('link[rel="stylesheet"][href]').forEach((el) => {
      const href = el.getAttribute('href');
      if (!href) return;
      
      if (!doc.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        doc.head.appendChild(link);
        console.log('🧩 Estilo externo cargado en canvas:', href);
      }
    });
  } catch (e) {
    console.warn('No se pudieron inyectar estilos externos:', e);
  }
};

/**
 * Obtiene el HTML del editor para preview
 */
export const getEditorHtmlForPreview = (editor: Editor): string => {
  if (!editor) return '';
  
  try {
    const html = editor.getHtml();
    const css = editor.getCss();
    
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vista Previa</title>
        <link href="/tailwind.css" rel="stylesheet">
        <style>${css}</style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
  } catch (e) {
    console.error('Error generando HTML para preview:', e);
    return '';
  }
};

/**
 * Obtiene el HTML del editor para exportar
 */
export const getEditorHtmlForExport = (editor: Editor): string => {
  if (!editor) return '';
  
  try {
    const html = editor.getHtml();
    const css = editor.getCss();
    
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Página Exportada</title>
        <style>
          /* Reset básico */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          
          /* Estilos del editor */
          ${css}
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
  } catch (e) {
    console.error('Error generando HTML para exportar:', e);
    return '';
  }
};

/**
 * Descarga un archivo con el contenido especificado
 */
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/html') => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Error descargando archivo:', e);
  }
};