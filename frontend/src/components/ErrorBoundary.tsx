import React, { Component, ReactNode } from 'react';
import { handleError } from '../utils/errorHandler';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  component?: string;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

/**
 * Componente ErrorBoundary específico para el editor visual
 * Integra con el sistema de manejo de errores mejorado
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('🚨 [ErrorBoundary] Component error caught:', error.message);
    
    try {
      // Usar el sistema de manejo de errores mejorado
      const errorId = await handleError(error, 'Component Render Error', {
        component: this.props.component || 'ErrorBoundary',
        action: 'render',
        userId: localStorage.getItem('userId') || undefined
      });

      this.setState({ errorId });

      // Llamar callback personalizado si existe
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }

      // Log adicional para desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.group('🐛 [ErrorBoundary] Component Stack');
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.groupEnd();
      }
    } catch (handlingError) {
      console.error('❌ [ErrorBoundary] Error while handling component error:', handlingError);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error si las props cambian (útil para componentes dinámicos del editor)
    if (this.props.resetOnPropsChange && 
        this.state.hasError && 
        prevProps.children !== this.props.children) {
      console.log('🔄 [ErrorBoundary] Resetting due to props change');
      this.handleReset();
    }
  }

  handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      console.warn('⚠️ [ErrorBoundary] Max retries reached');
      return;
    }

    console.log(`🔄 [ErrorBoundary] Retrying (${this.state.retryCount + 1}/${this.maxRetries})`);
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReset = () => {
    console.log('🔄 [ErrorBoundary] Resetting error state');
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      // Usar fallback personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto con opciones de recuperación
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h3>Algo salió mal en este componente</h3>
            <p className="error-message">
              {this.state.error?.message || 'Error desconocido'}
            </p>
            
            {this.state.errorId && (
              <p className="error-id">
                ID del error: <code>{this.state.errorId}</code>
              </p>
            )}

            <div className="error-actions">
              {this.state.retryCount < this.maxRetries && (
                <button 
                  onClick={this.handleRetry}
                  className="retry-button"
                >
                  🔄 Reintentar ({this.state.retryCount}/{this.maxRetries})
                </button>
              )}
              
              <button 
                onClick={this.handleReset}
                className="reset-button"
              >
                🔄 Reiniciar componente
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="reload-button"
              >
                🔄 Recargar página
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Detalles técnicos (desarrollo)</summary>
                <pre>{this.state.error?.stack}</pre>
              </details>
            )}
          </div>

          <style jsx>{`
            .error-boundary-container {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 200px;
              padding: 20px;
              background-color: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 8px;
              margin: 10px 0;
            }

            .error-boundary-content {
              text-align: center;
              max-width: 500px;
            }

            .error-icon {
              font-size: 48px;
              margin-bottom: 16px;
            }

            .error-message {
              color: #dc2626;
              margin: 12px 0;
              font-weight: 500;
            }

            .error-id {
              color: #6b7280;
              font-size: 12px;
              margin: 8px 0;
            }

            .error-id code {
              background-color: #f3f4f6;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: monospace;
            }

            .error-actions {
              display: flex;
              gap: 8px;
              justify-content: center;
              flex-wrap: wrap;
              margin: 16px 0;
            }

            .error-actions button {
              padding: 8px 16px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.2s;
            }

            .retry-button {
              background-color: #3b82f6;
              color: white;
            }

            .retry-button:hover {
              background-color: #2563eb;
            }

            .reset-button {
              background-color: #f59e0b;
              color: white;
            }

            .reset-button:hover {
              background-color: #d97706;
            }

            .reload-button {
              background-color: #6b7280;
              color: white;
            }

            .reload-button:hover {
              background-color: #4b5563;
            }

            .error-details {
              margin-top: 16px;
              text-align: left;
            }

            .error-details summary {
              cursor: pointer;
              color: #6b7280;
              font-size: 12px;
            }

            .error-details pre {
              background-color: #f3f4f6;
              padding: 12px;
              border-radius: 4px;
              overflow-x: auto;
              font-size: 11px;
              margin-top: 8px;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;