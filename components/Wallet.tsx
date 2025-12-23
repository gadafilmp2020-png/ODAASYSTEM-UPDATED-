
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, User, SystemSettings } from '../types';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, X, Loader2, ArrowRightLeft, Wallet as WalletIcon, Cpu, Info, ShieldCheck, AlertTriangle, Banknote, Upload, Send, ChevronDown, Lock } from 'lucide-react';
import { CurrencyIcon } from './CurrencyIcon';
import { OTF_VALUE_ETB, COMPANY_BANK_DETAILS } from '../constants';

interface WalletProps {
  user: User;
  allUsers?: User[]; // Added to support lookup
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void;
  systemSettings: SystemSettings;
  onP2PRequest?: (req: any, targetUsername: string) => void;
}

export const Wallet: React.FC<WalletProps> = ({ user, allUsers = [], transactions, onAddTransaction, onUpdateTransaction, systemSettings, onP2PRequest }) => {
  const userTransactions = transactions.filter(t => t.userId === user.id);
  const [showModal, setShowModal] = useState<'DEPOSIT' | 'WITHDRAWAL' | 'P2P' | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  
  // Pending Actions Check
  const pendingDeposit = userTransactions.find(t => t.type === 'DEPOSIT' && t.status === 'PENDING');
  
  // P2P State
  const [p2pMode, setP2PMode] = useState<'BUY' | 'SELL'>('BUY');
  const [p2pForm, setP2PForm] = useState({ targetUsername: '', amount: '', ftNumber: '' });
  
  // Look up target user for name verification
  const p2pTargetUser = useMemo(() => {
     if (!p2pForm.targetUsername) return null;
     return allUsers.find(u => u.username.toLowerCase() === p2pForm.targetUsername.toLowerCase());
  }, [p2pForm.targetUsername, allUsers]);

  const [formData, setFormData] = useState({
    amount: '',
    method: 'Bank Transfer',
    bankName: 'Commercial Bank of Ethiopia', 
    accountNumber: '',
    accountName: '',
    ftNumber: '',
  });
  
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [error, setError] = useState('');
  const [prevBalance, setPrevBalance] = useState(user.balance);
  const [balanceHighlight, setBalanceHighlight] = useState(false);

  useEffect(() => {
    if (user.balance !== prevBalance) {
      setBalanceHighlight(true);
      // Increased timeout to match the pop-in animation duration (500ms)
      const timer = setTimeout(() => setBalanceHighlight(false), 500);
      setPrevBalance(user.balance);
      return () => clearTimeout(timer);
    }
  }, [user.balance, prevBalance]);

  const closeModal = () => {
     setShowModal(null);
     setStep(1);
     setFormData({ amount: '', method: 'Bank Transfer', bankName: 'Commercial Bank of Ethiopia', accountNumber: '', accountName: '', ftNumber: '' });
     setP2PForm({ targetUsername: '', amount: '', ftNumber: '' });
     setProofFile(null);
     setConfirmCheck(false);
     setError('');
     setProcessing(false);
  };

  const handleOpenModal = (type: 'DEPOSIT' | 'WITHDRAWAL' | 'P2P') => {
      if ((type === 'WITHDRAWAL' || (type === 'P2P' && p2pMode === 'SELL')) && user.walletLocked) {
          alert("Action Denied: Your wallet is currently locked by the administrator.");
          return;
      }
      setShowModal(type);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (showModal === 'P2P') {
        const amt = Number(p2pForm.amount);
        if (isNaN(amt) || amt <= 0) { setError('Invalid amount'); return; }
        if (!p2pForm.targetUsername) { setError('Target username is required'); return; }
        if (!p2pTargetUser) { setError('User not found in system.'); return; }
        if (p2pTargetUser.id === user.id) { setError('Cannot trade with yourself.'); return; }

        if (p2pMode === 'BUY' && !p2pForm.ftNumber) { setError('Payment Reference ID (FT Number) is required for Buying.'); return; }
        if (p2pMode === 'SELL' && amt * (1 + systemSettings.p2pFeePercent/100) > user.balance) { setError(`Insufficient balance (Amount + Fees).`); return; }
        setStep(2);
        return;
    }

    const numAmount = Number(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
       setError('Please enter a valid amount.');
       return;
    }

    if (showModal === 'WITHDRAWAL') {
        const feePercent = systemSettings.withdrawalFeePercent;
        const totalDeduction = numAmount * (1 + feePercent/100);
        if (totalDeduction > user.balance) {
            setError(`Insufficient balance. You need ${totalDeduction.toFixed(2)} OTF to cover amount + fees.`);
            return;
        }
        if (!formData.accountNumber || !formData.accountName) {
            setError('Please provide valid bank account details.');
            return;
        }
    } 
    setStep(2);
  };

  const handleConfirmTransaction = () => {
    if (!confirmCheck) return;
    setProcessing(true);
    if (showModal === 'P2P') {
        setTimeout(() => {
            if (onP2PRequest) {
                const amt = Number(p2pForm.amount);
                const fee = amt * (systemSettings.p2pFeePercent / 100);
                try {
                    onP2PRequest({ type: p2pMode, amount: amt, fee, total: amt + fee, ftNumber: p2pForm.ftNumber }, p2pForm.targetUsername);
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
      const isDeposit = showModal === 'DEPOSIT';
      const numAmount = Number(formData.amount);
      const newTx: Transaction = {
        id: `t${Date.now()}`, 
        userId: user.id, 
        userName: user.name, 
        type: isDeposit ? 'DEPOSIT' : 'WITHDRAWAL',
        amount: isDeposit ? numAmount : -numAmount, 
        date: new Date().toISOString().split('T')[0],
        status: 'PENDING',
        depositStage: isDeposit ? 'REQUEST' : undefined,
        description: isDeposit 
            ? `Deposit Request via ${formData.method}` 
            : `Withdrawal to ${formData.bankName} (${formData.accountNumber})`, 
        method: formData.method,
        bankDetails: isDeposit ? undefined : `${formData.bankName} - ${formData.accountNumber} (${formData.accountName})`
      };
      onAddTransaction(newTx); 
      closeModal();
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setProofFile(e.target.files[0]);
      }
  };

  const handleSubmitProof = (txId: string) => {
      if(!formData.ftNumber) { setError('Transaction (FT) Number is required'); return; }
      if(!proofFile) { setError('Please upload the proof of payment file.'); return; }
      
      setProcessing(true);
      
      // Convert file to Base64 for persistence
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = reader.result as string;
          setTimeout(() => {
              if (onUpdateTransaction) {
                  onUpdateTransaction(txId, {
                      depositStage: 'PAYMENT_SUBMITTED',
                      ftNumber: formData.ftNumber,
                      proofUrl: base64String, 
                  });
              }
              alert(`Proof Submitted. Admin notified.`);
              closeModal();
          }, 1500);
      };
      reader.readAsDataURL(proofFile);
  };

  const getTxTypeConfig = (type: Transaction['type']) => {
    switch(type) {
      case 'DEPOSIT': return { icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-900/30', border: 'border-emerald-500/30' };
      case 'WITHDRAWAL': return { icon: ArrowUpRight, color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-500/30' };
      case 'P2P_TRANSFER': return { icon: ArrowRightLeft, color: 'text-cyan-400', bg: 'bg-cyan-900/30', border: 'border-cyan-500/30' };
      default: return { icon: WalletIcon, color: 'text-lime-400', bg: 'bg-lime-900/30', border: 'border-lime-500/30' };
    }
  };

  const numAmount = Number(formData.amount) || 0;
  const isDeposit = showModal === 'DEPOSIT';
  const feePercent = isDeposit ? 0 : systemSettings.withdrawalFeePercent;
  const feeAmount = numAmount * (feePercent / 100);
  const totalAmount = isDeposit ? numAmount : (numAmount + feeAmount); 
  const etbValue = numAmount * OTF_VALUE_ETB;

  const renderDepositAction = () => {
      if (!pendingDeposit) return <button onClick={() => handleOpenModal('DEPOSIT')} className="cyber-button-primary py-2.5 rounded-lg text-xs font-bold font-tech uppercase bg-emerald-600 hover:bg-emerald-500 border-emerald-500">Request Deposit</button>;
      if (pendingDeposit.depositStage === 'REQUEST') return <div className="py-2.5 rounded-lg text-xs font-bold font-tech uppercase bg-amber-900/20 text-amber-500 border border-amber-500/30 text-center flex items-center justify-center gap-2 animate-pop-in"><Clock size={14}/> Pending Admin Approval</div>;
      if (pendingDeposit.depositStage === 'WAITING_PAYMENT') return <button onClick={() => handleOpenModal('DEPOSIT')} className="cyber-button-primary py-2.5 rounded-lg text-xs font-bold font-tech uppercase animate-pulse-glow bg-amber-600 hover:bg-amber-500 border-amber-500 animate-pop-in">Submit Payment Proof</button>;
      if (pendingDeposit.depositStage === 'PAYMENT_SUBMITTED') return <div className="py-2.5 rounded-lg text-xs font-bold font-tech uppercase bg-cyan-900/20 text-cyan-500 border border-cyan-500/30 text-center flex items-center justify-center gap-2 animate-pop-in"><ShieldCheck size={14}/> Verifying Payment...</div>;
      return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in">
         <h1 className="text-3xl font-bold text-white tracking-tight font-tech drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">ASSET MANAGEMENT</h1>
         {user.walletLocked && (
             <div className="bg-amber-900/20 text-amber-500 border border-amber-500/30 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold font-tech animate-pulse">
                 <Lock size={16}/> WALLET LOCKED BY ADMIN
             </div>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Secure Chip Asset Card */}
        <div className="md:col-span-1 widget-card rounded-2xl overflow-hidden group animate-scale-in transition-all duration-300 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-emerald-500/20 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:border-emerald-500/50">
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-black z-0"></div>
           <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-amber-500/10 rounded-full blur-3xl"></div>
           <div className="absolute top-4 right-4 z-10"><Cpu className="text-emerald-500/50 w-12 h-12" strokeWidth={1}/></div>
           <div className="relative z-10 p-6 flex flex-col h-full justify-between">
               <div>
                   <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold font-tech flex items-center gap-2">
                       <ShieldCheck size={12} /> SECURE VAULT
                   </p>
                   {/* Enhanced Balance Display with Pop-in Animation */}
                   <p className={`text-4xl font-light font-tech tracking-tighter mt-2 flex items-center gap-2 transition-all duration-500 ease-out origin-left ${balanceHighlight ? 'text-lime-300 drop-shadow-[0_0_25px_rgba(132,204,22,1)]' : 'text-white drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]'}`}>
                      <CurrencyIcon size={32} className="text-lime-500" />
                      <span key={user.balance} className="animate-pop-in inline-block">
                        {user.balance.toLocaleString()}
                      </span>
                      <span className="text-sm text-emerald-400">OTF</span>
                   </p>
                   <p className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-1">
                      <Banknote size={12}/> 1 OTF = {OTF_VALUE_ETB} ETB
                   </p>
                   <p className={`text-sm mt-1 font-mono font-bold transition-all duration-300 ${balanceHighlight ? 'text-lime-300 scale-105 origin-left' : 'text-emerald-300'}`}>
                      ≈ {(user.balance * OTF_VALUE_ETB).toLocaleString()} ETB
                   </p>
               </div>
               <div className="grid grid-cols-2 gap-3 mt-10">
                  {renderDepositAction()}
                  <button onClick={() => handleOpenModal('WITHDRAWAL')} disabled={!!user.walletLocked} className="cyber-button py-2.5 rounded-lg text-xs font-bold font-tech uppercase hover:text-red-400 border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">Withdraw</button>
                  <button onClick={() => handleOpenModal('P2P')} disabled={!!user.walletLocked} className="col-span-2 py-2.5 bg-slate-900/50 hover:bg-cyan-900/20 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-xs font-bold font-tech uppercase flex items-center justify-center gap-2 transition-all text-cyan-400 shadow-inner disabled:opacity-50 disabled:cursor-not-allowed">
                      <ArrowRightLeft size={14} /> P2P Transfer / Trade
                  </button>
               </div>
           </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
           {/* Inflow - Green */}
           <div className="widget-card p-6 rounded-2xl flex flex-col justify-center animate-fade-in-up delay-100 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] border border-emerald-500/10">
              <p className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-wide font-tech">TOTAL INFLOW</p>
              <p className="text-3xl font-bold text-emerald-400 font-tech">
                {userTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
              </p>
           </div>
           {/* Outflow - Red */}
           <div className="widget-card p-6 rounded-2xl flex flex-col justify-center animate-fade-in-up delay-200 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] border border-red-500/10">
              <p className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-wide font-tech">TOTAL OUTFLOW</p>
              <p className="text-3xl font-bold text-red-400 font-tech">
                {Math.abs(userTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0)).toLocaleString()} 
              </p>
           </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showModal === 'P2P' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="widget-card rounded-2xl w-full max-w-sm animate-scale-in shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none"></div>
             <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-950/50 rounded-t-2xl relative z-10">
                <h3 className="font-bold text-white font-tech flex items-center gap-2">
                    <ArrowRightLeft size={18} className="text-cyan-400"/>
                    P2P TRADING
                </h3>
                <button onClick={closeModal} className="text-slate-500 hover:text-white"><X size={20} /></button>
             </div>
             
             <>
              {step === 1 ? (
                <form onSubmit={handleNextStep} className="p-6 space-y-5 relative z-10 animate-fade-in">
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                         <button type="button" onClick={() => setP2PMode('BUY')} className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${p2pMode === 'BUY' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`}>BUY</button>
                         <button type="button" onClick={() => setP2PMode('SELL')} className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${p2pMode === 'SELL' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-white'}`}>SELL</button>
                    </div>
                    
                    <div className="space-y-1.5 relative">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Target Username</label>
                        <input required className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none placeholder-slate-700" value={p2pForm.targetUsername} onChange={e => setP2PForm({...p2pForm, targetUsername: e.target.value})} placeholder="username" />
                        {p2pTargetUser && (
                            <div className="absolute top-full left-0 mt-1 flex items-center gap-2 text-xs font-bold bg-slate-900/80 px-2 py-1 rounded border border-slate-800 animate-fade-in">
                                <CheckCircle2 size={12} className="text-emerald-400"/> 
                                <span className="text-slate-300">Verified: </span>
                                <span className="text-emerald-400 uppercase">{p2pTargetUser.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5 pt-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">Amount (OTF <CurrencyIcon size={12}/>)</label>
                        <input required type="number" className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none placeholder-slate-700 font-tech" value={p2pForm.amount} onChange={e => setP2PForm({...p2pForm, amount: e.target.value})} placeholder="0.00" />
                    </div>

                    {p2pMode === 'BUY' && (
                       <div className="space-y-1.5 animate-slide-in-right">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Payment Reference ID</label>
                           <input required className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none placeholder-slate-700 font-mono border-l-2 border-l-lime-500" value={p2pForm.ftNumber} onChange={e => setP2PForm({...p2pForm, ftNumber: e.target.value})} placeholder="e.g. TXN123456" />
                       </div>
                    )}

                    {p2pForm.amount && !isNaN(Number(p2pForm.amount)) && Number(p2pForm.amount) > 0 && (
                        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 animate-fade-in-up shadow-inner">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Subtotal</span>
                                <span className="font-tech flex items-center gap-1"><CurrencyIcon size={10} /> {Number(p2pForm.amount).toFixed(2)} OTF</span>
                            </div>
                            <div className="flex justify-between text-xs text-amber-500">
                                <span>Network Fee ({systemSettings.p2pFeePercent}%)</span>
                                <span className="font-tech">+{(Number(p2pForm.amount) * systemSettings.p2pFeePercent/100).toFixed(2)} OTF</span>
                            </div>
                            <div className="h-px bg-slate-800 my-1"></div>
                            <div className="flex justify-between text-sm font-bold text-white items-center">
                                <span>Total Estimated</span>
                                <span className="font-tech text-cyan-400 text-lg drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{(Number(p2pForm.amount) * (1 + systemSettings.p2pFeePercent/100)).toFixed(2)} OTF</span>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-red-400 text-xs font-bold flex items-center gap-1 bg-red-950/20 p-2 rounded border border-red-900/50 animate-bounce shadow-[0_0_10px_rgba(239,68,68,0.2)]"><AlertTriangle size={12}/> {error}</p>}
                    <button type="submit" className="w-full py-3 cyber-button-primary rounded-lg font-bold text-xs uppercase tracking-widest">Proceed to Confirmation</button>
                 </form>
           ) : (
             <div className="p-6 space-y-5 animate-fade-in relative z-10">
                <div className="bg-gradient-to-b from-slate-900 to-black p-5 rounded-xl border border-slate-700 shadow-inner space-y-4 relative overflow-hidden animate-scale-in">
                   <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-lime-500"></div>
                   <div className="text-center pb-2 border-b border-slate-800 border-dashed">
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Transaction Summary</p>
                      <h3 className="text-2xl font-bold text-white mt-1 font-tech">{(Number(p2pForm.amount) * (1 + systemSettings.p2pFeePercent/100)).toFixed(2)} OTF</h3>
                      <p className="text-emerald-400 text-xs font-mono mt-1">≈ {(Number(p2pForm.amount) * (1 + systemSettings.p2pFeePercent/100) * OTF_VALUE_ETB).toFixed(2)} ETB</p>
                   </div>
                   <div className="space-y-2 text-sm">
                       <div className="flex justify-between"><span className="text-slate-500">Action</span><span className="font-bold text-white uppercase bg-slate-800 px-2 py-0.5 rounded text-xs">P2P {p2pMode}</span></div>
                       <div className="flex justify-between items-center"><span className="text-slate-500">{p2pMode === 'BUY' ? 'Buying From' : 'Selling To'}</span>
                           <div className="text-right">
                               <span className="block font-bold text-cyan-400">@{p2pForm.targetUsername}</span>
                               {p2pTargetUser && <span className="block text-[10px] text-slate-400 uppercase">{p2pTargetUser.name}</span>}
                           </div>
                       </div>
                       <div className="h-px bg-slate-800/50 my-1"></div>
                       <div className="flex justify-between"><span className="text-slate-500">Base Amount</span><span className="font-bold text-slate-300 font-tech">{Number(p2pForm.amount).toFixed(2)}</span></div>
                       <div className="flex justify-between"><span className="text-slate-500">Processing Fee</span><span className="font-bold text-amber-500 font-tech">{(Number(p2pForm.amount) * systemSettings.p2pFeePercent/100).toFixed(2)}</span></div>
                       {p2pMode === 'BUY' && (
                           <div className="flex justify-between items-center"><span className="text-slate-500">Reference ID</span><span className="font-mono text-xs text-white bg-slate-800 px-1 rounded">{p2pForm.ftNumber}</span></div>
                       )}
                   </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800/50 hover:border-lime-500/30 transition-colors cursor-pointer" onClick={() => setConfirmCheck(!confirmCheck)}>
                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${confirmCheck ? 'bg-lime-600 border-lime-500' : 'border-slate-600 bg-slate-900'}`}>
                        {confirmCheck && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight select-none">I verify that the transaction details above are correct and irreversible.</p>
                </div>

                <button disabled={!confirmCheck} onClick={handleConfirmTransaction} className={`w-full py-3.5 font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 font-tech uppercase tracking-wide transition-all duration-300 ${confirmCheck ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                   <ShieldCheck size={18} /> CONFIRM TRADE
                </button>
                <button onClick={() => setStep(1)} className="w-full py-3 text-slate-500 font-bold hover:text-white transition-colors text-xs uppercase tracking-wider">Cancel & Edit</button>
             </div>
           )}
           </>
         </div>
      </div>
      )}
      
      {/* Other modals (Deposit/Withdrawal) logic... */}
      {showModal && showModal !== 'P2P' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
             <div className="widget-card rounded-2xl w-full max-w-sm animate-scale-in shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                 <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-950/50 rounded-t-2xl relative z-10">
                    <h3 className="font-bold text-white font-tech flex items-center gap-2">
                        {showModal === 'DEPOSIT' && 'DEPOSIT PROTOCOL'}
                        {showModal === 'WITHDRAWAL' && 'WITHDRAWAL REQUEST'}
                    </h3>
                    <button onClick={closeModal} className="text-slate-500 hover:text-white"><X size={20}/></button>
                 </div>
                 
                 {/* Deposit Stage 2: Payment Wait / Proof Upload */}
                 {showModal === 'DEPOSIT' && pendingDeposit && pendingDeposit.depositStage === 'WAITING_PAYMENT' ? (
                     <div className="p-6 space-y-5 relative z-10 animate-fade-in">
                          <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl text-xs text-amber-200 leading-relaxed">
                              <p className="font-bold mb-2 flex items-center gap-2"><Info size={14}/> ADMIN APPROVED</p>
                              Please transfer exactly <span className="text-white font-bold">{(pendingDeposit.amount * OTF_VALUE_ETB).toFixed(2)} ETB</span> to the company account below.
                          </div>

                          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
                              <p className="text-[10px] text-slate-500 uppercase font-bold">Bank Name</p>
                              <p className="font-tech text-white">{COMPANY_BANK_DETAILS.bankName}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-bold mt-2">Account Number</p>
                              <p className="font-mono text-xl text-cyan-400 tracking-wider">{COMPANY_BANK_DETAILS.accountNumber}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-bold mt-2">Account Name</p>
                              <p className="font-tech text-white">{COMPANY_BANK_DETAILS.accountName}</p>
                          </div>

                          <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Enter FT / Transaction Number</label>
                              <input className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none font-mono" value={formData.ftNumber} onChange={e => setFormData({...formData, ftNumber: e.target.value})} placeholder="e.g. FT123456789" />
                          </div>
                          
                          <div className="space-y-1.5">
                               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Upload Receipt Proof</label>
                               <div className="border border-dashed border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center bg-slate-900/50 cursor-pointer hover:bg-slate-800/50 relative transition-colors">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*,.pdf"/>
                                    <Upload size={20} className="text-slate-500 mb-2"/>
                                    <span className="text-xs text-slate-400">{proofFile ? proofFile.name : "Click to Upload Receipt (Image/PDF)"}</span>
                               </div>
                          </div>
                          
                          {error && <p className="text-red-400 text-xs font-bold bg-red-950/20 p-2 rounded border border-red-900/50 animate-bounce">{error}</p>}

                          <button onClick={() => handleSubmitProof(pendingDeposit.id)} disabled={processing} className="w-full py-3 cyber-button-primary rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                              {processing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} SUBMIT VERIFICATION
                          </button>
                     </div>
                 ) : (
                    <>
                    {step === 1 ? (
                        <form onSubmit={handleNextStep} className="p-6 space-y-5 relative z-10">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">Amount (OTF)</label>
                                <input required type="number" className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none placeholder-slate-700 font-tech" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
                                {isDeposit && numAmount > 0 && (
                                    <p className="text-[10px] text-emerald-400 font-mono text-right animate-fade-in">
                                        ≈ {etbValue.toFixed(2)} ETB
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Payment Method</label>
                                <div className="relative">
                                    <select className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none appearance-none" value={formData.method} onChange={(e) => setFormData({...formData, method: e.target.value})}>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Mobile Money">Mobile Money</option>
                                        <option value="Cash Deposit">Cash Deposit</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                                </div>
                            </div>
                            {showModal === 'WITHDRAWAL' && (
                                <div className="space-y-3 animate-slide-in-right">
                                    <input required className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} placeholder="Bank Name" />
                                    <input required className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none font-mono" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} placeholder="Account No" />
                                    <input required className="w-full px-4 py-3 rounded-lg tech-input text-sm outline-none" value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} placeholder="Full Name" />
                                </div>
                            )}
                            {numAmount > 0 && (
                                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3 animate-fade-in-up shadow-inner">
                                    {isDeposit ? (
                                        <div><span className="text-[10px] text-slate-400 uppercase font-bold">You Must Transfer:</span><p className="text-3xl font-bold text-yellow-400 font-tech tracking-tight drop-shadow-md">{etbValue.toFixed(2)} ETB</p></div>
                                    ) : (
                                        <div className="flex justify-between text-sm font-bold text-white items-center"><span>Total Deducted</span><span className="font-tech text-red-400 text-lg">{totalAmount.toFixed(2)} OTF</span></div>
                                    )}
                                </div>
                            )}
                            <button type="submit" className="w-full py-3 cyber-button-primary rounded-lg font-bold text-xs uppercase tracking-widest">Proceed to Review</button>
                        </form>
                    ) : (
                        <div className="p-6 space-y-5 animate-fade-in relative z-10">
                            <div className="bg-gradient-to-b from-slate-900 to-black p-5 rounded-xl border border-slate-700 shadow-inner space-y-4 text-center">
                                <h3 className="text-2xl font-bold text-white mt-1 font-tech">{isDeposit ? etbValue.toFixed(2) + ' ETB' : totalAmount.toFixed(2) + ' OTF'}</h3>
                                <p className="text-slate-400 text-xs font-mono mt-1">{isDeposit ? 'Total Payable' : 'Total Deduction'}</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800/50 hover:border-lime-500/30 transition-colors cursor-pointer" onClick={() => setConfirmCheck(!confirmCheck)}>
                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${confirmCheck ? 'bg-lime-600 border-lime-500' : 'border-slate-600 bg-slate-900'}`}>{confirmCheck && <CheckCircle2 size={12} className="text-white" />}</div>
                                <p className="text-[10px] text-slate-400 leading-tight select-none">I confirm the details above are accurate.</p>
                            </div>
                            <button disabled={!confirmCheck || processing} onClick={handleConfirmTransaction} className={`w-full py-3.5 font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 font-tech uppercase tracking-wide transition-all duration-300 ${confirmCheck ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>{processing ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} {isDeposit ? 'SUBMIT REQUEST' : 'CONFIRM WITHDRAWAL'}</button>
                            <button onClick={() => setStep(1)} className="w-full py-2 text-slate-500 font-bold hover:text-white transition-colors text-xs uppercase tracking-wider">Back to Edit</button>
                        </div>
                    )}
                    </>
                 )}
             </div>
         </div>
      )}
    </div>
  );
};
