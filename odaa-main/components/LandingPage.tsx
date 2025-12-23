
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OdaaLogo } from './OdaaLogo';
import { BrandingPattern } from './BrandingPattern';
import { FloatingCoinsBackground } from './FloatingCoinsBackground';
import { ShieldCheck, TrendingUp, Users, ArrowRight, Activity, Zap, Globe, Lock, Sun, Moon, CheckCircle2, Cpu, Sparkles, Hexagon, Network, Terminal, Coffee } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface LandingPageProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const Navbar: React.FC<LandingPageProps> = ({ theme, toggleTheme }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 py-4 shadow-2xl' : 'bg-transparent py-8'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center gap-4 group">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl group-hover:border-lime-500/50 transition-all duration-500 shadow-lg">
                        <OdaaLogo size={36} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-2xl text-slate-900 dark:text-white font-brand tracking-[0.1em] uppercase leading-none">ODAA</span>
                        <span className="text-[10px] text-lime-600 dark:text-lime-500 font-bold tracking-[0.4em] uppercase opacity-70 font-tech">Protocol</span>
                    </div>
                </div>
                
                <div className="hidden lg:flex items-center gap-10 text-[10px] font-bold text-slate-500 dark:text-slate-400 font-tech uppercase tracking-[0.3em]">
                    <a href="#infrastructure" className="hover:text-slate-900 dark:hover:text-white transition-colors relative group">
                        Infrastructure
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-lime-500 transition-all group-hover:w-full"></span>
                    </a>
                    <a href="#exchange" className="hover:text-slate-900 dark:hover:text-white transition-colors relative group">
                        Exchange
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-cyan-500 transition-all group-hover:w-full"></span>
                    </a>
                    <a href="#security" className="hover:text-slate-900 dark:hover:text-white transition-colors relative group">
                        Security
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-500 transition-all group-hover:w-full"></span>
                    </a>
                </div>

                <div className="flex items-center gap-4">
                     <LanguageSelector minimal={true} />
                     <button 
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
                        aria-label="Toggle Theme"
                     >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                     </button>
                     <Link to="/app" className="relative px-8 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] text-white dark:text-black bg-slate-900 dark:bg-lime-400 hover:bg-slate-800 dark:hover:bg-white hover:scale-105 transition-all shadow-xl flex items-center gap-3 overflow-hidden group font-tech">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <Terminal size={14} /> System Access
                     </Link>
                </div>
            </div>
        </nav>
    );
};

const InfrastructureWidget = () => (
    <div className="p-8 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex justify-between items-start mb-12">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-lime-600 dark:text-lime-400 group-hover:shadow-[0_0_20px_rgba(163,230,53,0.2)] transition-all">
                    <Activity size={28} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-tech">Pulse Monitor</p>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white font-tech">Global Grid</h4>
                </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest font-tech">Live Sync</span>
            </div>
        </div>
        
        <div className="space-y-6">
            <div className="p-6 bg-slate-50/80 dark:bg-black/40 rounded-3xl border border-slate-100 dark:border-white/5 flex justify-between items-center group-hover:border-lime-500/20 transition-all">
                <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1 font-tech">Network Capacity</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white font-tech tracking-tighter">18.4M <span className="text-xs text-slate-400 font-normal">NODES</span></p>
                </div>
                <TrendingUp className="text-emerald-500" size={20} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50/80 dark:bg-black/40 rounded-3xl border border-slate-100 dark:border-white/5">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1 font-tech">Latency</p>
                    <p className="text-xl font-bold text-lime-600 dark:text-lime-400 font-tech">14ms</p>
                </div>
                <div className="p-5 bg-slate-50/80 dark:bg-black/40 rounded-3xl border border-slate-100 dark:border-white/5">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1 font-tech">Security</p>
                    <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 font-tech">L5</p>
                </div>
            </div>
        </div>
    </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ theme, toggleTheme }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-lime-500/30 selection:text-lime-800 dark:selection:text-lime-200 overflow-x-hidden transition-colors duration-700">
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <BrandingPattern />
            <FloatingCoinsBackground />

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col justify-center px-6 pt-20">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-20 items-center relative z-10">
                    <div className="lg:col-span-7 space-y-10 animate-fade-in">
                        <div className="inline-flex items-center gap-4 px-5 py-2 rounded-full bg-slate-200/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-sm">
                            <Sparkles size={14} className="text-lime-600 dark:text-lime-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-[0.3em] font-tech">
                                The Apex of Network Intelligence & Prosperity
                            </span>
                        </div>
                        
                        <h1 className="text-7xl md:text-[9rem] font-bold text-slate-900 dark:text-white font-brand tracking-[-0.05em] leading-[0.85]">
                            CRYPTO <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-600 via-emerald-600 to-cyan-600 dark:from-lime-400 dark:via-emerald-400 dark:to-cyan-400 animate-shimmer bg-[length:200%_100%] uppercase italic">Evolved.</span>
                        </h1>
                        
                        <p className="max-w-xl text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light pl-2 border-l border-slate-200 dark:border-white/10">
                            Orchestrate your financial future with a platform built for algorithmic sovereignty. High-frequency network mapping meets real-time commodity settlement.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6 pl-2">
                            <Link to="/app" className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 group shadow-2xl hover:shadow-lime-500/20 hover:translate-y-[-4px] transition-all font-tech">
                                Initialize Uplink <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500"/>
                            </Link>
                            <a href="#infrastructure" className="px-10 py-5 rounded-3xl text-[11px] font-bold uppercase tracking-[0.3em] text-slate-600 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all backdrop-blur-sm font-tech">
                                Explore Core
                            </a>
                        </div>
                    </div>

                    <div className="lg:col-span-5 hidden lg:block animate-scale-in delay-500">
                         <div className="relative group">
                             <div className="absolute inset-0 bg-lime-500/10 dark:bg-lime-500/20 rounded-[4rem] blur-[100px] animate-pulse-glow group-hover:scale-110 transition-transform duration-1000"></div>
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] animate-slow-pulse"></div>
                             
                             <div className="relative transform rotate-2 group-hover:rotate-0 transition-transform duration-700">
                                 <InfrastructureWidget />
                             </div>
                             
                             <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl rounded-full flex items-center justify-center animate-bounce duration-[4000ms] shadow-lg">
                                <Network size={32} className="text-lime-600 dark:text-lime-400" />
                             </div>
                             <div className="absolute -bottom-8 -left-8 px-6 py-3 bg-white dark:bg-black border border-slate-200 dark:border-white/20 backdrop-blur-xl rounded-2xl flex items-center gap-3 animate-float shadow-2xl">
                                <Hexagon size={20} className="text-cyan-600 dark:text-cyan-400 animate-spin-slow" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 font-tech">Protocol v3.1</span>
                             </div>
                         </div>
                    </div>
                </div>
                
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-fade-in opacity-40">
                    <span className="text-[9px] uppercase tracking-[0.5em] font-tech text-slate-500 dark:text-white">Scroll to Explore</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-lime-500 to-transparent"></div>
                </div>
            </section>

            {/* Core Stats Section */}
            <section className="py-32 px-6 bg-slate-100/50 dark:bg-white/[0.02] border-y border-slate-200 dark:border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                    {[
                        { label: 'Total Volume', val: '42.8M', unit: 'OTF', icon: Zap, color: 'text-lime-600 dark:text-lime-400' },
                        { label: 'Network Uptime', val: '99.99', unit: '%', icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400' },
                        { label: 'Asset Clusters', val: '8,412', unit: 'Nodes', icon: Network, color: 'text-cyan-600 dark:text-cyan-400' },
                        { label: 'TX Velocity', val: '0.04s', unit: 'Sync', icon: Activity, color: 'text-violet-600 dark:text-violet-400' }
                    ].map((stat, i) => (
                        <div key={i} className="space-y-3 group text-center lg:text-left">
                            <div className={`w-12 h-12 mx-auto lg:mx-0 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                <stat.icon size={24} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-tech">{stat.label}</p>
                            <h3 className="text-4xl font-bold text-slate-900 dark:text-white font-tech tracking-tighter">
                                {stat.val}<span className="text-sm font-normal text-slate-400 dark:text-slate-600 ml-1">{stat.unit}</span>
                            </h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* Exchange Section */}
            <section id="exchange" className="py-40 px-6 relative">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="order-2 lg:order-1 relative">
                        <div className="absolute inset-0 bg-cyan-500/5 dark:bg-cyan-500/10 blur-[100px] rounded-full"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {[
                                { asset: 'Honey Index', rate: '1.2504', change: '+2.4%', icon: Sparkles, color: 'text-amber-600 dark:text-amber-400' },
                                { asset: 'Coffee Index', rate: '1.4211', change: '+1.8%', icon: Coffee, color: 'text-orange-600 dark:text-orange-400' }
                            ].map((item, i) => (
                                <div key={i} className="p-8 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 backdrop-blur-xl hover:border-lime-500/30 transition-all group cursor-pointer shadow-xl">
                                    <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-black border border-slate-100 dark:border-white/10 flex items-center justify-center mb-6 ${item.color} group-hover:scale-110 transition-transform duration-500`}>
                                        <item.icon size={28} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white font-tech uppercase mb-1">{item.asset}</h4>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-6">Asset-OTF Bridge</p>
                                    <div className="flex justify-between items-end">
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{item.rate}</p>
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.change}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="order-1 lg:order-2 space-y-10">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-widest font-tech">
                            <Globe size={12} /> Elastic Liquidity
                        </div>
                        <h2 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white font-brand uppercase leading-[0.9] tracking-tighter">
                            Synthetic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500">Asset Engine</span>
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                            Harness the volatility of global markets within a secure internal ecosystem. Trade physical commodity indices against the Odaa Protocol with sub-millisecond execution.
                        </p>
                        <ul className="space-y-6">
                            {[
                                { t: 'Instant Asset Settlement', d: 'Verified on-grid settlement in < 2 seconds.' },
                                { t: 'Ultra-Low Commission', d: 'Fixed 0.25% system bid across all indices.' },
                                { t: 'Infinite Liquidity Depth', d: 'Recursive fund pools ensure zero slippage.' }
                            ].map((li, i) => (
                                <li key={i} className="flex gap-5 group">
                                    <div className="w-6 h-6 rounded-full border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white dark:group-hover:text-black transition-all shrink-0 mt-1">
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <div>
                                        <h5 className="text-slate-900 dark:text-white font-bold uppercase text-xs tracking-widest mb-1 font-tech">{li.t}</h5>
                                        <p className="text-sm text-slate-500">{li.d}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-black relative z-10 overflow-hidden transition-colors duration-700">
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-lime-500/5 rounded-full blur-[150px] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 items-center gap-12 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3">
                            <OdaaLogo size={40} pulse />
                            <span className="font-bold text-2xl text-slate-900 dark:text-white font-brand tracking-[0.1em] uppercase">ODAA</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.4em] mt-1 pl-1">Protocol Foundation 2026</p>
                    </div>
                    
                    <div className="flex justify-center gap-10 text-[10px] font-bold text-slate-500 font-tech uppercase tracking-[0.3em]">
                        <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terminals</a>
                        <a href="#" className="hover:text-white dark:hover:text-white transition-colors">Whitepaper</a>
                        <a href="#" className="hover:text-white dark:hover:text-white transition-colors">Security</a>
                    </div>
                    
                    <div className="flex flex-col items-center md:items-end gap-2">
                        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Encrypted Tunnel Active</div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em] font-tech">AES-256 Verified Session</span>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-100 dark:border-white/5 text-[9px] text-slate-400 dark:text-slate-700 font-mono text-center uppercase tracking-[0.5em]">
                    © ODAA GLOBAL SYSTEMS. ALL RIGHTS RESERVED. UNAUTHORIZED ACCESS IS LOGGED.
                </div>
            </footer>
        </div>
    );
};
