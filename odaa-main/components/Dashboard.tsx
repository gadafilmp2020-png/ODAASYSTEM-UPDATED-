
import React, { useState, useRef } from 'react';
import { User, Transaction, Notification, PendingRegistration, P2PRequest, SystemSettings, VerificationRequest, ViewState, SystemBackup } from '../types';
import { 
  Users, Award, X, Wallet, UserPlus, Network, Zap, Camera, ScanFace, RotateCcw, 
  ArrowDownLeft, ArrowUpRight, ShoppingBag, Coins, Send, QrCode, CreditCard, 
  ShieldAlert, Activity, ArrowRightLeft
} from 'lucide-react';
import { CurrencyIcon } from './CurrencyIcon';
import { OTF_VALUE_ETB } from '../constants';
import { DynamicBackground } from './DynamicBackground';
import { AIAdvisor } from './AIAdvisor';
import { VerificationBadge } from './VerificationBadge';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  user: User;
  usersList: User[];
  transactions: Transaction[];
  notifications?: Notification[];
  onMarkRead?: () => void;
  onRequestRegistration?: (req: Omit<PendingRegistration, 'id' | 'date' | 'requestedBy'>) => void;
  p2pRequests?: P2PRequest[];
  onP2PRequest?: (req: any, targetUsername: string) => void;
  onP2PAction?: (id: string, action: 'APPROVE' | 'REJECT') => void;
  systemSettings: SystemSettings;
  onRequestVerification?: (req: VerificationRequest) => void;
  onTrade?: (userId: string, asset: 'HONEY' | 'COFFEE', amount: number) => void;
  onUpdateProfile?: (updates: Partial<User>) => void;
  onViewChange?: (view: ViewState) => void;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
  onReportPasswordReset?: (username: string) => void;
  onStartKYC?: () => void;
  onRestoreSystem?: (backup: SystemBackup) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, usersList, transactions, notifications = [], 
  onMarkRead, onRequestRegistration,
  p2pRequests = [], onP2PRequest, onP2PAction,
  systemSettings, onRequestVerification,
  onTrade, onUpdateProfile,
  onViewChange, theme, toggleTheme, onReportPasswordReset, onStartKYC,
  onRestoreSystem
}) => {
  const { t } = useLanguage();
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '', username: '', email: '', phoneNumber: '', password: '', confirmPassword: '', ftNumber: '', sponsorId: user.id,
    placementMode: 'AUTO' as 'AUTO' | 'MANUAL', manualParentUsername: '', manualLeg: 'LEFT' as 'LEFT' | 'RIGHT'
  });
  const [regError, setRegError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    
    if (regForm.name.trim().split(/\s+/).length < 3) { 
        setRegError("Please enter full name (First, Middle, and Grandfather's name)."); 
        return; 
    }
    if (regForm.password !== regForm.confirmPassword) { 
        setRegError("Passwords do not match."); 
        return; 
    }
    if (usersList.some(u => u.username.toLowerCase() === regForm.username.trim().toLowerCase())) { 
        setRegError("Username is already taken."); 
        return; 
    }

    if(onRequestRegistration) {
      const { confirmPassword, ...reqData } = regForm;
      onRequestRegistration(reqData);
      setShowRegModal(false);
      setRegForm({
        name: '', username: '', email: '', phoneNumber: '', password: '', confirmPassword: '', ftNumber: '', sponsorId: user.id,
        placementMode: 'AUTO', manualParentUsername: '', manualLeg: 'LEFT'
      });
    }
  };

  const handleRestoreFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target?.result as string);
            if (!json.metadata || !json.data) throw new Error("Invalid protocol format.");
            const challenge = window.prompt(`RESTORE SHORTCUT: Reload Backup v${json.metadata.version}?\n\nType 'RESTORE' to confirm:`);
            if (challenge === 'RESTORE') {
                if (onRestoreSystem) onRestoreSystem(json as SystemBackup);
                alert("Protocol Restored Successfully.");
                window.location.reload();
            }
        } catch (error: any) { alert(`Restore Error: ${error.message}`); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const stats = [
    { 
        label: t('availableOtf'), 
        value: `${user.balance.toLocaleString()}`, 
        unit: 'OTF', 
        icon: CurrencyIcon, 
        theme: { 
            bg: 'bg-lime-500/10', 
            border: 'border-lime-500/20', 
            text: 'text-brand-lime', 
            glow: 'group-hover:shadow-[0_0_30px_rgba(132,204,22,0.15)]' 
        } 
    },
    { 
        label: t('valueEtb'), 
        value: `${(user.balance * OTF_VALUE_ETB).toLocaleString()}`, 
        unit: 'ETB', 
        icon: Wallet, 
        theme: { 
            bg: 'bg-cyan-500/10', 
            border: 'border-cyan-500/20', 
            text: 'text-cyan-400', 
            glow: 'group-hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]' 
        } 
    },
    { 
        label: t('directNodes'), 
        value: user.downlineCount, 
        unit: 'People', 
        icon: Users, 
        theme: { 
            bg: 'bg-emerald-500/10', 
            border: 'border-emerald-500/20', 
            text: 'text-emerald-400', 
            glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
        } 
    },
    { 
        label: t('networkRank'), 
        value: user.rank, 
        unit: '', 
        icon: Award, 
        theme: { 
            bg: 'bg-amber-500/10', 
            border: 'border-amber-500/20', 
            text: 'text-amber-400', 
            glow: 'group-hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]' 
        } 
    },
  ];

  const row1Actions = [
    { label: t('deposit'), icon: ArrowDownLeft, view: 'WALLET', style: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' },
    { label: t('withdraw'), icon: ArrowUpRight, view: 'WALLET', style: 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' },
    { label: t('buy'), icon: ShoppingBag, view: 'MARKETPLACE', style: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20' },
    { label: t('sell'), icon: Coins, view: 'MARKETPLACE', style: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' },
    { label: t('send'), icon: Send, view: 'WALLET', style: 'bg-lime-500/10 border-lime-500/20 text-lime-400 hover:bg-lime-500/20' },
    { label: t('receive'), icon: QrCode, view: 'WALLET', style: 'bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20' },
  ];

  const row2Nav = [
    { label: t('wallet'), icon: CreditCard, view: 'WALLET', style: 'bg-blue-500/5 border-blue-500/10 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30' },
    { label: t('marketplace'), icon: ArrowRightLeft, view: 'MARKETPLACE', style: 'bg-teal-500/5 border-teal-500/10 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/30' },
    { label: t('team'), icon: Users, view: 'TEAM', style: 'bg-indigo-500/5 border-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30' },
    { label: t('genealogy'), icon: Network, view: 'GENEALOGY', style: 'bg-purple-500/5 border-purple-500/10 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/30' },
    { label: t('register'), icon: UserPlus, view: 'REGISTER', style: 'bg-lime-500/5 border-lime-500/10 text-lime-400 hover:bg-lime-500/10 hover:border-lime-500/30' },
    { label: t('security'), icon: ShieldAlert, view: 'SECURITY', style: 'bg-orange-500/5 border-orange-500/10 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/30' },
  ];

  return (
    <div className="relative pb-24 min-h-screen bg-brand-dark">
      {/* Sleek Deep Background with Grid */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,#111,black)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px] opacity-10"></div>
      </div>

      <div className="relative z-10 space-y-12 p-6 md:p-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-8 animate-fade-in">
            <div className="flex items-center gap-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-brand-lime/30 p-2 bg-brand-surface shadow-2xl relative overflow-hidden">
                        <img src={user.avatarUrl || user.avatar} alt="Profile" className="w-full h-full rounded-[1.8rem] object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera size={32} className="text-white"/>
                        </div>
                    </div>
                    {user.kycStatus === 'VERIFIED' && (
                        <div className="absolute -bottom-2 -right-2 bg-brand-dark rounded-full p-1 border border-brand-lime/20 shadow-glow-lime">
                            <VerificationBadge size={36} />
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onUpdateProfile) {
                            const reader = new FileReader();
                            reader.onloadend = () => onUpdateProfile({ avatarUrl: reader.result as string });
                            reader.readAsDataURL(file);
                        }
                    }} />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl md:text-5xl font-black text-white font-tech uppercase tracking-tighter">{t('welcome')} <span className="text-brand-lime">Back</span></h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-[10px] font-black uppercase tracking-widest">Active Member</div>
                        <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest">@{user.username}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Global Analytics - MODIFIED STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
                <div 
                    key={idx} 
                    className={`relative p-1 rounded-[2.5rem] group hover:scale-[1.02] transition-transform duration-500 animate-fade-in-up cursor-default`} 
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    <div className={`absolute inset-0 bg-slate-900 rounded-[2.5rem] border ${stat.theme.border} ${stat.theme.glow} transition-all duration-500 opacity-80 backdrop-blur-xl`}></div>
                    <div className="relative p-6 h-full flex flex-col justify-between z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3.5 rounded-2xl ${stat.theme.bg} ${stat.theme.text} border ${stat.theme.border} shadow-inner`}>
                                <stat.icon size={22} />
                            </div>
                            <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${stat.theme.border} ${stat.theme.text} bg-black/40`}>
                                LIVE
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.25em] mb-1.5">{stat.label}</p>
                            <div className="flex items-baseline gap-1.5">
                                <h3 className={`text-2xl md:text-3xl font-black text-white font-tech tracking-tighter`}>
                                    {stat.value}
                                </h3>
                                {stat.unit && <span className={`text-[10px] font-bold ${stat.theme.text} font-mono uppercase opacity-80`}>{stat.unit}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* COMMAND CENTER: 2-ROW GRID */}
        <div className="space-y-6">
            <div className="flex items-center gap-4 px-2">
                <Zap size={18} className="text-brand-lime" />
                <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Quick Actions</h2>
            </div>

            {/* Row 1: Financial Pulsations - COLORED BUTTONS */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                {row1Actions.map((btn, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => onViewChange?.(btn.view as ViewState)}
                        className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group hover:-translate-y-1 animate-fade-in-up ${btn.style}`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                            <btn.icon size={24} />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest font-tech text-center opacity-90 group-hover:opacity-100">{btn.label}</span>
                        {idx === 0 && <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-current animate-ping"></div>}
                    </button>
                ))}
            </div>

            {/* Row 2: System Architecture - DISTINCT THEMES */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                {row2Nav.map((btn, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => onViewChange?.(btn.view as ViewState)}
                        className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2.5rem] border transition-all duration-500 group hover:-translate-y-1 animate-fade-in-up ${btn.style}`}
                        style={{ animationDelay: `${(idx + 6) * 50}ms` }}
                    >
                        <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/5 group-hover:scale-110 transition-all duration-500 shadow-inner">
                            <btn.icon size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-tech text-center opacity-80 group-hover:opacity-100 transition-colors">{btn.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* AI & Utilities Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
                <AIAdvisor user={user} recentTransactions={transactions} />
            </div>
            <div className="flex flex-col gap-6">
                 <button onClick={onStartKYC} className="member-action-btn !flex-row !justify-start !p-8 !rounded-[3rem] bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40">
                    <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400"><ScanFace size={28}/></div>
                    <div className="text-left ml-4">
                        <span className="block font-black text-white text-sm font-tech uppercase tracking-wide">Secure Biometrics</span>
                        <span className="text-[10px] text-slate-500 font-mono">KYC AUTHENTICATION</span>
                    </div>
                 </button>
                 <button onClick={() => restoreInputRef.current?.click()} className="member-action-btn !flex-row !justify-start !p-8 !rounded-[3rem] bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40">
                    <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400"><RotateCcw size={28}/></div>
                    <div className="text-left ml-4">
                        <span className="block font-black text-white text-sm font-tech uppercase tracking-wide">Legacy Sync</span>
                        <span className="text-[10px] text-slate-500 font-mono">{t('resetProtocol')}</span>
                    </div>
                    <input type="file" ref={restoreInputRef} className="hidden" accept=".json" onChange={handleRestoreFile} />
                 </button>
                 <div className="p-8 bg-brand-surface/40 border border-white/5 rounded-[3rem] flex items-center justify-between group">
                    <div className="space-y-1">
                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Protocol Signal</p>
                        <p className="text-xs text-brand-lime font-mono font-bold">STABLE_GRID</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-brand-lime/20 flex items-center justify-center">
                        <Activity size={20} className="text-brand-lime animate-pulse" />
                    </div>
                 </div>
            </div>
        </div>

        {/* Registration Modal (Legacy Ported) */}
        {showRegModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
                <div className="widget-card-2025 rounded-[3rem] w-full max-w-lg shadow-2xl animate-scale-in border-brand-lime/20 max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/20 sticky top-0 z-20 backdrop-blur-md">
                        <h2 className="text-2xl font-black text-white font-tech uppercase flex items-center gap-4"><UserPlus size={24} className="text-brand-lime"/> Register Member</h2>
                        <button onClick={() => setShowRegModal(false)} className="text-slate-500 hover:text-white transition-colors"><X size={28}/></button>
                    </div>
                    <form onSubmit={handleRegSubmit} className="p-10 space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4">Full Legal Name</label>
                            <input required className="tech-input-new" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} placeholder="First Middle Last" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4">Username</label><input required className="tech-input-new" value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})} placeholder="username" /></div>
                            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4">Phone Number</label><input required className="tech-input-new" value={regForm.phoneNumber} onChange={e => setRegForm({...regForm, phoneNumber: e.target.value})} placeholder="+251..." /></div>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4">Email Address</label><input required type="email" className="tech-input-new" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} placeholder="email@example.com" /></div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4">Password</label><input required type="password" className="tech-input-new" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} placeholder="••••••••" /></div>
                            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4">Confirm Password</label><input required type="password" className="tech-input-new" value={regForm.confirmPassword} onChange={e => setRegForm({...regForm, confirmPassword: e.target.value})} placeholder="••••••••" /></div>
                        </div>
                        
                        <div className="space-y-6 pt-4 border-t border-white/5">
                            <h3 className="text-xs font-black text-slate-400 font-tech uppercase tracking-[0.4em]">Placement Strategy</h3>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setRegForm({...regForm, placementMode: 'AUTO'})} className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${regForm.placementMode === 'AUTO' ? 'bg-brand-lime text-black border-brand-lime shadow-glow-lime' : 'bg-black/40 border-white/5 text-slate-500 hover:text-white'}`}>Auto-Balance</button>
                                <button type="button" onClick={() => setRegForm({...regForm, placementMode: 'MANUAL'})} className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${regForm.placementMode === 'MANUAL' ? 'bg-brand-lime text-black border-brand-lime shadow-glow-lime' : 'bg-black/40 border-white/5 text-slate-500 hover:text-white'}`}>Manual Placement</button>
                            </div>
                            {regForm.placementMode === 'MANUAL' && (
                                <div className="grid grid-cols-2 gap-6 bg-black/60 p-6 rounded-[2rem] border border-white/5 animate-fade-in shadow-inner">
                                    <input className="tech-input-new !text-xs" value={regForm.manualParentUsername} onChange={e => setRegForm({...regForm, manualParentUsername: e.target.value})} placeholder="Parent Username" />
                                    <select className="tech-input-new !text-xs appearance-none" value={regForm.manualLeg} onChange={e => setRegForm({...regForm, manualLeg: e.target.value as any})}>
                                        <option value="LEFT">Left Leg</option>
                                        <option value="RIGHT">Right Leg</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-white/5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4">Transaction Reference (FT)</label>
                            <input required className="tech-input-new font-mono !py-5 text-lg text-brand-lime tracking-widest" value={regForm.ftNumber} onChange={e => setRegForm({...regForm, ftNumber: e.target.value})} placeholder="FT Number" />
                        </div>

                        {regError && <div className="p-5 rounded-3xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 text-center animate-bounce">{regError}</div>}
                        <button type="submit" className="w-full primary-gradient-new shadow-glow-lime hover:scale-[1.01] active:scale-95 transition-all text-xs">Complete Registration</button>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
