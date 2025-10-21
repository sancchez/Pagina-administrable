// Funciones utilitarias para manejo de texto y contenido

/**
 * Limpia etiquetas de React del HTML
 */
export const cleanReactTags = (html: string): string => {
  if (!html) return '';
  
  return html
    .replace(/data-reactroot="[^"]*"/g, '')
    .replace(/data-react-[^=]*="[^"]*"/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Extrae contenido del body de un HTML completo
 */
export const extractBodyContent = (html: string): string => {
  if (!html) return '';
  
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1].trim() : html;
};

/**
 * Limpia y procesa HTML para GrapesJS
 */
export const processHtmlForGrapes = (html: string): string => {
  if (!html) return '';
  
  let processed = cleanReactTags(html);
  processed = extractBodyContent(processed);
  
  // Remover comentarios HTML
  processed = processed.replace(/<!--[\s\S]*?-->/g, '');
  
  // Limpiar espacios extra
  processed = processed.replace(/\s+/g, ' ').trim();
  
  return processed;
};

/**
 * Genera HTML completo para preview
 */
export const generatePreviewHtml = (
  html: string, 
  css: string, 
  title: string = 'Vista Previa'
): string => {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; }
        ${css}
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
};

/**
 * Extrae texto plano de HTML
 */
export const extractTextFromHtml = (html: string): string => {
  if (!html) return '';
  
  // Crear un elemento temporal para extraer texto
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Trunca texto a una longitud específica
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Convierte texto a slug (URL amigable)
 */
export const textToSlug = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Capitaliza la primera letra de cada palabra
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Valida si una cadena es HTML válido
 */
export const isValidHtml = (html: string): boolean => {
  if (!html) return false;
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return !doc.querySelector('parsererror');
  } catch {
    return false;
  }
};

/**
 * Escapa caracteres HTML especiales
 */
export const escapeHtml = (text: string): string => {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Desescapa caracteres HTML
 */
export const unescapeHtml = (html: string): string => {
  if (!html) return '';
  
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/**
 * Cuenta palabras en un texto
 */
export const countWords = (text: string): number => {
  if (!text) return 0;
  
  const plainText = extractTextFromHtml(text);
  return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Estima tiempo de lectura en minutos
 */
export const estimateReadingTime = (text: string, wordsPerMinute: number = 200): number => {
  const wordCount = countWords(text);
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Formatea texto para mostrar en UI
 */
export const formatTextForDisplay = (text: string, maxLength: number = 50): string => {
  if (!text) return 'Sin contenido';
  
  const plainText = extractTextFromHtml(text);
  const truncated = truncateText(plainText, maxLength);
  
  return truncated || 'Contenido vacío';
};

/**
 * Valida y limpia CSS
 */
export const cleanCss = (css: string): string => {
  if (!css) return '';
  
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios
    .replace(/\s+/g, ' ') // Normalizar espacios
    .replace(/;\s*}/g, '}') // Limpiar punto y coma antes de }
    .replace(/{\s*;/g, '{') // Limpiar punto y coma después de {
    .trim();
};

/**
 * Extrae selectores CSS únicos
 */
export const extractCssSelectors = (css: string): string[] => {
  if (!css) return [];
  
  const selectorRegex = /([^{}]+)\s*{[^}]*}/g;
  const selectors: string[] = [];
  let match;
  
  while ((match = selectorRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    if (selector && !selectors.includes(selector)) {
      selectors.push(selector);
    }
  }
  
  return selectors;
};

/**
 * Minifica CSS básico
 */
export const minifyCss = (css: string): string => {
  if (!css) return '';
  
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios
    .replace(/\s+/g, ' ') // Normalizar espacios
    .replace(/;\s*}/g, '}') // Limpiar antes de }
    .replace(/{\s*/g, '{') // Limpiar después de {
    .replace(/;\s*/g, ';') // Limpiar después de ;
    .replace(/,\s*/g, ',') // Limpiar después de ,
    .replace(/:\s*/g, ':') // Limpiar después de :
    .trim();
};

/**
 * Convierte colores hex a RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Convierte RGB a hex
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Genera un ID único para elementos
 */
export const generateUniqueId = (prefix: string = 'element'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Valida URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extrae dominio de URL
 */
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};

/**
 * Formatea bytes a tamaño legible
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};