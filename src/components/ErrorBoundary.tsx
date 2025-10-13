import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-[400px] flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 m-4">
            <div className="text-center p-8">
              <div className="text-red-500 dark:text-red-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
                {this.props.componentName ? `Erreur dans ${this.props.componentName}` : 'Composant temporairement indisponible'}
              </h3>
              <p className="text-red-600 dark:text-red-400 text-sm">
                {this.state.error?.message || 'Une erreur est survenue lors du chargement de ce composant'}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-4">
                Cette fonctionnalité est en cours de développement
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}