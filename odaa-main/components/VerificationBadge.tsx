import React from 'react';

export const VerificationBadge: React.FC<{ className?: string, size?: number }> = ({ className = "", size = 24 }) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${className}`} 
      style={{ width: size, height: size }}
      title="Verified Node"
    >
      {/* Outer Glow */}
      <div 
        className="absolute inset-0 bg-brand-lime rounded-full opacity-40 animate-pulse" 
        style={{ filter: `blur(${size / 4}px)` }}
      ></div>
      
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* White Background for contrast */}
        <circle cx="12" cy="12" r="10" fill="white" />
        
        {/* Lime Body */}
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          fill="#84cc16" 
          stroke="#3f6212"
          strokeWidth="1"
        />
        
        {/* Checkmark */}
        <path 
          d="M7.5 12L10 14.5L16.5 8" 
          stroke="#000" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </div>
  );
};