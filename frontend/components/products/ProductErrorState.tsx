import { AlertCircle, RefreshCw } from 'lucide-react';

interface ProductErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ProductErrorState: React.FC<ProductErrorStateProps> = ({
  error,
  onRetry,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="max-w-md mx-auto">
        <AlertCircle size={48} className="mx-auto text-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Unable to load product
        </h2>
        <p className="text-foreground/60 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors mx-auto"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
};