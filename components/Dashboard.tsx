import React, { useState, useMemo, useRef } from 'react';
import { User, Transaction, Notification, PendingRegistration, P2PRequest, SystemSettings, VerificationRequest } from '../types';
import { Users, Award, Bell, AlertTriangle, X, Wallet, Info, CheckCircle2, ScanFace, UserPlus, Network, Search, GitBranch, Zap, Hexagon, Coffee, BarChart2, Link as LinkIcon, Copy, ChevronRight, Camera, Edit2, Loader2, KeyRound } from 'lucide-react';
import { CurrencyIcon } from './CurrencyIcon';
import { OTF_VALUE_ETB } from '../constants';
import { DynamicBackground } from './DynamicBackground';
import { AIAdvisor } from './AIAdvisor';

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
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, usersList, transactions, notifications = [], 
  onMarkRead, onRequestRegistration,
  p2pRequests = [], onP2PRequest, onP2PAction,
  systemSettings, onRequestVerification,
  onTrade, onUpdateProfile
}) => {
  const [showRegModal, setShowRegModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  
  const [regForm, setRegForm] = useState({
    name: '', username: '', email: '', phoneNumber: '', password: '', confirmPassword: '', ftNumber: '', sponsorId: user.id,
    placementMode: 'AUTO' as 'AUTO' | 'MANUAL', manualParentUsername: '', manualLeg: 'LEFT' as 'LEFT' | 'RIGHT'
  });
  const [regError, setRegError] = useState('');

  const [copiedLink, setCopiedLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCopyLink = () => {
      const link = `https://odaasystem.com/ref/${user.username}`;
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
  };

  const stats = [
    { label: 'Available OTF', value: `${user.balance.toLocaleString()}`, unit: 'OTF', icon: CurrencyIcon, color: 'text-cyan-400' },
    { label: 'Value (ETB)', value: `${(user.balance * OTF_VALUE_ETB).toLocaleString()}`, unit: 'ETB', icon: Wallet, color: 'text-violet-400' },
    { label: 'Direct Nodes', value: user.downlineCount, unit: 'Nodes', icon: Users, color: 'text-emerald-400' },
    { label: 'Network Rank', value: user.rank, unit: 'Rank', icon: Award, color: 'text-amber-400' },
  ];

  return (
    <div className="relative pb-20 rounded-3xl overflow-hidden min-h-[90vh]">
      <DynamicBackground user={user} transactions={transactions} />

      <div className="relative z-10 space-y-8 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 animate-fade-in">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full border-2 border-cyan-500/50 p-1 bg-slate-900 shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                     <img src={user.avatarUrl || user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={20} className="text-white"/></div>
                     <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file && onUpdateProfile) {
                             const reader = new FileReader();
                             reader.onloadend = () => onUpdateProfile({ avatarUrl: reader.result as string });
                             reader.readAsDataURL(file);
                         }
                     }} />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-white font-tech uppercase tracking-tighter">NODE <span className="text-cyan-400">ESTABLISHED</span></h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/30 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 uppercase">Active Identity</span>
                        <span className="text-[10px] text-slate-500 font-mono">@{user.username}</span>
                    </div>
                </div>
            </div>

            <button onClick={handleCopyLink} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3 group hover:border-cyan-500/50 transition-all">
                <div className="p-2 bg-slate-950 rounded-lg text-slate-500 group-hover:text-cyan-400"><LinkIcon size={16} /></div>
                <div className="text-left"><p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Affiliate Link</p><p className="text-xs text-cyan-400 font-mono truncate max-w-[150px]">.../ref/{user.username}</p></div>
                {copiedLink ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Copy size={14} className="text-slate-600"/>}
            </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
                <div key={idx} className="widget-card p-5 rounded-2xl border border-white/5 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-tech">{stat.label}</p>
                        <stat.icon size={16} className={stat.color} />
                    </div>
                    <h3 className="text-2xl font-bold text-white font-tech">{stat.value}<span className="text-[10px] ml-1 text-slate-500">{stat.unit}</span></h3>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <AIAdvisor user={user} recentTransactions={transactions} />
            </div>
            <div className="space-y-4">
                 <button onClick={() => setShowRegModal(true)} className="w-full p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-4 group hover:border-cyan-500/30 transition-all text-left">
                    <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400"><UserPlus size={20}/></div>
                    <span className="font-bold text-white text-sm font-tech uppercase tracking-wide">Register Member</span>
                 </button>
                 <button onClick={() => setShowKYCModal(true)} className="w-full p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-4 group hover:border-violet-500/30 transition-all text-left">
                    <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400"><ScanFace size={20}/></div>
                    <span className="font-bold text-white text-sm font-tech uppercase tracking-wide">KYC Verification</span>
                 </button>
            </div>
        </div>

        {/* Registration Modal */}
        {showRegModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                <div className="widget-card rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in border border-cyan-500/20 max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-950/50 sticky top-0 z-20">
                        <h2 className="text-lg font-bold text-white font-tech uppercase flex items-center gap-2"><UserPlus size={18} className="text-cyan-400"/> New Registration Request</h2>
                        <button onClick={() => setShowRegModal(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
                    </div>
                    <form onSubmit={handleRegSubmit} className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name (First Middle Grandfather)</label>
                            <input required className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} placeholder="Full Legal Name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Username</label><input required className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none" value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})} /></div>
                            <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Phone</label><input required className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none" value={regForm.phoneNumber} onChange={e => setRegForm({...regForm, phoneNumber: e.target.value})} placeholder="+251..." /></div>
                        </div>
                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Email</label><input required type="email" className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Password</label><input required type="password" className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} /></div>
                            <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Confirm</label><input required type="password" className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none" value={regForm.confirmPassword} onChange={e => setRegForm({...regForm, confirmPassword: e.target.value})} /></div>
                        </div>
                        <div className="space-y-4 pt-2 border-t border-slate-800">
                            <h3 className="text-xs font-bold text-slate-400 font-tech uppercase">Binary Placement</h3>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setRegForm({...regForm, placementMode: 'AUTO'})} className={`flex-1 p-3 rounded-lg border text-[10px] font-bold uppercase transition-all ${regForm.placementMode === 'AUTO' ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>Auto-Balance</button>
                                <button type="button" onClick={() => setRegForm({...regForm, placementMode: 'MANUAL'})} className={`flex-1 p-3 rounded-lg border text-[10px] font-bold uppercase transition-all ${regForm.placementMode === 'MANUAL' ? 'bg-violet-900/20 border-violet-500 text-violet-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>Manual Choice</button>
                            </div>
                            {regForm.placementMode === 'MANUAL' && (
                                <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800 animate-fade-in">
                                    <input className="w-full px-3 py-2 rounded-lg tech-input text-xs outline-none" value={regForm.manualParentUsername} onChange={e => setRegForm({...regForm, manualParentUsername: e.target.value})} placeholder="Parent ID" />
                                    <select className="w-full px-3 py-2 rounded-lg tech-input text-xs outline-none" value={regForm.manualLeg} onChange={e => setRegForm({...regForm, manualLeg: e.target.value as any})}>
                                        <option value="LEFT">Left Leg</option>
                                        <option value="RIGHT">Right Leg</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Payment FT Number</label>
                            <input required className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none font-mono" value={regForm.ftNumber} onChange={e => setRegForm({...regForm, ftNumber: e.target.value})} placeholder="Bank Reference ID" />
                        </div>
                        {regError && <div className="p-3 rounded-lg bg-red-950/40 text-red-400 text-xs font-bold border border-red-500/20">{regError}</div>}
                        <button type="submit" className="w-full py-4 cyber-button-primary rounded-xl font-bold text-xs uppercase tracking-widest mt-2 shadow-lg">Submit Request</button>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
