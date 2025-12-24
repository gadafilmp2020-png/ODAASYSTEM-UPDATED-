
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
import { MOCK_TRANSACTIONS, REFERRAL_BONUS_PERCENT, MATCHING_BONUS_PERCENT, JOINING_FEE_AMOUNT, ADMIN_USER_ID, OTF_VALUE_ETB, COMPANY_BANK_DETAILS, COMPANY_CRYPTO_DETAILS } from '../constants';
import { generateAIResponse } from '../services/geminiService';
import { processNewMemberLogic, findAutoPlacement } from '../services/algorithm';
import { useUser } from '../contexts/UserContext';

const STORAGE_VERSION = 'v30_ALGO_REFACTOR';

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
  // Use Global User Context
  const { currentUser, allUsers, isAuthenticated, login, logout, updateUser, setAllUsers } = useUser();
  
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Updated System Settings based on new requirements
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => loadFromStorage('odaa_settings', {
    currencyRate: 1.19,
    joiningFee: 1000,
    referralBonus: 150,
    matchingBonus: 100, 
    levelIncomeBonus: 5.00,
    p2pFeePercent: 2,
    withdrawalFeePercent: 3,
    binaryDailyCap: 5000, 
    honeyValue: 1.25, 
    coffeeValue: 1.25,
    allowRegistrations: true, 
    allowP2P: true, 
    allowWithdrawals: true, 
    maintenanceMode: false, 
    systemAnnouncement: '', 
    supportEmail: 'support@odaa.net', 
    bankName: COMPANY_BANK_DETAILS.bankName,
    accountNumber: COMPANY_BANK_DETAILS.accountNumber, 
    accountName: COMPANY_BANK_DETAILS.accountName,
    minOTFSell: 10, 
    maxOTFSell: 10000, 
    minOTFBuy: 10, 
    maxOTFBuy: 10000,
    minOTFRateETB: 1.11,
    maxOTFRateETB: 1.99,
    cryptoExchangeName: COMPANY_CRYPTO_DETAILS.exchange, 
    cryptoWalletAddress: COMPANY_CRYPTO_DETAILS.walletAddress, 
    cryptoNetwork: COMPANY_CRYPTO_DETAILS.network,
    securityCooldownHours: 24,
    tradeCooldownMinutes: 5
  }));

  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => loadFromStorage('odaa_tx', MOCK_TRANSACTIONS));
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>(() => loadFromStorage('odaa_preg', []));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadFromStorage('index_notif', []));
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadFromStorage('odaa_msgs', []));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadFromStorage('odaa_logs', []));
  const [kycRequests, setKycRequests] = useState<VerificationRequest[]>(() => loadFromStorage('index_kyc', []));
  const [marketOrders, setMarketOrders] = useState<MarketOrder[]>(() => loadFromStorage('odaa_market', []));
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>(() => loadFromStorage('odaa_trades', []));
  const [usedFTNumbers, setUsedFTNumbers] = useState<string[]>(() => loadFromStorage('odaa_ft_registry', []));
  
  // Admin & P2P State
  const [p2pRequests, setP2PRequests] = useState<P2PRequest[]>(() => loadFromStorage('odaa_p2p_req', []));
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>(() => loadFromStorage('odaa_pwd_reset', []));
  const [deviceApprovalRequests, setDeviceApprovalRequests] = useState<DeviceApprovalRequest[]>(() => loadFromStorage('odaa_device_req', []));

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      const data = {
        odaa_settings: systemSettings, odaa_tx: allTransactions,
        odaa_preg: pendingRegistrations, index_notif: notifications, odaa_msgs: messages,
        odaa_logs: activityLogs, index_kyc: kycRequests, odaa_market: marketOrders,
        odaa_trades: activeTrades, odaa_ft_registry: usedFTNumbers,
        odaa_p2p_req: p2pRequests, odaa_pwd_reset: passwordResetRequests, odaa_device_req: deviceApprovalRequests
      };
      Object.entries(data).forEach(([key, val]) => {
        localStorage.setItem(`${key}_${STORAGE_VERSION}`, JSON.stringify(val));
      });
    }, 1000); 
    return () => clearTimeout(saveTimer);
  }, [systemSettings, allTransactions, pendingRegistrations, notifications, messages, activityLogs, kycRequests, marketOrders, activeTrades, usedFTNumbers, p2pRequests, passwordResetRequests, deviceApprovalRequests]);

  const handleUpdateUser = updateUser; 

  const handleLogActivity = (userId: string, userName: string, action: ActivityLog['action'], details: string) => {
      const log: ActivityLog = { id: `log-${Date.now()}`, userId, userName, action, details, timestamp: new Date().toISOString() };
      setActivityLogs(prev => [log, ...prev]);
  };

  const handleClearLogs = () => {
      setActivityLogs([]);
      handleLogActivity(currentUser?.id || 'admin', 'Admin', 'SYSTEM_CONFIG', 'Audit logs cleared.');
  };

  const handleAddNotification = (userId: string, message: string, type: Notification['type']) => {
      const notif: Notification = {
          id: `n-${Date.now()}-${Math.random()}`,
          userId,
          message,
          type,
          date: new Date().toISOString(),
          read: false
      };
      setNotifications(prev => [notif, ...prev]);
  };

  // --- P2P & SECURITY HANDLERS ---
  
  const handleP2PRequest = (req: any, targetUsername: string) => {
      if (!currentUser) return;
      const targetUser = allUsers.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
      if (!targetUser) throw new Error("Target user not found");
      
      const isSend = req.type === 'SEND';
      
      const newReq: P2PRequest = {
          id: `p2p-${Date.now()}`,
          requestorId: currentUser.id,
          requestorName: currentUser.username,
          targetUserId: targetUser.id,
          targetUserName: targetUser.username,
          status: isSend ? 'PENDING_ADMIN' : 'PENDING_SENDER',
          date: new Date().toISOString(),
          ...req
      };
      
      setP2PRequests(prev => [newReq, ...prev]);
      
      if (isSend) {
          handleAddNotification(targetUser.id, `Incoming Funds: ${currentUser.username} has sent ${req.amount} OTF. Pending Admin Approval.`, 'INFO');
          handleAddNotification('admin1', `P2P SEND: ${currentUser.username} -> ${targetUser.username} (${req.amount} OTF). Needs Approval.`, 'WARNING');
      } else {
          handleAddNotification(targetUser.id, `Payment Request: ${currentUser.username} requests ${req.amount} OTF. Approve in Wallet.`, 'WARNING');
      }
  };

  const handleP2PAction = (id: string, action: 'APPROVE' | 'REJECT') => {
      setP2PRequests(prev => prev.map(r => {
          if (r.id !== id) return r;
          
          if (action === 'APPROVE' && r.status === 'PENDING_SENDER') {
              const sender = allUsers.find(u => u.id === r.targetUserId);
              if (sender && sender.balance < r.total) {
                  handleAddNotification(r.targetUserId, `Error: Insufficient balance to approve request.`, 'ERROR');
                  return r;
              }

              handleAddNotification(r.requestorId, `Request Accepted! ${r.targetUserName} approved transfer. Pending Admin.`, 'INFO');
              handleAddNotification('admin1', `P2P REQUEST: ${r.targetUserName} approved sending ${r.amount} OTF to ${r.requestorName}. Needs Final Approval.`, 'WARNING');
              return { ...r, status: 'PENDING_ADMIN' };
          }

          if (action === 'APPROVE' && r.status === 'PENDING_ADMIN') {
              const senderId = r.type === 'SEND' ? r.requestorId : r.targetUserId;
              const receiverId = r.type === 'SEND' ? r.targetUserId : r.requestorId;
              
              const sender = allUsers.find(u => u.id === senderId);
              if (!sender || sender.balance < r.total) {
                  return { ...r, status: 'REJECTED' }; 
              }

              const lockUntil = new Date();
              lockUntil.setHours(lockUntil.getHours() + 24);

              setAllUsers(users => users.map(u => {
                  if (u.id === senderId) return { ...u, balance: u.balance - r.total }; 
                  if (u.id === receiverId) return { 
                      ...u, 
                      balance: u.balance + r.amount,
                      securityCooldownUntil: lockUntil.toISOString() 
                  };
                  return u;
              }));
              
              handleAddNotification(senderId, `P2P Sent: ${r.amount} OTF to ${r.targetUserName || 'User'}. Fee: ${r.fee} OTF.`, 'INFO');
              handleAddNotification(receiverId, `P2P Received: ${r.amount} OTF. Withdrawals locked for 24h.`, 'SUCCESS');
              return { ...r, status: 'APPROVED' };
          }
          
          if (action === 'REJECT') {
              const notifTarget = r.type === 'SEND' ? r.requestorId : r.requestorId; 
              handleAddNotification(notifTarget, `P2P Transaction Rejected.`, 'ERROR');
          }

          return { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' };
      }));
  };

  const handleReportPasswordReset = (username: string) => {
      const user = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
      if(user) {
          setPasswordResetRequests(p => [...p, { id: `pwd-${Date.now()}`, userId: user.id, username: user.username, name: user.name, date: new Date().toISOString(), status: 'PENDING' }]);
      }
  };

  const handleApprovePasswordReset = (requestId: string) => {
      const req = passwordResetRequests.find(r => r.id === requestId);
      if(req) {
          handleUpdateUser(req.userId, { password: 'password123', isTwoFactorEnabled: false }); 
          setPasswordResetRequests(p => p.filter(r => r.id !== requestId));
          handleAddNotification(req.userId, 'Your password has been reset to "password123" by Admin.', 'WARNING');
      }
  };

  const handleRequestDeviceApproval = (username: string, deviceId: string, ip: string) => {
      setDeviceApprovalRequests(p => [...p, { id: `dev-${Date.now()}`, username, deviceId, ip, timestamp: new Date().toISOString(), status: 'PENDING' }]);
  };

  const handleApproveDevice = (requestId: string) => {
      const req = deviceApprovalRequests.find(r => r.id === requestId);
      if(req) {
          const user = allUsers.find(u => u.username === req.username);
          if(user) {
              const devices = user.allowedDeviceIds || [];
              if(!devices.includes(req.deviceId)) devices.push(req.deviceId);
              handleUpdateUser(user.id, { allowedDeviceIds: devices });
          }
          setDeviceApprovalRequests(p => p.filter(r => r.id !== requestId));
      }
  };

  const handleInitiateTrade = (trade: ActiveTrade, orderId: string) => {
      const seller = allUsers.find(u => u.id === trade.sellerId);
      const order = marketOrders.find(o => o.id === orderId);
      if (!seller || !order) { alert("Trade Error: Seller or Order not found."); return; }
      if (seller.balance < trade.amountOTF) { alert("Trade Failed: Seller has insufficient funds for Escrow lock."); return; }

      const newSellerBalance = seller.balance - trade.amountOTF;
      handleUpdateUser(seller.id, { balance: newSellerBalance });
      handleLogActivity('system', 'System', 'TRADE_ACTION', `Escrow Locked: ${trade.amountOTF} OTF from ${seller.username}`);

      setActiveTrades(prev => [...prev, trade]);
      setMarketOrders(prev => {
          const remaining = order.amountOTF - trade.amountOTF;
          if (remaining > 0.01) return prev.map(o => o.id === orderId ? { ...o, amountOTF: remaining } : o);
          else return prev.filter(o => o.id !== orderId);
      });

      handleAddNotification(seller.id, `ESCROW ALERT: ${trade.amountOTF} OTF locked for trade with ${trade.buyerName}.`, 'WARNING');
      handleAddNotification(trade.buyerId, `Trade Initiated! Seller funds are locked in Escrow. Please proceed to payment.`, 'SUCCESS');
  };

  const handleTradeAction = (tradeId: string, action: 'PAYMENT' | 'RELEASE' | 'CANCEL', payload?: any) => {
      setActiveTrades(trades => trades.map(t => {
          if(t.id !== tradeId) return t;
          if(action === 'PAYMENT') {
              handleAddNotification(t.sellerId, `Payment Marked! Buyer ${t.buyerName} sent payment. Verify & Release.`, 'INFO');
              return { ...t, status: 'PAID_VERIFYING', ftNumber: payload || t.ftNumber };
          }
          if(action === 'CANCEL') {
              const seller = allUsers.find(u => u.id === t.sellerId);
              if(seller) {
                  handleUpdateUser(seller.id, { balance: seller.balance + t.amountOTF }); // Refund
                  handleAddNotification(t.sellerId, `Trade Cancelled. ${t.amountOTF} OTF returned to your wallet.`, 'INFO');
              }
              handleAddNotification(t.buyerId, `Trade Cancelled.`, 'ERROR');
              return { ...t, status: 'CANCELLED' };
          }
          if(action === 'RELEASE') {
              const buyer = allUsers.find(u => u.id === t.buyerId);
              if(buyer) {
                  handleUpdateUser(buyer.id, { balance: buyer.balance + t.amountOTF }); // Credit Buyer
                  handleAddNotification(t.buyerId, `SUCCESS: ${t.amountOTF} OTF received! Trade Complete.`, 'SUCCESS');
                  handleAddNotification(t.sellerId, `Trade Complete. Funds released to buyer.`, 'SUCCESS');
                  handleLogActivity('system', 'Market', 'TRADE_ACTION', `Escrow Released: ${t.amountOTF} OTF to ${buyer.username}`);
              }
              return { ...t, status: 'COMPLETED' };
          }
          return t;
      }));
  };

  const handleApproveRegistration = (regId: string) => {
      const reg = pendingRegistrations.find(r => r.id === regId);
      if (!reg) return;

      let parentId = 'admin1';
      let leg: 'LEFT' | 'RIGHT' = 'LEFT';

      if (reg.placementMode === 'MANUAL' && reg.manualParentUsername) {
          const manualParent = allUsers.find(u => u.username.toLowerCase() === reg.manualParentUsername?.toLowerCase());
          if (manualParent) {
              parentId = manualParent.id;
              leg = reg.manualLeg || 'LEFT';
          }
      } else {
          const sponsor = allUsers.find(u => u.id === reg.sponsorId) || allUsers.find(u => u.role === 'ADMIN');
          if (sponsor) {
              const placement = findAutoPlacement(allUsers, sponsor.id);
              parentId = placement.parentId;
              leg = placement.leg;
          }
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
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(reg.name)}&background=random`,
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
          kycStatus: 'NONE',
          isOnline: false
      };

      const { updatedUsers, newTransactions } = processNewMemberLogic(newUser, allUsers, systemSettings);

      setAllUsers(updatedUsers);
      setAllTransactions(prev => [...newTransactions, ...prev]);
      setPendingRegistrations(prev => prev.filter(r => r.id !== regId));
      
      handleAddNotification(reg.sponsorId, `${reg.name} joined your team! Commission processed.`, 'SUCCESS');
      handleLogActivity('admin1', 'System', 'REGISTRATION_APPROVAL', `Approved user ${newUser.username}, placed under ${parentId} (${leg})`);
  };

  const handleDirectRegistration = (userData: any) => {
      const mockReg: PendingRegistration = {
          id: `temp-${Date.now()}`,
          ...userData,
          requestedBy: currentUser?.id || 'admin',
          date: new Date().toISOString(),
          ftNumber: 'ADMIN-DIRECT'
      };
      setPendingRegistrations(prev => [mockReg, ...prev]);
      setTimeout(() => handleApproveRegistration(mockReg.id), 500);
  };

  const handleApproveAllDeposits = () => {
      const pendingDeposits = allTransactions.filter(t => t.type === 'DEPOSIT' && t.depositStage === 'PAYMENT_SUBMITTED');
      if (pendingDeposits.length === 0) return;

      const userBalanceUpdates = new Map<string, number>();
      
      setAllTransactions(prev => prev.map(t => {
          if (t.type === 'DEPOSIT' && t.depositStage === 'PAYMENT_SUBMITTED') {
              const currentBalance = userBalanceUpdates.get(t.userId) || (allUsers.find(u => u.id === t.userId)?.balance || 0);
              userBalanceUpdates.set(t.userId, currentBalance + t.amount);
              return { ...t, status: 'APPROVED', depositStage: 'COMPLETED' };
          }
          return t;
      }));

      setAllUsers(prev => prev.map(u => {
          if (userBalanceUpdates.has(u.id)) {
              const newBalance = userBalanceUpdates.get(u.id) || u.balance;
              handleAddNotification(u.id, `Bulk Approval: Deposit Confirmed!`, 'SUCCESS');
              return { ...u, balance: newBalance };
          }
          return u;
      }));

      handleLogActivity('admin1', 'System', 'TRANSACTION_REQUEST', `Bulk approved ${pendingDeposits.length} deposits.`);
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

  const handleLogin = (user: User, deviceId: string) => {
    login(user, deviceId);
    setCurrentView(user.role === 'ADMIN' ? 'ADMIN_DASHBOARD' : 'DASHBOARD');
  };

  const handleLogout = () => {
    logout();
    setCurrentView('DASHBOARD');
  };

  const handleApproveVerification = (id: string) => {
      const req = kycRequests.find(r => r.id === id);
      if(req) {
          handleUpdateUser(req.userId, { kycStatus: 'VERIFIED', kycData: { ...req, status: 'APPROVED' } });
          setKycRequests(p => p.filter(r => r.id !== id));
          handleLogActivity('admin1', 'System', 'SECURITY_ACTION', `KYC Approved for ${req.username}`);
          handleAddNotification(req.userId, 'Your identity verification (KYC) has been APPROVED.', 'SUCCESS');
      }
  };

  const handleRejectVerification = (id: string, reason: string) => {
      const req = kycRequests.find(r => r.id === id);
      if(req) {
          handleUpdateUser(req.userId, { kycStatus: 'REJECTED' });
          setKycRequests(p => p.filter(r => r.id !== id));
          handleLogActivity('admin1', 'System', 'SECURITY_ACTION', `KYC Rejected for ${req.username}. Reason: ${reason}`);
          handleAddNotification(req.userId, `KYC Rejected: ${reason}`, 'ERROR');
      }
  };

  // Safe check for user existence before rendering app
  if (!isAuthenticated || !currentUser) {
      return <Login onLogin={handleLogin} users={allUsers} onReportPasswordReset={handleReportPasswordReset} onRequestDeviceApproval={handleRequestDeviceApproval} />;
  }

  return (
    <div className="min-h-screen relative text-slate-200 bg-brand-dark">
      <BrandingPattern />
      
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-40">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400 hover:text-white"><Menu size={24}/></button>
          <div className="flex items-center gap-2"><OdaaLogo size={24}/><span className="font-bold font-tech text-white tracking-widest">ODAA</span></div>
          <button onClick={() => setIsNotificationOpen(true)} className="p-2 text-slate-400 hover:text-brand-lime relative">
              <Bell size={20}/>
              {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2 h-2 bg-brand-lime rounded-full animate-pulse"></span>}
          </button>
      </div>

      <Sidebar 
        currentView={currentView} setView={setCurrentView} role={currentUser.role} onLogout={handleLogout} 
        isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} theme={theme} toggleTheme={toggleTheme} 
        notificationCount={notifications.filter(n => !n.read).length}
        adminActionCount={pendingRegistrations.length}
      />
      
      <NotificationCenter 
         notifications={notifications} 
         isOpen={isNotificationOpen} 
         onClose={() => setIsNotificationOpen(false)}
         onMarkRead={(id) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n))}
         onMarkAllRead={() => setNotifications(p => p.map(n => ({ ...n, read: true })))}
         onClearAll={() => setNotifications([])}
         onNavigate={setCurrentView}
      />

      <main className="md:ml-80 p-6 pt-20 md:pt-8 relative z-10 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {currentView === 'DASHBOARD' && (
            <Dashboard 
                user={currentUser} usersList={allUsers} transactions={allTransactions} 
                systemSettings={systemSettings} onUpdateProfile={u => handleUpdateUser(currentUser.id, u)}
                onViewChange={setCurrentView}
                onRequestRegistration={r => setPendingRegistrations(p => [{...r, id: `pr${Date.now()}`, date: new Date().toISOString(), requestedBy: currentUser.id}, ...p])}
                onStartKYC={() => setCurrentView('SECURITY')}
            />
          )}
          
          {currentView === 'ADMIN_DASHBOARD' && currentUser.role === 'ADMIN' && (
            <AdminDashboard 
                users={allUsers} setUsers={setAllUsers} transactions={allTransactions} setTransactions={setAllTransactions} 
                addNotification={handleAddNotification} 
                systemSettings={systemSettings} setSystemSettings={setSystemSettings} 
                pendingRegistrations={pendingRegistrations} setPendingRegistrations={setPendingRegistrations}
                verificationRequests={kycRequests} activityLogs={activityLogs} 
                onLogActivity={handleLogActivity}
                onClearLogs={handleClearLogs}
                onUpdateUser={handleUpdateUser} 
                onResetSystem={() => { localStorage.clear(); window.location.reload(); }}
                onApproveRegistration={handleApproveRegistration}
                onRegisterUser={handleDirectRegistration}
                onApproveVerification={handleApproveVerification}
                onRejectVerification={handleRejectVerification}
                currentUserId={currentUser.id}
                messages={messages} onSendMessage={handleSendMessage}
                onApproveAllDeposits={handleApproveAllDeposits}
                activeTrades={activeTrades}
                onTradeAction={handleTradeAction}
                p2pRequests={p2pRequests}
                onP2PAction={handleP2PAction}
                passwordResetRequests={passwordResetRequests}
                onApprovePasswordReset={handleApprovePasswordReset}
                deviceApprovalRequests={deviceApprovalRequests}
                onApproveDevice={handleApproveDevice}
            />
          )}

          {currentView === 'WALLET' && (
            <Wallet 
                user={currentUser} allUsers={allUsers} transactions={allTransactions} 
                onAddTransaction={t => { setAllTransactions(p => [t, ...p]); handleLogActivity(currentUser.id, currentUser.name, 'TRANSACTION_REQUEST', `Type: ${t.type}, Amount: ${t.amount}`); }} 
                onUpdateTransaction={(id, updates) => setAllTransactions(p => p.map(t => t.id === id ? { ...t, ...updates } : t))}
                onUpdateUser={handleUpdateUser}
                systemSettings={systemSettings}
                isFTUsed={(ft) => allTransactions.some(t => t.ftNumber === ft)}
                onP2PRequest={handleP2PRequest}
                p2pRequests={p2pRequests.filter(r => r.targetUserId === currentUser.id || r.requestorId === currentUser.id)}
                onP2PAction={handleP2PAction} 
            />
          )}
          {currentView === 'MARKETPLACE' && (
            <Marketplace 
                currentUser={currentUser} allUsers={allUsers} systemSettings={systemSettings}
                marketOrders={marketOrders} activeTrades={activeTrades} 
                onPlaceOrder={o => setMarketOrders(p => [...p, o])}
                onInitiateTrade={handleInitiateTrade}
                onTradeAction={handleTradeAction}
                isFTUsed={(ft) => activeTrades.some(t => t.ftNumber === ft)}
            />
          )}
          {currentView === 'GENEALOGY' && <GenealogyTree users={allUsers} rootId={currentUser.id} />}
          {currentView === 'TEAM' && <Team currentUser={currentUser} allUsers={allUsers} />}
          {currentView === 'SECURITY' && <SecurityView user={currentUser} onUpdateSettings={handleUpdateUser} onReportPasswordReset={handleReportPasswordReset} onKycSubmission={k => setKycRequests(p => [{ ...k, id: `k${Date.now()}`, userId: currentUser.id, username: currentUser.username, timestamp: new Date().toISOString(), status: 'PENDING' } as VerificationRequest, ...p])} />}
          {currentView === 'REGISTER' && <MemberRegistration currentUser={currentUser} usersList={allUsers} systemSettings={systemSettings} onRequestRegistration={r => setPendingRegistrations(p => [{...r, id: `pr${Date.now()}`, date: new Date().toISOString(), requestedBy: currentUser.id}, ...p])} isFTUsed={(ft) => allTransactions.some(t => t.ftNumber === ft)} />}
        </div>
      </main>
      
      {currentUser.role !== 'ADMIN' && <SupportChat currentUser={currentUser} messages={messages} onSendMessage={handleSendMessage} isSupportOnline={allUsers.some(u => u.role === 'ADMIN' && u.isOnline)} />}
    </div>
  );
};
