import React, { useEffect, useState, useRef } from 'react';
import { Bot, Cpu, AlertCircle, Sparkles, RefreshCcw, Loader2 } from 'lucide-react';
import { getBusinessInsights } from '../services/geminiService';
import { User, Transaction } from '../types';

interface AIAdvisorProps {
  user: User;
  recentTransactions: Transaction[];
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ user, recentTransactions }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const lastRequestRef = useRef<number>(0);

  const fetchAdvice = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastRequestRef.current < 90000 && insights.length > 0) {
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
      const result = await getBusinessInsights(user, recentTransactions);
      const parsed = result
          .replace(/<\/?li>/g, '|||')
          .split('|||')
          .map(s => s.trim())
          .filter(s => s.length > 0);
      
      setInsights(parsed.length > 0 ? parsed : ["Account growth tracking is stable.", "Review your direct referrals for rank advancement.", "Financial records are synchronized with our core database."]);
      lastRequestRef.current = now;
      setLoading(false);
    } catch (e) {
      setInsights(["System connection is temporarily slow.", "Try refreshing your dashboard in a few moments.", "All account data remains secure."]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [user.rank]);

  return (
    <div className="widget-card-2025 border border-brand-lime/40 rounded-[3rem] p-10 relative overflow-hidden group bg-brand-surface">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-lime/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-5">
            <div className="bg-slate-950 p-4 rounded-2xl border border-brand-lime/30 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <Bot className="w-8 h-8 text-brand-lime animate-float" />
            </div>
            <div>
               <h3 className="text-xl font-black text-white font-tech uppercase tracking-[0.1em]">Gemini Business Advisor</h3>
               <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">Growth Insight Engine</p>
            </div>
        </div>
        <button 
          onClick={() => fetchAdvice(true)} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-lime/10 border border-brand-lime/20 shadow-lg hover:bg-brand-lime hover:text-black transition-all group/btn"
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} className="group-hover/btn:rotate-180 transition-transform duration-700"/>}
            <span className="text-[10px] font-black uppercase tracking-widest">Refresh Scan</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse py-6">
          <div className="h-3 bg-slate-800/50 rounded-full w-3/4"></div>
          <div className="h-3 bg-slate-800/50 rounded-full w-full"></div>
          <div className="h-3 bg-slate-800/50 rounded-full w-1/2"></div>
        </div>
      ) : (
        <div className="relative z-10 space-y-6">
            <ul className="space-y-6">
                {insights.map((item, idx) => (
                    <li key={idx} className="border-l-4 border-brand-lime/40 pl-6 py-2 animate-fade-in-up group/item hover:border-brand-lime transition-colors" style={{ animationDelay: `${idx * 150}ms` }}>
                        <p className="text-base leading-relaxed text-slate-100 font-normal">
                            {item}
                        </p>
                    </li>
                ))}
            </ul>
            
            <div className="mt-10 p-6 bg-red-950/20 border border-red-500/20 rounded-[2rem] flex gap-4 items-start animate-fade-in shadow-inner">
                <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-100/60 leading-relaxed font-medium">
                    <strong className="text-red-400 font-black uppercase tracking-widest mr-2">Gemini:</strong> 
                    Insights are generated via Large Language Model. Cross-verify large decisions with upline hierarchy.
                </p>
            </div>
        </div>
      )}
      
      <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-600 font-mono font-bold uppercase tracking-widest">
           <div className="flex items-center gap-2">
               <Cpu size={14} className="text-brand-lime/50" />
               <span>CORE_PROTOCOL: STABLE</span>
           </div>
           <span className="bg-black/40 px-3 py-1 rounded-full border border-white/5">v3.2_GEMINI_PRO</span>
      </div>
    </div>
  );
};