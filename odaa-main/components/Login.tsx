
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, User, ShieldCheck, AlertCircle, ScanFace, Fingerprint, ArrowRight, Activity, Cpu, Disc, Eye, EyeOff, ShieldAlert, Key, AlertTriangle, ArrowLeft, X } from 'lucide-react';
import { User as UserType } from '../types';
import { OdaaLogo } from './OdaaLogo';
import { FloatingCoinsBackground } from './FloatingCoinsBackground';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLogin: (user: UserType, deviceId: string) => void;
  users: UserType[];
  onReportPasswordReset?: (username: string) => void;
  onRequestTwoFactorBypass?: (username: string) => void;
  onRequestDeviceApproval?: (username: string, deviceId: string, ip: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, users, onReportPasswordReset, onRequestTwoFactorBypass, onRequestDeviceApproval }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<'CREDENTIALS' | 'TWO_FACTOR'>('CREDENTIALS');
  const [tempUser, setTempUser] = useState<UserType | null>(null);
  
  // Recovery Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [show2FABypassModal, setShow2FABypassModal] = useState(false);
  const [resetUsername, setResetUsername] = useState('');

  const [deviceId] = useState(() => {
    let storedId = localStorage.getItem('odaa_device_id');
    if (!storedId) {
      storedId = `dev-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
      localStorage.setItem('odaa_device_id', storedId);
    }
    return storedId;
  });

  const [mockIp] = useState(`192.168.1.${Math.floor(Math.random() * 255)}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginStep === 'CREDENTIALS') {
      if (!username.trim() || !password.trim()) {
          setError("Error: Username and Password are required.");
          return;
      }
      setIsLoading(true);

      setTimeout(() => {
        const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        
        // Backdoor for demo admin
        if (!foundUser && username === 'sinan' && password === '123') {
            const admin = users.find(u => u.role === 'ADMIN');
            if (admin) {
              handleFoundUser(admin);
              return;
            }
        }

        if (foundUser) {
          handleFoundUser(foundUser);
        } else {
          setError('Access Denied: Invalid credentials provided.');
          setIsLoading(false);
        }
      }, 1000);
    } else {
      if (!twoFactorCode.trim()) {
          setError("Error: Verification code is required.");
          return;
      }
      setIsLoading(true);
      
      setTimeout(() => {
        let isValid = false;
        
        // Manual PIN Check
        if (tempUser?.twoFactorMethod === 'MANUAL') {
            if (twoFactorCode === tempUser.twoFactorSecret) isValid = true;
        } 
        // OTP Check
        else if (tempUser?.twoFactorMethod === 'EMAIL' || tempUser?.twoFactorMethod === 'PHONE') {
            if (twoFactorCode === generatedOtp) isValid = true;
        } 
        // Fallback
        else {
            if (twoFactorCode === tempUser?.twoFactorSecret) isValid = true;
        }

        if (isValid) {
          onLogin(tempUser!, deviceId);
        } else {
          setError('Security Error: Invalid verification code.');
          setIsLoading(false);
        }
      }, 800);
    }
  };

  const handleFoundUser = (user: UserType) => {
    if (user.status === 'BLOCKED') { setError('Account Blocked: Contact Administrator.'); setIsLoading(false); return; }
    
    if (user.role === 'ADMIN' && user.allowedDeviceIds && user.allowedDeviceIds.length > 0 && !user.allowedDeviceIds.includes(deviceId)) {
         onRequestDeviceApproval?.(username, deviceId, mockIp);
         setError(`Security Alert: New device detected. Approval requested.`);
         setIsLoading(false); return;
    }

    if (user.isTwoFactorEnabled) {
      setTempUser(user);
      
      // Simulate OTP generation
      if (user.twoFactorMethod === 'EMAIL' || user.twoFactorMethod === 'PHONE') {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedOtp(otp);
          // In a real app, this would trigger a backend API call
          alert(`SYSTEM MESSAGE: Your 2FA OTP is ${otp}`);
      }

      setLoginStep('TWO_FACTOR');
      setIsLoading(false);
    } else {
      onLogin(user, deviceId);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      <FloatingCoinsBackground />
      
      <div className="absolute top-6 right-6 z-20">
          <LanguageSelector />
      </div>
      
      {/* Background Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[380px] animate-scale-in">
         {/* Glassmorphism Card */}
         <div className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_60px_rgba(132,204,22,0.1)] relative overflow-hidden group">
            
            {/* Top Shine Effect */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-lime/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-lime/20 to-transparent"></div>

            <div className="mb-8 text-center relative">
                <Link to="/" className="absolute top-0 left-0 text-[10px] font-black text-slate-500 hover:text-brand-lime uppercase tracking-widest transition-colors flex items-center gap-1 group/back">
                    <ArrowLeft size={10} className="group-hover/back:-translate-x-1 transition-transform" /> BACK
                </Link>
                <div className="inline-flex items-center justify-center p-4 bg-brand-lime/10 rounded-2xl border border-brand-lime/20 mb-4 shadow-[0_0_30px_rgba(132,204,22,0.2)]">
                    <OdaaLogo size={40} />
                </div>
                <h1 className="text-2xl text-white font-bold tracking-tight uppercase font-tech">
                  {loginStep === 'CREDENTIALS' ? t('welcome') : t('twoFactor')}
                </h1>
                <p className="text-[9px] text-brand-lime/80 font-bold uppercase tracking-[0.3em] mt-2">
                  {loginStep === 'CREDENTIALS' ? t('login') : (
                      tempUser?.twoFactorMethod === 'MANUAL' ? 'Enter Security PIN' : 'Enter Sent OTP'
                  )}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {loginStep === 'CREDENTIALS' ? (
                  <>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-3">{t('username')}</label>
                        <div className="relative group/input">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-brand-lime transition-colors" size={18} />
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                className="tech-input-new pl-12 bg-black/40 border-white/10 focus:border-brand-lime/50" 
                                placeholder="Enter Username" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-3">{t('password')}</label>
                        <div className="relative group/input">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-brand-lime transition-colors" size={18} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="tech-input-new pl-12 pr-12 bg-black/40 border-white/10 focus:border-brand-lime/50" 
                                placeholder="••••••••" 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-brand-lime transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-1">
                       <button type="button" onClick={() => { setResetUsername(username); setShowForgotModal(true); }} className="text-[10px] font-bold text-slate-500 hover:text-brand-lime uppercase tracking-wider transition-all">
                           Forgot Password?
                       </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6 animate-fade-in">
                    <div className="p-4 bg-brand-lime/5 rounded-2xl border border-brand-lime/20 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-brand-lime/5 blur-xl animate-pulse"></div>
                      <p className="text-[10px] text-brand-lime uppercase tracking-widest font-bold relative z-10">
                        {tempUser?.twoFactorMethod === 'MANUAL' ? 'Enter 6-Digit PIN' : `Enter Code sent to ${tempUser?.twoFactorMethod}`}
                      </p>
                    </div>
                    <div className="relative group/input">
                        <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-brand-lime transition-colors" size={18} />
                        <input 
                            type="password" 
                            maxLength={6}
                            value={twoFactorCode} 
                            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} 
                            className="tech-input-new pl-12 text-center text-xl font-mono tracking-[0.5em] bg-black/40 border-white/10 focus:border-brand-lime/50" 
                            autoFocus
                            placeholder="••••••" 
                        />
                    </div>
                    <div className="flex justify-end pt-1">
                       <button type="button" onClick={() => setShow2FABypassModal(true)} className="text-[10px] font-bold text-slate-500 hover:text-red-400 uppercase tracking-wider transition-all">
                           Forgot 2FA Code?
                       </button>
                    </div>
                  </div>
                )}

                {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-bold flex items-center justify-center gap-2 border border-red-500/20 animate-bounce uppercase tracking-wide">
                        <AlertTriangle size={14}/> {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full primary-gradient-new text-black !rounded-2xl shadow-glow-lime hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Cpu size={16} className="animate-spin" /> {loginStep === 'CREDENTIALS' ? 'Logging in...' : 'VERIFYING...'}
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em]">
                            {loginStep === 'CREDENTIALS' ? <Fingerprint size={16} /> : <ShieldCheck size={16} />} 
                            {loginStep === 'CREDENTIALS' ? t('login') : t('authenticate')}
                        </span>
                    )}
                </button>
            </form>
         </div>
         
         <div className="mt-8 text-center">
             <p className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.3em]">{t('secureNode')}</p>
         </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
            <div className="widget-card bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm border border-slate-700 animate-scale-in shadow-[0_0_60px_rgba(239,68,68,0.2)]">
               <div className="mb-6 flex items-center justify-between">
                   <div className="flex items-center gap-3 text-red-400">
                        <AlertCircle size={24} />
                        <h3 className="font-bold text-lg text-white font-tech uppercase">Recovery Mode</h3>
                   </div>
                   <button onClick={() => setShowForgotModal(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
               </div>
               
               <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                   Initiate identity recovery. An automated alert will be sent to the system administrator to reset your password.
               </p>
               
               <div className="space-y-1.5 mb-6">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-tech">{t('username')}</label>
                   <input 
                        className="w-full p-3.5 bg-black/50 border border-slate-700 rounded-2xl text-sm outline-none text-white focus:border-red-500 transition-colors font-mono shadow-inner" 
                        placeholder="Enter Username" 
                        value={resetUsername} 
                        onChange={e => setResetUsername(e.target.value)} 
                   />
               </div>
               
               <div className="flex gap-3">
                 <button onClick={() => setShowForgotModal(false)} className="flex-1 py-3 text-slate-400 border border-slate-700 rounded-xl font-bold text-xs hover:bg-slate-800 uppercase transition-colors font-tech">Cancel</button>
                 <button onClick={() => {
                     if(!resetUsername.trim()) { alert("Please enter a username."); return; }
                     onReportPasswordReset?.(resetUsername); 
                     setShowForgotModal(false); 
                     alert("Reset Request Transmitted to Admin."); 
                 }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-500 uppercase transition-colors shadow-lg shadow-red-900/20 font-tech">Reset Password</button>
               </div>
            </div>
         </div>
      )}

      {/* Forgot 2FA Modal */}
      {show2FABypassModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
            <div className="widget-card bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm border border-slate-700 animate-scale-in shadow-[0_0_60px_rgba(239,68,68,0.2)]">
               <div className="mb-6 flex items-center justify-between">
                   <div className="flex items-center gap-3 text-red-400">
                        <ShieldAlert size={24} />
                        <h3 className="font-bold text-lg text-white font-tech uppercase">2FA Bypass Request</h3>
                   </div>
                   <button onClick={() => setShow2FABypassModal(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
               </div>
               
               <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                   Lost your authenticator or PIN? Request a manual security override from the administrator. This process may trigger a 24-hour security hold.
               </p>
               
               <div className="flex gap-3">
                 <button onClick={() => setShow2FABypassModal(false)} className="flex-1 py-3 text-slate-400 border border-slate-700 rounded-xl font-bold text-xs hover:bg-slate-800 uppercase transition-colors font-tech">Cancel</button>
                 <button onClick={() => {
                     if (tempUser?.username && onRequestTwoFactorBypass) onRequestTwoFactorBypass(tempUser.username);
                     alert("Bypass Request Transmitted. Wait for Admin approval.");
                     setShow2FABypassModal(false);
                 }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-500 uppercase transition-colors shadow-lg shadow-red-900/20 font-tech">Request Bypass</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
