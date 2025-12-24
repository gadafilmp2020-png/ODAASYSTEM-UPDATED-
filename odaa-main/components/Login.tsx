
import React, { useState } from 'react';
import { Lock, User, AlertCircle, Fingerprint, Cpu, ArrowRight } from 'lucide-react';
import { OdaaLogo } from './OdaaLogo';
import { useUser } from '../contexts/UserContext';

export const Login: React.FC = () => {
  const { login } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      await login({ username, password, deviceId });
      // Login successful, App.tsx will re-render due to auth state change
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-brand-dark">
      <div className="relative z-10 w-full max-w-[420px] animate-scale-in">
         <div className="widget-card rounded-3xl p-0 overflow-hidden relative group border border-brand-lime/20 bg-slate-950">
            <div className="p-8 relative z-10">
                <div className="flex flex-col items-center mb-8 relative">
                    <div className="mb-6">
                        <OdaaLogo size={64} pulse />
                    </div>
                    <h1 className="text-4xl text-white font-tech tracking-wider mb-1">ODAA</h1>
                    <p className="text-[10px] text-brand-lime uppercase tracking-[0.3em] font-bold">Secure Access</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5 group/input">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Username</label>
                        <div className="relative bg-slate-900 rounded-xl border border-slate-800">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                                <User size={18} />
                            </div>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white text-sm outline-none" 
                                required 
                                placeholder="Enter Username" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 group/input">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Password</label>
                        <div className="relative bg-slate-900 rounded-xl border border-slate-800">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white text-sm outline-none" 
                                required 
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-950/40 text-red-400 text-xs font-bold flex items-center gap-2 border border-red-500/20">
                            <AlertCircle size={14}/> {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full py-4 primary-gradient-new text-black rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Cpu size={16} className="animate-spin" /> VERIFYING...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <Fingerprint size={16} /> LOGIN
                            </span>
                        )}
                    </button>
                </form>
            </div>
         </div>
      </div>
    </div>
  );
};
