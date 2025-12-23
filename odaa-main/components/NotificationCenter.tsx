
import React, { useMemo } from 'react';
import { Bell, X, CheckCircle2, Info, AlertTriangle, Clock, Trash2, Check, ExternalLink } from 'lucide-react';
import { Notification, ViewState } from '../types';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewState) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  isOpen,
  onClose,
  onNavigate
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  // Sorting: Urgent (Error/Warning) -> Unread -> Date
  const sortedNotifications = useMemo(() => {
      return [...notifications].sort((a, b) => {
          const isUrgentA = a.type === 'ERROR' || a.type === 'WARNING';
          const isUrgentB = b.type === 'ERROR' || b.type === 'WARNING';
          
          // 1. Urgent First
          if (isUrgentA && !isUrgentB) return -1;
          if (!isUrgentA && isUrgentB) return 1;
          
          // 2. Unread Next
          if (!a.read && b.read) return -1;
          if (a.read && !b.read) return 1;
          
          // 3. Newest First
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [notifications]);

  const getIcon = (type: Notification['type'], read: boolean) => {
    const opacity = read ? 'opacity-50' : 'opacity-100';
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className={`text-emerald-500 ${opacity}`} size={18} />;
      case 'WARNING': return <AlertTriangle className={`text-amber-500 ${opacity}`} size={18} />;
      case 'ERROR': return <AlertTriangle className={`text-red-500 ${opacity}`} size={18} />; // Urgent
      default: return <Info className={`text-lime-500 ${opacity}`} size={18} />;
    }
  };

  const getBorderColor = (type: Notification['type'], read: boolean) => {
      if (read) return 'border-l-slate-700';
      switch (type) {
          case 'ERROR': return 'border-l-red-500';
          case 'WARNING': return 'border-l-amber-500';
          case 'SUCCESS': return 'border-l-emerald-500';
          default: return 'border-l-lime-500';
      }
  };

  const handleClick = (n: Notification) => {
      if (!n.read) onMarkRead(n.id);
      if (n.targetView) {
          onNavigate(n.targetView);
      }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSecs = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSecs < 60) return 'Just now';
    if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)}m ago`;
    if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] animate-fade-in" 
          onClick={onClose}
        />
      )}

      {/* Slide-over Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-sm bg-slate-950 border-l border-lime-500/20 z-[100] shadow-[0_0_80px_rgba(132,204,22,0.2)] transition-transform duration-500 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header - Lime Theme */}
        <div className="p-6 border-b border-lime-900/30 flex items-center justify-between bg-gradient-to-r from-lime-950/20 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-lime-500/10 rounded-xl text-lime-500 border border-lime-500/30 relative">
              <Bell size={20} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-lime-400 rounded-full animate-ping"></span>}
            </div>
            <div>
              <h3 className="text-white font-bold font-tech uppercase tracking-widest text-sm text-lime-100">System Uplink</h3>
              <p className="text-[10px] text-lime-400 font-mono uppercase tracking-tighter">
                {unreadCount} PENDING • LIVE FEED
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-lime-400/50 hover:text-lime-400 hover:bg-lime-950/30 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {sortedNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4 opacity-40">
              <div className="p-8 rounded-full bg-slate-900/50 border border-slate-800">
                <Bell size={48} className="text-lime-900/50" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest font-tech text-lime-900/50">All Clear</p>
            </div>
          ) : (
            sortedNotifications.map((n) => {
              const isUrgent = n.type === 'ERROR' || n.type === 'WARNING';
              return (
              <div 
                key={n.id}
                onClick={() => handleClick(n)}
                className={`p-4 rounded-xl border-l-4 transition-all duration-300 cursor-pointer relative group overflow-hidden ${
                  n.read 
                    ? 'bg-slate-950 border-y border-r border-slate-800 opacity-60 hover:opacity-100' 
                    : isUrgent 
                        ? 'bg-red-950/10 border-y border-r border-red-900/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]' 
                        : 'bg-slate-900 border-y border-r border-slate-800'
                } ${getBorderColor(n.type, n.read)}`}
              >
                {!n.read && (
                  <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-lime-500'}`} />
                )}
                
                <div className="flex gap-4 items-start">
                  <div className={`mt-0.5 shrink-0 p-2 rounded-lg ${n.read ? 'bg-slate-900' : 'bg-black/40 border border-white/5'}`}>
                    {getIcon(n.type, n.read)}
                  </div>
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${isUrgent ? 'text-red-400' : 'text-slate-500'}`}>
                            {n.type}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-slate-600 font-mono uppercase">
                          <Clock size={10} />
                          {getTimeAgo(n.date)}
                        </div>
                    </div>
                    <p className={`text-xs leading-relaxed transition-colors duration-300 ${n.read ? 'text-slate-500 font-light' : 'text-slate-200 font-medium'}`}>
                      {n.message}
                    </p>
                    
                    {n.targetView && (
                        <div className="pt-2 flex items-center gap-1 text-[9px] font-bold text-lime-500 group-hover:text-lime-400 transition-colors uppercase tracking-wider">
                            <ExternalLink size={10} /> Open Source
                        </div>
                    )}
                  </div>
                </div>
              </div>
            )})
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-4 border-t border-lime-900/20 bg-slate-950 grid grid-cols-2 gap-3">
            <button 
              onClick={onMarkAllRead}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all uppercase tracking-widest font-tech"
            >
              <Check size={14} /> Mark Read
            </button>
            <button 
              onClick={onClearAll}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-red-900/30 text-[10px] font-bold text-red-500 hover:text-white hover:bg-red-600 transition-all uppercase tracking-widest font-tech shadow-lg shadow-red-900/10"
            >
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        )}
      </div>
    </>
  );
};
