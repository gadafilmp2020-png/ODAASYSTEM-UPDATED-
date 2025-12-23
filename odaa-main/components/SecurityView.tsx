import React, { useState, useMemo } from 'react';
import { User, VerificationRequest } from '../types';
import { ShieldCheck, ShieldAlert, KeyRound, Smartphone, Lock, CheckCircle2, Fingerprint, ScanFace, Clock, Save, Building2, Hash, CreditCard, Loader2, Calendar, Globe, Image as ImageIcon, User as UserIcon, Eye, EyeOff, QrCode, X, Copy, Mail } from 'lucide-react';

interface SecurityViewProps {
  user: User;
  onUpdateSettings: (userId: string, updates: Partial<User>) => void;
  onReportPasswordReset: (username: string) => void;
  onStartKycProcess?: () => void;
  onKycSubmission?: (data: Partial<VerificationRequest>) => void;
}

const CooldownWidget: React.FC<{ expiresAt?: string }> = ({ expiresAt }) => {
    if (!expiresAt) return null;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    if (expiryDate <= now) return null;
    const hoursLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    return (
        <div className="p-6 bg-amber-500/10 border-2 border-amber-500/30 rounded-[3rem] flex items-center gap-6 animate-pop-in shadow-huge">
            <div className="p-4 bg-amber-500/10 rounded-2xl animate-pulse"><ShieldAlert size={32} className="text-amber-500" /></div>
            <div><h4 className="text-sm font-black text-amber-500 uppercase tracking-widest">Cooldown Active</h4><p className="text-[10px] text-amber-200/60 uppercase font-black tracking-tighter">Withdrawals locked for {hoursLeft} hours.</p></div>
        </div>
    );
};

export const SecurityView: React.FC<SecurityViewProps> = ({ user, onUpdateSettings, onKycSubmission }) => {
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: user.bankName || '', accountNumber: user.accountNumber || '', accountName: user.accountName || user.name, cryptoExchangeName: user.cryptoExchangeName || 'Binance', cryptoWalletAddress: user.cryptoWalletAddress || '', cryptoNetwork: user.cryptoNetwork || 'BEP20' });
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');

  const [kycFormData, setKycFormData] = useState({ fullName: '', country: 'Ethiopia', dob: '', idType: 'NATIONAL_ID' as VerificationRequest['idType'], idNumber: '', });
  const [kycFiles, setKycFiles] = useState<{ front: string | null; selfie: string | null; }>({ front: null, selfie: null });

  // 2FA State
  const [twoFactorMethod, setTwoFactorMethod] = useState<'MANUAL' | 'OTP'>('MANUAL');
  const [manualPin, setManualPin] = useState('');
  const [confirmManualPin, setConfirmManualPin] = useState('');
  const [otpChannel, setOtpChannel] = useState<'EMAIL' | 'PHONE'>('EMAIL');

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) { alert("Mismatch."); return; }
    onUpdateSettings(user.id, { password: passwordForm.new });
    setPasswordForm({ current: '', new: '', confirm: '' });
    alert("Key Overwritten.");
  };

  const handleBankUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('SAVING');
    const cooldown = new Date(); cooldown.setHours(cooldown.getHours() + 48);
    setTimeout(() => { onUpdateSettings(user.id, { ...bankForm, securityCooldownUntil: cooldown.toISOString() }); setSaveStatus('SAVED'); setTimeout(() => setSaveStatus('IDLE'), 2000); }, 1000);
  };

  const handleKycFileChange = (field: keyof typeof kycFiles, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => { setKycFiles(prev => ({ ...prev, [field]: reader.result as string })); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onKycSubmission) onKycSubmission({ ...kycFormData, frontImage: kycFiles.front || undefined, selfieImage: kycFiles.selfie || undefined });
  };

  const handleSave2FA = () => {
      if (twoFactorMethod === 'MANUAL') {
          if (manualPin.length !== 6 || isNaN(Number(manualPin))) {
              alert("Manual Code must be exactly 6 digits.");
              return;
          }
          if (manualPin !== confirmManualPin) {
              alert("Security PIN mismatch. Please confirm the code correctly.");
              return;
          }
          onUpdateSettings(user.id, { 
              isTwoFactorEnabled: true, 
              twoFactorMethod: 'MANUAL',
              twoFactorSecret: manualPin 
          });
      } else {
          // OTP Logic
          onUpdateSettings(user.id, {
              isTwoFactorEnabled: true,
              twoFactorMethod: otpChannel,
              // Secret is not static for OTP, but setting a flag is enough for this demo
              twoFactorSecret: 'DYNAMIC_OTP' 
          });
      }
      alert("Two-Step Verification Protocol Activated.");
      setManualPin('');
      setConfirmManualPin('');
  };

  return (
    <div className="space-y-12 animate-fade-in pb-24 max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div><h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none font-tech">Security_<span className="text-brand-lime">Center</span></h1></div>
        <CooldownWidget expiresAt={user.securityCooldownUntil} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="widget-card-2025 p-10 rounded-[3.5rem] border-brand-lime/20 lg:col-span-2">
          <div className="flex items-center gap-5 mb-8 border-b border-white/5 pb-6">
             <div className="p-4 bg-brand-lime/5 rounded-2xl border border-brand-lime/20 text-brand-lime"><ScanFace size={32} /></div>
             <div><h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Identity Sync Protocol</h3><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Status: {user.kycStatus || 'NONE'}</p></div>
          </div>
          {user.kycStatus === 'VERIFIED' ? (
                <div className="flex flex-col items-center justify-center py-10 gap-6 animate-pop-in"><ShieldCheck size={80} className="text-brand-lime shadow-glow-lime"/><p className="text-slate-200 font-black uppercase tracking-widest text-xs">Identity Node Authorized</p></div>
            ) : (
                <form onSubmit={handleKycSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2"><label className="text-[9px] text-slate-500 font-black uppercase tracking-widest pl-8">Legal Identity</label><div className="relative group"><UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={18}/><input required className="tech-input-new pl-16" placeholder="Full Legal Name" value={kycFormData.fullName} onChange={e => setKycFormData({...kycFormData, fullName: e.target.value})} /></div></div>
                        <div className="space-y-2"><label className="text-[9px] text-slate-500 font-black uppercase tracking-widest pl-8">ID Magnitude</label><div className="relative group"><Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={18}/><input required className="tech-input-new pl-16 font-mono" placeholder="ID Number" value={kycFormData.idNumber} onChange={e => setKycFormData({...kycFormData, idNumber: e.target.value})} /></div></div>
                        <div className="md:col-span-2 grid grid-cols-2 gap-8">
                            <div className="relative h-44 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-black/40 flex flex-col items-center justify-center group overflow-hidden hover:border-brand-lime transition-all">
                                {kycFiles.front ? <img src={kycFiles.front} className="w-full h-full object-cover"/> : <><ImageIcon className="text-slate-700 group-hover:text-brand-lime mb-2" size={32}/><span className="text-[9px] font-black uppercase text-slate-600 group-hover:text-brand-lime">Upload ID Front</span></>}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleKycFileChange('front', e)}/>
                            </div>
                            <div className="relative h-44 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-black/40 flex flex-col items-center justify-center group overflow-hidden hover:border-brand-lime transition-all">
                                {kycFiles.selfie ? <img src={kycFiles.selfie} className="w-full h-full object-cover"/> : <><ScanFace className="text-slate-700 group-hover:text-brand-lime mb-2" size={32}/><span className="text-[9px] font-black uppercase text-slate-600 group-hover:text-brand-lime">Upload Security Selfie</span></>}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleKycFileChange('selfie', e)}/>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full primary-gradient-new !rounded-[3rem]">Initialize verification sequence</button>
                </form>
            )}
        </div>

        <div className="widget-card-2025 p-10 rounded-[3.5rem] border-brand-lime/20 flex flex-col">
          <div className="flex items-center gap-5 mb-8"><div className="p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/20 text-cyan-400"><Lock size={32} /></div><div><h3 className="text-2xl font-bold text-white uppercase tracking-tighter leading-none">Access Matrix</h3><p className="text-[9px] text-cyan-400 uppercase tracking-widest font-black mt-2">Manual Key Overwrite</p></div></div>
          <form onSubmit={handlePasswordUpdate} className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="space-y-2"><label className="text-[9px] text-slate-500 font-black uppercase tracking-widest pl-8">Current Secret</label><div className="relative group"><Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={18}/><input required type="password" className="tech-input-new pl-16" placeholder="••••••••" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} /></div></div>
            <div className="space-y-2"><label className="text-[9px] text-slate-500 font-black uppercase tracking-widest pl-8">New Matrix Key</label><div className="relative group"><KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={18}/><input required type={showNewPassword ? "text" : "password"} className="tech-input-new pl-16 pr-12" placeholder="••••••••" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} /><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-brand-lime transition-all">{showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
            <div className="space-y-2"><label className="text-[9px] text-slate-500 font-black uppercase tracking-widest pl-8">Re-verify Key</label><div className="relative group"><ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={18}/><input required type="password" className="tech-input-new pl-16" placeholder="••••••••" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} /></div></div>
            <button type="submit" className="w-full py-4 bg-slate-900 border-2 border-brand-lime/30 text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:bg-brand-lime hover:text-black mt-auto">Update Access Secret</button>
          </form>
        </div>

        {/* TWO-STEP VERIFICATION WIDGET */}
        <div className="widget-card-2025 p-10 rounded-[3.5rem] border-brand-lime/20 flex flex-col">
          <div className="flex items-center gap-5 mb-8">
              <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 text-amber-500">
                  <Smartphone size={32} />
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tighter leading-none">Two-Step Verification</h3>
                  <p className="text-[9px] text-amber-500 uppercase tracking-widest font-black mt-2">
                      {user.isTwoFactorEnabled 
                        ? `ACTIVE: ${user.twoFactorMethod === 'MANUAL' ? 'MANUAL PIN' : 'OTP SECURE'}` 
                        : 'PROTOCOL INACTIVE'}
                  </p>
              </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
              {user.isTwoFactorEnabled ? (
                  <div className="space-y-8 animate-fade-in">
                      <div className="p-6 bg-emerald-900/10 border border-emerald-500/20 rounded-3xl flex items-center gap-4">
                          <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-500"><CheckCircle2 size={24} /></div>
                          <div>
                              <p className="text-xs font-bold text-white uppercase tracking-wide">Shield Established</p>
                              <p className="text-[10px] text-slate-500">Method: {user.twoFactorMethod}</p>
                          </div>
                      </div>
                      <button 
                          onClick={() => {
                              if(window.confirm("Disable 2-Step Verification? This lowers account security.")) {
                                  onUpdateSettings(user.id, { isTwoFactorEnabled: false });
                              }
                          }}
                          className="w-full py-4 bg-red-900/20 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] transition-all"
                      >
                          Deactivate Shield
                      </button>
                  </div>
              ) : (
                  <div className="space-y-6">
                      <div className="flex bg-slate-900/50 p-1.5 rounded-[2rem] border border-white/5">
                          <button onClick={() => setTwoFactorMethod('MANUAL')} className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${twoFactorMethod === 'MANUAL' ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>Manual PIN</button>
                          <button onClick={() => setTwoFactorMethod('OTP')} className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${twoFactorMethod === 'OTP' ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>OTP Verify</button>
                      </div>

                      {twoFactorMethod === 'MANUAL' ? (
                          <div className="space-y-4 animate-fade-in">
                              <p className="text-[10px] text-slate-400 pl-4">Define a 6-digit static code. You must enter this code upon every login.</p>
                              
                              <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-4">Set Security PIN</label>
                                  <div className="relative group">
                                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={18}/>
                                      <input 
                                          type="password"
                                          className="tech-input-new pl-16 text-center text-xl font-mono tracking-[0.5em] text-amber-500" 
                                          placeholder="000000"
                                          maxLength={6}
                                          value={manualPin}
                                          onChange={(e) => setManualPin(e.target.value.replace(/\D/g,''))}
                                      />
                                  </div>
                              </div>

                              <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-4">Confirm Security PIN</label>
                                  <div className="relative group">
                                      <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={18}/>
                                      <input 
                                          type="password"
                                          className={`tech-input-new pl-16 text-center text-xl font-mono tracking-[0.5em] transition-colors ${manualPin && confirmManualPin && manualPin !== confirmManualPin ? 'text-red-500 border-red-500/50' : 'text-amber-500'}`}
                                          placeholder="000000"
                                          maxLength={6}
                                          value={confirmManualPin}
                                          onChange={(e) => setConfirmManualPin(e.target.value.replace(/\D/g,''))}
                                      />
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-4 animate-fade-in">
                              <p className="text-[10px] text-slate-400 pl-4">Receive a dynamic code via your registered contact method.</p>
                              <div className="grid grid-cols-2 gap-4">
                                  <button onClick={() => setOtpChannel('EMAIL')} className={`p-4 rounded-3xl border text-center transition-all ${otpChannel === 'EMAIL' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                                      <Mail size={20} className="mx-auto mb-2"/>
                                      <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
                                  </button>
                                  <button onClick={() => setOtpChannel('PHONE')} className={`p-4 rounded-3xl border text-center transition-all ${otpChannel === 'PHONE' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                                      <Smartphone size={20} className="mx-auto mb-2"/>
                                      <span className="text-[9px] font-black uppercase tracking-widest">Phone</span>
                                  </button>
                              </div>
                          </div>
                      )}
                      
                      <button onClick={handleSave2FA} className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-[2.5rem] text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-amber-900/20 transition-all mt-4">
                          Activate {twoFactorMethod === 'MANUAL' ? 'PIN' : 'OTP'} Protection
                      </button>
                  </div>
              )}
          </div>
        </div>

        <div className="lg:col-span-2 widget-card-2025 p-10 rounded-[4rem] border-brand-lime/20 bg-black/60">
           <div className="flex justify-between items-center mb-10"><div className="flex items-center gap-5"><div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 text-emerald-400"><Building2 size={32} /></div><div><h3 className="text-2xl font-bold text-white uppercase tracking-tighter">Settlement Registry</h3><p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-black">Authorized Withdrawal Endpoint</p></div></div></div>
           <form onSubmit={handleBankUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8 bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 shadow-inner">
                  <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] pl-4 border-l-2 border-brand-lime/30">Local Infrastructure</h4>
                  <div className="space-y-4">
                    <div className="relative group"><Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={18}/><input required className="tech-input-new pl-16" placeholder="Bank Name" value={bankForm.bankName} onChange={e => setBankForm({...bankForm, bankName: e.target.value})} /></div>
                    <div className="relative group"><Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={18}/><input required className="tech-input-new pl-16 font-mono" placeholder="Account Number" value={bankForm.accountNumber} onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} /></div>
                  </div>
              </div>
              <div className="space-y-8 bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 shadow-inner">
                  <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] pl-4 border-l-2 border-cyan-400/30">Crypto Gateway</h4>
                  <div className="space-y-4">
                    <div className="relative group"><Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400/30 group-focus-within:text-cyan-400 transition-colors" size={18}/><input className="tech-input-new pl-16 font-mono text-[10px]" placeholder="Wallet Hash" value={bankForm.cryptoWalletAddress} onChange={e => setBankForm({...bankForm, cryptoWalletAddress: e.target.value})} /></div>
                    <div className="relative group"><Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400/30 group-focus-within:text-cyan-400 transition-colors" size={18}/><select className="tech-input-new pl-16 appearance-none" value={bankForm.cryptoExchangeName} onChange={e => setBankForm({...bankForm, cryptoExchangeName: e.target.value})}><option value="Binance">Binance</option><option value="Bybit">Bybit</option></select></div>
                  </div>
              </div>
              <div className="md:col-span-2 space-y-2 px-4">
                  <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest pl-8">Legal Registry Identity</label>
                  <div className="relative group"><CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={18}/><input required className="tech-input-new pl-16" placeholder="Account Holder Name" value={bankForm.accountName} onChange={e => setBankForm({...bankForm, accountName: e.target.value})} /></div>
              </div>
              <div className="md:col-span-2 pt-4"><button type="submit" className="w-full py-5 bg-slate-900 border-2 border-brand-lime/30 text-brand-lime rounded-[3rem] text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:bg-brand-lime hover:text-black">{saveStatus === 'SAVING' ? 'Synchronizing...' : 'Update Settlement Registry'}</button></div>
           </form>
        </div>
      </div>
    </div>
  );
};