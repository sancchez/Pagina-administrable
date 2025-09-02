export class EditorCommands {
  static toggleBold() {
    document.execCommand('bold', false);
  }

  static toggleItalic() {
    document.execCommand('italic', false);
  }

  static toggleUnderline() {
    document.execCommand('underline', false);
  }

  static toggleStrikethrough() {
    document.execCommand('strikeThrough', false);
  }

  static setTextColor(color: string) {
    document.execCommand('foreColor', false, color);
  }

  static formatBlock(tag: string) {
    document.execCommand('formatBlock', false, tag);
  }

  static align(direction: 'left' | 'center' | 'right' | 'justify') {
    const commands = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull'
    };
    document.execCommand(commands[direction], false);
  }

  static insertList(type: 'ul' | 'ol') {
    const command = type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
    document.execCommand(command, false);
  }

  static insertLink(url: string) {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      document.execCommand('createLink', false, url);
    } else {
      const linkText = prompt('Texto del enlace:') || url;
      const html = `<a href="${url}" target="_blank">${linkText}</a>`;
      document.execCommand('insertHTML', false, html);
    }
  }

  static insertImage() {
    // Crear input file para seleccionar imagen desde PC
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          const html = `<img src="${imageUrl}" alt="Imagen" style="max-width: 100%; height: auto; margin: 10px 0; cursor: move; position: relative;" data-movable="true" data-resizable="true" />`;
          document.execCommand('insertHTML', false, html);
        };
        reader.readAsDataURL(file);
      }
    };
    
    // También permitir URL
    const useUrl = confirm('¿Quieres subir una imagen desde tu PC? Cancela para usar URL.');
    if (useUrl) {
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    } else {
      const url = prompt('URL de la imagen:');
      if (url) {
        const html = `<img src="${url}" alt="Imagen" style="max-width: 100%; height: auto; margin: 10px 0; cursor: move; position: relative;" data-movable="true" data-resizable="true" />`;
        document.execCommand('insertHTML', false, html);
      }
    }
  }

  static insertBox() {
    const content = prompt('Contenido del recuadro:') || 'Haz clic para editar este texto';
    const html = `
      <div class="editable-text-box" style="
        border: 2px solid #3b82f6;
        border-radius: 12px;
        padding: 24px;
        margin: 20px 0;
        background-color: #ffffff;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        cursor: move;
        position: relative;
        display: inline-block;
        min-width: 250px;
        min-height: 120px;
        transition: all 0.3s ease;
        font-family: 'Inter', system-ui, sans-serif;
        line-height: 1.6;
        color: #1e293b;
      " contenteditable="true" data-movable="true" data-resizable="true" data-text-box="true">
        ${content}
      </div>
    `;
    document.execCommand('insertHTML', false, html);
  }

  static insertDivider() {
    const html = '<hr style="margin: 20px 0; border: none; border-top: 2px solid #e5e7eb; cursor: move; position: relative;" data-movable="true" />';
    document.execCommand('insertHTML', false, html);
  }

  static undo() {
    document.execCommand('undo', false);
  }

  static redo() {
    document.execCommand('redo', false);
  }

  static setFontSize(size: string) {
    document.execCommand('fontSize', false, '7');
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size;
      try {
        range.surroundContents(span);
      } catch (e) {
        span.appendChild(range.extractContents());
        range.insertNode(span);
      }
    }
  }

  static setBackgroundColor(color: string) {
    document.execCommand('backColor', false, color);
  }

  static setFontFamily(fontFamily: string) {
    document.execCommand('fontName', false, fontFamily);
  }

  static insertTable(rows: number = 3, cols: number = 3) {
    let html = '<table style="border-collapse: collapse; width: 100%; margin: 20px 0; cursor: move; position: relative;" data-movable="true" data-resizable="true">';
    for (let i = 0; i < rows; i++) {
      html += '<tr>';
      for (let j = 0; j < cols; j++) {
        html += '<td style="border: 1px solid #ddd; padding: 8px; min-width: 100px;" contenteditable="true">Celda</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    document.execCommand('insertHTML', false, html);
  }

  static insertVideo() {
    const url = prompt('URL del video (YouTube, Vimeo, etc.):');
    if (url) {
      let embedUrl = url;
      
      // Convertir URLs de YouTube a embed
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1].split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1].split('?')[0];
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
      
      const html = `
        <div style="position: relative; width: 100%; max-width: 560px; margin: 20px auto; cursor: move;" data-movable="true" data-resizable="true">
          <iframe 
            src="${embedUrl}" 
            width="560" 
            height="315" 
            frameborder="0" 
            allowfullscreen
            style="width: 100%; height: 315px; border-radius: 8px;"
          ></iframe>
        </div>
      `;
      document.execCommand('insertHTML', false, html);
    }
  }

  static insertText() {
    const text = prompt('Texto a insertar:') || 'Nuevo texto';
    const html = `<p contenteditable="true" style="margin: 10px 0; padding: 8px; cursor: text;">${text}</p>`;
    document.execCommand('insertHTML', false, html);
  }

  static insertTitle() {
    const text = prompt('Título a insertar:') || 'Nuevo título';
    const html = `<h2 contenteditable="true" style="margin: 15px 0; padding: 8px; cursor: text; font-weight: bold;">${text}</h2>`;
    document.execCommand('insertHTML', false, html);
  }

  // Función para manejar pegado de imágenes
  static handleImagePaste(event: ClipboardEvent, targetElement?: HTMLElement | null) {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const imageUrl = e.target?.result as string;
              const img = document.createElement('img');
              img.src = imageUrl;
              img.alt = 'Imagen pegada';
              img.style.cssText = 'max-width: 100%; height: auto; margin: 10px 0; cursor: move; position: relative;';
              img.setAttribute('data-movable', 'true');
              img.setAttribute('data-resizable', 'true');
              
              // Insertar la imagen en una posición más inteligente
              if (targetElement && targetElement.parentNode) {
                // Si hay un elemento objetivo, insertar después de él
                if (targetElement.nextSibling) {
                  targetElement.parentNode.insertBefore(img, targetElement.nextSibling);
                } else {
                  targetElement.parentNode.appendChild(img);
                }
              } else {
                // Fallback: usar insertHTML si no hay elemento objetivo
                const html = `<img src="${imageUrl}" alt="Imagen pegada" style="max-width: 100%; height: auto; margin: 10px 0; cursor: move; position: relative;" data-movable="true" data-resizable="true" />`;
                document.execCommand('insertHTML', false, html);
              }
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    }
  }

  static insertButton(text: string = 'Botón') {
    const html = `
      <button style="
        background-color: #3b82f6;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        margin: 10px 5px;
        transition: background-color 0.2s;
        position: relative;
      " onmouseover="this.style.backgroundColor='#2563eb'" onmouseout="this.style.backgroundColor='#3b82f6'" data-movable="true">
        ${text}
      </button>
    `;
    document.execCommand('insertHTML', false, html);
  }

  static insertCard() {
    const html = `
      <div class="editable-text-box" style="
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        padding: 32px;
        margin: 20px 0;
        background-color: #ffffff;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        box-shadow: 0 8px 25px rgba(0,0,0,0.08);
        transition: all 0.3s ease;
        cursor: move;
        position: relative;
        min-width: 300px;
        min-height: 150px;
      " contenteditable="true" data-movable="true" data-resizable="true" data-text-box="true">
        <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 1.5rem; font-weight: 600;">Título de la tarjeta</h3>
        <p style="margin: 0; color: #6b7280; line-height: 1.7; font-size: 1rem;">Contenido de la tarjeta. Haz clic para editar este texto y personalizar el contenido según tus necesidades.</p>
      </div>
    `;
    document.execCommand('insertHTML', false, html);
  }

  static insertCircle(size: number = 100, color: string = '#3b82f6') {
    const html = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${color};
        margin: 20px auto;
        display: inline-block;
        cursor: move;
        position: relative;
        border: 2px solid #e5e7eb;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      " data-shape="circle" data-resizable="true" data-movable="true"></div>
    `;
    document.execCommand('insertHTML', false, html);
  }

  static insertRectangle(width: number = 200, height: number = 100, color: string = '#10b981') {
    const html = `
      <div style="
        width: ${width}px;
        height: ${height}px;
        background-color: ${color};
        margin: 20px auto;
        display: inline-block;
        cursor: move;
        position: relative;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      " data-shape="rectangle" data-resizable="true" data-movable="true"></div>
    `;
    document.execCommand('insertHTML', false, html);
  }

  static insertTriangle(size: number = 100, color: string = '#f59e0b') {
    const html = `
      <div style="
        width: 0;
        height: 0;
        border-left: ${size/2}px solid transparent;
        border-right: ${size/2}px solid transparent;
        border-bottom: ${size}px solid ${color};
        margin: 20px auto;
        display: inline-block;
        cursor: move;
        position: relative;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
      " data-shape="triangle" data-resizable="true" data-movable="true"></div>
    `;
    document.execCommand('insertHTML', false, html);
  }

  static insertStar(size: number = 100, color: string = '#ef4444') {
    const html = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        margin: 20px auto;
        display: inline-block;
        cursor: move;
        position: relative;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
      " data-shape="star" data-resizable="true" data-movable="true">
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="#e5e7eb" stroke-width="1">
          <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26" />
        </svg>
      </div>
    `;
    document.execCommand('insertHTML', false, html);
  }

  // Métodos específicos para recuadros de texto con colores
  static insertColoredTextBox(colorTheme: 'blue' | 'green' | 'purple' | 'orange' | 'red' = 'blue') {
    const themes = {
      blue: {
        border: '#3b82f6',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        shadow: 'rgba(59, 130, 246, 0.15)',
        text: '#1e40af'
      },
      green: {
        border: '#10b981',
        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        shadow: 'rgba(16, 185, 129, 0.15)',
        text: '#065f46'
      },
      purple: {
        border: '#8b5cf6',
        background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
        shadow: 'rgba(139, 92, 246, 0.15)',
        text: '#5b21b6'
      },
      orange: {
        border: '#f59e0b',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        shadow: 'rgba(245, 158, 11, 0.15)',
        text: '#92400e'
      },
      red: {
        border: '#ef4444',
        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        shadow: 'rgba(239, 68, 68, 0.15)',
        text: '#991b1b'
      }
    };

    const theme = themes[colorTheme];
    const content = prompt('Contenido del recuadro:') || 'Haz clic para editar este texto';
    
    const html = `
      <div class="editable-text-box" style="
        border: 2px solid ${theme.border};
        border-radius: 12px;
        padding: 24px;
        margin: 20px 0;
        background: ${theme.background};
        box-shadow: 0 4px 12px ${theme.shadow};
        cursor: move;
        position: relative;
        display: inline-block;
        min-width: 250px;
        min-height: 120px;
        transition: all 0.3s ease;
        font-family: 'Inter', system-ui, sans-serif;
        line-height: 1.6;
        color: ${theme.text};
      " contenteditable="true" data-movable="true" data-resizable="true" data-text-box="true" data-theme="${colorTheme}">
        ${content}
      </div>
    `;
    document.execCommand('insertHTML', false, html);
  }

  // Cambiar color de un recuadro de texto existente
  static changeTextBoxColor(element: HTMLElement, colorTheme: 'blue' | 'green' | 'purple' | 'orange' | 'red') {
    const themes = {
      blue: {
        border: '#3b82f6',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        shadow: 'rgba(59, 130, 246, 0.15)',
        text: '#1e40af'
      },
      green: {
        border: '#10b981',
        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        shadow: 'rgba(16, 185, 129, 0.15)',
        text: '#065f46'
      },
      purple: {
        border: '#8b5cf6',
        background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
        shadow: 'rgba(139, 92, 246, 0.15)',
        text: '#5b21b6'
      },
      orange: {
        border: '#f59e0b',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        shadow: 'rgba(245, 158, 11, 0.15)',
        text: '#92400e'
      },
      red: {
        border: '#ef4444',
        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        shadow: 'rgba(239, 68, 68, 0.15)',
        text: '#991b1b'
      }
    };

    const theme = themes[colorTheme];
    
    if (element && element.dataset.textBox) {
      element.style.borderColor = theme.border;
      element.style.background = theme.background;
      element.style.boxShadow = `0 4px 12px ${theme.shadow}`;
      element.style.color = theme.text;
      element.dataset.theme = colorTheme;
    }
  }
}