import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[var(--primary)]"></div>
      <p className="mt-4 text-[var(--muted-foreground)] text-lg">Crafting your custom roadmap...</p>
    </div>
  );
};

export default LoadingSpinner;