import React from 'react';

export const BrandingPattern: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none bg-brand-dark dark:bg-brand-dark">
      {/* Strictly Neutral Grid Pattern - No Tint */}
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      
      {/* Dark Vignette only, no color */}
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/60 to-black"></div>
    </div>
  );
};