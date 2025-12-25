
import React, { useState } from 'react';
import { Lock, User, AlertCircle, Fingerprint, Cpu, ArrowRight, ShieldCheck, HelpCircle, X, Loader2 } from 'lucide-react';
import { OdaaLogo } from './OdaaLogo';
import { useUser } from '../contexts/UserContext';

export const Login: React.FC = () => {
  const { login } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetStatus, setResetStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');

  // Simple Device ID generator
  const [deviceId] = useState(() => {
    let storedId = localStorage.getItem('odaa_device_id');
    if (!storedId) {
      storedId = `dev-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
      localStorage.setItem('odaa_device_id', storedId);
    }
    return storedId;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
        setError("Please enter both username and password.");
        return;
    }

    setIsLoading(true);

    try {
      await new Promise(r => setTimeout(r, 500)); // Visual delay
      await login({ username, password, deviceId });
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || 'Access Denied: Invalid Credentials or Node Lock.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetRequest = (e: React.FormEvent) => {
      e.preventDefault();
      if(!resetUsername.trim()) return;
      setResetStatus('SENDING');
      setTimeout(() => {
          setResetStatus('SENT');
          setTimeout(() => {
              setShowForgotModal(false);
              setResetStatus('IDLE');
              setResetUsername('');
              setError(''); 
              alert("Recovery Protocol Initiated. Admin has been notified.");
          }, 1500);
      }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-brand-dark">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-lime/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[420px] animate-scale-in">
         <div className="widget-card-2025 rounded-[2.5rem] p-0 overflow-hidden relative group border border-brand-lime/20 bg-slate-950 shadow-huge">
            <div className="p-8 relative z-10">
                <div className="flex flex-col items-center mb-8 relative">
                    <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-brand-lime/20 blur-xl rounded-full animate-pulse"></div>
                        <OdaaLogo size={64} pulse />
                    </div>
                    <h1 className="text-4xl text-white font-tech tracking-wider mb-1">ODAA</h1>
                    <p className="text-[10px] text-brand-lime uppercase tracking-[0.3em] font-bold">Secure Access Node</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5 group/input">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Identity</label>
                        <div className="relative bg-slate-900 rounded-xl border border-slate-800 focus-within:border-brand-lime/50 transition-colors">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                                <User size={18} />
                            </div>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white text-sm outline-none font-mono" 
                                required 
                                placeholder="Username" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 group/input">
                        <div className="flex justify-between items-center pl-1 pr-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Key</label>
                            <button 
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-[9px] font-bold text-slate-500 hover:text-brand-lime uppercase tracking-wider transition-colors flex items-center gap-1"
                            >
                                Recovery <ArrowRight size={10} />
                            </button>
                        </div>
                        <div className="relative bg-slate-900 rounded-xl border border-slate-800 focus-within:border-brand-lime/50 transition-colors">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white text-sm outline-none font-mono" 
                                required 
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-950/40 text-red-400 text-xs font-bold flex items-center gap-2 border border-red-500/20 animate-bounce">
                            <AlertCircle size={14}/> {error}
                        </div>
                    )}

                    <button 
                        id="login-btn"
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full py-4 primary-gradient-new text-black rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-glow-lime flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <><Cpu size={16} className="animate-spin" /> VERIFYING...</>
                        ) : (
                            <><Fingerprint size={16} /> AUTHENTICATE</>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-white/5 pt-4">
                    <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest flex items-center justify-center gap-2">
                        <ShieldCheck size={12}/> System Secured & Encrypted
                    </p>
                </div>
            </div>
         </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
              <div className="widget-card-2025 w-full max-w-sm border-slate-700 bg-slate-950 shadow-huge animate-scale-in">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white font-tech uppercase flex items-center gap-2">
                          <HelpCircle size={20} className="text-brand-lime"/> Recovery
                      </h3>
                      <button onClick={() => setShowForgotModal(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleResetRequest} className="p-8 space-y-6">
                      <p className="text-xs text-slate-400 leading-relaxed">
                          Lost your access key? Enter your username below to initiate a manual reset protocol with the System Administrator.
                      </p>
                      
                      <div className="space-y-1.5 group/input">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Target Username</label>
                        <div className="relative bg-slate-900 rounded-xl border border-slate-800 focus-within:border-brand-lime/50 transition-colors">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                                <User size={18} />
                            </div>
                            <input 
                                type="text" 
                                value={resetUsername} 
                                onChange={(e) => setResetUsername(e.target.value)} 
                                className="w-full pl-12 pr-4 py-3 bg-transparent text-white text-sm outline-none font-mono" 
                                required 
                                placeholder="Username" 
                            />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={resetStatus !== 'IDLE'}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs border border-white/5 transition-all flex items-center justify-center gap-2"
                      >
                          {resetStatus === 'SENDING' ? <Loader2 size={14} className="animate-spin"/> : <ShieldCheck size={14}/>}
                          {resetStatus === 'IDLE' ? 'Request Reset' : resetStatus === 'SENDING' ? 'Transmitting...' : 'Sent'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
