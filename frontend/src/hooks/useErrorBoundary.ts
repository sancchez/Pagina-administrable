import { useCallback, useState } from 'react';
import { handleError } from '../utils/errorHandler';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

interface UseErrorBoundaryReturn {
  errorState: ErrorBoundaryState;
  resetError: () => void;
  captureError: (error: Error, context?: string) => Promise<void>;
  retry: () => void;
}

/**
 * Hook personalizado para manejo de errores en componentes del editor
 * Proporciona funcionalidades de error boundary programático
 */
export const useErrorBoundary = (
  maxRetries: number = 3,
  component?: string
): UseErrorBoundaryReturn => {
  const [errorState, setErrorState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorId: null,
    retryCount: 0
  });

  const resetError = useCallback(() => {
    console.log('🔄 [useErrorBoundary] Resetting error state');
    setErrorState({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0
    });
  }, []);

  const captureError = useCallback(async (error: Error, context: string = 'Component Error') => {
    console.log('🚨 [useErrorBoundary] Capturing error:', error.message);
    
    try {
      const errorId = await handleError(error, context, {
        component: component || 'Unknown Component',
        action: 'render'
      });

      setErrorState(prev => ({
        hasError: true,
        error,
        errorId,
        retryCount: prev.retryCount
      }));
    } catch (handlingError) {
      console.error('❌ [useErrorBoundary] Error while handling error:', handlingError);
      
      // Fallback: establecer error sin ID
      setErrorState(prev => ({
        hasError: true,
        error,
        errorId: null,
        retryCount: prev.retryCount
      }));
    }
  }, [component]);

  const retry = useCallback(() => {
    if (errorState.retryCount >= maxRetries) {
      console.warn('⚠️ [useErrorBoundary] Max retries reached');
      return;
    }

    console.log(`🔄 [useErrorBoundary] Retrying (${errorState.retryCount + 1}/${maxRetries})`);
    
    setErrorState(prev => ({
      ...prev,
      hasError: false,
      retryCount: prev.retryCount + 1
    }));
  }, [errorState.retryCount, maxRetries]);

  return {
    errorState,
    resetError,
    captureError,
    retry
  };
};

export default useErrorBoundary;