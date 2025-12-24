
import React, { useState, useEffect } from 'react';
import { User, PendingRegistration, SystemSettings } from '../types';
import { AlertTriangle, Wallet, CheckCircle2, ShieldCheck, Fingerprint, Network, CreditCard, Landmark as BankIcon, User as UserIcon, Phone, Lock, Hash, AtSign, UserCircle, GitBranch, Loader2, Eye, EyeOff, Tag, Compass, Mail, Bitcoin, Copy, Smartphone } from 'lucide-react';
import { OTF_VALUE_ETB, COMPANY_CRYPTO_DETAILS } from '../constants';

interface MemberRegistrationProps {
  currentUser: User;
  usersList: User[];
  systemSettings: SystemSettings;
  isFTUsed?: (ft: string) => boolean;
  onRequestRegistration: (req: Omit<PendingRegistration, 'id' | 'date' | 'requestedBy'>) => void;
}

export const MemberRegistration: React.FC<MemberRegistrationProps> = ({ currentUser, usersList, systemSettings, isFTUsed, onRequestRegistration }) => {
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'BANK' | 'CRYPTO'>('BANK');
  const [regForm, setRegForm] = useState({
    name: '', username: '', email: '', phoneNumber: '', password: '', confirmPassword: '', ftNumber: '', sponsorId: currentUser.id,
    placementMode: 'AUTO' as 'AUTO' | 'MANUAL', manualParentUsername: '', manualLeg: 'LEFT' as 'LEFT' | 'RIGHT'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // joiningFee is now directly in OTF as per requirements
  const joiningFeeOTF = systemSettings.joiningFee;
  const joiningFeeETB = joiningFeeOTF * OTF_VALUE_ETB;
  const hasEnoughBalance = currentUser.balance >= joiningFeeOTF;

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setIsSubmitting(true);

    if (paymentMethod === 'WALLET' && !hasEnoughBalance) {
        setRegError(`Payment Error: Insufficient Wallet Balance.`);
        setIsSubmitting(false);
        return;
    }

    if ((paymentMethod === 'BANK' || paymentMethod === 'CRYPTO') && isFTUsed && isFTUsed(regForm.ftNumber)) {
        setRegError(`CRITICAL: Reference Number ${regForm.ftNumber} has already been registered.`);
        setIsSubmitting(false);
        return;
    }

    setTimeout(() => {
        if (regForm.password !== regForm.confirmPassword) { 
            setRegError("Error: Passwords do not match."); 
            setIsSubmitting(false);
            return; 
        }
        if (usersList.some(u => u.username.toLowerCase() === regForm.username.trim().toLowerCase())) { 
            setRegError("Error: This username is already taken."); 
            setIsSubmitting(false);
            return; 
        }

        if (regForm.placementMode === 'MANUAL' && !regForm.manualParentUsername) {
            setRegError("Error: Please provide a parent ID for manual placement.");
            setIsSubmitting(false);
            return;
        }

        const { confirmPassword, ...rest } = regForm;
        onRequestRegistration({ 
            ...rest, 
            paymentMethod,
            ftNumber: paymentMethod === 'WALLET' ? `WALLET-PAY-${Date.now()}` : regForm.ftNumber 
        });
        setRegSuccess(`Registration submitted! Awaiting administrator verification.`);
        setRegForm({
            name: '', username: '', email: '', phoneNumber: '', password: '', confirmPassword: '', ftNumber: '', sponsorId: currentUser.id,
            placementMode: 'AUTO', manualParentUsername: '', manualLeg: 'LEFT'
        });
        setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto pb-20">
        <div className="flex flex-col gap-3 px-2">
            <h1 className="text-5xl font-bold text-white tracking-tight uppercase">Member <span className="text-brand-lime">Enrollment</span></h1>
            <div className="flex items-center gap-3">
                <div className="h-0.5 w-12 bg-brand-lime"></div>
                <p className="text-slate-500 text-[11px] font-medium uppercase tracking-[0.2em] italic">Expand your partnership network</p>
            </div>
        </div>

        <div className="widget-card-2025 bg-brand-surface border-brand-lime/30 rounded-[2.5rem]">
            <div className="relative z-10 p-10 md:p-14 space-y-12">
                {regSuccess && (
                    <div className="p-6 bg-brand-lime/5 border border-brand-lime/30 rounded-2xl text-brand-lime font-bold flex items-center gap-5 animate-pop-in">
                        <CheckCircle2 size={32} />
                        <span className="text-sm tracking-wide">{regSuccess}</span>
                    </div>
                )}

                <form onSubmit={handleRegSubmit} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 text-brand-lime pl-2 border-l-2 border-brand-lime/60">
                                <UserCircle size={18} />
                                <span className="text-[11px] font-bold uppercase tracking-widest">Personal Details</span>
                            </div>
                            <div className="space-y-5">
                                <div className="relative group/input">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within/input:text-brand-lime" size={18} />
                                    <input required className="tech-input-new pl-12" placeholder="Full legal name" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
                                </div>
                                <div className="relative group/input">
                                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within/input:text-brand-lime" size={18} />
                                    <input required className="tech-input-new pl-12" placeholder="Choose username" value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})} />
                                </div>
                                <div className="relative group/input">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within/input:text-brand-lime" size={18} />
                                    <input required className="tech-input-new pl-12" placeholder="Phone Number" value={regForm.phoneNumber} onChange={e => setRegForm({...regForm, phoneNumber: e.target.value})} />
                                </div>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within/input:text-brand-lime" size={18} />
                                    <input required type="email" className="tech-input-new pl-12" placeholder="Email Address" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-3 text-brand-lime pl-2 border-l-2 border-brand-lime/60">
                                <Lock size={18} />
                                <span className="text-[11px] font-bold uppercase tracking-widest">Security Credentials</span>
                            </div>
                            <div className="space-y-5">
                                <div className="relative group/input">
                                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within/input:text-brand-lime" size={18} />
                                    <input required type={showPassword ? "text" : "password"} className="tech-input-new pl-12 pr-12" placeholder="Set password" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-brand-lime"><Eye size={16} /></button>
                                </div>
                                <div className="relative group/input">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within/input:text-brand-lime" size={18} />
                                    <input required type={showConfirmPassword ? "text" : "password"} className="tech-input-new pl-12 pr-12" placeholder="Confirm password" value={regForm.confirmPassword} onChange={e => setRegForm({...regForm, confirmPassword: e.target.value})} />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-brand-lime"><Eye size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-brand-lime pl-2 border-l-2 border-brand-lime/60">
                            <Network size={18} />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Placement Strategy</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <button type="button" onClick={() => setRegForm({...regForm, placementMode: 'AUTO'})} className={`py-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${regForm.placementMode === 'AUTO' ? 'bg-brand-lime/10 border-brand-lime text-brand-lime' : 'bg-black/20 border-white/5 text-slate-500 hover:text-white'}`}>Auto-Balance</button>
                             <button type="button" onClick={() => setRegForm({...regForm, placementMode: 'MANUAL'})} className={`py-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${regForm.placementMode === 'MANUAL' ? 'bg-brand-lime/10 border-brand-lime text-brand-lime' : 'bg-black/20 border-white/5 text-slate-500 hover:text-white'}`}>Manual Target</button>
                        </div>
                        
                        {regForm.placementMode === 'MANUAL' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 p-6 rounded-3xl border border-white/5 animate-fade-in">
                                <div className="relative group/input">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within/input:text-brand-lime" size={18} />
                                    <input className="tech-input-new pl-12" placeholder="Parent Username ID" value={regForm.manualParentUsername} onChange={e => setRegForm({...regForm, manualParentUsername: e.target.value})} />
                                </div>
                                <div className="relative group/input">
                                    <Compass className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within/input:text-brand-lime" size={18} />
                                    <select className="tech-input-new pl-12 appearance-none" value={regForm.manualLeg} onChange={e => setRegForm({...regForm, manualLeg: e.target.value as any})}>
                                        <option value="LEFT">Left Binary Leg</option>
                                        <option value="RIGHT">Right Binary Leg</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8 border-t border-brand-lime/20 pt-8">
                        <div className="flex items-center gap-3 text-brand-lime pl-2 border-l-2 border-brand-lime/60">
                            <CreditCard size={18} />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Payment Protocol</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('BANK')}
                                className={`p-6 rounded-3xl border transition-all text-left relative overflow-hidden group ${paymentMethod === 'BANK' ? 'bg-brand-lime/10 border-brand-lime' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${paymentMethod === 'BANK' ? 'bg-brand-lime text-black' : 'bg-slate-800 text-slate-500'}`}>
                                        <BankIcon size={24} />
                                    </div>
                                    {paymentMethod === 'BANK' && <CheckCircle2 size={20} className="text-brand-lime" />}
                                </div>
                                <h4 className={`text-sm font-bold uppercase tracking-wider ${paymentMethod === 'BANK' ? 'text-white' : 'text-slate-400'}`}>Bank Transfer</h4>
                                <p className="text-[10px] text-slate-500 mt-2 font-mono">Manual verification via FT Number.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('CRYPTO')}
                                className={`p-6 rounded-3xl border transition-all text-left relative overflow-hidden group ${paymentMethod === 'CRYPTO' ? 'bg-amber-500/10 border-amber-500' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${paymentMethod === 'CRYPTO' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                                        <Bitcoin size={24} />
                                    </div>
                                    {paymentMethod === 'CRYPTO' && <CheckCircle2 size={20} className="text-amber-500" />}
                                </div>
                                <h4 className={`text-sm font-bold uppercase tracking-wider ${paymentMethod === 'CRYPTO' ? 'text-white' : 'text-slate-400'}`}>Crypto</h4>
                                <p className="text-[10px] text-slate-500 mt-2 font-mono">USDT/BTC Payment Verification.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('WALLET')}
                                className={`p-6 rounded-3xl border transition-all text-left relative overflow-hidden group ${paymentMethod === 'WALLET' ? 'bg-cyan-500/10 border-cyan-500' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${paymentMethod === 'WALLET' ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                                        <Wallet size={24} />
                                    </div>
                                    {paymentMethod === 'WALLET' && <CheckCircle2 size={20} className="text-cyan-500" />}
                                </div>
                                <h4 className={`text-sm font-bold uppercase tracking-wider ${paymentMethod === 'WALLET' ? 'text-white' : 'text-slate-400'}`}>Wallet Balance</h4>
                                <p className="text-[10px] text-slate-500 mt-2 font-mono">Instant deduction from your OTF vault.</p>
                            </button>
                        </div>

                        {paymentMethod === 'BANK' && (
                            <div className="space-y-6 bg-black/40 p-6 rounded-3xl border border-white/5 animate-fade-in">
                                 <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
                                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bank Details</p>
                                     <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                         <span className="text-slate-400 text-xs">Bank</span>
                                         <span className="text-white font-bold text-xs">{systemSettings.bankName}</span>
                                     </div>
                                     <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                         <span className="text-slate-400 text-xs">Account No</span>
                                         <span className="text-brand-lime font-mono font-bold text-sm">{systemSettings.accountNumber}</span>
                                     </div>
                                     <div className="flex justify-between items-center">
                                         <span className="text-slate-400 text-xs">Name</span>
                                         <span className="text-white font-bold text-xs">{systemSettings.accountName}</span>
                                     </div>
                                     <div className="pt-2 mt-2 border-t border-dashed border-slate-800 flex justify-between items-center">
                                         <span className="text-slate-500 text-[10px] uppercase font-bold">Joining Fee</span>
                                         <span className="text-white font-bold text-sm font-mono">{systemSettings.joiningFee.toLocaleString()} OTF</span>
                                     </div>
                                     <div className="flex justify-between items-center">
                                         <span className="text-slate-500 text-[10px] uppercase font-bold">ETB Equivalent</span>
                                         <span className="text-amber-500 font-bold text-sm font-mono">≈ {joiningFeeETB.toLocaleString()} ETB</span>
                                     </div>
                                 </div>
                                 
                                 <div className="relative group/input">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within/input:text-brand-lime" size={18} />
                                    <input required={paymentMethod === 'BANK'} className="tech-input-new pl-12 font-mono" placeholder="Enter FT Transaction Number" value={regForm.ftNumber} onChange={e => setRegForm({...regForm, ftNumber: e.target.value})} />
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'CRYPTO' && (
                            <div className="space-y-6 bg-black/40 p-6 rounded-3xl border border-white/5 animate-fade-in">
                                 <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
                                     <div className="flex items-center gap-3 mb-2">
                                         <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Smartphone size={16}/></div>
                                         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Crypto Payment</span>
                                     </div>
                                     
                                     <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => handleCopy(COMPANY_CRYPTO_DETAILS.walletAddress)}>
                                         <div>
                                             <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{COMPANY_CRYPTO_DETAILS.exchange} • {COMPANY_CRYPTO_DETAILS.network}</p>
                                             <p className="text-white font-mono text-xs mt-1 truncate max-w-[200px] md:max-w-xs">{COMPANY_CRYPTO_DETAILS.walletAddress}</p>
                                         </div>
                                         <div className="text-amber-500">{copied ? <CheckCircle2 size={16}/> : <Copy size={16}/>}</div>
                                     </div>

                                     <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-800">
                                         <span className="text-slate-500 text-[10px] uppercase font-bold">Joining Fee</span>
                                         <span className="text-white font-bold text-sm font-mono">{systemSettings.joiningFee.toLocaleString()} OTF</span>
                                     </div>
                                 </div>
                                 
                                 <div className="relative group/input">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50 group-focus-within/input:text-amber-500" size={18} />
                                    <input required={paymentMethod === 'CRYPTO'} className="tech-input-new pl-12 font-mono text-amber-500 focus:border-amber-500" placeholder="Enter Transaction Hash (TxID)" value={regForm.ftNumber} onChange={e => setRegForm({...regForm, ftNumber: e.target.value})} />
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'WALLET' && (
                            <div className="space-y-6 bg-black/40 p-6 rounded-3xl border border-white/5 animate-fade-in">
                                <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Current Balance</p>
                                        <p className="text-2xl font-bold text-white font-tech">{currentUser.balance.toLocaleString()} <span className="text-xs text-slate-500 font-normal">OTF</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Required Fee</p>
                                        <p className="text-xl font-bold text-cyan-400 font-tech">{joiningFeeOTF.toLocaleString()} <span className="text-xs text-slate-500 font-normal">OTF</span></p>
                                    </div>
                                </div>
                                
                                {!hasEnoughBalance && (
                                    <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl flex items-center gap-3 text-red-400">
                                        <AlertTriangle size={20} />
                                        <p className="text-xs font-bold uppercase tracking-wide">Insufficient funds for registration</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-6">
                        {regError && <div className="p-4 rounded-xl bg-red-950/40 text-red-400 text-[10px] font-bold border border-red-500/20 uppercase tracking-wide flex items-center gap-2 mb-4 animate-bounce"><AlertTriangle size={14}/> {regError}</div>}
                        
                        <button type="submit" className="w-full py-6 primary-gradient-new !rounded-2xl text-sm font-bold uppercase tracking-widest transition-all shadow-huge flex items-center justify-center gap-3">
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Fingerprint size={18} />}
                            {isSubmitting ? 'Processing Registration...' : 'Complete Enrollment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};
