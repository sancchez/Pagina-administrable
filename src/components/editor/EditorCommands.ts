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
    const url = prompt('URL de la imagen:');
    if (url) {
      const html = `<img src="${url}" alt="Imagen" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
      document.execCommand('insertHTML', false, html);
    }
  }

  static insertBox() {
    const content = prompt('Contenido del recuadro:') || 'Nuevo recuadro';
    const html = `
      <div style="
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
        background-color: #f9fafb;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      " contenteditable="true">
        ${content}
      </div>
    `;
    document.execCommand('insertHTML', false, html);
  }

  static insertDivider() {
    const html = '<hr style="margin: 20px 0; border: none; border-top: 2px solid #e5e7eb;" />';
    document.execCommand('insertHTML', false, html);
  }

  static undo() {
    document.execCommand('undo', false);
  }

  static redo() {
    document.execCommand('redo', false);
  }
}