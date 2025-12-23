import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, HeadphonesIcon, Minimize2, User, ShieldCheck, Bot } from 'lucide-react';
import { User as UserType, ChatMessage } from '../types';

interface SupportChatProps {
  currentUser: UserType;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isSupportOnline?: boolean;
}

export const SupportChat: React.FC<SupportChatProps> = ({ currentUser, messages, onSendMessage, isSupportOnline = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for this user interaction
  const myMessages = messages.filter(
    m => m.senderId === currentUser.id || m.recipientId === currentUser.id
  ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const unreadCount = myMessages.filter(m => m.recipientId === currentUser.id && !m.read).length;

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, myMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[320px] md:w-[400px] h-[500px] widget-card-2025 rounded-[2.5rem] flex flex-col border border-brand-lime/40 animate-scale-in origin-bottom-right overflow-hidden bg-slate-950 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
          
          {/* Header */}
          <div className="bg-slate-900/95 p-6 border-b border-brand-lime/20 flex justify-between items-center backdrop-blur-md shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-2.5 bg-brand-lime/10 rounded-xl border border-brand-lime/30 relative shrink-0">
                 <Bot size={20} className="text-brand-lime animate-float" />
                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSupportOnline ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isSupportOnline ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                 </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-white font-tech uppercase tracking-widest truncate">Gemini Intelligence</h3>
                <p className={`text-[9px] font-mono uppercase tracking-tighter truncate ${isSupportOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isSupportOnline ? 'Live Agent Linked' : 'AI Node Online'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors hover:bg-white/5 rounded-full shrink-0">
              <Minimize2 size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950/80 min-w-0 overflow-x-hidden">
            <div className="flex justify-center my-2">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isSupportOnline ? 'text-emerald-500 border-emerald-900/30 bg-emerald-950/20' : 'text-slate-600 bg-slate-900/40 border-slate-800'} px-3 py-1.5 rounded-full border`}>
                   Authorized Channel
                </span>
            </div>
            
            {myMessages.length === 0 && (
                <div className="text-center mt-12 space-y-4 opacity-30 animate-pulse">
                    <Bot size={48} className="mx-auto text-slate-600"/>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Awaiting Gemini Command...</p>
                </div>
            )}

            {myMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const isAI = msg.senderId === 'AI_SUPPORT';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up min-w-0 w-full`}>
                  <div className={`max-w-[85%] rounded-[1.5rem] p-5 border transition-all min-w-0 break-words ${
                    isMe 
                      ? 'bg-brand-lime/10 border-brand-lime/20 text-slate-100 rounded-tr-none ml-auto' 
                      : isAI 
                        ? 'bg-indigo-900/20 border-indigo-500/20 text-slate-100 rounded-tl-none mr-auto'
                        : 'bg-slate-800 border-slate-700 text-slate-100 rounded-tl-none mr-auto'
                  }`}>
                    {!isMe && (
                        <div className={`text-[9px] font-black mb-2 flex items-center gap-1.5 uppercase tracking-[0.2em] ${isAI ? 'text-indigo-400' : 'text-brand-lime'}`}>
                            {isAI ? <><Bot size={12}/> Gemini Intelligence</> : <><ShieldCheck size={12}/> Support Node</>}
                        </div>
                    )}
                    <p className="text-sm leading-relaxed font-light break-words whitespace-pre-wrap">
                        {msg.text}
                    </p>
                    <div className={`text-[8px] mt-3 font-mono font-bold uppercase tracking-tighter ${isMe ? 'text-brand-lime/40 text-right' : 'text-slate-600'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-slate-900/95 border-t border-slate-800/50 flex gap-3 backdrop-blur-xl shrink-0">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Query Gemini Intelligence..."
              className="tech-input-new !py-3 !px-5"
            />
            <button 
              type="submit" 
              disabled={!text.trim()}
              className="p-3.5 primary-gradient-new text-black rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shrink-0"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-500 relative group z-50 ${
          isOpen 
            ? 'bg-slate-900 border-slate-700 text-slate-400 rotate-90 scale-90' 
            : 'bg-gradient-to-br from-brand-lime to-brand-green border-brand-lime text-black hover:scale-110 shadow-[0_20px_40px_rgba(148,163,184,0.3)]'
        }`}
      >
        {isOpen ? <X size={28} /> : <Bot size={28} className="animate-float" />}
        
        {!isOpen && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-slate-950 animate-bounce">
            {unreadCount}
          </div>
        )}

        {!isOpen && (
            <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-slate-950 ${isSupportOnline ? 'bg-emerald-500' : 'bg-brand-lime'}`}></div>
        )}
      </button>
    </div>
  );
};