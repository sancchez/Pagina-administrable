import { toast } from 'react-toastify';

// Interfaces para manejo de errores
interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: Date;
  url?: string;
  userAgent?: string;
}

interface ErrorDetails {
  message: string;
  stack?: string;
  code?: string | number;
  status?: number;
  type: 'network' | 'validation' | 'authentication' | 'authorization' | 'server' | 'client' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
}

interface ErrorLog {
  id: string;
  error: ErrorDetails;
  context: ErrorContext;
  timestamp: Date;
  resolved: boolean;
  attempts: number;
}

// Almacén de errores en memoria mejorado
class ErrorStore {
  private errors: ErrorLog[] = [];
  private maxErrors = 100;
  private recoveryStrategies: Map<string, (error: ErrorDetails, context: ErrorContext) => Promise<boolean>> = new Map();

  constructor() {
    this.setupRecoveryStrategies();
  }

  private setupRecoveryStrategies(): void {
    // Estrategia para errores de componentes del editor
    this.recoveryStrategies.set('editor-component', async (error, context) => {
      console.log('🔄 [ErrorStore] Attempting editor component recovery');
      try {
        // Limpiar cache de componentes si existe
        if (typeof window !== 'undefined' && (window as any).componentCache) {
          (window as any).componentCache.clear();
        }
        
        // Esperar un momento antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      } catch {
        return false;
      }
    });

    // Estrategia para errores de guardado
    this.recoveryStrategies.set('save-operation', async (error, context) => {
      console.log('🔄 [ErrorStore] Attempting save operation recovery');
      try {
        // Crear backup en localStorage
        const editorState = sessionStorage.getItem('craft-editor-state');
        if (editorState && context.userId) {
          localStorage.setItem(`editor-backup-${context.userId}-${Date.now()}`, editorState);
        }
        
        // Verificar conectividad
        const response = await fetch('/api/health', { method: 'HEAD' });
        return response.ok;
      } catch {
        return false;
      }
    });

    // Estrategia para errores de red
    this.recoveryStrategies.set('network-error', async (error, context) => {
      console.log('🔄 [ErrorStore] Attempting network recovery');
      try {
        // Verificar conectividad básica
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        return response.ok;
      } catch {
        return false;
      }
    });
  }

  addError(error: ErrorDetails, context: ErrorContext): string {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const errorLog: ErrorLog = {
      id,
      error,
      context: {
        ...context,
        timestamp: new Date(),
        url: window.location.href,
        userAgent: navigator.userAgent
      },
      timestamp: new Date(),
      resolved: false,
      attempts: 0
    };

    this.errors.unshift(errorLog);
    
    // Mantener solo los últimos errores
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log críticos se envían al servidor
    if (error.severity === 'critical') {
      this.reportToServer(errorLog);
    }

    return id;
  }

  getErrors(): ErrorLog[] {
    return [...this.errors];
  }

  getUnresolvedErrors(): ErrorLog[] {
    return this.errors.filter(error => !error.resolved);
  }

  markAsResolved(id: string): void {
    const error = this.errors.find(e => e.id === id);
    if (error) {
      error.resolved = true;
    }
  }

  incrementAttempts(id: string): void {
    const error = this.errors.find(e => e.id === id);
    if (error) {
      error.attempts++;
    }
  }

  private async reportToServer(errorLog: ErrorLog): Promise<void> {
    try {
      // Solo reportar en producción
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorLog)
        });
      }
    } catch (reportError) {
      console.error('Failed to report error to server:', reportError);
    }
  }
}

// Instancia global del store
const errorStore = new ErrorStore();

/**
 * Analizar y clasificar el error
 */
function analyzeError(error: unknown): ErrorDetails {
  let details: ErrorDetails = {
    message: 'Error desconocido',
    type: 'unknown',
    severity: 'medium',
    recoverable: true
  };

  if (error instanceof Error) {
    details.message = error.message;
    details.stack = error.stack;
    
    // Clasificar por tipo de error
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      details.type = 'client';
      details.severity = 'high';
      details.recoverable = false;
    } else if (error.name === 'ValidationError') {
      details.type = 'validation';
      details.severity = 'low';
      details.recoverable = true;
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      details.type = 'network';
      details.severity = 'medium';
      details.recoverable = true;
    }
  } else if (typeof error === 'string') {
    details.message = error;
  } else if (error && typeof error === 'object') {
    const errorObj = error as any;
    
    // Error de respuesta HTTP
    if ('response' in errorObj) {
      const response = errorObj.response;
      details.status = response?.status;
      details.message = response?.data?.message || response?.statusText || 'Error de servidor';
      
      if (response?.status >= 400 && response?.status < 500) {
        details.type = response?.status === 401 ? 'authentication' : 
                      response?.status === 403 ? 'authorization' : 'client';
        details.severity = response?.status === 401 || response?.status === 403 ? 'high' : 'medium';
      } else if (response?.status >= 500) {
        details.type = 'server';
        details.severity = 'high';
      }
    }
    
    // Error con código
    if ('code' in errorObj) {
      details.code = errorObj.code;
    }
    
    // Error con mensaje
    if ('message' in errorObj) {
      details.message = errorObj.message;
    }
  }

  return details;
}

/**
 * Generar mensaje de usuario amigable
 */
function generateUserMessage(error: ErrorDetails, context: string): string {
  const baseMessage = context ? `${context}: ` : '';
  
  switch (error.type) {
    case 'network':
      return `${baseMessage}Problema de conexión. Verifique su internet e intente nuevamente.`;
    case 'authentication':
      return `${baseMessage}Su sesión ha expirado. Por favor, inicie sesión nuevamente.`;
    case 'authorization':
      return `${baseMessage}No tiene permisos para realizar esta acción.`;
    case 'validation':
      return `${baseMessage}${error.message}`;
    case 'server':
      return `${baseMessage}Error del servidor. Intente nuevamente en unos momentos.`;
    case 'client':
      return `${baseMessage}Error en la aplicación. Recargue la página e intente nuevamente.`;
    default:
      return `${baseMessage}${error.message}`;
  }
}

/**
 * Estrategias de recuperación automática
 */
async function attemptRecovery(error: ErrorDetails, context: ErrorContext, errorId: string): Promise<boolean> {
  console.log('🔄 [ErrorHandler] Attempting recovery for error:', errorId);
  
  if (!error.recoverable) {
    return false;
  }

  const attempts = errorStore.getErrors().find(e => e.id === errorId)?.attempts || 0;
  
  // Máximo 3 intentos
  if (attempts >= 3) {
    return false;
  }

  errorStore.incrementAttempts(errorId);

  // Determinar estrategia de recuperación basada en el contexto
  let strategyKey = 'default';
  
  if (context.component?.includes('Editor') || context.action?.includes('editor')) {
    strategyKey = 'editor-component';
  } else if (context.action?.includes('save') || context.action?.includes('update')) {
    strategyKey = 'save-operation';
  } else if (error.type === 'network') {
    strategyKey = 'network-error';
  }
  
  // Intentar recuperación específica
  const strategy = (errorStore as any).recoveryStrategies?.get(strategyKey);
  if (strategy) {
    try {
      const recovered = await strategy(error, context);
      if (recovered) {
        console.log('✅ [ErrorHandler] Recovery successful using strategy:', strategyKey);
        errorStore.markAsResolved(errorId);
        return true;
      }
    } catch (strategyError) {
      console.error('❌ [ErrorHandler] Strategy failed:', strategyError);
    }
  }

  // Estrategias generales de recuperación
  switch (error.type) {
    case 'network':
      // Esperar y reintentar
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)));
      return true;
      
    case 'authentication':
      // Intentar refrescar token
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Lógica de refresh token aquí
          return true;
        }
      } catch {
        // Redirigir a login
        window.location.href = '/admin/login';
      }
      return false;
      
    default:
      return false;
  }
}

/**
 * Manejador principal de errores
 */
export const handleError = async (
  error: unknown, 
  context: string = 'Operación', 
  contextDetails?: Partial<ErrorContext>
): Promise<string> => {
  console.log('🚨 [ErrorHandler] Handling error in context:', context);
  
  const errorDetails = analyzeError(error);
  const fullContext: ErrorContext = {
    component: contextDetails?.component || 'Unknown',
    action: context,
    userId: contextDetails?.userId || localStorage.getItem('userId') || undefined,
    ...contextDetails
  };

  // Registrar el error
  const errorId = errorStore.addError(errorDetails, fullContext);
  
  // Generar mensaje para el usuario
  const userMessage = generateUserMessage(errorDetails, context);
  
  // Mostrar notificación según la severidad
  switch (errorDetails.severity) {
    case 'critical':
      toast.error(`❌ Error crítico: ${userMessage}`, {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'error-toast-critical'
      });
      break;
      
    case 'high':
      toast.error(`⚠️ ${userMessage}`, {
        position: "top-right",
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'error-toast-high'
      });
      break;
      
    case 'medium':
      toast.warn(`⚠️ ${userMessage}`, {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'error-toast-medium'
      });
      break;
      
    case 'low':
      toast.info(`ℹ️ ${userMessage}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'error-toast-low'
      });
      break;
  }

  // Intentar recuperación automática si es posible
  if (errorDetails.recoverable && errorDetails.severity !== 'critical') {
    console.log('🔄 [ErrorHandler] Attempting automatic recovery...');
    
    setTimeout(async () => {
      const recovered = await attemptRecovery(errorDetails, fullContext, errorId);
      if (recovered) {
        errorStore.markAsResolved(errorId);
        toast.success('✅ Problema resuelto automáticamente', {
          position: "top-right",
          autoClose: 3000,
          className: 'success-toast-recovery'
        });
      }
    }, 1000);
  }

  // Log detallado para desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.group(`🐛 [ErrorHandler] Error Details - ${errorId}`);
    console.error('Original Error:', error);
    console.log('Analyzed Details:', errorDetails);
    console.log('Context:', fullContext);
    console.log('User Message:', userMessage);
    console.groupEnd();
  }

  return errorId;
};

/**
 * Manejadores específicos
 */
export const handleSuccess = (message: string, autoClose: number = 5000) => {
  toast.success(message, { autoClose });
};

export const handleInfo = (message: string, autoClose: number = 5000) => {
  toast.info(message, { autoClose });
};

export const handleWarning = (message: string, autoClose: number = 5000) => {
  toast.warn(message, { autoClose });
};

/**
 * Manejador de errores de validación
 */
export const handleValidationError = (errors: Record<string, string>, context: string = 'Validación') => {
  const errorMessages = Object.entries(errors)
    .map(([field, message]) => `${field}: ${message}`)
    .join(', ');
  
  toast.error(`${context}: ${errorMessages}`);
};

/**
 * Manejador de errores de red
 */
export const handleNetworkError = (error: unknown, context: string = 'Conexión') => {
  return handleError(error, context, { 
    component: 'NetworkLayer',
    action: 'request'
  });
};

/**
 * Manejador de errores de autenticación
 */
export const handleAuthError = (error: unknown, context: string = 'Autenticación') => {
  return handleError(error, context, {
    component: 'AuthLayer',
    action: 'authenticate'
  });
};

/**
 * Utilidades para obtener información de errores
 */
export const getErrorStats = () => {
  const errors = errorStore.getErrors();
  const unresolved = errorStore.getUnresolvedErrors();
  
  return {
    total: errors.length,
    unresolved: unresolved.length,
    byType: errors.reduce((acc, error) => {
      acc[error.error.type] = (acc[error.error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySeverity: errors.reduce((acc, error) => {
      acc[error.error.severity] = (acc[error.error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
};

export const clearResolvedErrors = () => {
  const errors = errorStore.getErrors();
  errors.forEach(error => {
    if (error.resolved) {
      errorStore.markAsResolved(error.id);
    }
  });
};

// Manejador global de errores no capturados
window.addEventListener('error', (event) => {
  handleError(event.error, 'Error global no capturado', {
    component: 'GlobalErrorHandler',
    action: 'uncaughtError'
  });
});

window.addEventListener('unhandledrejection', (event) => {
  handleError(event.reason, 'Promise rechazada no manejada', {
    component: 'GlobalErrorHandler', 
    action: 'unhandledRejection'
  });
});

export default {
  handleError,
  handleSuccess,
  handleInfo,
  handleWarning,
  handleValidationError,
  handleNetworkError,
  handleAuthError,
  getErrorStats,
  clearResolvedErrors
};