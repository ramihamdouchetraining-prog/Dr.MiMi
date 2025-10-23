// Empty State Component - Shows when no results are found
import { Search, Filter, X, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: 'search' | 'filter' | 'empty' | 'error' | 'mimi';
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  title = "Aucun résultat trouvé",
  message = "Essayez de modifier vos filtres ou votre recherche",
  icon = 'mimi',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  
  const renderIcon = () => {
    switch (icon) {
      case 'search':
        return <Search className="w-16 h-16 text-gray-300" />;
      case 'filter':
        return <Filter className="w-16 h-16 text-gray-300" />;
      case 'empty':
        return <X className="w-16 h-16 text-gray-300" />;
      case 'error':
        return <span className="text-6xl">⚠️</span>;
      case 'mimi':
      default:
        return (
          <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-5xl">
            🤔
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="mb-6">
        {renderIcon()}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
        {title}
      </h3>

      {/* Message */}
      <p className="text-gray-600 text-center max-w-md mb-8">
        {message}
      </p>

      {/* Action Buttons */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              {actionLabel}
            </button>
          )}
          
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Loading Spinner Component
export function LoadingSpinner({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Spinner */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>

      {/* Message */}
      <p className="text-gray-600 font-medium text-center">
        {message}
      </p>

      {/* Optional Dr.MiMi hint */}
      <p className="mt-4 text-sm text-gray-400 text-center max-w-xs">
        Dr.MiMi prépare vos données...
      </p>
    </div>
  );
}

// Error State Component
export function ErrorState({ 
  title = "Une erreur est survenue",
  message = "Impossible de charger les données. Veuillez réessayer.",
  onRetry
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      message={message}
      icon="error"
      actionLabel="Réessayer"
      onAction={onRetry}
      secondaryActionLabel="Retour à l'accueil"
      onSecondaryAction={() => window.location.href = '/'}
    />
  );
}

export default EmptyState;
