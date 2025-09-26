/**
 * Utilidades para manejo de archivos con validaciones
 */

// Interfaces para validaciones
interface FileValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

interface FileTypeValidation {
  allowedTypes: string[];
  maxSize?: number; // en bytes
  minSize?: number; // en bytes
}

/**
 * Validar tipo y tamaño de archivo
 */
export function validateFile(file: File, validation: FileTypeValidation): FileValidationResult {
  const warnings: string[] = [];
  
  // Validar tipo de archivo
  if (validation.allowedTypes.length > 0) {
    const isValidType = validation.allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type || file.type.startsWith(type);
    });
    
    if (!isValidType) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Tipos permitidos: ${validation.allowedTypes.join(', ')}`
      };
    }
  }
  
  // Validar tamaño máximo
  if (validation.maxSize && file.size > validation.maxSize) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${formatFileSize(validation.maxSize)}`
    };
  }
  
  // Validar tamaño mínimo
  if (validation.minSize && file.size < validation.minSize) {
    return {
      valid: false,
      error: `El archivo es demasiado pequeño. Tamaño mínimo: ${formatFileSize(validation.minSize)}`
    };
  }
  
  // Advertencias para archivos grandes
  if (file.size > 10 * 1024 * 1024) { // 10MB
    warnings.push('El archivo es muy grande y puede tardar en procesarse');
  }
  
  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Validar nombre de archivo
 */
export function validateFilename(filename: string): FileValidationResult {
  const warnings: string[] = [];
  
  // Caracteres no permitidos en nombres de archivo
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (invalidChars.test(filename)) {
    return {
      valid: false,
      error: 'El nombre del archivo contiene caracteres no válidos'
    };
  }
  
  // Longitud del nombre
  if (filename.length > 255) {
    return {
      valid: false,
      error: 'El nombre del archivo es demasiado largo (máximo 255 caracteres)'
    };
  }
  
  if (filename.length < 1) {
    return {
      valid: false,
      error: 'El nombre del archivo no puede estar vacío'
    };
  }
  
  // Advertencias
  if (filename.length > 100) {
    warnings.push('El nombre del archivo es muy largo');
  }
  
  if (!/\.[a-zA-Z0-9]+$/.test(filename)) {
    warnings.push('El archivo no tiene extensión');
  }
  
  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Descargar contenido como archivo con validaciones
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'application/json'): FileValidationResult {
  try {
    // Validar nombre de archivo
    const filenameValidation = validateFilename(filename);
    if (!filenameValidation.valid) {
      return filenameValidation;
    }
    
    // Validar contenido
    if (!content || content.length === 0) {
      return {
        valid: false,
        error: 'El contenido del archivo está vacío'
      };
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return {
      valid: true,
      warnings: filenameValidation.warnings
    };
  } catch (error) {
    return {
      valid: false,
      error: `Error al descargar archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

/**
 * Leer archivo como texto con validaciones
 */
export function readFileAsText(file: File, validation?: FileTypeValidation): Promise<{ success: boolean; content?: string; error?: string; warnings?: string[] }> {
  return new Promise((resolve) => {
    try {
      // Validar archivo si se proporciona validación
      if (validation) {
        const fileValidation = validateFile(file, validation);
        if (!fileValidation.valid) {
          resolve({
            success: false,
            error: fileValidation.error
          });
          return;
        }
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve({
            success: true,
            content: event.target.result as string,
            warnings: validation ? validateFile(file, validation).warnings : undefined
          });
        } else {
          resolve({
            success: false,
            error: 'No se pudo leer el contenido del archivo'
          });
        }
      };
      reader.onerror = () => resolve({
        success: false,
        error: 'Error al leer el archivo'
      });
      reader.readAsText(file);
    } catch (error) {
      resolve({
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
    }
  });
}

/**
 * Validar si un archivo es JSON válido
 */
export function validateJsonFile(content: string): { valid: boolean; error?: string; data?: unknown } {
  try {
    const data = JSON.parse(content);
    return { valid: true, data };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON format'
    };
  }
}

/**
 * Formatear tamaño de archivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generar nombre de archivo con timestamp
 */
export function generateTimestampedFilename(baseName: string, extension: string = 'json'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${baseName}-${timestamp}.${extension}`;
}

export default {
  downloadFile,
  readFileAsText,
  validateJsonFile,
  formatFileSize,
  generateTimestampedFilename
};