import React from 'react';
import { AlertTriangleIcon } from './icons';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
  onReset: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 bg-[var(--card-background)] border border-red-500/30 rounded-lg">
      <AlertTriangleIcon className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-2xl font-bold text-red-400 mb-2">An Error Occurred</h3>
      <p className="text-[var(--card-foreground)] max-w-md mb-6">{message}</p>
      <div className="flex gap-4">
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-[var(--primary)] text-white font-semibold rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
        >
          Retry
        </button>
        <button
          onClick={onReset}
          className="px-6 py-2 bg-[var(--button-secondary-background)] text-[var(--foreground)] font-semibold rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;