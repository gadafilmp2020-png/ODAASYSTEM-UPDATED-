
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, Check } from 'lucide-react';
import { Language } from '../types';

export const LanguageSelector: React.FC<{ className?: string, minimal?: boolean }> = ({ className = '', minimal = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English (US)', native: 'English' },
    { code: 'am', label: 'Amharic', native: 'አማርኛ' },
    { code: 'om', label: 'Oromo', native: 'Afaan Oromoo' }
  ];

  const currentLang = languages.find(l => l.code === language);

  return (
    <div className={`relative ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${minimal ? 'text-slate-500 hover:text-white' : 'bg-slate-900 border border-white/10 hover:border-brand-lime/50 text-slate-300'}`}
      >
        <Globe size={16} className={minimal ? '' : 'text-brand-lime'} />
        {!minimal && (
            <div className="text-left leading-none">
                <span className="block text-[10px] font-bold uppercase tracking-wider">{currentLang?.native}</span>
            </div>
        )}
      </button>

      {isOpen && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-950 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center justify-between group transition-colors"
                    >
                        <div>
                            <span className="block text-xs font-bold text-white group-hover:text-brand-lime">{lang.native}</span>
                            <span className="block text-[9px] text-slate-500 uppercase tracking-widest">{lang.label}</span>
                        </div>
                        {language === lang.code && <Check size={14} className="text-brand-lime" />}
                    </button>
                ))}
            </div>
        </>
      )}
    </div>
  );
};
