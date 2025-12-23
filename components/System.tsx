
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { GenealogyTree } from './GenealogyTree';
import { Wallet } from './Wallet';
import { Login } from './Login';
// import { AdminDashboard } from './AdminDashboard'; // Removed AdminDashboard import due to deletion
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

const STORAGE_VERSION = 'v25_FT_REGISTRY';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => loadFromStorage('odaa_settings', {
    currencyRate: 1.19, joiningFee: JOINING_FEE_AMOUNT, referralBonus: REFERRAL_BONUS_AMOUNT, matchingBonus: MATCHING_BONUS_AMOUNT,
    levelIncomeBonus: 5.00, p2pFeePercent: 2, withdrawalFeePercent: 5, binaryDailyCap: 5000, honeyValue: 1.25, coffeeValue: 1.25,
    allowRegistrations: true, allowP2P: true, allowWithdrawals: true, maintenanceMode: false, systemAnnouncement: '', 
    supportEmail: 'support@odaa.net', bankName: 'Commercial Bank of Ethiopia',
    accountNumber: '1000998877665', accountName: 'Odaa Global Systems',
    minOTFSell: 10, maxOTFSell: 10000, minOTFBuy: 10, maxOTFBuy: 10000,
    minOTFRateETB: 0.5, maxOTFRateETB: 5.0,
    cryptoExchangeName: 'Binance', cryptoWalletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', cryptoNetwork: 'BEP20 (BSC)',
    securityCooldownHours: 48
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
    setCurrentUser(prev => (prev?.id === userId ? { ...prev, ...updates } : prev));
  }, []);

  const handleLogActivity = (userId: string, userName: string, action: ActivityLog['action'], details: string) => {
      const log: ActivityLog = { id: `log-${Date.now()}`, userId, userName, action, details, timestamp: new Date().toISOString() };
      setActivityLogs(prev => [log, ...prev]);
  };

  const handleSendMessage = async (text: string) => {
      if(!currentUser) return;
      const userMsg: ChatMessage = { id: `m-${Date.now()}`, senderId: currentUser.id, senderName: currentUser.name, recipientId: 'AI_SUPPORT', text, timestamp: new Date().toISOString(), read: true };
      setMessages(prev => [...prev, userMsg]);

      // Gemini AI Response
      const history = messages.filter(m => m.senderId === currentUser.id || m.recipientId === currentUser.id);
      const aiResponseText = await generateAIResponse(currentUser, history, text);
      
      const aiMsg: ChatMessage = { id: `m-${Date.now()+1}`, senderId: 'AI_SUPPORT', senderName: 'Gemini Agent', recipientId: currentUser.id, text: aiResponseText, timestamp: new Date().toISOString(), read: false };
      setMessages(prev => [...prev, aiMsg]);
  };

  const handleLogin = (user: User, deviceId: string) => {
    const updated = { ...user, isOnline: true, lastActive: new Date().toISOString() };
    setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    setCurrentUser(updated);
    setIsAuthenticated(true);
    // setCurrentView(user.role === 'ADMIN' ? 'ADMIN_DASHBOARD' : 'DASHBOARD'); // Original line
    setCurrentView('DASHBOARD'); // Temporarily redirect ADMIN to DASHBOARD since AdminDashboard (root) is removed.
  };

  const handleLogout = () => {
    if (currentUser) handleUpdateUser(currentUser.id, { isOnline: false });
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} users={allUsers} />;

  return (
    <div className="min-h-screen relative text-slate-200 bg-brand-dark">
      <BrandingPattern />
      <Sidebar 
        currentView={currentView} setView={setCurrentView} role={currentUser?.role || 'MEMBER'} onLogout={handleLogout} 
        isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} theme={theme} toggleTheme={toggleTheme} 
      />
      <main className="md:ml-64 p-6 pt-24 md:pt-12 relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {currentView === 'DASHBOARD' && (
            <Dashboard 
                user={currentUser!} usersList={allUsers} transactions={allTransactions} 
                systemSettings={systemSettings} onUpdateProfile={u => handleUpdateUser(currentUser!.id, u)}
                onViewChange={setCurrentView}
            />
          )}
          {/* AdminDashboard component (root) has been removed/deleted. 
              The Admin Dashboard functionality should be handled by 'odaa-main/components/AdminDashboard'.
              If an admin user logs in, they will currently see the regular dashboard.
          {currentView === 'ADMIN_DASHBOARD' && currentUser?.role === 'ADMIN' && (
            <AdminDashboard 
                users={allUsers} setUsers={setAllUsers} transactions={allTransactions} setTransactions={setAllTransactions} 
                addNotification={(uid, msg, type) => setNotifications(p => [{ id: `n${Date.now()}`, userId: uid, message: msg, type, date: new Date().toISOString(), read: false }, ...p])} 
                systemSettings={systemSettings} setSystemSettings={setSystemSettings} 
                pendingRegistrations={pendingRegistrations} setPendingRegistrations={setPendingRegistrations}
                verificationRequests={kycRequests} activityLogs={activityLogs} onLogActivity={(uid, un, act, det) => setActivityLogs(p => [{ id: `l${Date.now()}`, userId: uid, userName: un, action: act, details: det, timestamp: new Date().toISOString() }, ...p])}
                onUpdateUser={handleUpdateUser} onResetSystem={() => { localStorage.clear(); window.location.reload(); }}
            />
          )}
          */}
          {currentView === 'WALLET' && (
            <Wallet 
                user={currentUser!} allUsers={allUsers} transactions={allTransactions} 
                onAddTransaction={t => { setAllTransactions(p => [t, ...p]); handleLogActivity(currentUser!.id, currentUser!.name, 'TRANSACTION_REQUEST', `Type: ${t.type}, Amount: ${t.amount}`); }} 
                onUpdateTransaction={(id, updates) => setAllTransactions(p => p.map(t => t.id === id ? { ...t, ...updates } : t))}
                systemSettings={systemSettings}
            />
          )}
          {currentView === 'MARKETPLACE' && (
            <Marketplace 
                currentUser={currentUser!} allUsers={allUsers} systemSettings={systemSettings}
                marketOrders={marketOrders} activeTrades={activeTrades} 
                onPlaceOrder={o => setMarketOrders(p => [...p, o])}
                onInitiateTrade={t => setActiveTrades(p => [...p, t])}
                onTradeAction={(tid, act, pay) => setActiveTrades(trades => trades.map(t => t.id === tid ? { ...t, status: act === 'PAYMENT' ? 'PAID_VERIFYING' : act === 'RELEASE' ? 'COMPLETED' : 'CANCELLED', ftNumber: pay || t.ftNumber } : t))}
            />
          )}
          {currentView === 'GENEALOGY' && <GenealogyTree users={allUsers} rootId={currentUser!.id} />}
          {currentView === 'TEAM' && <Team currentUser={currentUser!} allUsers={allUsers} />}
          {currentView === 'SECURITY' && <SecurityView user={currentUser!} onUpdateSettings={handleUpdateUser} onReportPasswordReset={u => alert("Reset Request Sent")} onKycSubmission={k => setKycRequests(p => [{ ...k, id: `k${Date.now()}`, userId: currentUser!.id, username: currentUser!.username, timestamp: new Date().toISOString(), status: 'PENDING' } as VerificationRequest, ...p])} />}
          {currentView === 'REGISTER' && <MemberRegistration currentUser={currentUser!} usersList={allUsers} systemSettings={systemSettings} onRequestRegistration={r => setPendingRegistrations(p => [{...r, id: `pr${Date.now()}`, date: new Date().toISOString(), requestedBy: currentUser!.id}, ...p])} />}
        </div>
      </main>
      {currentUser?.role !== 'ADMIN' && <SupportChat currentUser={currentUser!} messages={messages} onSendMessage={handleSendMessage} isSupportOnline={allUsers.some(u => u.role === 'ADMIN' && u.isOnline)} />}
    </div>
  );
};