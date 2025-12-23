
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, Transaction, Rank, Notification, PendingRegistration, ActivityLog, Role, P2PRequest, PasswordResetRequest, DeviceApprovalRequest, SystemSettings, ChatMessage, SystemBackup, VerificationRequest } from '../types';
import { CheckCircle2, XCircle, Search, UserPlus, Database, Wallet, Clock, ArrowRightLeft, Key, Activity, Landmark, Monitor, Check, Filter, ShieldAlert, ChevronDown, Network, TrendingUp, TrendingDown, DollarSign, Settings, Megaphone, Percent, Info, CreditCard, Bell, CloudLightning, Loader2, RefreshCw, FileText, Cpu, LayoutGrid, ArrowDownLeft, ArrowUpRight, MessageSquare, Send, User as UserIcon, Edit2, Trash2, Power, AlertTriangle, Download, Terminal, Lock, Unlock, ShieldBan, Ban, Upload, ScanFace, FileBadge, Phone, ExternalLink, Eye, ShieldCheck, ToggleLeft, ToggleRight, X, Zap, PieChart, Coins, Users, Sparkles, Hexagon, RotateCcw, ShoppingBag, Package, BarChart3, Coffee, Shield } from 'lucide-react';
import { INITIAL_COMPANY_CAPITAL, OTF_VALUE_ETB } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from "@google/genai";

type TabType = 'DATABASE' | 'REGISTRATION' | 'ACTIVITY' | 'WITHDRAWALS' | 'PENDING_REG' | 'USER_LOGS' | 'COMPANY_BALANCE' | 'P2P_TRADES' | 'SECURITY' | 'SYSTEM_CONFIG' | 'SUPPORT' | 'VERIFICATION';

interface AdminDashboardProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addNotification: (userId: string, message: string, type: Notification['type']) => void;
  pendingRegistrations?: PendingRegistration[];
  setPendingRegistrations?: React.Dispatch<React.SetStateAction<PendingRegistration[]>>;
  activityLogs: ActivityLog[];
  onLogActivity: (userId: string, userName: string, action: ActivityLog['action'], details: string) => void;
  onClearLogs?: () => void;
  currentUserId?: string;
  initialTab?: TabType;
  p2pRequests?: P2PRequest[];
  onP2PAction?: (id: string, action: 'APPROVE' | 'REJECT') => void;
  passwordResetRequests?: PasswordResetRequest[];
  onApprovePasswordReset?: (requestId: string) => void;
  deviceApprovalRequests?: DeviceApprovalRequest[];
  onApproveDevice?: (requestId: string) => void;
  verificationRequests?: VerificationRequest[];
  onApproveVerification?: (requestId: string) => void;
  onRejectVerification?: (requestId: string) => void;
  onApproveAllVerifications?: () => void;
  systemSettings: SystemSettings;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  messages?: ChatMessage[];
  onSendMessage?: (recipientId: string, text: string) => void;
  onResetSystem?: () => void;
  onRestoreSystem?: (backup: SystemBackup) => void;
  onUpdateUser?: (userId: string, updates: Partial<User>) => void;
  onRegisterUser?: (userData: any) => void;
  onApproveRegistration?: (regId: string) => void;
  onApproveAllRegistrations?: () => void;
  onApproveAllDeposits?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users, setUsers, transactions, setTransactions, addNotification, 
  pendingRegistrations = [], setPendingRegistrations, activityLogs, onLogActivity, onClearLogs, currentUserId,
  initialTab = 'REGISTRATION', p2pRequests = [], onP2PAction,
  passwordResetRequests = [], onApprovePasswordReset,
  deviceApprovalRequests = [], onApproveDevice,
  verificationRequests = [], onApproveVerification, onRejectVerification,
  systemSettings, setSystemSettings,
  messages = [], onSendMessage,
  onResetSystem, onRestoreSystem, onUpdateUser,
  onRegisterUser, onApproveRegistration, onApproveAllDeposits
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  
  const [newUser, setNewUser] = useState({
    name: '', username: '', email: '', phoneNumber: '', password: '', sponsorId: '', rank: Rank.MEMBER,
    placementMode: 'AUTO' as 'AUTO' | 'MANUAL', manualParentUsername: '', manualLeg: 'LEFT' as 'LEFT' | 'RIGHT'
  });
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [adminTxInput, setAdminTxInput] = useState('');
  
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  
  const [managingUser, setManagingUser] = useState<User | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  
  const [coinImage, setCoinImage] = useState<string | null>(null);
  const [isMintingCoin, setIsMintingCoin] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync activeTab with initialTab prop if it changes
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab as TabType);
    }
  }, [initialTab]);

  const pendingDeposits = transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING');
  const pendingWithdrawals = transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING');
  const pendingP2P = p2pRequests.filter(r => r.status === 'PENDING');
  
  // Calculate Live Metrics
  const onlineMembersCount = users.filter(u => u.isOnline).length;

  const safeResetSystem = () => {
    if (window.confirm("CRITICAL: This will PERMANENTLY ERASE all user data, transactions, and system history. This action cannot be undone. Are you absolutely certain?")) {
        const challenge = window.prompt("Type 'DELETE ALL' to confirm factory reset:");
        if (challenge === 'DELETE ALL' && onResetSystem) {
            onResetSystem();
            alert("System reset successful.");
        } else {
            alert("Reset aborted: Confirmation mismatch.");
        }
    }
  };

  const filteredUsers = users.filter(u => 
      (u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === 'ALL' || u.status === filterType)
  );

  const filteredLogs = activityLogs.filter(log => 
     log.userName.toLowerCase().includes(logSearch.toLowerCase()) || 
     log.action.toLowerCase().includes(logSearch.toLowerCase()) || 
     log.details.toLowerCase().includes(logSearch.toLowerCase())
  );

  useEffect(() => {
      if (activeTab === 'SUPPORT' && chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [selectedChatUser, messages, activeTab]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault(); 
    setRegError(''); 
    setRegSuccess('');
    
    try {
      if (!onRegisterUser) throw new Error("Registration handler not connected.");
      
      onRegisterUser({
          ...newUser,
      });

      setRegSuccess(`Registered ${newUser.name} successfully!`);
      setTimeout(() => setRegSuccess(''), 3000);
      setNewUser({ name: '', username: '', email: '', phoneNumber: '', password: '', sponsorId: '', rank: Rank.MEMBER, placementMode: 'AUTO', manualParentUsername: '', manualLeg: 'LEFT' });
    } catch (e: any) { 
        setRegError(e.message); 
    }
  };

  const handleApproveRegClick = (reg: PendingRegistration) => {
      if (onApproveRegistration) {
          onApproveRegistration(reg.id);
          addNotification(reg.requestedBy, `Registration for ${reg.name} Approved`, 'SUCCESS');
      }
  };

  const handleRejectRegistration = (id: string) => {
      if (setPendingRegistrations) {
          setPendingRegistrations(prev => prev.filter(r => r.id !== id));
          onLogActivity(currentUserId || 'admin', 'Admin', 'REGISTRATION_REQUEST', `Rejected registration request ID: ${id}`);
      }
  };

  const handleBackupSystem = () => {
      const backup: SystemBackup = {
          metadata: { version: '2.5', timestamp: new Date().toISOString(), exportedBy: currentUserId || 'admin' },
          data: { users, transactions, settings: systemSettings, logs: activityLogs, pendingRegistrations, p2pRequests, passwordResetRequests, deviceApprovalRequests, messages, verificationRequests }
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `odaa_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onLogActivity(currentUserId || 'admin', 'Admin', 'SYSTEM_CONFIG', 'Created full system backup.');
  };
  
  const handleRestoreClick = () => { fileInputRef.current?.click(); };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const json = JSON.parse(e.target?.result as string);
              if (!json.metadata || !json.data) throw new Error("Invalid file format.");
              const confirmRestore = window.confirm(`Restore Backup v${json.metadata.version}? This overwrites data.`);
              if (confirmRestore && onRestoreSystem) onRestoreSystem(json as SystemBackup);
          } catch (error: any) { alert(`Restore Failed: ${error.message}`); }
      };
      reader.readAsText(file);
      event.target.value = '';
  };

  const handleActivateAll = () => {
      if (window.confirm("WARNING: This will set ALL users to 'ACTIVE' status. Continue?")) {
          setUsers(prev => prev.map(u => ({ ...u, status: 'ACTIVE' })));
          onLogActivity(currentUserId || 'admin', 'Admin', 'SECURITY_ACTION', 'Executed Bulk User Activation');
          alert("All users have been activated.");
      }
  };

  const generateOfficialCoin = async () => {
       const apiKey = process.env.API_KEY;
       if (!apiKey) { alert("API Key missing."); return; }
       setIsMintingCoin(true);
       try {
           const ai = new GoogleGenAI({ apiKey });
           const response = await ai.models.generateContent({
               model: 'gemini-2.5-flash-image',
               contents: { parts: [{ text: "A futuristic gold coin with Ethiopian patterns and OTF logo." }] },
               config: { imageConfig: { aspectRatio: "1:1" } }
           });
           
           let foundImage = false;
           for (const part of response.candidates?.[0]?.content?.parts || []) {
               if (part.inlineData) {
                   setCoinImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                   foundImage = true;
                   break;
               }
           }
           if (!foundImage) throw new Error("No image generated.");
       } catch (e: any) { alert(e.message); }
       setIsMintingCoin(false);
  };

  const handleApproveDeposit = (txId: string, stage: Transaction['depositStage']) => {
      const tx = transactions.find(t => t.id === txId); if(!tx) return;
      if(stage === 'REQUEST') {
          setTransactions(prev => prev.map(t => t.id === txId ? { ...t, depositStage: 'WAITING_PAYMENT' } : t));
          addNotification(tx.userId, `Deposit Request Approved. Please send funds.`, 'INFO');
      } else if (stage === 'PAYMENT_SUBMITTED') {
          setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'APPROVED', depositStage: 'COMPLETED' } : t));
          setUsers(prev => prev.map(u => u.id === tx.userId ? { ...u, balance: u.balance + tx.amount } : u));
          addNotification(tx.userId, `Deposit of ${tx.amount} OTF Confirmed!`, 'SUCCESS');
      }
  };

  const handleWithdrawal = (txId: string, action: 'APPROVE' | 'REJECT') => {
     if (action === 'REJECT') {
        const tx = transactions.find(t => t.id === txId); if(!tx) return;
        setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'REJECTED' } : t));
        setUsers(prev => prev.map(u => u.id === tx.userId ? { ...u, balance: u.balance + Math.abs(tx.amount) } : u));
        addNotification(tx.userId, `Withdrawal REJECTED. Funds returned.`, 'ERROR');
     } else {
        if(!adminTxInput) { alert("Please enter Bank Tx ID."); return; }
        setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'APPROVED', adminResponseTxId: adminTxInput } : t));
        const tx = transactions.find(t => t.id === txId); if(tx) addNotification(tx.userId, `Withdrawal Approved! Tx Ref: ${adminTxInput}`, 'SUCCESS');
        setAdminTxInput('');
     }
  };

  const handleP2PAction = (id: string, action: 'APPROVE' | 'REJECT') => {
      if (onP2PAction) {
          onP2PAction(id, action);
          // Assuming the parent handles logic and notifications
      }
  };

  const handleAutoSave = (key: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value })); setSaveStatus('SAVING');
    setTimeout(() => { setSaveStatus('SAVED'); }, 600); setTimeout(() => { setSaveStatus('IDLE'); }, 2500);
  };

  const handleReplyMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChatUser && replyText.trim() && onSendMessage) {
        onSendMessage(selectedChatUser, replyText); setReplyText('');
    }
  };

  const handleToggleStatus = () => { if (!managingUser || !onUpdateUser) return; const newStatus = managingUser.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'; onUpdateUser(managingUser.id, { status: newStatus }); setManagingUser({ ...managingUser, status: newStatus }); };
  const handleToggleWalletLock = () => { if (!managingUser || !onUpdateUser) return; const newState = !managingUser.walletLocked; onUpdateUser(managingUser.id, { walletLocked: newState }); setManagingUser({ ...managingUser, walletLocked: newState }); };
  
  const handleManualFundAdjustment = () => {
      if (!managingUser || !onUpdateUser || !adjustmentAmount || !adjustmentReason) return;
      const amount = Number(adjustmentAmount); if (isNaN(amount) || amount <= 0) return;
      const finalAmount = adjustmentType === 'CREDIT' ? amount : -amount;
      const newBalance = managingUser.balance + finalAmount;
      onUpdateUser(managingUser.id, { balance: newBalance }); setManagingUser({ ...managingUser, balance: newBalance });
      const tx: Transaction = { id: `adj-${Date.now()}`, userId: managingUser.id, userName: managingUser.name, type: 'ADMIN_ADJUSTMENT', amount: finalAmount, date: new Date().toISOString().split('T')[0], status: 'APPROVED', description: `Admin ${adjustmentType}: ${adjustmentReason}` };
      setTransactions(prev => [tx, ...prev]);
      addNotification(managingUser.id, `Balance Adjustment: ${adjustmentType === 'CREDIT' ? '+' : '-'}${amount} OTF.`, adjustmentType === 'CREDIT' ? 'SUCCESS' : 'WARNING');
      setAdjustmentAmount(''); setAdjustmentReason('');
  };

  const handleBroadcastNotification = (e: React.FormEvent) => {
      e.preventDefault();
      if (!broadcastMsg.trim()) return;
      users.forEach(u => addNotification(u.id, `SYSTEM ANNOUNCEMENT: ${broadcastMsg}`, 'INFO'));
      onLogActivity(currentUserId || 'admin', 'Admin', 'SYSTEM_CONFIG', `Broadcasted notification: ${broadcastMsg.substring(0, 30)}...`);
      setBroadcastMsg('');
      alert("Notification Broadcasted to All Users.");
  };

  const treasuryData = useMemo(() => {
      const adminBalance = users.find(u => u.role === 'ADMIN')?.balance || 0;
      const userLiabilities = users.filter(u => u.role !== 'ADMIN').reduce((acc, u) => acc + u.balance, 0);
      const totalSystemValue = adminBalance + userLiabilities;
      const joiningFeesTotal = transactions.filter(t => t.type === 'JOINING_FEE').reduce((acc, t) => acc + t.amount, 0);
      const withdrawalsTotal = Math.abs(transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED').reduce((acc, t) => acc + t.amount, 0));
      const p2pVolume = transactions.filter(t => t.type === 'P2P_TRANSFER' && t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
      const chartDataMap = new Map<string, { date: string, balance: number }>();
      let runningBalance = INITIAL_COMPANY_CAPITAL;
      const sortedTx = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      sortedTx.forEach(tx => {
          if (tx.type === 'JOINING_FEE' || tx.type === 'SERVICE_FEE' || (tx.userId === 'admin1')) {
              if (tx.type === 'JOINING_FEE') runningBalance += tx.amount;
              else runningBalance += tx.amount;
              chartDataMap.set(tx.date, { date: tx.date, balance: runningBalance });
          }
      });
      const chartData = Array.from(chartDataMap.values());
      if (chartData.length === 0) chartData.push({ date: new Date().toISOString().split('T')[0], balance: 0 });
      return { adminBalance, userLiabilities, totalSystemValue, joiningFeesTotal, withdrawalsTotal, p2pVolume, chartData };
  }, [users, transactions]);

  // RESTORED: Full list of Admin Tabs with proper counts
  const tabs = [
    { id: 'COMPANY_BALANCE', label: 'Treasury', icon: Landmark },
    { id: 'DATABASE', label: 'Registry', icon: Database },
    { id: 'REGISTRATION', label: 'Enrollment', icon: UserPlus },
    { id: 'PENDING_REG', label: 'Queue', icon: Clock, count: pendingRegistrations.length },
    { id: 'VERIFICATION', label: 'KYC', icon: ScanFace, count: verificationRequests?.length || 0 },
    { id: 'WITHDRAWALS', label: 'Finance', icon: Wallet, count: pendingWithdrawals.length + pendingDeposits.length },
    { id: 'P2P_TRADES', label: 'P2P Market', icon: ArrowRightLeft, count: pendingP2P.length },
    { id: 'SECURITY', label: 'Security', icon: ShieldAlert, count: (passwordResetRequests?.length || 0) + (deviceApprovalRequests?.length || 0) },
    { id: 'SYSTEM_CONFIG', label: 'Protocol', icon: Settings },
    { id: 'SUPPORT', label: 'Support', icon: MessageSquare, count: messages.filter(m => m.recipientId === 'admin1' && !m.read).length },
    { id: 'USER_LOGS', label: 'System Logs', icon: Activity },
  ];

  return (
    <div className="space-y-8 pb-10">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-fade-in">
           <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight font-tech uppercase leading-none">ADMIN<span className="text-lime-400">CONSOLE</span></h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-lime-500/10 border border-lime-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-lime-500 uppercase tracking-widest">{onlineMembersCount} MEMBERS ONLINE</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase">SECURITY MODE: HARDENED</span>
                    </div>
                </div>
           </div>
           
           <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
               <div className="flex gap-2">
                   {tabs.map(t => (
                       <button key={t.id} onClick={() => setActiveTab(t.id as TabType)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === t.id ? 'bg-lime-600 text-white shadow-lg shadow-lime-900/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}`}>
                           <t.icon size={14} />
                           {t.label} 
                           {t.count ? <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">{t.count}</span> : ''}
                       </button>
                   ))}
               </div>
           </div>
       </div>

       {activeTab === 'REGISTRATION' && (
             <div className="widget-card rounded-3xl animate-fade-in p-8 max-w-4xl mx-auto border border-white/5 relative overflow-hidden">
                 <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6 relative z-10">
                     <div className="p-3 bg-lime-500/10 rounded-2xl border border-lime-500/30"><UserPlus size={24} className="text-lime-400" /></div>
                     <div><h2 className="text-2xl font-bold text-white font-tech tracking-wide">MEMBER REGISTRATION</h2><p className="text-slate-400 text-xs">Manual distributor entry via System Algorithm.</p></div>
                 </div>
                 {regSuccess && <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400"><CheckCircle2 size={20} /><span className="font-bold">{regSuccess}</span></div>}
                 {regError && <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400"><AlertTriangle size={20} /><span className="font-bold">{regError}</span></div>}
                 <form onSubmit={handleRegister} className="space-y-6 relative z-10">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Legal Name</label><input required className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-lime-500 outline-none transition-colors" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Full Name" /></div>
                         <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Username</label><input required className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-lime-500 outline-none transition-colors" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="username" /></div>
                         <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label><input required type="email" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-lime-500 outline-none transition-colors" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="email@example.com" /></div>
                         <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label><input required className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-lime-500 outline-none transition-colors" value={newUser.phoneNumber} onChange={e => setNewUser({...newUser, phoneNumber: e.target.value})} placeholder="+251..." /></div>
                         <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Access Password</label><input required className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-lime-500 outline-none transition-colors" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="••••••••" /></div>
                         <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Direct Sponsor ID</label><input className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-lime-500 outline-none transition-colors" value={newUser.sponsorId} onChange={e => setNewUser({...newUser, sponsorId: e.target.value})} placeholder="Admin / Sponsor ID" /></div>
                     </div>
                     <div className="space-y-4">
                         <h3 className="text-xs font-bold text-white uppercase tracking-widest">Placement Protocol</h3>
                         <div className="flex gap-4">
                             <button type="button" onClick={() => setNewUser({...newUser, placementMode: 'AUTO'})} className={`flex-1 p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${newUser.placementMode === 'AUTO' ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-900/10' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>System Auto-Balance</button>
                             <button type="button" onClick={() => setNewUser({...newUser, placementMode: 'MANUAL'})} className={`flex-1 p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${newUser.placementMode === 'MANUAL' ? 'bg-lime-900/20 border-lime-500 text-lime-400 shadow-lg shadow-lime-900/10' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Direct Target Entry</button>
                         </div>
                         {newUser.placementMode === 'MANUAL' && (
                             <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800 animate-fade-in shadow-inner">
                                 <input className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-lime-500" placeholder="Parent Node Username" value={newUser.manualParentUsername} onChange={e => setNewUser({...newUser, manualParentUsername: e.target.value})}/>
                                 <select className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-lime-500 appearance-none" value={newUser.manualLeg} onChange={e => setNewUser({...newUser, manualLeg: e.target.value as 'LEFT' | 'RIGHT'})}>
                                     <option value="LEFT">Left Binary Leg</option>
                                     <option value="RIGHT">Right Binary Leg</option>
                                 </select>
                             </div>
                         )}
                     </div>
                     <button type="submit" className="w-full py-4 bg-gradient-to-r from-lime-600 to-emerald-600 hover:from-lime-500 hover:to-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl transition-all shadow-lime-900/20">Establish Node Link</button>
                 </form>
             </div>
       )}

       {activeTab === 'PENDING_REG' && (
             <div className="widget-card rounded-2xl p-6 min-h-[500px] animate-fade-in">
                 <h3 className="font-bold text-white font-tech mb-6 flex items-center gap-2 uppercase tracking-widest"><Clock size={18} className="text-amber-400"/> PENDING APPROVALS</h3>
                 {pendingRegistrations.length === 0 ? <div className="text-center text-slate-600 mt-32 italic font-tech uppercase tracking-widest text-sm">Clear frequency. No pending requests.</div> : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {pendingRegistrations.map(req => (
                             <div key={req.id} className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4 hover:border-amber-500/30 transition-colors group">
                                 <div className="flex justify-between items-center"><h4 className="font-bold text-white">{req.name}</h4><span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-mono tracking-tighter">@{req.username}</span></div>
                                 <div className="text-[10px] text-slate-500 space-y-1.5 font-tech uppercase tracking-widest border-l-2 border-slate-800 pl-3">
                                     <p>Sponsor: <span className="text-slate-300">@{users.find(u => u.id === req.sponsorId)?.username}</span></p>
                                     <p>Placement: <span className="text-slate-300">{req.placementMode}</span></p>
                                     <p className="font-mono text-amber-500 font-bold">FT: {req.ftNumber}</p>
                                 </div>
                                 <div className="grid grid-cols-2 gap-3 pt-2">
                                     <button onClick={() => handleApproveRegClick(req)} className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">APPROVE</button>
                                     <button onClick={() => handleRejectRegistration(req.id)} className="py-2.5 bg-red-900/20 border border-red-900/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">REJECT</button>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
       )}

       {activeTab === 'COMPANY_BALANCE' && (
             <div className="space-y-6 animate-fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="widget-card p-6 rounded-2xl relative border-amber-500/20 bg-slate-900/50"><h2 className="text-4xl font-bold text-white font-tech tracking-tighter">{treasuryData.adminBalance.toLocaleString()} <span className="text-sm font-normal text-slate-500">OTF</span></h2><p className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">COMPANY VAULT</p></div>
                     <div className="widget-card p-6 rounded-2xl relative border-blue-500/20 bg-slate-900/50"><h2 className="text-4xl font-bold text-white font-tech tracking-tighter">{treasuryData.userLiabilities.toLocaleString()} <span className="text-sm font-normal text-slate-500">OTF</span></h2><p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">USER LIABILITIES</p></div>
                     <div className="widget-card p-6 rounded-2xl relative border-emerald-500/20 bg-slate-900/50"><h2 className="text-4xl font-bold text-white font-tech tracking-tighter">{treasuryData.totalSystemValue.toLocaleString()} <span className="text-sm font-normal text-slate-500">OTF</span></h2><p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">TOTAL EQUITY</p></div>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <div className="lg:col-span-2 widget-card p-8 rounded-[2rem] min-h-[450px] flex flex-col border-slate-800 bg-slate-900/20 shadow-inner">
                         <h3 className="text-white font-bold font-tech uppercase tracking-widest mb-8 flex items-center gap-2">Economic Pulse Analysis</h3>
                         <div className="flex-1"><ResponsiveContainer width="100%" height="100%"><AreaChart data={treasuryData.chartData}><defs><linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false}/><XAxis dataKey="date" stroke="#475569" fontSize={9} axisLine={false} tickLine={false} /><YAxis stroke="#475569" fontSize={9} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }} /><Area type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={2} fill="url(#colorBal)" /></AreaChart></ResponsiveContainer></div>
                     </div>
                     <div className="widget-card p-8 rounded-[2rem] border-slate-800 bg-slate-900/30 space-y-6">
                         <h3 className="text-white font-bold uppercase tracking-widest text-xs">Protocol Revenue</h3>
                         <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-white/5">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Membership Fees</span>
                                <span className="text-white font-mono text-sm font-bold">{treasuryData.joiningFeesTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-white/5">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">System Withdrawals</span>
                                <span className="text-red-400 font-mono text-sm font-bold">-{treasuryData.withdrawalsTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-white/5">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">P2P Volume (Taxed)</span>
                                <span className="text-cyan-400 font-mono text-sm font-bold">{treasuryData.p2pVolume.toLocaleString()}</span>
                            </div>
                         </div>
                         <div className="pt-6"><button onClick={() => { setManagingUser(users.find(u => u.role === 'ADMIN') || null); }} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border border-white/5">MANAGE SYSTEM ASSETS</button></div>
                     </div>
                 </div>
                 <div className="widget-card p-10 rounded-[2.5rem] relative border-amber-500/20 bg-slate-950/50 flex flex-col md:flex-row items-center gap-12 overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                     <div className="flex-1 space-y-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500 border border-amber-500/30"><Zap size={20}/></div>
                            <h3 className="text-2xl font-bold text-white font-tech uppercase tracking-tighter">Asset Minting Protocol</h3>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-lg">Execute the official 2026 Odaa Commemorative Token generation sequence. This creates a visual unique identifier for system distribution.</p>
                        <button onClick={generateOfficialCoin} disabled={isMintingCoin} className="px-10 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-2xl transition-all shadow-amber-900/20 flex items-center gap-3">
                            {isMintingCoin ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {isMintingCoin ? 'MINTING IN PROGRESS...' : 'EXECUTE 2026 TOKEN MINT'}
                        </button>
                     </div>
                     <div className="relative w-48 h-48 rounded-full bg-slate-900 flex items-center justify-center border-4 border-amber-500/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-lime-500/10 animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {coinImage ? <img src={coinImage} className="w-full h-full object-cover animate-pop-in" alt="Minted Token"/> : <Coins className="text-slate-800" size={64}/>}
                     </div>
                 </div>
             </div>
       )}

       {activeTab === 'DATABASE' && (
             <div className="widget-card rounded-[2rem] h-[750px] flex flex-col p-8 bg-slate-900/30 border-slate-800">
                 <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                    <div>
                        <h3 className="font-bold text-white font-tech uppercase tracking-widest">USER REGISTRY</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-mono mt-1">Authorized personnel database access</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"/>
                            <input type="text" placeholder="Filter by Node ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 transition-all w-64"/>
                        </div>
                        <button onClick={handleActivateAll} className="px-6 py-2.5 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white text-[10px] font-bold rounded-xl uppercase tracking-widest transition-all">ACTIVATE ALL NODES</button>
                    </div>
                 </div>
                 <div className="flex-1 overflow-auto custom-scrollbar border border-white/5 rounded-2xl bg-black/20">
                    <table className="w-full text-xs text-left text-slate-400 border-collapse">
                        <thead className="bg-slate-950 text-slate-500 uppercase font-bold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-5 border-b border-white/5">Identity</th>
                                <th className="p-5 border-b border-white/5">Node Level</th>
                                <th className="p-5 border-b border-white/5">Vault Balance</th>
                                <th className="p-5 border-b border-white/5">Status</th>
                                <th className="p-5 border-b border-white/5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-5">
                                        <div className="font-bold text-slate-200 group-hover:text-white">{u.name}</div>
                                        <div className="text-[10px] text-slate-600 font-mono mt-0.5">@{u.username}</div>
                                    </td>
                                    <td className="p-5"><span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 font-mono">{u.rank}</span></td>
                                    <td className="p-5 font-mono text-emerald-400 font-bold">{u.balance.toFixed(2)}</td>
                                    <td className="p-5">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{u.status}</span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button onClick={() => setManagingUser(u)} className="text-cyan-500 hover:text-white hover:bg-cyan-600 px-4 py-1.5 rounded-lg border border-cyan-500/30 text-[10px] font-bold uppercase tracking-widest transition-all">MANAGE</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
                 {managingUser && (
                     <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
                         <div className="bg-slate-900 p-8 rounded-[2rem] w-full max-w-md border border-slate-700 space-y-8 animate-scale-in shadow-2xl relative">
                             <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-lime-500"></div>
                             <div className="flex justify-between items-start">
                                 <div>
                                    <h3 className="font-bold text-white text-2xl font-tech uppercase tracking-tighter">NODE OVERRIDE</h3>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">TARGET: @{managingUser.username} ({managingUser.name})</p>
                                 </div>
                                 <button onClick={() => setManagingUser(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500"><X size={20}/></button>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <button onClick={handleToggleStatus} className={`py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${managingUser.status === 'ACTIVE' ? 'bg-red-900/20 text-red-500 border-red-900/50 hover:bg-red-500 hover:text-white' : 'bg-emerald-900/20 text-emerald-500 border-emerald-900/50 hover:bg-emerald-500 hover:text-white'}`}>
                                    {managingUser.status === 'ACTIVE' ? 'BLOCK IDENTITY' : 'RESTORE ACCESS'}
                                </button>
                                <button onClick={handleToggleWalletLock} className={`py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${managingUser.walletLocked ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50 hover:bg-emerald-500 hover:text-white' : 'bg-amber-900/20 text-amber-500 border-amber-900/50 hover:bg-amber-500 hover:text-white'}`}>
                                    {managingUser.walletLocked ? 'RELEASE VAULT' : 'RESTRICT VAULT'}
                                </button>
                             </div>

                             <div className="space-y-4 pt-6 border-t border-slate-800">
                                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2"><DollarSign size={14} className="text-cyan-500"/> Fund Adjustment Protocol</p>
                                 <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                                     <button onClick={() => setAdjustmentType('CREDIT')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest ${adjustmentType === 'CREDIT' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>INJECT FUNDS</button>
                                     <button onClick={() => setAdjustmentType('DEBIT')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest ${adjustmentType === 'DEBIT' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>DEDUCT FUNDS</button>
                                 </div>
                                 <div className="space-y-3">
                                    <input type="number" placeholder="Enter OTF Volume" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-cyan-500 font-mono shadow-inner" value={adjustmentAmount} onChange={e => setAdjustmentAmount(e.target.value)} />
                                    <input type="text" placeholder="Audit Reason (Internal)" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-cyan-500 shadow-inner" value={adjustmentReason} onChange={e => setAdjustmentReason(e.target.value)} />
                                 </div>
                                 <button onClick={handleManualFundAdjustment} className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl uppercase tracking-[0.2em] shadow-xl shadow-cyan-900/20 transition-all active:scale-95">EXECUTE AUTHORIZED PULSE</button>
                             </div>
                         </div>
                     </div>
                 )}
             </div>
       )}

       {activeTab === 'WITHDRAWALS' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                 <div className="widget-card p-8 rounded-[2rem] border-slate-800 bg-slate-900/30 min-h-[400px]">
                     <div className="flex items-center gap-3 mb-8">
                        <ArrowDownLeft size={20} className="text-emerald-500"/>
                        <h3 className="text-white font-bold uppercase tracking-widest">Inflow Approvals</h3>
                     </div>
                     {pendingDeposits.length === 0 ? <div className="text-center text-slate-600 py-20 font-tech uppercase text-[10px] tracking-[0.2em]">All deposits normalized.</div> : pendingDeposits.map(tx => (
                         <div key={tx.id} className="p-4 bg-slate-950 border border-white/5 rounded-2xl mb-4 flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                             <div><p className="text-white text-sm font-bold">@{users.find(u => u.id === tx.userId)?.username}</p><p className="text-emerald-500 font-mono text-xs font-bold mt-0.5">+{tx.amount.toLocaleString()} OTF</p></div>
                             <div className="flex gap-2">
                                {tx.depositStage === 'REQUEST' && <button onClick={() => handleApproveDeposit(tx.id, 'REQUEST')} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-xl uppercase transition-all shadow-lg shadow-blue-900/20">APPROVE REQ</button>}
                                {tx.depositStage === 'PAYMENT_SUBMITTED' && <button onClick={() => handleApproveDeposit(tx.id, 'PAYMENT_SUBMITTED')} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-xl uppercase transition-all shadow-lg shadow-emerald-900/20 animate-pulse-glow">CONFIRM PAY</button>}
                             </div>
                         </div>
                     ))}
                 </div>
                 <div className="widget-card p-8 rounded-[2rem] border-slate-800 bg-slate-900/30 min-h-[400px]">
                     <div className="flex items-center gap-3 mb-8">
                        <ArrowUpRight size={20} className="text-red-500"/>
                        <h3 className="text-white font-bold uppercase tracking-widest">Outflow Requests</h3>
                     </div>
                     {pendingWithdrawals.length === 0 ? <div className="text-center text-slate-600 py-20 font-tech uppercase text-[10px] tracking-[0.2em]">Frequency clear. No withdrawals.</div> : pendingWithdrawals.map(tx => (
                         <div key={tx.id} className="p-5 bg-slate-950 border border-white/5 rounded-2xl mb-4 space-y-4">
                             <div className="flex justify-between items-start">
                                 <div><p className="text-white font-bold">@{users.find(u => u.id === tx.userId)?.username}</p><p className="text-[10px] text-slate-500 font-mono mt-0.5">{tx.bankDetails}</p></div>
                                 <p className="text-red-400 font-mono font-bold text-base">-{Math.abs(tx.amount).toLocaleString()} <span className="text-[10px] font-normal opacity-50">OTF</span></p>
                             </div>
                             <div className="flex gap-3 pt-2">
                                 <input placeholder="Enter Bank Tx Ref ID" value={adminTxInput} onChange={e => setAdminTxInput(e.target.value)} className="bg-black border border-slate-800 text-xs p-3 flex-1 text-white rounded-xl outline-none focus:border-emerald-500 font-mono shadow-inner"/>
                                 <button onClick={() => handleWithdrawal(tx.id, 'APPROVE')} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-xl uppercase transition-all shadow-lg shadow-emerald-900/20">PAY</button>
                                 <button onClick={() => handleWithdrawal(tx.id, 'REJECT')} className="px-4 py-2 bg-red-900/20 border border-red-900/30 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold rounded-xl uppercase transition-all">VOID</button>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
       )}

       {activeTab === 'SYSTEM_CONFIG' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                 <div className="widget-card p-8 rounded-[2rem] border-slate-800 bg-slate-900/20">
                     <h3 className="text-white font-bold mb-8 uppercase tracking-[0.2em] text-xs flex items-center gap-2"><Power size={14} className="text-emerald-500"/> Protocol Switches</h3>
                     {['maintenanceMode', 'allowRegistrations', 'allowP2P', 'allowWithdrawals'].map(key => (
                         <div key={key} className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl mb-4 border border-white/5 hover:border-white/10 transition-all shadow-inner">
                             <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
                             <button onClick={() => handleAutoSave(key as keyof SystemSettings, !systemSettings[key as keyof SystemSettings])} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${systemSettings[key as keyof SystemSettings] ? 'bg-emerald-600' : 'bg-slate-800'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${systemSettings[key as keyof SystemSettings] ? 'left-7' : 'left-1'} shadow-md`}></div></button>
                         </div>
                     ))}
                 </div>
                 <div className="widget-card p-8 rounded-[2rem] border-slate-800 bg-slate-900/20">
                     <h3 className="text-white font-bold mb-8 uppercase tracking-[0.2em] text-xs flex items-center gap-2"><Percent size={14} className="text-cyan-500"/> Economic Logic</h3>
                     <div className="grid grid-cols-2 gap-6">
                         {['joiningFee', 'referralBonus', 'matchingBonus', 'levelIncomeBonus', 'withdrawalFeePercent', 'p2pFeePercent'].map(key => (
                             <div key={key} className="space-y-1.5"><label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest pl-1">{key.replace(/([A-Z])/g, ' $1')}</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-3 text-white text-xs rounded-xl outline-none focus:border-cyan-500 font-mono shadow-inner" value={systemSettings[key as keyof SystemSettings] as number} onChange={e => handleAutoSave(key as keyof SystemSettings, Number(e.target.value))} /></div>
                         ))}
                     </div>
                 </div>
                 <div className="lg:col-span-2 widget-card p-10 rounded-[2.5rem] border-slate-800 bg-slate-900/30">
                     <h3 className="text-white font-bold mb-8 uppercase tracking-[0.2em] text-xs flex items-center gap-2"><Megaphone size={16} className="text-amber-500"/> Global System Broadcast</h3>
                     <div className="flex gap-4 mb-10">
                        <div className="relative flex-1">
                            <Megaphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                            <input className="w-full bg-slate-950 border border-slate-800 pl-12 pr-6 py-4 text-white text-sm rounded-2xl outline-none focus:border-amber-500 transition-all shadow-inner" placeholder="Transmit announcement to all network nodes..." value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} />
                        </div>
                        <button onClick={handleBroadcastNotification} className="px-10 py-4 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold rounded-2xl uppercase tracking-[0.3em] transition-all shadow-xl shadow-amber-900/20 active:scale-95">TRANSMIT</button>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-800">
                        <button onClick={handleBackupSystem} className="flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-xl uppercase tracking-widest transition-all"><Download size={14}/> Backup</button>
                        <button onClick={handleRestoreClick} className="flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-xl uppercase tracking-widest transition-all"><Upload size={14}/> Restore</button>
                        <button onClick={safeResetSystem} className="flex items-center justify-center gap-2 py-4 bg-red-900/10 border border-red-900/30 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold rounded-xl uppercase tracking-widest transition-all"><Power size={14}/> Purge</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                     </div>
                 </div>
             </div>
       )}

       {activeTab === 'SUPPORT' && (
             <div className="widget-card rounded-[2.5rem] h-[650px] flex bg-slate-950/50 border border-slate-800 overflow-hidden animate-fade-in shadow-2xl">
                 <div className="w-1/3 border-r border-slate-800 overflow-y-auto custom-scrollbar bg-slate-950">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-950 z-20">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Channels</h4>
                        <span className="text-[9px] bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded-full font-bold border border-cyan-500/20">LIVE</span>
                    </div>
                     {Array.from(new Set(messages.filter(m => m.senderId !== 'admin1').map(m => m.senderId))).map(sid => {
                         const u = users.find(u => u.id === sid);
                         const lastMsg = messages.filter(m => m.senderId === sid || m.recipientId === sid).pop();
                         const unread = messages.filter(m => m.senderId === sid && m.recipientId === 'admin1' && !m.read).length;
                         
                         return (
                             <div key={sid} onClick={() => setSelectedChatUser(sid)} className={`p-6 border-b border-slate-900 cursor-pointer transition-all hover:bg-white/[0.02] flex items-center justify-between group ${selectedChatUser === sid ? 'bg-white/[0.04] border-l-4 border-l-lime-500' : ''}`}>
                                 <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-500 group-hover:text-white group-hover:border-lime-500/50 transition-colors uppercase">{(u?.name || sid).charAt(0)}</div>
                                     <div>
                                         <p className="text-white font-bold text-sm tracking-tight">{u?.name || sid}</p>
                                         <p className="text-[10px] text-slate-600 truncate w-32 mt-0.5 font-tech">{lastMsg?.text}</p>
                                     </div>
                                 </div>
                                 {unread > 0 && <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold animate-bounce shadow-lg shadow-red-900/20">{unread}</span>}
                             </div>
                         );
                     })}
                 </div>
                 <div className="flex-1 flex flex-col bg-slate-900/10 backdrop-blur-sm">
                     {selectedChatUser ? (
                         <>
                             <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                                 <div className="flex items-center gap-4">
                                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                                     <div>
                                        <span className="text-sm font-bold text-white uppercase tracking-wider font-tech">{users.find(u => u.id === selectedChatUser)?.name}</span>
                                        <p className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-widest">ENCRYPTED CHANNEL SECURED</p>
                                     </div>
                                 </div>
                                 <button className="text-slate-600 hover:text-white transition-colors"><ShieldCheck size={18}/></button>
                             </div>
                             <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-black/10">
                                 {messages.filter(m => m.senderId === selectedChatUser || m.recipientId === selectedChatUser).map(msg => (
                                     <div key={msg.id} className={`flex ${msg.senderId === 'admin1' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                         <div className={`p-4 rounded-2xl text-xs max-w-[70%] leading-relaxed shadow-xl border ${msg.senderId === 'admin1' ? 'bg-lime-900/20 border-lime-500/30 text-lime-100 rounded-tr-none' : 'bg-slate-800/80 border-slate-700 text-slate-200 rounded-tl-none'}`}>
                                             {msg.text}
                                             <div className={`text-[8px] mt-2 font-mono opacity-40 text-right ${msg.senderId === 'admin1' ? 'text-lime-200' : 'text-white'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                         </div>
                                     </div>
                                 ))}
                                 <div ref={chatEndRef}></div>
                             </div>
                             <form onSubmit={handleReplyMessage} className="p-5 border-t border-slate-800 flex gap-3 bg-slate-950/80 backdrop-blur-md">
                                 <input className="flex-1 bg-black/40 border border-slate-800 p-4 rounded-2xl text-white text-xs outline-none focus:border-lime-500 transition-all shadow-inner placeholder-slate-700" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Transmit secure response protocol..."/>
                                 <button className="p-4 bg-lime-600 hover:bg-lime-500 text-white rounded-2xl shadow-2xl transition-all shadow-lime-900/20 active:scale-95"><Send size={20}/></button>
                             </form>
                         </>
                     ) : <div className="flex-1 flex flex-col items-center justify-center text-slate-700 gap-4 opacity-40 font-tech uppercase tracking-[0.3em] text-[10px]">
                            <MessageSquare size={48} className="mb-2"/>
                            Select a node communication stream
                         </div>}
                 </div>
             </div>
       )}

       {activeTab === 'USER_LOGS' && (
             <div className="widget-card rounded-[2rem] h-[700px] flex flex-col p-8 bg-slate-900/30 border-slate-800 animate-fade-in">
                 <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="font-bold text-white font-tech uppercase tracking-widest">SYSTEM AUDIT LEDGER</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-mono mt-1">Real-time action tracking</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"/>
                            <input placeholder="Search audit trail..." value={logSearch} onChange={e => setLogSearch(e.target.value)} className="bg-slate-950 border border-slate-800 text-xs pl-10 pr-4 py-2.5 rounded-xl text-white outline-none focus:border-cyan-500 transition-all w-64 shadow-inner"/>
                        </div>
                        <button onClick={onClearLogs} className="px-6 py-2.5 bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold rounded-xl uppercase tracking-widest transition-all">FLUSH LEDGER</button>
                    </div>
                 </div>
                 <div className="flex-1 overflow-auto custom-scrollbar space-y-1.5 border border-white/5 rounded-2xl bg-black/20 p-4">
                     {filteredLogs.map(log => (
                         <div key={log.id} className="text-[10px] p-3 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors flex items-center gap-4 font-mono group">
                             <span className="text-slate-600 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                             <span className="text-cyan-500 font-bold whitespace-nowrap min-w-[100px] group-hover:text-cyan-400 transition-colors uppercase">@{log.userName}</span>
                             <span className={`px-2 py-0.5 rounded font-bold uppercase text-[8px] tracking-widest ${log.action.includes('ERROR') || log.action.includes('REJECT') ? 'bg-red-900/20 text-red-400 border border-red-900/30' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>{log.action}</span>
                             <span className="text-slate-400 break-all">{log.details}</span>
                         </div>
                     ))}
                     {filteredLogs.length === 0 && <div className="text-center py-20 text-slate-700 italic font-tech uppercase tracking-widest text-[10px]">No logs found in registry</div>}
                 </div>
             </div>
       )}

       {activeTab === 'P2P_TRADES' && (
             <div className="widget-card rounded-[2rem] p-8 bg-slate-900/30 border-slate-800 animate-fade-in shadow-xl">
                 <div className="mb-8">
                    <h3 className="font-bold text-white font-tech uppercase tracking-widest">NETWORK P2P EXCHANGES</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-mono mt-1">Live peer-to-peer liquidity flow</p>
                 </div>
                 <div className="overflow-hidden border border-white/5 rounded-2xl bg-black/20">
                    <table className="w-full text-xs text-left text-slate-400 border-collapse">
                        <thead className="bg-slate-950 text-slate-500 uppercase font-bold sticky top-0 z-10">
                            <tr>
                                <th className="p-5 border-b border-white/5">Requestor</th>
                                <th className="p-5 border-b border-white/5">Operation</th>
                                <th className="p-5 border-b border-white/5">Volume</th>
                                <th className="p-5 border-b border-white/5">Target</th>
                                <th className="p-5 border-b border-white/5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {p2pRequests.map(req => (
                                <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-5 font-bold text-slate-200">@{req.requestorName}</td>
                                    <td className="p-5"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${req.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'}`}>{req.type}</span></td>
                                    <td className="p-5 font-mono text-white font-bold">{req.amount.toLocaleString()} OTF</td>
                                    <td className="p-5 text-slate-300">@{req.targetUserName}</td>
                                    <td className="p-5 text-right"><span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{req.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {p2pRequests.length === 0 && <div className="text-center py-20 text-slate-700 italic font-tech uppercase tracking-widest text-[10px]">No peer transfers detected in registry</div>}
                 </div>
             </div>
       )}

       {activeTab === 'SECURITY' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                 <div className="widget-card p-8 rounded-[2rem] border-slate-800 bg-slate-900/30">
                     <div className="flex items-center gap-3 mb-8">
                        <Key size={20} className="text-amber-500"/>
                        <h3 className="text-white font-bold uppercase tracking-widest">Password Resets</h3>
                     </div>
                     {passwordResetRequests.length === 0 ? <div className="text-center text-slate-700 py-10 text-[10px] uppercase font-tech tracking-widest">No resets requested</div> : passwordResetRequests.map(req => (
                         <div key={req.id} className="flex justify-between items-center p-4 bg-slate-950 border border-white/5 rounded-2xl mb-4 hover:border-amber-500/30 transition-all">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><UserIcon size={14}/></div>
                                 <span className="text-sm text-slate-200 font-bold tracking-tight">@{req.username}</span>
                             </div>
                             <button onClick={() => onApprovePasswordReset?.(req.id)} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-amber-900/20">RESET ACCESS</button>
                         </div>
                     ))}
                 </div>
                 <div className="widget-card p-8 rounded-[2rem] border-slate-800 bg-slate-900/30">
                     <div className="flex items-center gap-3 mb-8">
                        <Monitor size={20} className="text-cyan-500"/>
                        <h3 className="text-white font-bold uppercase tracking-widest">Hardware Approvals</h3>
                     </div>
                     {deviceApprovalRequests.length === 0 ? <div className="text-center text-slate-700 py-10 text-[10px] uppercase font-tech tracking-widest">All devices authorized</div> : deviceApprovalRequests.map(req => (
                         <div key={req.id} className="p-4 bg-slate-950 border border-white/5 rounded-2xl mb-4 space-y-4 hover:border-cyan-500/30 transition-all group">
                             <div className="flex justify-between items-center">
                                 <span className="text-sm text-white font-bold tracking-tight">@{req.username}</span>
                                 <span className="text-[9px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-white/5 uppercase tracking-widest">{req.ip}</span>
                             </div>
                             <p className="text-[10px] text-slate-600 font-mono break-all bg-black/40 p-3 rounded-xl border border-white/5 group-hover:border-cyan-500/20 transition-all">{req.deviceId}</p>
                             <button onClick={() => onApproveDevice?.(req.id)} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-cyan-900/20">AUTHORIZE HARDWARE</button>
                         </div>
                     ))}
                 </div>
             </div>
       )}

       {activeTab === 'VERIFICATION' && (
             <div className="widget-card rounded-[2rem] p-8 bg-slate-900/30 border-slate-800 animate-fade-in shadow-xl">
                 <div className="mb-8">
                    <h3 className="font-bold text-white font-tech uppercase tracking-widest flex items-center gap-2"><ScanFace size={20} className="text-lime-500"/> KYC VERIFICATION PENDING</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-mono mt-1">Authorized identity verification center</p>
                 </div>
                 {verificationRequests?.length === 0 ? <div className="text-center text-slate-700 py-32 font-tech uppercase tracking-widest text-[10px]">Registry is empty. No pending verifications.</div> : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {verificationRequests?.map(req => (
                            <div key={req.id} className="p-6 bg-slate-950 border border-slate-800 rounded-[1.5rem] space-y-5 hover:border-lime-500/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-lime-500/5 rounded-full blur-[40px] pointer-events-none"></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-lime-500 transition-colors">
                                        <FileBadge size={24}/>
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm tracking-tight">{req.fullName}</p>
                                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">@{req.username} • {req.country}</p>
                                    </div>
                                </div>
                                
                                <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-2 relative z-10">
                                    <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-bold">Protocol</span><span className="text-[9px] text-lime-400 font-mono font-bold uppercase">{req.idType}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-bold">Identity ID</span><span className="text-[9px] text-white font-mono font-bold uppercase">{req.idNumber || 'S-192-332'}</span></div>
                                </div>

                                <a href={req.documentUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold border border-slate-800 uppercase tracking-widest transition-all relative z-10">
                                    <ExternalLink size={14}/> VIEW IDENTITY SEGMENTS
                                </a>
                                
                                <div className="flex gap-3 relative z-10">
                                    <button onClick={() => onApproveVerification?.(req.id)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 active:scale-95">VERIFY</button>
                                    <button onClick={() => onRejectVerification?.(req.id)} className="flex-1 py-3 bg-red-900/10 border border-red-900/30 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold rounded-xl uppercase tracking-widest transition-all active:scale-95">DENY</button>
                                </div>
                            </div>
                        ))}
                     </div>
                 )}
             </div>
       )}
    </div>
  );
};
