
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Network, CreditCard, Users, LogOut, ShieldCheck, Terminal, X, UserPlus, ShoppingBag, Sun, Moon, ShieldAlert, Globe } from 'lucide-react';
import { ViewState, Role, Permission } from '../types';
import { OdaaLogo } from './OdaaLogo';
import { hasPermission } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { translations } from '../translations';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  role: Role;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  notificationCount?: number;
  adminActionCount?: number;
}

interface MenuItem {
  id: ViewState;
  labelKey: keyof typeof translations['en'];
  icon: React.ElementType;
  permission: Permission;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  role, 
  onLogout, 
  isOpen, 
  onClose,
  theme,
  toggleTheme,
  notificationCount = 0,
  adminActionCount = 0
}) => {
  const { t } = useLanguage();
  
  const allMenuItems: MenuItem[] = [
    { id: 'ADMIN_DASHBOARD', labelKey: 'adminDashboard', icon: Terminal, permission: 'VIEW_ADMIN_CONSOLE' },
    { id: 'DASHBOARD', labelKey: 'dashboard', icon: LayoutGrid, permission: 'VIEW_MEMBER_DASHBOARD' },
    { id: 'WALLET', labelKey: 'wallet', icon: CreditCard, permission: 'ACCESS_WALLET' },
    { id: 'MARKETPLACE', labelKey: 'marketplace', icon: ShoppingBag, permission: 'P2P_TRADE' },
    { id: 'TEAM', labelKey: 'team', icon: Users, permission: 'VIEW_TEAM' },
    { id: 'GENEALOGY', labelKey: 'genealogy', icon: Network, permission: 'VIEW_TEAM' },
    { id: 'REGISTER', labelKey: 'register', icon: UserPlus, permission: 'REGISTER_MEMBERS' },
    { id: 'SECURITY', labelKey: 'security', icon: ShieldAlert, permission: 'VIEW_MEMBER_DASHBOARD' },
  ];

  const visibleMenuItems = allMenuItems.filter(item => hasPermission(role, item.permission));
  const isAdmin = role === 'ADMIN';

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 dark:bg-black/90 backdrop-blur-xl z-40 md:hidden transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      {/* Dark/Lime Mobile Drawer */}
      <div className={`
        fixed top-4 right-4 bottom-4 w-72 bg-brand-surface flex flex-col border border-brand-lime/20 rounded-[3rem] z-50 transition-transform duration-500 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'}
        md:translate-x-0
      `}>
        
        <div className="p-8 pb-4 flex items-center justify-between">
          <button onClick={onClose} className="md:hidden text-slate-500 hover:text-brand-lime p-2">
            <X size={24} />
          </button>
          <Link to="/" className="flex items-center gap-4 group cursor-pointer text-right">
            <div className="flex flex-col">
                 <span className="text-2xl text-white font-bold tracking-tight font-tech">ODAA</span>
                 <span className="text-[7px] uppercase tracking-[0.6em] font-black text-brand-lime leading-none">BUSINESS_SYSTEM</span>
            </div>
            <div className="p-2.5 bg-brand-lime/10 rounded-2xl border border-brand-lime/20 group-hover:scale-110 transition-all duration-500">
               <OdaaLogo size={32} className="text-brand-lime" />
            </div>
          </Link>
        </div>

        <div className="px-6 py-6">
           <div className="p-5 rounded-[2rem] bg-black/20 border border-brand-lime/10 flex flex-row-reverse items-center gap-4 group hover:bg-black/40 transition-all text-right">
              <div className={`p-3 rounded-xl transition-transform group-hover:rotate-12 ${isAdmin ? 'bg-cyan-500/20 text-cyan-400' : 'bg-brand-lime/20 text-brand-lime'}`}>
                {isAdmin ? <Terminal size={20}/> : <ShieldCheck size={20}/>}
              </div>
              <div className="space-y-0.5 overflow-hidden flex-1">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-lora italic leading-none">User Profile</p>
                <p className="text-xs font-bold text-white uppercase tracking-tight truncate">{role}</p>
              </div>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pt-2">
          <p className="px-5 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 font-lora italic text-right">Main Menu</p>
          {visibleMenuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setView(item.id); onClose(); }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-[1.8rem] transition-all duration-500 group relative overflow-hidden border-2
                  ${isActive
                    ? 'bg-brand-lime text-black border-brand-lime shadow-glow-lime' 
                    : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'}
                `}
              >
                <div className="flex items-center gap-5 flex-row-reverse w-full">
                  <item.icon className={`w-5 h-5 transition-all duration-500 shrink-0 ${isActive ? 'scale-110' : 'group-hover:text-brand-lime group-hover:-translate-x-1'}`} />
                  <span className="text-[11px] font-black uppercase tracking-widest font-tech flex-1 text-right">{t(item.labelKey)}</span>
                </div>
                {item.id === 'ADMIN_DASHBOARD' && adminActionCount > 0 && (
                   <span className="absolute left-4 bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-lg font-black animate-pulse">{adminActionCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-8 space-y-3 bg-black/20 rounded-b-[3rem] border-t border-white/5">
          {/* Language Selector in Sidebar */}
          <div className="w-full flex justify-end">
             <LanguageSelector />
          </div>

          <Link 
            to="/"
            className="w-full flex items-center justify-between px-5 py-3 rounded-2xl text-slate-500 hover:text-brand-lime hover:bg-white/5 transition-all group flex-row-reverse border border-transparent hover:border-white/5"
          >
            <div className="flex items-center gap-5 flex-row-reverse w-full">
                <Globe size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-widest font-tech flex-1 text-right">
                  {t('publicWebsite')}
                </span>
            </div>
          </Link>

          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-5 py-3 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all group flex-row-reverse border border-transparent hover:border-white/5"
          >
            <div className="flex items-center gap-5 flex-row-reverse w-full">
                {theme === 'dark' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-slate-400" />}
                <span className="text-[11px] font-black uppercase tracking-widest font-tech flex-1 text-right">
                  {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                </span>
            </div>
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-5 px-5 py-4 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all group flex-row-reverse text-right"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-widest font-tech flex-1">{t('logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};
