import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// Tipos de estados de carga
export type LoadingStateType = 'loading' | 'error' | 'success' | 'idle';

// Configuración de tamaños
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const containerSizeClasses = {
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

// Props para el componente LoadingState
interface LoadingStateProps {
  state: LoadingStateType;
  size?: LoadingSize;
  message?: string;
  error?: string | Error;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  inline?: boolean;
  showMessage?: boolean;
  children?: React.ReactNode;
  fullScreen?: boolean;
}

// Componente de spinner reutilizable
export const Spinner: React.FC<{
  size?: LoadingSize;
  className?: string;
  color?: string;
}> = ({ 
  size = 'md', 
  className = '', 
  color = 'text-blue-600' 
}) => (
  <Loader2 
    className={`${sizeClasses[size]} ${color} animate-spin ${className}`} 
  />
);

// Componente de error reutilizable
export const ErrorDisplay: React.FC<{
  error: string | Error;
  onRetry?: () => void;
  retryText?: string;
  size?: LoadingSize;
  className?: string;
}> = ({ 
  error, 
  onRetry, 
  retryText = 'Reintentar', 
  size = 'md',
  className = '' 
}) => {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return (
    <div className={`flex flex-col items-center justify-center text-center ${containerSizeClasses[size]} ${className}`}>
      <AlertCircle className={`${sizeClasses[size]} text-red-500 mb-2`} />
      <p className="text-red-600 mb-3 text-sm">{errorMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {retryText}
        </button>
      )}
    </div>
  );
};

// Componente principal LoadingState
export const LoadingState: React.FC<LoadingStateProps> = ({
  state,
  size = 'md',
  message,
  error,
  onRetry,
  retryText = 'Reintentar',
  className = '',
  inline = false,
  showMessage = true,
  children,
  fullScreen = false,
}) => {
  // Clases base según el tipo de display
  const baseClasses = inline 
    ? 'inline-flex items-center gap-2' 
    : 'flex flex-col items-center justify-center';
  
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-90 z-50'
    : containerSizeClasses[size];

  // Renderizar según el estado
  switch (state) {
    case 'loading':
      return (
        <div className={`${baseClasses} ${containerClasses} ${className}`}>
          <Spinner size={size} />
          {showMessage && message && (
            <span className="text-gray-600 text-sm ml-2">{message}</span>
          )}
        </div>
      );

    case 'error':
      if (inline) {
        return (
          <div className={`${baseClasses} ${className}`}>
            <AlertCircle className={`${sizeClasses[size]} text-red-500`} />
            {showMessage && (
              <span className="text-red-600 text-sm">
                {error instanceof Error ? error.message : error || 'Error'}
              </span>
            )}
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-red-600 hover:text-red-800 text-sm underline ml-2"
              >
                {retryText}
              </button>
            )}
          </div>
        );
      }
      
      return (
        <div className={`${containerClasses} ${className}`}>
          <ErrorDisplay
            error={error || 'Ha ocurrido un error'}
            onRetry={onRetry}
            retryText={retryText}
            size={size}
          />
        </div>
      );

    case 'success':
      return children ? <>{children}</> : null;

    case 'idle':
    default:
      return children ? <>{children}</> : null;
  }
};

// Hook personalizado para manejar estados de carga
export const useLoadingState = (initialState: LoadingStateType = 'idle') => {
  const [state, setState] = React.useState<LoadingStateType>(initialState);
  const [error, setError] = React.useState<string | Error | null>(null);

  const setLoading = React.useCallback(() => {
    setState('loading');
    setError(null);
  }, []);

  const setSuccess = React.useCallback(() => {
    setState('success');
    setError(null);
  }, []);

  const setErrorState = React.useCallback((error: string | Error) => {
    setState('error');
    setError(error);
  }, []);

  const setIdle = React.useCallback(() => {
    setState('idle');
    setError(null);
  }, []);

  const reset = React.useCallback(() => {
    setState('idle');
    setError(null);
  }, []);

  const execute = React.useCallback(async (asyncFunction: () => Promise<any>) => {
    try {
      setLoading();
      const result = await asyncFunction();
      setSuccess();
      return result;
    } catch (error) {
      setErrorState(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }, [setLoading, setSuccess, setErrorState]);

  return {
    state,
    error,
    isLoading: state === 'loading',
    isError: state === 'error',
    isSuccess: state === 'success',
    isIdle: state === 'idle',
    loading: state === 'loading', // Alias for compatibility
    setLoading,
    setSuccess,
    setError: setErrorState,
    setIdle,
    reset,
    execute,
  };
};

// Componente wrapper para operaciones asíncronas
export const AsyncWrapper: React.FC<{
  state: LoadingStateType;
  error?: string | Error;
  onRetry?: () => void;
  loadingMessage?: string;
  size?: LoadingSize;
  fullScreen?: boolean;
  children: React.ReactNode;
}> = ({
  state,
  error,
  onRetry,
  loadingMessage = 'Cargando...',
  size = 'md',
  fullScreen = false,
  children,
}) => {
  return (
    <LoadingState
      state={state}
      error={error}
      onRetry={onRetry}
      message={loadingMessage}
      size={size}
      fullScreen={fullScreen}
    >
      {children}
    </LoadingState>
  );
};

// Componente para botones con estado de carga
export const LoadingButton: React.FC<{
  loading: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  size?: LoadingSize;
  variant?: 'primary' | 'secondary' | 'danger';
}> = ({
  loading,
  disabled = false,
  onClick,
  children,
  className = '',
  size = 'sm',
  variant = 'primary',
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2 px-4 py-2 rounded-md
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading && <Spinner size={size} color="text-current" />}
      {children}
    </button>
  );
};

export default LoadingState;