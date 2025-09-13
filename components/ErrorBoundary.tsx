// Componente Error Boundary para capturar errores en la aplicación
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualizar el estado para mostrar la UI de error
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log del error para debugging
    console.error('Error capturado por ErrorBoundary:', error);
    console.error('Información adicional del error:', errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // UI de error personalizada
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="max-w-md w-full mx-4">
            <div className="bg-red-900/20 border border-red-600 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h1 className="text-xl font-bold text-red-400 mb-2">
                ¡Oops! Algo salió mal
              </h1>

              <p className="text-gray-300 mb-6 text-sm">
                Ha ocurrido un error inesperado. Esto puede deberse a problemas de conectividad o un error temporal.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Recargar página
                </button>

                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Ir al inicio
                </button>
              </div>

              {/* Información de debug (solo en desarrollo) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                    Información técnica (desarrollo)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-800 rounded text-xs font-mono text-gray-300 overflow-auto max-h-40">
                    <p className="font-semibold text-red-400">Error:</p>
                    <p className="mb-2">{this.state.error.message}</p>
                    <p className="font-semibold text-red-400">Stack:</p>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
