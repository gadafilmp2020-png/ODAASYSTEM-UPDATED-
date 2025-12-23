import React from 'react';
import { OdaaLogo } from './OdaaLogo';

export const BrandLoader: React.FC<{ label?: string }> = ({ label = "Initializing Core..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12">
      <div className="relative">
         <div className="absolute inset-[-20px] border border-lime-500/20 rounded-full animate-spin-slow"></div>
         <div className="absolute inset-[-10px] border border-cyan-500/10 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
         <OdaaLogo size={64} pulse />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-[10px] font-bold text-lime-500 uppercase tracking-[0.5em] font-tech animate-pulse">{label}</p>
        <div className="w-32 h-[1px] bg-slate-800 mx-auto overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lime-500 to-transparent w-1/2 animate-[shimmer_2s_infinite_linear]"></div>
        </div>
      </div>
    </div>
  );
};