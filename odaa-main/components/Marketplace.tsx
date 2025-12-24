
import React, { useState, useEffect, useMemo } from 'react';
import { User, MarketOrder, SystemSettings, ActiveTrade, ViewState } from '../types';
import { 
  ShoppingBag, PlusCircle, AlertTriangle, ShieldCheck, 
  CheckCircle2, X, Clock, Star, History, Zap, Sparkles, 
  Loader2, ChevronRight, Building2, Globe, Hash, Fingerprint, 
  Info, Shield, TrendingUp, CreditCard, Send, ArrowRight,
  ShieldAlert, Repeat, Landmark, Tag, Coins, Smartphone, User as UserIcon, Filter, Scale
} from 'lucide-react';
import { CurrencyIcon } from './CurrencyIcon';
import { OTF_VALUE_ETB } from '../constants';
import { VerificationBadge } from './VerificationBadge';

const TradeCountdown: React.FC<{ targetDate: number }> = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState<string>('00:00');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            const now = Date.now();
            const diff = targetDate - now;
            if (diff <= 0) {
                setTimeLeft('00:00');
                setIsExpired(true);
            } else {
                const m = Math.floor(diff / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${m}:${s < 10 ? '0' : ''}${s}`);
                setIsExpired(false);
            }
        };
        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    if (isExpired) return <span className="text-red-500 font-black font-tech italic text-[10px] uppercase tracking-widest">Expired</span>;

    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full shrink-0">
            <Clock size={10} className="text-amber-500 animate-pulse" />
            <span className="text-amber-500 font-mono font-black text-[10px]">{timeLeft}</span>
        </div>
    );
};

interface MarketplaceProps {
  currentUser: User;
  allUsers?: User[];
  systemSettings: SystemSettings;
  marketOrders: MarketOrder[];
  activeTrades: ActiveTrade[];
  onPlaceOrder: (order: MarketOrder) => void;
  onInitiateTrade: (trade: ActiveTrade, orderId: string) => void;
  onTradeAction: (tradeId: string, action: 'PAYMENT' | 'RELEASE' | 'CANCEL', payload?: any) => void;
  isFTUsed?: (ft: string) => boolean;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ 
    currentUser, allUsers, systemSettings, 
    marketOrders, activeTrades, 
    onPlaceOrder, onInitiateTrade, onTradeAction,
    isFTUsed
}) => {
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL' | 'MY_TRADES'>('BUY');
  
  const [sellAmount, setSellAmount] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [minQty, setMinQty] = useState('');
  const [settlementType, setSettlementType] = useState<'BANK' | 'CRYPTO'>('BANK');
  
  const [sellBankName, setSellBankName] = useState(currentUser.bankName || '');
  const [sellAccountNumber, setSellAccountNumber] = useState(currentUser.accountNumber || '');
  const [sellAccountHolder, setSellAccountHolder] = useState(currentUser.accountName || currentUser.name || '');
  
  const [sellCryptoExchange, setSellCryptoExchange] = useState(currentUser.cryptoExchangeName || 'Binance');
  const [sellCryptoAddress, setSellCryptoAddress] = useState(currentUser.cryptoWalletAddress || '');
  const [sellCryptoNetwork, setSellCryptoNetwork] = useState(currentUser.cryptoNetwork || 'BEP20');
  
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState('');

  const [tradeModal, setTradeModal] = useState<ActiveTrade | null>(null);
  const [buyQty, setBuyQty] = useState('');
  const [tradeError, setTradeError] = useState(''); 
  const [selectedOrder, setSelectedOrder] = useState<MarketOrder | null>(null);
  const [ftInput, setFtInput] = useState('');

  const handlePostSellOrder = (e: React.FormEvent) => {
      e.preventDefault();
      setPostError('');
      setIsPosting(true);
      const amount = Number(sellAmount);
      const price = Number(sellPrice);
      const minimum = Number(minQty) || 0;
      
      if (amount < (systemSettings.minOTFSell || 10)) { setPostError(`Min: ${systemSettings.minOTFSell || 10} OTF`); setIsPosting(false); return; }
      if (amount > (systemSettings.maxOTFSell || 10000)) { setPostError(`Max Sell Limit: ${systemSettings.maxOTFSell || 10000} OTF`); setIsPosting(false); return; }
      
      // Unit Rate Validation
      if (price < (systemSettings.minOTFRateETB || 0.5)) { setPostError(`Min Rate: ${systemSettings.minOTFRateETB || 0.5} ETB`); setIsPosting(false); return; }
      if (price > (systemSettings.maxOTFRateETB || 100)) { setPostError(`Max Rate: ${systemSettings.maxOTFRateETB || 100} ETB`); setIsPosting(false); return; }
      
      if (minimum > amount) { setPostError(`Min limit per buyer cannot exceed total volume.`); setIsPosting(false); return; }

      let bankDetails = '';
      if (settlementType === 'BANK') {
          if (!sellBankName || !sellAccountNumber) { setPostError('Complete registry required.'); setIsPosting(false); return; }
          bankDetails = `[BANK] ${sellBankName} | Acc: ${sellAccountNumber} | Holder: ${sellAccountHolder}`;
      } else {
          if (!sellCryptoAddress) { setPostError('Hash required.'); setIsPosting(false); return; }
          bankDetails = `[CRYPTO] ${sellCryptoExchange} (${sellCryptoNetwork}) | Hash: ${sellCryptoAddress}`;
      }
      
      onPlaceOrder({ id: `ord-${Date.now()}`, userId: currentUser.id, username: currentUser.username, type: 'SELL', amountOTF: amount, priceETB: price, minQuantity: minimum, bankDetails });
      setSellAmount(''); setSellPrice(''); setMinQty(''); setActiveTab('MY_TRADES'); setIsPosting(false);
  };

  const handleInitiateTrade = () => {
      if (!selectedOrder) return;
      setTradeError(''); 
      const qty = Number(buyQty);
      
      // Determine effective minimum (System min vs Seller min)
      const effectiveMin = Math.max(systemSettings.minOTFBuy || 10, selectedOrder.minQuantity || 0);

      if (qty < effectiveMin) { setTradeError(`Minimum purchase allowed is ${effectiveMin} OTF.`); return; }
      if (qty > (systemSettings.maxOTFBuy || 10000)) { setTradeError(`Max purchase limit is ${systemSettings.maxOTFBuy || 10000} OTF.`); return; }
      if (qty > selectedOrder.amountOTF) { setTradeError(`Order limit: ${selectedOrder.amountOTF} OTF.`); return; }

      const seller = allUsers?.find(u => u.id === selectedOrder.userId);
      const newTrade: ActiveTrade = {
          id: `trd-${Date.now()}`, buyerId: currentUser.id, sellerId: selectedOrder.userId,
          buyerName: currentUser.username, sellerName: seller?.username || 'Node',
          amountOTF: qty, priceETB: selectedOrder.priceETB, totalCostETB: qty * selectedOrder.priceETB,
          status: 'WAITING_PAYMENT', expiresAt: Date.now() + 600000,
          sellerBankDetails: selectedOrder.bankDetails, ftNumber: '', createdAt: new Date().toISOString()
      };
      onInitiateTrade(newTrade, selectedOrder.id);
      setTradeModal(newTrade);
      setSelectedOrder(null);
  };

  const handleConfirmPayment = () => {
      if (!tradeModal || !ftInput) return;
      if (isFTUsed && isFTUsed(ftInput)) { setTradeError("FT already used."); return; }
      onTradeAction(tradeModal.id, 'PAYMENT', ftInput);
      setFtInput('');
  };

  // Sort trades: Active first, then by date
  const myTrades = activeTrades
    .filter(t => t.buyerId === currentUser.id || t.sellerId === currentUser.id)
    .sort((a, b) => {
        const aActive = a.status !== 'COMPLETED' && a.status !== 'CANCELLED';
        const bActive = b.status !== 'COMPLETED' && b.status !== 'CANCELLED';
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-12 pb-20 animate-fade-in max-w-6xl mx-auto">
       <div className="flex flex-col md:flex-row justify-between items-end gap-8 px-4">
           <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter font-tech uppercase leading-none">P2P <span className="text-brand-lime">Marketplace</span></h1>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-max">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-glow-lime"></div>
                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest font-mono">Market Active</span>
                </div>
           </div>
           
           <div className="flex flex-wrap bg-slate-900/60 p-2 rounded-3xl border border-white/5 backdrop-blur-3xl shadow-huge">
               {[
                   { id: 'BUY', label: 'Buy', icon: ShoppingBag },
                   { id: 'SELL', label: 'Sell', icon: PlusCircle },
                   { id: 'MY_TRADES', label: 'My Trades', icon: History, count: myTrades.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length }
               ].map(tab => (
                   <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all flex items-center gap-3 uppercase tracking-[0.2em] font-tech ${activeTab === tab.id ? 'bg-brand-lime text-black shadow-glow-lime' : `text-slate-500 hover:text-white`}`}>
                       <tab.icon size={14} /> <span>{tab.label}</span>
                       {tab.count ? <span className="px-2 py-0.5 rounded-lg bg-black/40 text-white text-[9px] ml-1">{tab.count}</span> : null}
                   </button>
               ))}
           </div>
       </div>

       {activeTab === 'SELL' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
               <div className="widget-card-2025 p-12 rounded-[3.5rem] relative border-brand-lime/20 shadow-premium overflow-hidden">
                   <div className="flex items-center gap-6 mb-12 relative z-10">
                       <div className="p-4 bg-brand-lime/10 rounded-2xl border border-brand-lime/20 text-brand-lime shrink-0"><PlusCircle size={32} /></div>
                       <div><h2 className="text-3xl font-black text-white font-tech uppercase tracking-tighter">Create Sell Order</h2></div>
                   </div>

                   <form onSubmit={handlePostSellOrder} className="space-y-10 relative z-10">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-5">Volume (OTF)</label>
                                <div className="relative group">
                                    <Coins className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={20} />
                                    <input required type="number" className="tech-input-new pl-14 !py-4 font-bold" placeholder={`Amount`} value={sellAmount} onChange={e => setSellAmount(e.target.value)} />
                                </div>
                                <p className="pl-5 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                    Min Sell Limit: {systemSettings.minOTFSell || 10} OTF | Max: {systemSettings.maxOTFSell || 10000} OTF
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-5">Min. Buyer Limit (OTF)</label>
                                <div className="relative group">
                                    <Scale className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={20} />
                                    <input type="number" className="tech-input-new pl-14 !py-4 font-bold" placeholder="Optional Min Qty" value={minQty} onChange={e => setMinQty(e.target.value)} />
                                </div>
                                <p className="pl-5 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                    Buyers cannot purchase less than this amount.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-5">Unit Rate (ETB)</label>
                                <div className="relative group">
                                    <TrendingUp className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={20} />
                                    <input required type="number" step="0.01" className="tech-input-new pl-14 !py-4 font-bold" value={sellPrice} onChange={e => setSellPrice(e.target.value)} />
                                </div>
                                <p className="pl-5 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                    Allowed Range: {systemSettings.minOTFRateETB || 0.5} - {systemSettings.maxOTFRateETB || 100} ETB
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 bg-black/40 p-8 rounded-[3rem] border border-white/5 shadow-inner">
                            <div className="flex bg-slate-900 p-1 rounded-2xl mb-4">
                                <button type="button" onClick={() => setSettlementType('BANK')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settlementType === 'BANK' ? 'bg-brand-lime text-black' : 'text-slate-500'}`}>Local Bank</button>
                                <button type="button" onClick={() => setSettlementType('CRYPTO')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settlementType === 'CRYPTO' ? 'bg-brand-lime text-black' : 'text-slate-500'}`}>Crypto</button>
                            </div>
                            {settlementType === 'BANK' ? (
                                <div className="space-y-4 animate-slide-in-right">
                                    <div className="relative group"><Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-lime/30" size={18}/><input required className="tech-input-new pl-14 !py-3 !text-xs" placeholder="Bank Name" value={sellBankName} onChange={e => setSellBankName(e.target.value)} /></div>
                                    <div className="relative group"><Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-lime/30" size={18}/><input required className="tech-input-new pl-14 !py-3 !text-xs font-mono" placeholder="Account Number" value={sellAccountNumber} onChange={e => setSellAccountNumber(e.target.value)} /></div>
                                    <div className="relative group"><UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-lime/30" size={18}/><input required className="tech-input-new pl-14 !py-3 !text-xs" placeholder="Account Holder Name" value={sellAccountHolder} onChange={e => setSellAccountHolder(e.target.value)} /></div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-slide-in-right">
                                    <div className="relative group"><Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-lime/30" size={18}/><select className="tech-input-new pl-14 !py-3 !text-xs appearance-none" value={sellCryptoExchange} onChange={e => setSellCryptoExchange(e.target.value)}><option value="Binance">Binance</option><option value="Bybit">Bybit</option></select></div>
                                    <div className="relative group"><Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-lime/30" size={18}/><input required className="tech-input-new pl-14 !py-3 !text-xs font-mono" placeholder="Wallet Address" value={sellCryptoAddress} onChange={e => setSellCryptoAddress(e.target.value)} /></div>
                                </div>
                            )}
                        </div>
                       
                       {postError && <p className="text-red-400 text-xs font-bold bg-red-950/20 p-2 rounded border border-red-900/50 animate-bounce text-center">{postError}</p>}
                       
                       <button disabled={isPosting} className="w-full py-6 primary-gradient-new">Post Order</button>
                   </form>
               </div>

               {/* PREVIEW CARD */}
               <div className="space-y-6">
                   <h3 className="text-xl font-black text-white font-tech uppercase tracking-tighter">Preview: Buyer's View</h3>
                   <div className="widget-card-2025 p-8 rounded-[3rem] border-brand-lime/20 flex flex-col justify-between h-[420px] shadow-lg relative opacity-90 hover:opacity-100 transition-opacity">
                        <div className="absolute top-4 right-6 bg-brand-lime/20 text-brand-lime px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-brand-lime/30">Preview Mode</div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-brand-lime/10 rounded-xl border border-brand-lime/20 text-brand-lime"><ShoppingBag size={24}/></div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-0.5 mb-1">{[1,2,3,4,5].map(i => <Star key={i} size={8} className="text-brand-lime fill-current"/>)}</div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">Verified</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-4xl font-black text-white font-tech leading-none">{sellAmount || '0'} <span className="text-xs font-normal opacity-50 uppercase tracking-widest ml-2">OTF</span></h4>
                                <div className="flex items-center gap-2 mt-4"><p className="text-[10px] text-slate-500 font-mono tracking-widest font-black uppercase">@{currentUser.username}</p></div>
                            </div>
                            <div className="p-5 bg-slate-900/50 rounded-2xl border border-white/5 space-y-2">
                                <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Rate</span><span className="text-lg font-black text-white font-mono">{sellPrice || '0.00'} ETB</span></div>
                                {Number(minQty) > 0 && (
                                    <div className="flex justify-between items-center"><span className="text-[9px] text-amber-500 uppercase font-black tracking-widest">Min Buy</span><span className="text-sm font-black text-amber-500 font-mono">{minQty} OTF</span></div>
                                )}
                            </div>
                        </div>
                        <button disabled className="w-full py-4 bg-slate-900 text-slate-500 rounded-2xl text-[10px] font-black uppercase border border-brand-lime/10 cursor-not-allowed">Buy Now</button>
                   </div>
                   <p className="text-center text-xs text-slate-500 font-mono uppercase tracking-widest">This is how your order appears in the marketplace.</p>
               </div>
           </div>
       )}

       {activeTab === 'BUY' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
               {marketOrders.filter(o => o.type === 'SELL' && o.userId !== currentUser.id).map(order => (
                   <div key={order.id} className="widget-card-2025 p-8 rounded-[3rem] group hover:border-brand-lime transition-all flex flex-col justify-between h-[420px] shadow-premium">
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-brand-lime/10 rounded-xl border border-brand-lime/20 text-brand-lime"><ShoppingBag size={24}/></div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-0.5 mb-1">{[1,2,3,4,5].map(i => <Star key={i} size={8} className="text-brand-lime fill-current"/>)}</div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">Verified</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-4xl font-black text-white font-tech leading-none">{order.amountOTF.toLocaleString()} <span className="text-xs font-normal opacity-50 uppercase tracking-widest ml-2">OTF</span></h4>
                                <div className="flex items-center gap-2 mt-4"><p className="text-[10px] text-slate-500 font-mono tracking-widest font-black uppercase">@{order.username}</p></div>
                            </div>
                            <div className="p-5 bg-slate-900/50 rounded-2xl border border-white/5 space-y-2">
                                <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Rate</span><span className="text-lg font-black text-white font-mono">{order.priceETB} ETB</span></div>
                                {order.minQuantity > 0 && (
                                    <div className="flex justify-between items-center"><span className="text-[9px] text-amber-500 uppercase font-black tracking-widest">Min Buy</span><span className="text-sm font-black text-amber-500 font-mono">{order.minQuantity} OTF</span></div>
                                )}
                            </div>
                        </div>
                        <button onClick={() => { setSelectedOrder(order); setBuyQty(String(order.amountOTF)); }} className="w-full py-4 bg-slate-900 hover:bg-brand-lime hover:text-black rounded-2xl text-[10px] font-black uppercase transition-all border border-brand-lime/20">Buy Now</button>
                   </div>
               ))}
           </div>
       )}

       {activeTab === 'MY_TRADES' && (
           <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto px-4">
                {myTrades.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/30 rounded-[3rem] border border-white/5">
                        <History size={48} className="mx-auto text-slate-700 mb-4"/>
                        <p className="text-slate-500 font-tech uppercase tracking-widest text-xs">No active trades.</p>
                    </div>
                ) : (
                    myTrades.map(trade => {
                        const isBuyer = trade.buyerId === currentUser.id;
                        return (
                            <div key={trade.id} className={`p-8 rounded-[3rem] bg-slate-900/50 border flex flex-col md:flex-row justify-between items-center gap-8 group transition-all relative overflow-hidden ${trade.status === 'WAITING_PAYMENT' ? 'border-amber-500/30' : trade.status === 'COMPLETED' ? 'border-emerald-500/30' : 'border-white/5'}`}>
                                <div className={`absolute top-0 left-0 w-2 h-full ${isBuyer ? 'bg-cyan-500' : 'bg-brand-lime'}`}></div>
                                
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className={`p-4 rounded-2xl border shrink-0 ${isBuyer ? 'bg-cyan-900/20 text-cyan-400 border-cyan-500/30' : 'bg-brand-lime/10 text-brand-lime border-brand-lime/30'}`}>
                                        {isBuyer ? <ShoppingBag size={24}/> : <Coins size={24}/>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-white text-2xl font-tech tracking-tight">{trade.amountOTF} OTF</span>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-lg border uppercase font-black tracking-wider ${isBuyer ? 'border-cyan-500/30 text-cyan-400 bg-cyan-950/30' : 'border-brand-lime/30 text-brand-lime bg-brand-lime/10'}`}>
                                                {isBuyer ? 'BUYING' : 'SELLING'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-mono mt-1 font-bold uppercase tracking-widest">
                                            {isBuyer ? `Seller: @${trade.sellerName}` : `Buyer: @${trade.buyerName}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto justify-end">
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Status</p>
                                        <div className="flex items-center gap-3">
                                            {trade.status !== 'COMPLETED' && trade.status !== 'CANCELLED' && <TradeCountdown targetDate={trade.expiresAt} />}
                                            <p className={`text-xs font-black font-mono px-3 py-1 rounded-full border ${trade.status === 'COMPLETED' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30' : trade.status === 'WAITING_PAYMENT' ? 'text-amber-400 border-amber-500/30 bg-amber-950/30' : 'text-slate-400 border-slate-700'}`}>
                                                {trade.status.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setTradeModal(trade)} className="w-full md:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 hover:border-white/20 shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                        <Repeat size={14} /> Open
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
           </div>
       )}

       {selectedOrder && (
           <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-fade-in">
               <div className="widget-card-2025 p-12 rounded-[4rem] w-full max-w-lg border border-brand-lime/20 space-y-8 animate-scale-in relative bg-slate-950 shadow-huge">
                   <div className="flex justify-between items-start">
                       <div className="flex items-center gap-4"><div className="p-3 bg-brand-lime/10 rounded-xl text-brand-lime border border-brand-lime/20"><ShoppingBag size={24}/></div><h3 className="font-black text-white text-xl uppercase tracking-tighter">Purchase magnitude</h3></div>
                       <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-500 hover:text-white"><X size={24}/></button>
                   </div>
                   <div className="space-y-6">
                        <div className="bg-black/60 p-6 rounded-3xl border border-white/5 space-y-4">
                             <div className="flex justify-between items-center"><span className="text-[10px] text-slate-500 uppercase tracking-widest">Rate</span><span className="text-white font-mono font-bold text-lg">{selectedOrder.priceETB} ETB</span></div>
                             <div className="flex justify-between items-center"><span className="text-[10px] text-slate-500 uppercase tracking-widest">Available</span><span className="text-brand-lime font-mono font-bold text-lg">{selectedOrder.amountOTF} OTF</span></div>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest pl-6">Amount to buy (OTF)</label>
                             <div className="relative group">
                                <Zap className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30" size={20}/>
                                <input type="number" className="tech-input-new pl-16 !py-5 font-black text-xl text-center" value={buyQty} onChange={e => setBuyQty(e.target.value)} />
                             </div>
                             <div className="pl-6 text-[9px] text-slate-500 font-bold uppercase tracking-widest flex justify-between">
                                 <span className={Number(buyQty) < Math.max(systemSettings.minOTFBuy || 10, selectedOrder.minQuantity || 0) ? "text-amber-500" : ""}>
                                     Min: {Math.max(systemSettings.minOTFBuy || 10, selectedOrder.minQuantity || 0)} OTF
                                 </span>
                                 <span>Max Buy Limit: {systemSettings.maxOTFBuy || 10000} OTF</span>
                             </div>
                        </div>
                        
                        {tradeError && <p className="text-red-400 text-xs font-bold bg-red-950/20 p-2 rounded border border-red-900/50 animate-bounce text-center">{tradeError}</p>}

                        <div className="p-6 bg-brand-lime/5 rounded-3xl border border-brand-lime/10 flex justify-between items-center">
                             <span className="text-[10px] text-brand-lime font-black uppercase tracking-widest">Total Payable</span>
                             <span className="text-2xl font-black text-white font-mono">{(Number(buyQty) * selectedOrder.priceETB).toLocaleString()} <span className="text-[10px] font-normal text-slate-500">ETB</span></span>
                        </div>
                   </div>
                   <button onClick={handleInitiateTrade} className="w-full primary-gradient-new text-black !rounded-[3rem] text-xs font-black uppercase tracking-[0.4em]">Confirm Purchase</button>
               </div>
           </div>
       )}

       {tradeModal && (
           <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-fade-in">
               <div className="widget-card-2025 p-12 rounded-[4rem] w-full max-w-xl border border-brand-lime/20 animate-scale-in bg-slate-950 shadow-huge max-h-[90vh] overflow-y-auto custom-scrollbar">
                   <div className="flex justify-between items-start mb-8 sticky top-0 bg-slate-950 z-10 pb-4">
                       <div className="space-y-1"><div className="flex items-center gap-3"><div className="p-3 bg-brand-lime/10 rounded-xl text-brand-lime border border-brand-lime/20"><Repeat size={20}/></div><h3 className="font-black text-white text-xl uppercase tracking-tighter">Trade Details</h3></div></div>
                       <button onClick={() => setTradeModal(null)} className="p-2 text-slate-500 hover:text-white"><X size={24}/></button>
                   </div>
                   <div className="space-y-10">
                       <div className="flex justify-between items-center"><TradeCountdown targetDate={tradeModal.expiresAt} /><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${tradeModal.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{tradeModal.status.replace(/_/g, ' ')}</span></div>
                       
                       {/* ESCROW WARNING UI */}
                       {tradeModal.status === 'WAITING_PAYMENT' && (
                           <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex items-center gap-4 animate-pulse-glow">
                                <ShieldCheck size={24} className="text-amber-500 ml-2" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Escrow Active</p>
                                    <p className="text-[9px] text-slate-400">Seller's funds are locked in the system vault. Safe to pay.</p>
                                </div>
                           </div>
                       )}

                       <div className="grid grid-cols-2 gap-4">
                           <div className="bg-black/60 p-6 rounded-[2rem] border border-white/5 space-y-1"><p className="text-[9px] text-slate-500 uppercase tracking-widest">Amount</p><p className="text-2xl font-black text-white font-tech">{tradeModal.amountOTF.toLocaleString()} <span className="text-xs font-normal opacity-40">OTF</span></p></div>
                           <div className="bg-black/60 p-6 rounded-[2rem] border border-white/5 space-y-1"><p className="text-[9px] text-slate-500 uppercase tracking-widest">Value (ETB)</p><p className="text-2xl font-black text-brand-lime font-tech">{tradeModal.totalCostETB.toLocaleString()} <span className="text-xs font-normal opacity-40">ETB</span></p></div>
                       </div>
                       <div className="space-y-6">
                           <div className="flex items-center gap-3 text-slate-400 pl-4 border-l-2 border-slate-700 font-black uppercase tracking-[0.2em] text-[10px]">Seller Bank Details</div>
                           <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-brand-lime/10 relative overflow-hidden group"><div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Landmark size={64}/></div><p className="text-sm font-mono text-slate-200 leading-relaxed font-bold select-all whitespace-pre-wrap">{tradeModal.sellerBankDetails}</p></div>
                       </div>
                       {tradeModal.buyerId === currentUser.id && tradeModal.status === 'WAITING_PAYMENT' && (
                           <div className="space-y-8 animate-pop-in">
                               <div className="space-y-3">
                                   <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest pl-8">Transaction Reference</label>
                                   <div className="relative group">
                                       <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-lime/30 group-focus-within:text-brand-lime transition-colors" size={20} />
                                       <input className="tech-input-new pl-16 !py-5 font-mono text-xl text-amber-500 tracking-widest" placeholder="Reference ID" value={ftInput} onChange={e => setFtInput(e.target.value)} />
                                   </div>
                               </div>
                               <button disabled={!ftInput} onClick={handleConfirmPayment} className="w-full py-6 primary-gradient-new text-black !rounded-[3rem] text-xs font-black uppercase tracking-[0.4em] active:scale-95 transition-all">Submit Payment Proof</button>
                           </div>
                       )}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};
