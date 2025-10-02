/**
 * Mapeo de iconos de lucide-react a SVG real (Backend)
 * Este archivo resuelve el problema de que los componentes de iconos
 * no se convierten correctamente durante la migración TSX -> HTML
 */

export interface IconProps {
  className?: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

/**
 * Mapeo de nombres de iconos a sus paths SVG
 * Basado en lucide-react v0.263.1
 */
export const ICON_PATHS: Record<string, string> = {
  // Iconos comunes
  'Target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  'Globe': '<circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  'Heart': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7 7-7z"/>',
  'Shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'Award': '<circle cx="12" cy="8" r="7"/><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>',
  'Users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'Lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  'Calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
  'MapPin': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  
  // Iconos de servicios
  'Wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  'Phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  'Mail': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
  'FileText': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/>',
  'CreditCard': '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" x2="23" y1="10" y2="10"/>',
  'Clock': '<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>',
  
  // Iconos de navegación
  'ArrowRight': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'CheckCircle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>',
  'MessageCircle': '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  'Send': '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  'User': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  
  // Iconos de gestión
  'Settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'BarChart3': '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  'Zap': '<polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>',
  'Droplets': '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2.04 4.6 4.14 5.93a10.97 10.97 0 0 1 3.83 4.15c-2.27-.59-4.7-.77-7.15-.32A10.97 10.97 0 0 0 12.56 6.6z"/>',
  
  // Iconos de documentos
  'Download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  'Eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  'Scale': '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  'BookOpen': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  
  // Iconos de búsqueda y consulta
  'Search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  'DollarSign': '<line x1="12" x2="12" y1="1" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  
  // Iconos de estado
  'TrendingUp': '<polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/>',
  'Building': '<rect x="4" y="2" width="16" height="20" rx="1" ry="1"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
  
  // Iconos de carga y estado
  'Loader2': '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
  'AlertCircle': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  'RefreshCw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
};

/**
 * Convierte un componente de icono de lucide-react a SVG real
 */
export function convertIconToSvg(iconName: string, props: IconProps = {}): string {
  const path = ICON_PATHS[iconName];
  
  if (!path) {
    console.warn(`⚠️ Icono no encontrado: ${iconName}`);
    return `<!-- Icono ${iconName} no encontrado -->`;
  }

  const {
    className = '',
    size = 24,
    color = 'currentColor',
    strokeWidth = 2
  } = props;

  // Extraer dimensiones de las clases de Tailwind si están presentes
  let width = size;
  let height = size;
  
  if (className.includes('w-4 h-4')) {
    width = height = 16;
  } else if (className.includes('w-5 h-5')) {
    width = height = 20;
  } else if (className.includes('w-6 h-6')) {
    width = height = 24;
  } else if (className.includes('w-8 h-8')) {
    width = height = 32;
  } else if (className.includes('w-12 h-12')) {
    width = height = 48;
  } else if (className.includes('w-16 h-16')) {
    width = height = 64;
  }

  return `<svg class="${className}" width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

/**
 * Procesa HTML y convierte referencias de iconos a SVG real
 */
export function processIconsInHtml(html: string): string {
  console.log(`🔍 Procesando HTML para iconos, longitud: ${html.length}`);
  
  // Patrón mejorado para encontrar componentes de iconos de lucide-react
  // Captura tanto self-closing como tags con contenido
  const iconPattern = /<(\w+)(\s+[^>]*)?(?:\s+className="([^"]*)"[^>]*)?(?:\/>|>[^<]*<\/\1>)/g;
  
  let processedHtml = html;
  let match;
  let replacements = 0;
  
  // Reset regex
  iconPattern.lastIndex = 0;
  
  while ((match = iconPattern.exec(html)) !== null) {
    const [fullMatch, iconName, attributes, className] = match;
    
    if (ICON_PATHS[iconName]) {
      console.log(`🔄 Convirtiendo icono ${iconName} a SVG (className: ${className || 'sin clase'})`);
      
      // Extraer className de los atributos si no se capturó directamente
      let finalClassName = className;
      if (!finalClassName && attributes) {
        const classMatch = attributes.match(/className="([^"]*)"/);
        if (classMatch) {
          finalClassName = classMatch[1];
        }
      }
      
      const svgReplacement = convertIconToSvg(iconName, { className: finalClassName || '' });
      processedHtml = processedHtml.replace(fullMatch, svgReplacement);
      replacements++;
    }
  }
  
  console.log(`✅ Procesamiento completado: ${replacements} iconos convertidos`);
  return processedHtml;
}