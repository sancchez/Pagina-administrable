import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
                        <h1 className="text-3xl font-bold text-red-600 mb-4">Algo salió mal</h1>
                        <p className="text-gray-600 mb-4">
                            La aplicación ha encontrado un error crítico y no puede continuar.
                        </p>
                        <div className="bg-gray-100 p-4 rounded overflow-auto mb-6 max-h-64">
                            <p className="font-mono text-sm text-red-500 font-bold mb-2">
                                {this.state.error?.toString()}
                            </p>
                            <pre className="font-mono text-xs text-gray-700 whitespace-pre-wrap">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Recargar Página
                        </button>
                        <a
                            href="/"
                            className="ml-4 text-blue-600 hover:underline"
                        >
                            Ir al Inicio
                        </a>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
