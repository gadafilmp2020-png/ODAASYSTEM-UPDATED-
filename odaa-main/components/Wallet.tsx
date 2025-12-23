import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, User, SystemSettings, P2PRequest } from '../types';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, X, Loader2, ArrowRightLeft, Wallet as WalletIcon, Cpu, Info, ShieldCheck, AlertTriangle, Banknote, Upload, Send, ChevronDown, Lock, Coins, Building2, Hash, User as UserIcon, Smartphone, Fingerprint, Globe, QrCode } from 'lucide-react';
import { CurrencyIcon } from './CurrencyIcon';
import { OTF_VALUE_ETB, COMPANY_BANK_DETAILS } from '../constants';

interface WalletProps {
  user: User;
  allUsers?: User[]; 
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void;
  systemSettings: SystemSettings;
  isFTUsed?: (ft: string) => boolean;
  onUpdateUser?: (userId: string, updates: Partial<User>) => void;
  onP2PRequest?: (req: any, targetUsername: string) => void;
  p2pRequests?: P2PRequest[];
  onP2PAction?: (id: string, action: 'APPROVE' | 'REJECT') => void;
}

export const Wallet: React.FC<WalletProps> = ({ 
    user, allUsers = [], transactions, onAddTransaction, 
    onUpdateTransaction, systemSettings, isFTUsed, 
    onUpdateUser, onP2PRequest, p2pRequests = [], onP2PAction 
}) => {
  const userTransactions = transactions.filter(t => t.userId === user.id);
  const [showModal, setShowModal] = useState<'DEPOSIT' | 'WITHDRAWAL' | 'SEND' | 'RECEIVE' | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({ amount: '', method: 'Bank Transfer', bankName: user.bankName || 'CBE', accountNumber: user.accountNumber || '', accountName: user.accountName || user.name, ftNumber: '' });
  const [processing, setProcessing] = useState(false);
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [error, setError] = useState('');
  
  // P2P Inputs
  const [p2pForm, setP2PForm] = useState({ targetUsername: '', amount: '', pin: '' });
  
  // Request Approval State
  const [selectedRequest, setSelectedRequest] = useState<P2PRequest | null>(null);
  const [approvalPin, setApprovalPin] = useState('');

  const p2pTargetUser = useMemo(() => {
     if (!p2pForm.targetUsername) return null;
     return allUsers.find(u => u.username.toLowerCase() === p2pForm.targetUsername.toLowerCase());
  }, [p2pForm.targetUsername, allUsers]);

  const closeModal = () => { 
      setShowModal(null); setStep(1); setConfirmCheck(false); setProcessing(false); setError(''); 
      setP2PForm({ targetUsername: '', amount: '', pin: '' }); 
      setSelectedRequest(null);
      setApprovalPin('');
  };

  const handleOpenP2P = (type: 'SEND' | 'RECEIVE') => {
      if (!user.isTwoFactorEnabled) {
          alert("Security Protocol: You must register a 2-Step Verification Code in Security settings to use P2P features.");
          return;
      }
      setShowModal(type);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (showModal === 'SEND' || showModal === 'RECEIVE') {
        const amt = Number(p2pForm.amount);
        if (isNaN(amt) || amt <= 0) { setError('Invalid amount'); return; }
        if (!p2pForm.targetUsername) { setError('Target username required'); return; }
        if (!p2pTargetUser) { setError('User not found'); return; }
        if (p2pTargetUser.id === user.id) { setError('Cannot transact with yourself'); return; }
        
        if (showModal === 'SEND') {
            const fee = amt * (systemSettings.p2pFeePercent / 100);
            if (user.balance < (amt + fee)) { setError(`Insufficient funds. Need ${amt + fee} OTF.`); return; }
            
            // STRICT 2FA CHECK FOR SENDER
            if (!p2pForm.pin) { setError('2-Step Verification Code required.'); return; }
            if (user.twoFactorMethod === 'MANUAL' && p2pForm.pin !== user.twoFactorSecret) { setError('Invalid 2FA Code.'); return; }
            if (user.twoFactorMethod !== 'MANUAL' && p2pForm.pin !== '123456') { /* Mock OTP check */ setError('Invalid Code.'); return; } // In prod, check dynamic OTP
        }
        setStep(2);
        return;
    }
    const amt = Number(formData.amount);
    if (isNaN(amt) || amt <= 0) { alert("Invalid Amount."); return; }
    if (showModal === 'WITHDRAWAL') {
        const fee = systemSettings.withdrawalFeePercent || 2;
        if (amt * (1 + fee/100) > user.balance) { alert(`Insufficient Funds for Amount + ${fee}% Fee.`); return; }
    }
    setStep(2);
  };

  const handleConfirmTransaction = () => {
    if (!confirmCheck) return;
    setProcessing(true);
    
    if (showModal === 'SEND' || showModal === 'RECEIVE') {
        setTimeout(() => {
            if (onP2PRequest) {
                const amt = Number(p2pForm.amount);
                const fee = amt * (systemSettings.p2pFeePercent / 100);
                try {
                    onP2PRequest({ 
                        type: showModal === 'SEND' ? 'SEND' : 'REQUEST', 
                        amount: amt, 
                        fee, 
                        total: amt + fee 
                    }, p2pForm.targetUsername);
                    closeModal();
                } catch (err: any) {
                    setError(err.message);
                    setProcessing(false);
                }
            }
        }, 1500);
        return;
    }

    setTimeout(() => {
      const numAmount = Number(formData.amount);
      if (showModal === 'WITHDRAWAL') {
          const fee = numAmount * ((systemSettings.withdrawalFeePercent || 0) / 100);
          if (onUpdateUser) onUpdateUser(user.id, { balance: user.balance - (numAmount + fee) });
          onAddTransaction({ id: `tx-${Date.now()}`, userId: user.id, userName: user.name, type: 'WITHDRAWAL', amount: -numAmount, date: new Date().toISOString().split('T')[0], status: 'PENDING', description: `Withdrawal to ${formData.bankName}`, bankDetails: `${formData.bankName} - ${formData.accountNumber}` });
      } else {
          onAddTransaction({ id: `t${Date.now()}`, userId: user.id, userName: user.name, type: 'DEPOSIT', amount: numAmount, date: new Date().toISOString().split('T')[0], status: 'PENDING', depositStage: 'REQUEST', description: `Deposit Request Initiated` });
      }
      closeModal();
    }, 1500);
  };

  const handleSubmitProof = (txId: string) => {
      if (!formData.ftNumber) { setError("Reference ID required."); return; }
      if (isFTUsed && isFTUsed(formData.ftNumber)) { setError("Error: This FT Number has already been used."); return; }
      setProcessing(true);
      setTimeout(() => {
          if (onUpdateTransaction) onUpdateTransaction(txId, { depositStage: 'PAYMENT_SUBMITTED', ftNumber: formData.ftNumber });
          closeModal();
      }, 1500);
  };

  const handleApproveRequest = (req: P2PRequest) => {
      if (!approvalPin) { alert("Enter 2FA Code"); return; }
      // Verify PIN for Request Approval (Sender authorizing funds)
      if (user.twoFactorMethod === 'MANUAL' && approvalPin !== user.twoFactorSecret) { alert("Invalid 2FA Code"); return; }
      
      const fee = req.amount * (systemSettings.p2pFeePercent / 100);
      const totalDed = req.amount + fee;

      if (user.balance < totalDed) { alert(`Insufficient Balance. Need ${totalDed} OTF (Inc. 2% Fee)`); return; }

      if (onP2PAction) onP2PAction(req.id, 'APPROVE');
      setSelectedRequest(null);
      setApprovalPin('');
  };

  const pendingDeposit = userTransactions.find(t => t.type === 'DEPOSIT' && t.status === 'PENDING');
  const numAmount = Number(formData.amount) || 0;
  
  // Filter P2P requests waiting for MY approval (I am the target of a REQUEST)
  const incomingRequests = p2pRequests.filter(r => r.type === 'REQUEST' && r.targetUserId === user.id && r.status === 'PENDING_SENDER');

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between px-2 gap-6">
         <div><h1 className="text-4xl font-bold text-white tracking-tight uppercase">My <span className="text-brand-lime">Wallet</span></h1><p className="text-[10px] text-slate-500 uppercase tracking-widest italic mt-1 pl-1">Manage your funds</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 widget-card-2025 p-10 h-[300px] border-brand-lime flex flex-col justify-between bg-slate-900/40 relative">
            <div className="absolute top-4 right-6 text-brand-lime opacity-30 animate-pulse"><Cpu size={48} /></div>
            <div><p className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Total Balance</p><h2 className="text-6xl font-black text-white font-tech tracking-tighter mt-4">{user.balance.toLocaleString()} <span className="text-sm font-normal text-brand-lime">OTF</span></h2><p className="text-sm text-slate-500 font-mono mt-1">≈ {(user.balance * OTF_VALUE_ETB).toLocaleString()} ETB</p></div>
            <div className="flex items-center gap-4 pt-6 border-t border-white/5"><div className="w-1.5 h-1.5 bg-brand-lime rounded-full"></div><span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Account Active</span></div>
        </div>

        <div className="space-y-4">
          <div className="widget-card-2025 p-8 border-brand-lime/30 bg-black/60 space-y-4 h-full flex flex-col justify-center">
            <button onClick={() => setShowModal('DEPOSIT')} className="w-full py-4 primary-gradient-new text-black !rounded-2xl flex items-center justify-center gap-3 active:scale-95 shadow-glow-lime"><ArrowDownLeft size={16}/> {pendingDeposit ? 'Check Progress' : 'Deposit'}</button>
            <button onClick={() => setShowModal('WITHDRAWAL')} className="w-full py-4 bg-slate-800 border-2 border-white/5 hover:border-brand-lime/20 rounded-2xl flex items-center justify-center gap-3 text-white text-[10px] font-black uppercase tracking-widest transition-all"><ArrowUpRight size={16}/> Withdraw</button>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleOpenP2P('SEND')} className="w-full py-4 bg-cyan-900/20 border-2 border-cyan-500/20 hover:border-cyan-500/50 rounded-2xl flex items-center justify-center gap-3 text-cyan-400 text-[10px] font-black uppercase tracking-widest transition-all"><Send size={16}/> Send</button>
                <button onClick={() => handleOpenP2P('RECEIVE')} className="w-full py-4 bg-lime-900/20 border-2 border-lime-500/20 hover:border-lime-500/50 rounded-2xl flex items-center justify-center gap-3 text-lime-400 text-[10px] font-black uppercase tracking-widest transition-all"><QrCode size={16}/> Receive</button>
            </div>
          </div>
        </div>
      </div>

      {/* INCOMING REQUESTS SECTION */}
      {incomingRequests.length > 0 && (
          <div className="widget-card-2025 p-8 border-amber-500/30 bg-slate-900/40">
              <h3 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2"><AlertTriangle size={16}/> Incoming Payment Requests</h3>
              <div className="grid gap-4">
                  {incomingRequests.map(req => (
                      <div key={req.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-slate-800 rounded-full"><UserIcon size={20}/></div>
                              <div>
                                  <p className="text-white font-bold text-sm">@{req.requestorName} requests {req.amount} OTF</p>
                                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{new Date(req.date).toLocaleDateString()}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3 w-full md:w-auto">
                              {selectedRequest?.id === req.id ? (
                                  <div className="flex gap-2 w-full animate-fade-in items-center">
                                      <span className="text-[9px] text-amber-500 uppercase font-bold mr-1">2FA Code:</span>
                                      <input type="password" placeholder="PIN" className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center text-white outline-none font-mono" value={approvalPin} onChange={e => setApprovalPin(e.target.value)} />
                                      <button onClick={() => handleApproveRequest(req)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-emerald-500">Confirm</button>
                                      <button onClick={() => setSelectedRequest(null)} className="text-slate-500 hover:text-white px-2"><X size={16}/></button>
                                  </div>
                              ) : (
                                  <>
                                    <button onClick={() => setSelectedRequest(req)} className="flex-1 px-6 py-2 bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all">Approve</button>
                                    <button onClick={() => onP2PAction && onP2PAction(req.id, 'REJECT')} className="px-4 py-2 bg-red-900/20 text-red-500 border border-red-900/30 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Deny</button>
                                  </>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
              <div className="widget-card-2025 w-full max-w-sm border-brand-lime rounded-[3rem] bg-slate-950 shadow-huge">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center"><h3 className="text-[10px] font-black text-white uppercase tracking-widest">{showModal}</h3><button onClick={closeModal} className="p-2 bg-white/5 rounded-full text-slate-500"><X size={18}/></button></div>
                  <div className="p-10 space-y-8">
                      {showModal === 'SEND' || showModal === 'RECEIVE' ? (
                          step === 1 ? (
                              <form onSubmit={handleNextStep} className="space-y-6">
                                  <div className="space-y-2"><label className="text-[9px] text-slate-500 font-black uppercase tracking-widest pl-4">{showModal === 'SEND' ? 'Receiver' : 'Sender'} Username</label><input required className="tech-input-new" value={p2pForm.targetUsername} onChange={e => setP2PForm({...p2pForm, targetUsername: e.target.value})} placeholder="Username" />{p2pTargetUser && <p className="text-[9px] text-emerald-500 pl-4 font-bold">VERIFIED: {p2pTargetUser.name}</p>}</div>
                                  <div className="space-y-2"><label className="text-[9px] text-slate-500 font-black uppercase tracking-widest pl-4">Amount</label><input required type="number" className="tech-input-new" value={p2pForm.amount} onChange={e => setP2PForm({...p2pForm, amount: e.target.value})} placeholder="0.00" /></div>
                                  {showModal === 'SEND' && (
                                      <div className="space-y-2">
                                          <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest pl-4 flex items-center gap-2"><Lock size={10}/> 2-Step Verification</label>
                                          <input required type="password" className="tech-input-new text-center tracking-[0.5em] font-mono text-amber-500" value={p2pForm.pin} onChange={e => setP2PForm({...p2pForm, pin: e.target.value})} placeholder="******" maxLength={6} />
                                          <p className="text-[8px] text-slate-600 pl-4">Enter your 2FA Code to authorize transfer.</p>
                                      </div>
                                  )}
                                  {error && <p className="text-red-500 text-[10px] font-bold bg-red-900/20 p-2 rounded">{error}</p>}
                                  <button type="submit" className="w-full primary-gradient-new !rounded-[2.5rem]">Next</button>
                              </form>
                          ) : (
                              <div className="space-y-6 text-center">
                                  <div className="p-6 bg-slate-900 rounded-3xl border border-white/5"><p className="text-slate-500 text-[10px] uppercase font-bold">Total {showModal === 'SEND' ? 'Sent' : 'Requested'}</p><h3 className="text-3xl font-black text-white font-tech">{p2pForm.amount} OTF</h3>
                                  {showModal === 'SEND' && <p className="text-amber-500 text-[10px] font-bold mt-1">+ {(Number(p2pForm.amount) * systemSettings.p2pFeePercent/100).toFixed(2)} Fee</p>}
                                  </div>
                                  <div className="flex items-center gap-3 p-4 bg-brand-lime/5 rounded-2xl cursor-pointer" onClick={() => setConfirmCheck(!confirmCheck)}><div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${confirmCheck ? 'bg-brand-lime border-brand-lime' : 'border-slate-700'}`}>{confirmCheck && <CheckCircle2 size={12} className="text-black" />}</div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Confirm Transaction</p></div>
                                  <button disabled={!confirmCheck || processing} onClick={handleConfirmTransaction} className="w-full py-5 primary-gradient-new text-black !rounded-[2.5rem] flex items-center justify-center gap-3">{processing ? <Loader2 className="animate-spin"/> : <Send size={16}/>} Execute</button>
                              </div>
                          )
                      ) : (
                          // Deposit / Withdrawal Logic (Existing)
                          step === 1 ? (
                              <form onSubmit={handleNextStep} className="space-y-6">
                                  <div className="space-y-2"><label className="text-[9px] text-slate-500 font-black uppercase tracking-widest pl-8">Amount (OTF)</label><div className="relative group"><Coins className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30 transition-colors" size={20}/><input required type="number" className="tech-input-new pl-16 text-xl font-black" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" /></div></div>
                                  {showModal === 'WITHDRAWAL' && (
                                    <div className="space-y-3 animate-slide-in-right border-t border-white/5 pt-4">
                                      <div className="relative group"><Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30" size={18}/><input required className="tech-input-new pl-16 !py-3 !text-xs" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} placeholder="Bank Name" /></div>
                                      <div className="relative group"><Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30" size={18}/><input required className="tech-input-new pl-16 !py-3 !text-xs font-mono" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} placeholder="Account Number" /></div>
                                      <div className="relative group"><UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30" size={18}/><input required className="tech-input-new pl-16 !py-3 !text-xs" value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} placeholder="Full Legal Name" /></div>
                                    </div>
                                  )}
                                  <button type="submit" className="w-full primary-gradient-new !rounded-[2.5rem]">Next</button>
                              </form>
                          ) : (
                              // Confirmation Step
                              <div className="space-y-8 animate-fade-in text-center">
                                  {/* Deposit Logic showing Bank Details if applicable */}
                                  {showModal === 'DEPOSIT' && pendingDeposit && pendingDeposit.depositStage === 'WAITING_PAYMENT' ? (
                                      <div className="space-y-6">
                                           <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 space-y-3 font-mono text-xs"><p><span className="text-slate-600">BANK:</span> <span className="text-white uppercase">{systemSettings.bankName}</span></p><p><span className="text-slate-600">ACC:</span> <span className="text-brand-lime font-black">{systemSettings.accountNumber}</span></p></div>
                                           <div className="space-y-2"><label className="text-[9px] text-slate-500 font-black uppercase tracking-widest pl-8">Transaction Reference</label><div className="relative group"><Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30" size={18}/><input required className="tech-input-new pl-16 font-mono text-xl text-amber-500 tracking-widest" placeholder="Reference ID" value={formData.ftNumber} onChange={e => setFormData({...formData, ftNumber: e.target.value})} /></div></div>
                                           <button onClick={() => handleSubmitProof(pendingDeposit.id)} className="w-full py-4 primary-gradient-new text-black !rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-glow-lime">Submit Proof</button>
                                      </div>
                                  ) : (
                                      // Standard Confirmation
                                      <div className="space-y-8">
                                          <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-brand-lime/20 shadow-inner"><p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Final Amount</p><h4 className="text-4xl font-black text-white mt-4 font-tech">{numAmount.toLocaleString()} <span className="text-sm font-normal text-brand-lime">OTF</span></h4></div>
                                          <div className="flex items-center gap-3 p-4 bg-brand-lime/5 rounded-2xl border border-brand-lime/10 cursor-pointer" onClick={() => setConfirmCheck(!confirmCheck)}><div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${confirmCheck ? 'bg-brand-lime border-brand-lime' : 'border-slate-700 bg-black/40'}`}>{confirmCheck && <CheckCircle2 size={12} className="text-black" />}</div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest select-none">Confirm this transaction</p></div>
                                          <button disabled={!confirmCheck || processing} onClick={handleConfirmTransaction} className="w-full py-5 primary-gradient-new text-black !rounded-[2.5rem] flex items-center justify-center gap-3 shadow-glow-lime">{processing ? <Loader2 className="animate-spin" size={20}/> : <ShieldCheck size={20}/>} Confirm</button>
                                      </div>
                                  )}
                              </div>
                          )
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};