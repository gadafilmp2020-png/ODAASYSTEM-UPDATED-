
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { GenealogyTree } from './GenealogyTree';
import { Wallet } from './Wallet';
import { Login } from './Login';
import { Team } from './Team'; 
import { BrandingPattern } from './BrandingPattern';
import { SupportChat } from './SupportChat';
import { OdaaLogo } from './OdaaLogo';
import { Marketplace } from './Marketplace';
import { MemberRegistration } from './MemberRegistration';
import { NotificationCenter } from './NotificationCenter';
import { SecurityView } from './SecurityView';
import { ViewState } from '../types';
import { Menu, Bell } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { api } from '../services/api';

export const System: React.FC<{ theme: 'dark' | 'light', toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
  const { currentUser, isAuthenticated, logout } = useUser();
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Data State
  const [transactions, setTransactions] = useState([]);
  const [systemSettings, setSystemSettings] = useState<any>({});
  const [usersList, setUsersList] = useState([]); // For team/genealogy

  // Fetch Data on Load
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          const dashboardData = await api.getDashboardData();
          setTransactions(dashboardData.transactions);
          // In a real app, settings would come from API too
          setSystemSettings({
             currencyRate: 1.19, joiningFee: 1000, referralBonus: 150,
             withdrawalFeePercent: 3, p2pFeePercent: 2,
             bankName: 'Commercial Bank of Ethiopia', accountNumber: '1000998877665', accountName: 'Odaa Global Systems'
          });
          
          if (currentView === 'GENEALOGY' || currentView === 'TEAM') {
             const treeData = await api.getTree();
             setUsersList(treeData);
          }
        } catch (e) {
          console.error("Data fetch error", e);
        }
      };
      fetchData();
    }
  }, [isAuthenticated, currentView]);

  if (!isAuthenticated) return <Login />;

  return (
    <div className="min-h-screen relative text-slate-200 bg-brand-dark">
      <BrandingPattern />
      
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-40">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400 hover:text-white"><Menu size={24}/></button>
          <div className="flex items-center gap-2"><OdaaLogo size={24}/><span className="font-bold font-tech text-white tracking-widest">ODAA</span></div>
          <button onClick={() => setIsNotificationOpen(true)} className="p-2 text-slate-400 hover:text-brand-lime relative">
              <Bell size={20}/>
          </button>
      </div>

      <Sidebar 
        currentView={currentView} setView={setCurrentView} role={currentUser?.role || 'MEMBER'} onLogout={logout} 
        isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} theme={theme} toggleTheme={toggleTheme} 
      />
      
      <NotificationCenter 
         notifications={[]} 
         isOpen={isNotificationOpen} 
         onClose={() => setIsNotificationOpen(false)}
         onMarkRead={() => {}} onMarkAllRead={() => {}} onClearAll={() => {}}
         onNavigate={setCurrentView}
      />

      <main className="md:ml-80 p-6 pt-20 md:pt-8 relative z-10 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {currentView === 'DASHBOARD' && currentUser && (
            <Dashboard 
                user={currentUser} usersList={usersList} transactions={transactions} 
                systemSettings={systemSettings} onUpdateProfile={() => {}}
                onViewChange={setCurrentView}
            />
          )}
          {currentView === 'GENEALOGY' && currentUser && <GenealogyTree users={usersList} rootId={currentUser.id} />}
          {currentView === 'TEAM' && currentUser && <Team currentUser={currentUser} allUsers={usersList} />}
          {currentView === 'WALLET' && currentUser && (
            <Wallet 
                user={currentUser} transactions={transactions} 
                onAddTransaction={() => {}} systemSettings={systemSettings}
            />
          )}
          {currentView === 'SECURITY' && currentUser && <SecurityView user={currentUser} onUpdateSettings={() => {}} onReportPasswordReset={() => {}} />}
        </div>
      </main>
    </div>
  );
};
