
import React from 'react';
import { Link } from 'react-router-dom';
import { OdaaLogo } from './OdaaLogo';
import { BrandingPattern } from './BrandingPattern';
import { ShieldCheck, TrendingUp, Users, ArrowRight, Activity, Zap, Globe, Lock } from 'lucide-react';

const Navbar: React.FC = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <OdaaLogo size={32} />
                    <span className="font-bold text-xl text-white font-tech tracking-widest">ODAA</span>
                </div>
                
                <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400 font-tech uppercase tracking-wide">
                    <a href="#features" className="hover:text-lime-400 transition-colors">Features</a>
                    <a href="#market" className="hover:text-lime-400 transition-colors">Market</a>
                    <a href="#security" className="hover:text-lime-400 transition-colors">Security</a>
                </div>

                <div className="flex items-center gap-4">
                     <Link to="/app" className="cyber-button px-6 py-2 rounded-lg text-xs font-bold uppercase text-white hover:text-lime-400 transition-all border border-lime-500/20 hover:border-lime-500">
                        Login / System
                     </Link>
                </div>
            </div>
        </nav>
    );
};

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, desc: string, delay: string }> = ({ icon: Icon, title, desc, delay }) => (
    <div className={`p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-lime-500/50 transition-all group animate-fade-in-up`} style={{ animationDelay: delay }}>
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-lime-900/20">
            <Icon size={24} className="text-slate-400 group-hover:text-lime-400 transition-colors" />
        </div>
        <h3 className="text-lg font-bold text-white font-tech uppercase mb-2 group-hover:text-lime-400 transition-colors">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
);

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-lime-500/30 selection:text-lime-200 font-sans">
            <Navbar />
            <BrandingPattern />

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-900/10 border border-lime-500/20 text-lime-400 text-[10px] font-bold uppercase tracking-widest mb-6 animate-fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse"></span>
                        Next Gen Network Marketing
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold text-white font-tech tracking-tight mb-6 animate-fade-in-up">
                        THE FUTURE OF <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500">DIGITAL WEALTH</span>
                    </h1>
                    
                    <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed animate-fade-in-up delay-100">
                        Odaa System combines advanced genealogy tracking, real-time wallet management, and AI-driven insights into a single, powerful platform for modern network marketers.
                    </p>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
                        <Link to="/app" className="cyber-button-primary px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center gap-2 group">
                            Launch Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                        </Link>
                        <a href="#features" className="px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white border border-slate-700 hover:border-white/20 transition-all bg-slate-900/50 backdrop-blur-sm">
                            Explore Features
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white font-tech uppercase mb-4">System Core Capabilities</h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-lime-500 to-emerald-500 mx-auto"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard 
                            icon={Users} 
                            title="Advanced Genealogy" 
                            desc="Visualize your entire network tree structure with real-time expansion tracking and binary leg balancing."
                            delay="0ms"
                        />
                        <FeatureCard 
                            icon={TrendingUp} 
                            title="P2P Trading Engine" 
                            desc="Seamless peer-to-peer asset transfers with secure transaction verification and instant settlement."
                            delay="100ms"
                        />
                        <FeatureCard 
                            icon={ShieldCheck} 
                            title="Bank-Grade Security" 
                            desc="Multi-layer encryption, device authorization protocols, and secure wallet architecture."
                            delay="200ms"
                        />
                        <FeatureCard 
                            icon={Zap} 
                            title="Instant Commissions" 
                            desc="Automated payout logic for direct referrals, binary matching, and level income bonuses."
                            delay="300ms"
                        />
                         <FeatureCard 
                            icon={Globe} 
                            title="Global Access" 
                            desc="Manage your business from anywhere in the world with a responsive, mobile-first dashboard."
                            delay="400ms"
                        />
                        <FeatureCard 
                            icon={Activity} 
                            title="AI Business Insights" 
                            desc="Integrated Gemini AI analyzes your performance and suggests actionable growth strategies."
                            delay="500ms"
                        />
                    </div>
                </div>
            </section>

            {/* Market Section */}
            <section id="market" className="py-20 px-6 relative z-10 border-t border-white/5 bg-slate-900/20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                     <div className="flex-1 space-y-6">
                         <h2 className="text-3xl font-bold text-white font-tech uppercase">Live Commodity Exchange</h2>
                         <p className="text-slate-400 leading-relaxed">
                             Participate in our unique internal market. Trade between <strong className="text-amber-400">Honey</strong> and <strong className="text-orange-500">Coffee</strong> assets using Odaa Token (OTF). Our proprietary algorithm ensures dynamic value adjustment based on community investment flow.
                         </p>
                         <ul className="space-y-3">
                             <li className="flex items-center gap-3 text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-lime-500 rounded-full"></div> Real-time value updates</li>
                             <li className="flex items-center gap-3 text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-lime-500 rounded-full"></div> 0.25% System Commission Bid</li>
                             <li className="flex items-center gap-3 text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-lime-500 rounded-full"></div> Instant Execution</li>
                         </ul>
                     </div>
                     <div className="flex-1 relative">
                         <div className="absolute inset-0 bg-gradient-to-r from-lime-500/20 to-emerald-500/20 blur-3xl rounded-full"></div>
                         <div className="relative z-10 bg-slate-900/80 border border-slate-700 rounded-2xl p-8 backdrop-blur-xl">
                             <div className="flex justify-between items-center mb-6">
                                 <h3 className="text-white font-bold uppercase">Market Status</h3>
                                 <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-1 rounded border border-emerald-900 uppercase font-bold animate-pulse">Live</span>
                             </div>
                             <div className="space-y-4">
                                 <div className="flex justify-between items-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded bg-amber-900/20 flex items-center justify-center text-amber-500"><Lock size={16}/></div>
                                         <span className="text-sm font-bold text-slate-300">HONEY</span>
                                     </div>
                                     <span className="text-white font-mono font-bold">1.2500</span>
                                 </div>
                                 <div className="flex justify-between items-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded bg-orange-900/20 flex items-center justify-center text-orange-500"><Lock size={16}/></div>
                                         <span className="text-sm font-bold text-slate-300">COFFEE</span>
                                     </div>
                                     <span className="text-white font-mono font-bold">1.2500</span>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-slate-950 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <OdaaLogo size={24} />
                        <span className="font-bold text-white font-tech tracking-widest">ODAA SYSTEM</span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono uppercase">
                        © 2025 Odaa Network Systems. All rights reserved. Secured by AES-256.
                    </div>
                </div>
            </footer>
        </div>
    );
};
