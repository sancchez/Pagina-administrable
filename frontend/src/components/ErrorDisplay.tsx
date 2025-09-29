import React from 'react';
import { AlertCircle, RefreshCw, Wifi, Server, Shield, AlertTriangle } from 'lucide-react';
import { ErrorInfo, ErrorDisplayProps } from '../utils/errorHandler';

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  showRetryButton = true, 
  className = '' 
}) => {
  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return <Wifi className="w-12 h-12 text-red-500" />;
      case 'server':
        return <Server className="w-12 h-12 text-red-500" />;
      case 'validation':
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
      default:
        return <AlertCircle className="w-12 h-12 text-red-500" />;
    }
  };

  const getErrorEmoji = () => {
    switch (error.type) {
      case 'network':
        return '📡';
      case 'server':
        return '🔧';
      case 'validation':
        return '⚠️';
      default:
        return '😕';
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case 'network':
        return 'Problema de Conexión';
      case 'server':
        return 'Error del Servidor';
      case 'validation':
        return 'Error de Validación';
      default:
        return 'Oops!';
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className="text-center max-w-md mx-auto p-6">
        {/* Icono/Emoji */}
        <div className="mb-4">
          <div className="text-6xl mb-2">{getErrorEmoji()}</div>
          {getErrorIcon()}
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          {getErrorTitle()}
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-4">
          {error.message}
        </p>

        {/* Código de error si está disponible */}
        {error.code && (
          <p className="text-sm text-gray-500 mb-4">
            Código: {error.code}
          </p>
        )}

        {/* Botón de reintentar */}
        {showRetryButton && onRetry && (
          <button 
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar de nuevo
          </button>
        )}

        {/* Detalles adicionales en desarrollo */}
        {process.env.NODE_ENV === 'development' && error.details && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Detalles técnicos
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;