// Utilidad unificada para manejo de errores en la aplicación

export interface ErrorInfo {
  message: string;
  type: 'network' | 'validation' | 'server' | 'unknown';
  code?: string | number;
  details?: any;
}

export interface ErrorDisplayProps {
  error: ErrorInfo;
  onRetry?: () => void;
  showRetryButton?: boolean;
  className?: string;
}

// Función para clasificar y normalizar errores
export const normalizeError = (error: any): ErrorInfo => {
  // Error de red/conexión
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Error de conexión. Verifica tu conexión a internet.',
      type: 'network'
    };
  }

  // Error HTTP
  if (error.status) {
    switch (error.status) {
      case 404:
        return {
          message: 'Recurso no encontrado',
          type: 'server',
          code: 404
        };
      case 401:
        return {
          message: 'No autorizado. Inicia sesión nuevamente.',
          type: 'server',
          code: 401
        };
      case 403:
        return {
          message: 'No tienes permisos para realizar esta acción',
          type: 'server',
          code: 403
        };
      case 500:
        return {
          message: 'Error interno del servidor',
          type: 'server',
          code: 500
        };
      default:
        return {
          message: `Error del servidor (${error.status})`,
          type: 'server',
          code: error.status
        };
    }
  }

  // Error de validación
  if (error.name === 'ValidationError' || error.type === 'validation') {
    return {
      message: error.message || 'Error de validación',
      type: 'validation',
      details: error.details
    };
  }

  // Error genérico
  return {
    message: error.message || 'Ha ocurrido un error inesperado',
    type: 'unknown',
    details: error
  };
};

// Función para logging consistente de errores
export const logError = (error: any, context?: string) => {
  const normalizedError = normalizeError(error);
  const logMessage = context 
    ? `[${context}] ${normalizedError.message}` 
    : normalizedError.message;
  
  console.error(logMessage, {
    type: normalizedError.type,
    code: normalizedError.code,
    details: normalizedError.details,
    originalError: error
  });
};

// Hook personalizado para manejo de errores
export const useErrorHandler = () => {
  const handleError = (error: any, context?: string) => {
    logError(error, context);
    return normalizeError(error);
  };

  return { handleError };
};