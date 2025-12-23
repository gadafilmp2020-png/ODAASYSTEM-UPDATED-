
import React, { useState } from 'react';
import { Lock, User, ShieldCheck, AlertCircle, ScanFace, Fingerprint, ArrowRight, Activity, Cpu, Disc } from 'lucide-react';
import { User as UserType } from '../types';
import { OdaaLogo } from './OdaaLogo';

interface LoginProps {
  onLogin: (user: UserType, deviceId: string) => void;
  users: UserType[];
  onReportPasswordReset?: (username: string) => void;
  onRequestDeviceApproval?: (username: string, deviceId: string, ip: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, users, onReportPasswordReset, onRequestDeviceApproval }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
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

    if (!username.trim() || !password.trim()) {
        setError("Please enter both username and password.");
        return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      
      if (!foundUser && username === 'sinan' && password === '123') {
          const admin = users.find(u => u.role === 'ADMIN');
          if (admin) {
            if (admin.allowedDeviceIds && admin.allowedDeviceIds.length > 0 && !admin.allowedDeviceIds.includes(deviceId)) {
                onRequestDeviceApproval?.(username, deviceId, mockIp);
                setError(`New device detected. Approval request sent.`);
                setIsLoading(false); return;
            }
            onLogin(admin, deviceId); return;
          }
      }

      if (foundUser) {
        if (foundUser.status === 'BLOCKED') { setError('Account blocked.'); setIsLoading(false); return; }
        
        if (foundUser.role === 'ADMIN' && foundUser.allowedDeviceIds && foundUser.allowedDeviceIds.length > 0 && !foundUser.allowedDeviceIds.includes(deviceId)) {
             onRequestDeviceApproval?.(username, deviceId, mockIp);
             setError(`New device detected. Approval request sent.`);
             setIsLoading(false); return;
        }
        
        onLogin(foundUser, deviceId);
      } else {
        setError('Invalid credentials.');
        setIsLoading(false);
      }
    }, 1200); // Slightly longer for effect
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Main Widget Container */}
      <div className="relative z-10 w-full max-w-[420px] animate-scale-in">
         
         {/* Top Decoration */}
         <div className="flex justify-between items-end mb-4 px-4">
            <div className="flex items-center gap-2 text-lime-500/80">
                <Activity size={16} className="animate-pulse"/>
                <span className="text-[10px] font-bold font-tech tracking-widest uppercase">System Online</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                SECURE NODE
            </div>
         </div>

         {/* The Access Card */}
         <div className="widget-card rounded-3xl p-0 overflow-hidden relative group">
            
            {/* Holographic Scanner Effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lime-400 to-transparent opacity-50 shadow-[0_0_15px_#84cc16] animate-[scanline_4s_linear_infinite]"></div>
            
            <div className="p-8 relative z-10">
                
                {/* Header Section with Rotating Ring */}
                <div className="flex flex-col items-center mb-8 relative">
                    <div className="relative mb-6 group-hover:scale-105 transition-transform duration-500">
                        {/* Rotating Outer Ring */}
                        <div className="absolute inset-[-10px] border border-dashed border-lime-500/30 rounded-full animate-spin-slow"></div>
                        <div className="absolute inset-[-4px] border border-emerald-500/20 rounded-full animate-spin-super-slow" style={{ animationDirection: 'reverse' }}></div>
                        
                        <div className="absolute inset-0 bg-lime-500/20 blur-xl rounded-full animate-pulse-glow"></div>
                        <div className="w-20 h-20 bg-slate-950 rounded-2xl border border-slate-700 flex items-center justify-center relative shadow-2xl z-10">
                             <OdaaLogo size={42} />
                             {/* Corner Accents */}
                             <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-lime-500"></div>
                             <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-emerald-500"></div>
                        </div>
                    </div>
                    <h1 className="text-4xl text-white font-glitch tracking-wider mb-1 drop-shadow-md">ODAA</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-[1px] w-8 bg-slate-700"></div>
                        <span className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400 uppercase tracking-[0.3em] font-bold font-tech">Access Control</span>
                        <div className="h-[1px] w-8 bg-slate-700"></div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Input */}
                    <div className="space-y-1.5 group/input">
                        <div className="flex justify-between">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-tech pl-1">Identity ID</label>
                            {username && <ScanFace size={12} className="text-emerald-500 animate-pulse"/>}
                        </div>
                        <div className="relative bg-slate-900/50 rounded-xl border border-slate-700/50 transition-all duration-300 group-focus-within/input:border-emerald-500/50 group-focus-within/input:bg-slate-900 group-focus-within/input:shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-emerald-400 transition-colors">
                                <User size={18} />
                            </div>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white text-sm outline-none placeholder-slate-700 font-sans tracking-wide" 
                                required 
                                placeholder="Enter Username" 
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5 group/input">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-tech pl-1">Access Key</label>
                        <div className="relative bg-slate-900/50 rounded-xl border border-slate-700/50 transition-all duration-300 group-focus-within/input:border-lime-500/50 group-focus-within/input:bg-slate-900 group-focus-within/input:shadow-[0_0_15px_rgba(132,204,22,0.1)]">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-lime-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white text-sm outline-none placeholder-slate-700 font-sans tracking-wide" 
                                required 
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-1">
                       <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] font-bold text-slate-500 hover:text-lime-400 uppercase tracking-wider transition-colors font-tech flex items-center gap-1 group/link">
                           Reset Protocol <ArrowRight size={10} className="group-hover/link:translate-x-1 transition-transform"/>
                       </button>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-950/40 text-red-400 text-xs font-bold flex items-center gap-2 border border-red-500/20 animate-bounce shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                            <AlertCircle size={14}/> {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full py-4 cyber-button-primary rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/btn font-tech uppercase tracking-widest text-xs"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2 animate-pulse">
                                <Cpu size={16} className="animate-spin" /> ESTABLISHING LINK...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <Fingerprint size={16} /> AUTHENTICATE
                            </span>
                        )}
                    </button>
                </form>

                {/* Footer Decor */}
                <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center text-[9px] text-slate-600 uppercase font-mono">
                    <div className="flex items-center gap-1.5"><ShieldCheck size={10} className="text-emerald-500"/> AES-256 Encrypted</div>
                    <div className="tracking-widest opacity-50">ID: {deviceId.split('-')[1].toUpperCase()}</div>
                </div>
            </div>
         </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
            <div className="widget-card bg-slate-900 rounded-2xl p-8 w-full max-w-sm border border-slate-700 animate-scale-in shadow-[0_0_60px_rgba(239,68,68,0.2)]">
               <div className="mb-6 flex items-center gap-3 text-red-400">
                    <AlertCircle size={24} />
                    <h3 className="font-bold text-lg text-white font-tech uppercase">Recovery Mode</h3>
               </div>
               
               <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                   Enter your username to initiate the identity recovery protocol. An admin will be notified to reset your access key.
               </p>
               
               <div className="space-y-1.5 mb-6">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-tech">Target Identity</label>
                   <input 
                        className="w-full p-3.5 bg-black/50 border border-slate-700 rounded-xl text-sm outline-none text-white focus:border-red-500 transition-colors font-mono shadow-inner" 
                        placeholder="Username" 
                        value={resetUsername} 
                        onChange={e => setResetUsername(e.target.value)} 
                   />
               </div>
               
               <div className="flex gap-3">
                 <button onClick={() => setShowForgotModal(false)} className="flex-1 py-3 text-slate-400 border border-slate-700 rounded-xl font-bold text-xs hover:bg-slate-800 uppercase transition-colors font-tech">Abort</button>
                 <button onClick={() => {onReportPasswordReset?.(resetUsername); setShowForgotModal(false);}} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-500 uppercase transition-colors shadow-lg shadow-red-900/20 font-tech">Execute Reset</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
