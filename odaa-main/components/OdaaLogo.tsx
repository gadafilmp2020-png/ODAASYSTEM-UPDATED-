
import React from 'react';

interface OdaaLogoProps {
  className?: string;
  size?: number;
  monochrome?: boolean;
  pulse?: boolean;
  sigil?: boolean;
}

export const OdaaLogo: React.FC<OdaaLogoProps> = ({ 
  className = "", 
  size = 24, 
  monochrome = false,
  pulse = false,
  sigil = false
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${pulse ? 'animate-pulse' : ''}`}
    >
      <defs>
        <linearGradient id="logoGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#84cc16" /> {/* Lime 500 */}
          <stop offset="100%" stopColor="#15803d" /> {/* Green 700 */}
        </linearGradient>
        <linearGradient id="logoGreenInner" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#d9f99d" />
          <stop offset="100%" stopColor="#65a30d" />
        </linearGradient>
        <filter id="logoShadow">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.2)" />
        </filter>
      </defs>

      {/* Main Body */}
      <circle 
        cx="50" cy="50" r="48" 
        fill={monochrome ? "none" : "url(#logoGreen)"} 
        stroke={monochrome ? "currentColor" : "#365314"} 
        strokeWidth={monochrome ? "6" : "2"} 
      />
      
      {!monochrome && (
        <>
          <circle cx="50" cy="50" r="42" fill="none" stroke="#bef264" strokeWidth="1.5" opacity="0.5" />
          <circle cx="50" cy="50" r="38" fill="rgba(0,0,0,0.1)" />
        </>
      )}

      {/* The 5-Sphere Cluster Symbol */}
      <g transform="translate(50, 42)" fill={monochrome ? "currentColor" : "url(#logoGreenInner)"} stroke={monochrome ? "none" : "#3f6212"} strokeWidth="0.5" filter={!monochrome ? "url(#logoShadow)" : ""}>
          {/* Top 3 */}
          <circle cx="-14" cy="-9" r="8" />
          <circle cx="14" cy="-9" r="8" />
          <circle cx="0" cy="-17" r="8" />
          
          {/* Bottom 2 */}
          <circle cx="-9" cy="7" r="10" />
          <circle cx="9" cy="7" r="10" />
          
          {!monochrome && (
            <>
              {/* Highlights */}
              <circle cx="-16" cy="-11" r="2" fill="white" fillOpacity="0.7" stroke="none" />
              <circle cx="12" cy="-11" r="2" fill="white" fillOpacity="0.7" stroke="none" />
              <circle cx="-2" cy="-19" r="2" fill="white" fillOpacity="0.7" stroke="none" />
              <circle cx="-11" cy="5" r="2.5" fill="white" fillOpacity="0.7" stroke="none" />
              <circle cx="7" cy="5" r="2.5" fill="white" fillOpacity="0.7" stroke="none" />
            </>
          )}
      </g>

      {/* Text */}
      <g fill={monochrome ? "currentColor" : "#ecfccb"} style={{ fontFamily: 'Arial, sans-serif', fontWeight: 800, textAnchor: 'middle' }}>
         <text x="50" y="76" fontSize="13" letterSpacing="1" stroke={monochrome ? "none" : "#14532d"} strokeWidth="0.5">ODA</text>
         <text x="50" y="86" fontSize="8" letterSpacing="1.5" stroke={monochrome ? "none" : "#14532d"} strokeWidth="0.2">SYSTEM</text>
      </g>
    </svg>
  );
};
