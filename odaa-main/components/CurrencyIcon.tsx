
import React from 'react';

export const CurrencyIcon: React.FC<{ className?: string, size?: number }> = ({ className = "", size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Coin Gold Gradient */}
        <linearGradient id="otfGoldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" /> {/* Light Gold */}
          <stop offset="40%" stopColor="#D97706" /> {/* Deep Gold */}
          <stop offset="100%" stopColor="#92400E" /> {/* Dark Bronze */}
        </linearGradient>
        
        {/* Berry Green Gradient */}
        <radialGradient id="otfBerryGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#86EFAC" /> {/* Light Green highlight */}
          <stop offset="100%" stopColor="#15803D" /> {/* Deep Green shadow */}
        </radialGradient>

        <filter id="otfEmboss" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="rgba(0,0,0,0.4)" />
        </filter>
      </defs>

      {/* 1. Coin Base (Reeded Edge Simulation via Stroke) */}
      <circle cx="50" cy="50" r="48" fill="url(#otfGoldGrad)" stroke="#78350F" strokeWidth="1" />
      
      {/* 2. Inner Rim */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="#FEF3C7" strokeWidth="1.5" opacity="0.6" />
      <circle cx="50" cy="50" r="38" fill="rgba(0,0,0,0.05)" />

      {/* 3. Center Cluster (5 Green Berries + Leaves) */}
      <g transform="translate(50, 42)">
          {/* Leaves (Behind) */}
          <path d="M-15 0 Q-25 -10 -20 -20 Q-10 -15 0 -10" fill="#166534" stroke="#D97706" strokeWidth="0.5" />
          <path d="M15 0 Q25 -10 20 -20 Q10 -15 0 -10" fill="#166534" stroke="#D97706" strokeWidth="0.5" />

          {/* Top Row Berries (3) */}
          <g filter="url(#otfEmboss)">
            <circle cx="-14" cy="-8" r="8" fill="url(#otfBerryGrad)" stroke="#F59E0B" strokeWidth="0.5" />
            <circle cx="14" cy="-8" r="8" fill="url(#otfBerryGrad)" stroke="#F59E0B" strokeWidth="0.5" />
            <circle cx="0" cy="-16" r="8" fill="url(#otfBerryGrad)" stroke="#F59E0B" strokeWidth="0.5" />
          </g>

          {/* Bottom Row Berries (2 - Larger) */}
          <g filter="url(#otfEmboss)">
            <circle cx="-9" cy="8" r="9" fill="url(#otfBerryGrad)" stroke="#F59E0B" strokeWidth="0.5" />
            <circle cx="9" cy="8" r="9" fill="url(#otfBerryGrad)" stroke="#F59E0B" strokeWidth="0.5" />
          </g>

          {/* Indentations/Highlights on Berries */}
          <circle cx="-16" cy="-10" r="1.5" fill="white" opacity="0.6" />
          <circle cx="12" cy="-10" r="1.5" fill="white" opacity="0.6" />
          <circle cx="-2" cy="-18" r="1.5" fill="white" opacity="0.6" />
          <circle cx="-11" cy="6" r="2" fill="white" opacity="0.6" />
          <circle cx="7" cy="6" r="2" fill="white" opacity="0.6" />
      </g>

      {/* 4. Text Engraving */}
      <g style={{ filter: 'drop-shadow(0px 1px 0px rgba(255,255,255,0.3))' }}>
        <text 
            x="50" 
            y="82" 
            fontSize="16" 
            fontWeight="900" 
            textAnchor="middle" 
            fill="#78350F" 
            fontFamily="Arial, sans-serif"
            letterSpacing="2"
        >
            OTF
        </text>
      </g>
    </svg>
  );
};
