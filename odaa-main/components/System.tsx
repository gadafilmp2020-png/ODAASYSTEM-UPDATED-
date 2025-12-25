
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { GenealogyTree } from './GenealogyTree';
import { Wallet } from './Wallet';
import { Login } from './Login';
import { AdminDashboard } from './AdminDashboard'; 
import { Team } from './Team'; 
import { BrandingPattern } from './BrandingPattern';
import { SupportChat } from './SupportChat';
import { OdaaLogo } from './OdaaLogo';
import { Marketplace } from './Marketplace';
import { MemberRegistration } from './MemberRegistration';
import { NotificationCenter } from './NotificationCenter';
import { SecurityView } from './SecurityView';
import { ViewState, User, Transaction, Notification, PendingRegistration, ActivityLog, P2PRequest, PasswordResetRequest, DeviceApprovalRequest, SystemSettings, ChatMessage, SystemBackup, VerificationRequest, Rank, MarketOrder, ActiveTrade } from '../types';
import { Menu, Bell, ArrowLeft } from 'lucide-react';
import { MOCK_USERS, MOCK_TRANSACTIONS, REFERRAL_BONUS_AMOUNT, MATCHING_BONUS_AMOUNT, JOINING_FEE_AMOUNT } from '../constants';
import { generateAIResponse } from '../services/geminiService';
import { processNewMemberLogic, findAutoPlacement } from '../services/algorithm';
import { useUser } from '../contexts/UserContext';
import { api } from '../services/api';

const STORAGE_VERSION = 'v36_PRODUCTION_FINAL';

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(`${key}_${STORAGE_VERSION}`);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    return parsed === null ? fallback : parsed;
  } catch (e) {
    return fallback;
  }
};

export const System: React.FC<{ theme: 'dark' | 'light', toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
  const { currentUser, isAuthenticated, logout, refreshSession } = useUser();
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // System State Management
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => loadFromStorage('odaa_settings', {
    currencyRate: 1.19, joiningFee: JOINING_FEE_AMOUNT, referralBonus: REFERRAL_BONUS_AMOUNT, matchingBonus: MATCHING_BONUS_AMOUNT,
    levelIncomeBonus: 5.00, p2pFeePercent: 2, withdrawalFeePercent: 5, binaryDailyCap: 5000, maxDailyBinaryPairs: 20, honeyValue: 1.25, coffeeValue: 1.25,
    allowRegistrations: true, allowP2P: true, allowWithdrawals: true, maintenanceMode: false, systemAnnouncement: '', 
    supportEmail: 'support@odaa.net', bankName: 'Commercial Bank of Ethiopia',
    accountNumber: '1000998877665', accountName: 'Odaa Global Systems',
    minOTFSell: 10, maxOTFSell: 10000, minOTFBuy: 10, maxOTFBuy: 10000,
    minOTFRateETB: 0.5, maxOTFRateETB: 5.0,
    cryptoExchangeName: 'Binance', cryptoWalletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', cryptoNetwork: 'BEP20 (BSC)',
    securityCooldownHours: 48, tradeCooldownMinutes: 30
  }));

  const [allUsers, setAllUsers] = useState<User[]>(() => loadFromStorage('odaa_users', MOCK_USERS));
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => loadFromStorage('odaa_tx', MOCK_TRANSACTIONS));
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>(() => loadFromStorage('odaa_preg', []));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadFromStorage('index_notif', []));
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadFromStorage('odaa_msgs', []));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadFromStorage('odaa_logs', []));
  const [kycRequests, setKycRequests] = useState<VerificationRequest[]>(() => loadFromStorage('index_kyc', []));
  const [marketOrders, setMarketOrders] = useState<MarketOrder[]>(() => loadFromStorage('odaa_market', []));
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>(() => loadFromStorage('odaa_trades', []));
  const [usedFTNumbers, setUsedFTNumbers] = useState<string[]>(() => loadFromStorage('odaa_ft_registry', []));

  // Role-Based Initial Routing
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'ADMIN' && currentView === 'DASHBOARD') {
      setCurrentView('ADMIN_DASHBOARD');
    }
  }, [isAuthenticated, currentUser]);

  // Sync session data for live DB changes
  useEffect(() => {
    if (isAuthenticated) {
        // Fetch real tree data from backend to sync Admin/Genealogy views
        api.getTree()
           .then(data => {
               if (Array.isArray(data) && data.length > 0) {
                   setAllUsers(data);
               }
           })
           .catch(err => console.error("Failed to sync tree:", err));

        const interval = setInterval(refreshSession, 30000); // Pulse check every 30s
        return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      const data = {
        odaa_settings: systemSettings, odaa_users: allUsers, odaa_tx: allTransactions,
        odaa_preg: pendingRegistrations, index_notif: notifications, odaa_msgs: messages,
        odaa_logs: activityLogs, index_kyc: kycRequests, odaa_market: marketOrders,
        odaa_trades: activeTrades, odaa_ft_registry: usedFTNumbers
      };
      Object.entries(data).forEach(([key, val]) => {
        localStorage.setItem(`${key}_${STORAGE_VERSION}`, JSON.stringify(val));
      });
    }, 1500); 
    return () => clearTimeout(saveTimer);
  }, [systemSettings, allUsers, allTransactions, pendingRegistrations, notifications, messages, activityLogs, kycRequests, marketOrders, activeTrades, usedFTNumbers]);

  const handleUpdateUser = useCallback((userId: string, updates: Partial<User>) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    // Local update for responsive UI, server will persist on next fetch
  }, []);

  const handleLogActivity = (userId: string, userName: string, action: ActivityLog['action'], details: string) => {
      const log: ActivityLog = { id: `log-${Date.now()}`, userId, userName, action, details, timestamp: new Date().toISOString() };
      setActivityLogs(prev => [log, ...prev]);
  };

  const handleSendMessage = async (text: string) => {
      if(!currentUser) return;
      const userMsg: ChatMessage = { id: `m-${Date.now()}`, senderId: currentUser.id, senderName: currentUser.name, recipientId: 'AI_SUPPORT', text, timestamp: new Date().toISOString(), read: true };
      setMessages(prev => [...prev, userMsg]);
      const history = messages.filter(m => m.senderId === currentUser.id || m.recipientId === currentUser.id);
      const aiResponseText = await generateAIResponse(currentUser, history, text);
      const aiMsg: ChatMessage = { id: `m-${Date.now()+1}`, senderId: 'AI_SUPPORT', senderName: 'Gemini Agent', recipientId: currentUser.id, text: aiResponseText, timestamp: new Date().toISOString(), read: false };
      setMessages(prev => [...prev, aiMsg]);
  };

  // --- CORE ALGORITHM: Registration Approval ---
  const handleApproveRegistration = (regId: string) => {
    const reg = pendingRegistrations.find(r => r.id === regId);
    if (!reg) return;

    if (allUsers.some(u => u.username === reg.username || u.email === reg.email)) {
        alert("CRITICAL: Username or Email already exists in the registry.");
        return;
    }

    // Determine Placement
    let parentId = reg.sponsorId;
    let leg: 'LEFT' | 'RIGHT' = 'LEFT';

    if (reg.placementMode === 'MANUAL' && reg.manualParentUsername) {
        const manualParent = allUsers.find(u => u.username === reg.manualParentUsername);
        if (manualParent) {
            const isOccupied = allUsers.some(u => u.parentId === manualParent.id && u.leg === reg.manualLeg);
            if (!isOccupied) {
                parentId = manualParent.id;
                leg = reg.manualLeg || 'LEFT';
            } else {
                // Fallback to auto if manual spot taken
                const placement = findAutoPlacement(allUsers, reg.sponsorId);
                parentId = placement.parentId;
                leg = placement.leg;
            }
        } else {
             const placement = findAutoPlacement(allUsers, reg.sponsorId);
             parentId = placement.parentId;
             leg = placement.leg;
        }
    } else {
        const placement = findAutoPlacement(allUsers, reg.sponsorId);
        parentId = placement.parentId;
        leg = placement.leg;
    }

    const newUser: User = {
        id: `u-${Date.now()}`,
        name: reg.name,
        username: reg.username,
        email: reg.email,
        phoneNumber: reg.phoneNumber,
        role: 'MEMBER',
        joinDate: new Date().toISOString().split('T')[0],
        rank: Rank.MEMBER,
        parentId,
        leg,
        sponsorId: reg.sponsorId,
        balance: 0,
        totalEarnings: 0,
        honeyBalance: 0,
        coffeeBalance: 0,
        avatar: `https://ui-avatars.com/api/?name=${reg.name}`,
        downlineCount: 0,
        status: 'ACTIVE',
        password: reg.password,
        binaryLeftCount: 0,
        binaryRightCount: 0,
        binaryLeftVolume: 0,
        binaryRightVolume: 0,
        binaryPaidVolume: 0,
        careerVolume: 0,
        binaryPaidPairs: 0,
        kycStatus: 'NONE'
    };

    // Execute MLM Logic (Commissions, Volume)
    const { updatedUsers, newTransactions } = processNewMemberLogic(newUser, allUsers, systemSettings);

    setAllUsers(updatedUsers);
    setAllTransactions(prev => [...newTransactions, ...prev]);
    setPendingRegistrations(prev => prev.filter(r => r.id !== regId));
    
    // Register used FT number
    if(reg.ftNumber) setUsedFTNumbers(prev => [...prev, reg.ftNumber]);

    handleLogActivity('admin1', 'System', 'REGISTRATION_APPROVAL', `Activated Node: @${newUser.username} under @${allUsers.find(u=>u.id===parentId)?.username}`);
  };

  const handleApproveAllDeposits = () => {
      const deposits = allTransactions.filter(t => t.type === 'DEPOSIT' && t.depositStage === 'PAYMENT_SUBMITTED');
      let updatedTx = [...allTransactions];
      let updatedUsers = [...allUsers];

      deposits.forEach(tx => {
          updatedTx = updatedTx.map(t => t.id === tx.id ? { ...t, status: 'APPROVED', depositStage: 'COMPLETED' } : t);
          updatedUsers = updatedUsers.map(u => u.id === tx.userId ? { ...u, balance: u.balance + tx.amount } : u);
      });

      setAllTransactions(updatedTx);
      setAllUsers(updatedUsers);
      handleLogActivity('admin1', 'System', 'OTHER', `Bulk approved ${deposits.length} deposits`);
  };

  if (!isAuthenticated) return <Login />;

  return (
    <div className="min-h-screen relative text-slate-200 bg-brand-dark">
      <BrandingPattern />
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-40">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400 hover:text-white"><Menu size={24}/></button>
          <div className="flex items-center gap-2"><OdaaLogo size={24}/><span className="font-bold font-tech text-white tracking-widest">ODAA</span></div>
          <button onClick={() => setIsNotificationOpen(true)} className="p-2 text-slate-400 hover:text-brand-lime relative">
              <Bell size={20}/>
              {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>}
          </button>
      </div>

      <Sidebar 
        currentView={currentView} setView={setCurrentView} role={currentUser?.role || 'MEMBER'} onLogout={logout} 
        isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} theme={theme} toggleTheme={toggleTheme} 
        notificationCount={notifications.filter(n => !n.read).length} adminActionCount={pendingRegistrations.length + kycRequests.length}
      />
      
      <NotificationCenter 
         notifications={notifications.filter(n => n.userId === currentUser?.id || currentUser?.role === 'ADMIN')}
         isOpen={isNotificationOpen} 
         onClose={() => setIsNotificationOpen(false)}
         onMarkRead={id => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))} 
         onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} 
         onClearAll={() => setNotifications([])}
         onNavigate={setCurrentView}
      />

      <main className="md:ml-72 p-6 pt-24 md:pt-8 relative z-10 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {currentView === 'DASHBOARD' && currentUser && (
            <Dashboard 
                user={currentUser} usersList={allUsers} transactions={allTransactions} 
                systemSettings={systemSettings} onUpdateProfile={u => handleUpdateUser(currentUser.id, u)}
                onViewChange={setCurrentView} onRequestRegistration={r => setPendingRegistrations(p => [{...r, id: `pr${Date.now()}`, date: new Date().toISOString(), requestedBy: currentUser.id} as PendingRegistration, ...p])}
            />
          )}
          
          {currentView === 'ADMIN_DASHBOARD' && currentUser?.role === 'ADMIN' && (
            <AdminDashboard 
                users={allUsers} setUsers={setAllUsers} transactions={allTransactions} setTransactions={setAllTransactions} 
                addNotification={(uid, msg, type) => setNotifications(p => [{ id: `n${Date.now()}`, userId: uid, message: msg, type, date: new Date().toISOString(), read: false }, ...p])} 
                systemSettings={systemSettings} setSystemSettings={setSystemSettings} 
                pendingRegistrations={pendingRegistrations} setPendingRegistrations={setPendingRegistrations}
                verificationRequests={kycRequests} onApproveVerification={id => { setKycRequests(p => p.filter(k => k.id !== id)); const req = kycRequests.find(k => k.id === id); if(req) handleUpdateUser(req.userId, { kycStatus: 'VERIFIED' }); }}
                onRejectVerification={(id, reason) => { setKycRequests(p => p.filter(k => k.id !== id)); const req = kycRequests.find(k => k.id === id); if(req) handleUpdateUser(req.userId, { kycStatus: 'REJECTED' }); }}
                activityLogs={activityLogs} onLogActivity={handleLogActivity}
                onUpdateUser={handleUpdateUser} onResetSystem={() => { localStorage.clear(); window.location.reload(); }}
                onRestoreSystem={(backup) => { 
                    setAllUsers(backup.data.users); setAllTransactions(backup.data.transactions); setSystemSettings(backup.data.settings); 
                    setActivityLogs(backup.data.logs); setPendingRegistrations(backup.data.pendingRegistrations);
                    alert("System Restored"); 
                }}
                onRegisterUser={(data) => {
                    // Direct Admin Registration Bypass
                    const newUser = { ...data, id: `u-${Date.now()}`, joinDate: new Date().toISOString().split('T')[0], status: 'ACTIVE', balance: 0, totalEarnings: 0, downlineCount: 0, avatar: `https://ui-avatars.com/api/?name=${data.name}` };
                    // Placement Logic
                    const placement = findAutoPlacement(allUsers, data.sponsorId);
                    newUser.parentId = placement.parentId;
                    newUser.leg = placement.leg;
                    const { updatedUsers } = processNewMemberLogic(newUser as User, allUsers, systemSettings);
                    setAllUsers(updatedUsers);
                }}
                onApproveRegistration={handleApproveRegistration}
                onApproveAllDeposits={handleApproveAllDeposits}
                p2pRequests={activeTrades.filter(t => t.status === 'WAITING_PAYMENT') as any} // Map trades to request view if needed
            />
          )}
          
          {currentView === 'WALLET' && currentUser && (
            <Wallet 
                user={currentUser} allUsers={allUsers} transactions={allTransactions} 
                onAddTransaction={t => { setAllTransactions(p => [t, ...p]); handleLogActivity(currentUser.id, currentUser.name, 'TRANSACTION_REQUEST', `Type: ${t.type}, Amount: ${t.amount}`); }} 
                onUpdateTransaction={(id, updates) => setAllTransactions(p => p.map(t => t.id === id ? { ...t, ...updates } : t))}
                systemSettings={systemSettings} isFTUsed={ft => usedFTNumbers.includes(ft)}
            />
          )}
          {currentView === 'MARKETPLACE' && currentUser && (
            <Marketplace 
                currentUser={currentUser} allUsers={allUsers} systemSettings={systemSettings}
                marketOrders={marketOrders} activeTrades={activeTrades} 
                onPlaceOrder={o => setMarketOrders(p => [...p, o])}
                onInitiateTrade={(t, orderId) => { setActiveTrades(p => [...p, t]); setMarketOrders(p => p.filter(o => o.id !== orderId)); }}
                onTradeAction={(tid, act, pay) => setActiveTrades(trades => trades.map(t => t.id === tid ? { ...t, status: act === 'PAYMENT' ? 'PAID_VERIFYING' : act === 'RELEASE' ? 'COMPLETED' : 'CANCELLED', ftNumber: pay || t.ftNumber } : t))}
                isFTUsed={ft => usedFTNumbers.includes(ft)}
            />
          )}
          {currentView === 'GENEALOGY' && currentUser && <GenealogyTree users={allUsers} rootId={currentUser.id} />}
          {currentView === 'TEAM' && currentUser && <Team currentUser={currentUser} allUsers={allUsers} />}
          {currentView === 'SECURITY' && currentUser && <SecurityView user={currentUser} onUpdateSettings={handleUpdateUser} onReportPasswordReset={u => alert("Reset Request Sent")} onKycSubmission={k => setKycRequests(p => [{ ...k, id: `k${Date.now()}`, userId: currentUser.id, username: currentUser.username, timestamp: new Date().toISOString(), status: 'PENDING' } as VerificationRequest, ...p])} />}
          {currentView === 'REGISTER' && currentUser && <MemberRegistration currentUser={currentUser} usersList={allUsers} systemSettings={systemSettings} onRequestRegistration={r => setPendingRegistrations(p => [{...r, id: `pr${Date.now()}`, date: new Date().toISOString(), requestedBy: currentUser.id} as PendingRegistration, ...p])} isFTUsed={ft => usedFTNumbers.includes(ft)} />}
        </div>
      </main>
      {currentUser?.role !== 'ADMIN' && currentUser && <SupportChat currentUser={currentUser} messages={messages} onSendMessage={handleSendMessage} isSupportOnline={allUsers.some(u => u.role === 'ADMIN' && u.isOnline)} />}
    </div>
  );
};
