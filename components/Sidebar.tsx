
import React from 'react';
import { LayoutDashboard, Network, Wallet, Users, LogOut, ShieldCheck, Database, Landmark, X } from 'lucide-react';
import { ViewState, Role } from '../types';
import { OdaaLogo } from './OdaaLogo';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  role: Role;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, role, onLogout, isOpen, onClose }) => {
  const memberItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'GENEALOGY', label: 'My Network', icon: Network },
    { id: 'WALLET', label: 'Wallet', icon: Wallet },
    { id: 'TEAM', label: 'My Team', icon: Users },
  ];

  const adminItems = [
    { id: 'ADMIN_DASHBOARD', label: 'Admin Console', icon: Database },
    { id: 'COMPANY_BALANCE', label: 'Company Funds', icon: Landmark },
    { id: 'GENEALOGY', label: 'Global Genealogy', icon: Network },
  ];

  const menuItems = role === 'ADMIN' ? adminItems : memberItems;

  return (
    <>
      {/* Mobile Backdrop Overlay with Smooth Transition */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-slate-950/95 backdrop-blur-xl flex flex-col border-r border-slate-800/50 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden z-50 transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        
        {/* Logo Section */}
        <div className="h-24 flex items-center justify-between px-6 border-b border-slate-800/50 relative overflow-hidden group z-10 bg-slate-950">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-700/50 group-hover:border-cyan-500/50 transition-colors duration-300 shadow-lg shadow-black/20">
               <OdaaLogo size={28} />
            </div>
            <div className="flex flex-col animate-slide-in-right">
                 <span className="text-2xl text-white tracking-widest font-glitch">ODAA</span>
                 <span className="text-[9px] uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 font-bold font-tech">Tree Fruit</span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button onClick={onClose} className="md:hidden text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Account Info */}
        <div className="px-6 py-6 border-b border-slate-800/50 bg-slate-900/20 animate-fade-in delay-100 relative z-10">
           <p className="text-[9px] text-slate-500 uppercase mb-1.5 font-bold tracking-widest font-tech">Authorized Personnel</p>
           <div className="flex items-center gap-2">
             <ShieldCheck size={16} className={role === 'ADMIN' ? "text-cyan-400" : "text-slate-500"} />
             <p className="font-bold text-slate-200 text-sm tracking-wide font-tech">
               {role === 'ADMIN' ? 'ADMINISTRATOR' : 'DISTRIBUTOR'}
             </p>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto relative z-10 custom-scrollbar">
          {menuItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-500 ease-out group relative overflow-hidden border
                ${currentView === item.id
                  ? 'bg-slate-900 border-cyan-500/50 text-white shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]' 
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200 hover:border-slate-800'}
                ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0 md:translate-x-0 md:opacity-100'}
              `}
              style={{ transitionDelay: `${isOpen ? idx * 75 + 100 : 0}ms` }}
            >
              {currentView === item.id && (
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 animate-fade-in shadow-[0_0_10px_#22d3ee]"></div>
              )}
              <item.icon className={`w-4 h-4 transition-colors duration-300 ${currentView === item.id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`} />
              <span className="text-sm font-bold tracking-wide relative z-10 font-tech uppercase">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-950/50 animate-fade-in delay-300 relative z-10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg cyber-button text-sm font-bold font-tech uppercase group hover:text-red-400 hover:border-red-900/50"
          >
            <LogOut className="w-4 h-4 group-hover:stroke-red-400 transition-colors" />
            <span>TERMINATE SESSION</span>
          </button>
        </div>
      </div>
    </>
  );
};
