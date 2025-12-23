import React, { useState, useMemo } from 'react';
import { User, Rank } from '../types';
import { 
  Search, Users, UserCheck, UserX, Filter, Shield, 
  Network, Cpu, Zap, Activity, ChevronRight, 
  Fingerprint, Globe, Target, ArrowRight, Star
} from 'lucide-react';
import { VerificationBadge } from './VerificationBadge';

interface TeamProps {
  currentUser: User;
  allUsers: User[];
}

export const Team: React.FC<TeamProps> = ({ currentUser, allUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ACTIVE');

  const downline = useMemo(() => {
    const results: (User & { depth: number })[] = [];
    const queue: { id: string; depth: number }[] = [{ id: currentUser.id, depth: 0 }];
    const visited = new Set([currentUser.id]);

    let head = 0;
    while(head < queue.length){
        const { id, depth } = queue[head++];
        const children = allUsers.filter(u => u.parentId === id);
        children.forEach(child => {
            if(!visited.has(child.id)){
                visited.add(child.id);
                queue.push({ id: child.id, depth: depth + 1 });
                results.push({ ...child, depth: depth + 1 });
            }
        });
    }
    return results;
  }, [currentUser, allUsers]);

  const totalMembers = downline.length;
  const activeCount = downline.filter(u => u.status === 'ACTIVE').length;
  const blockedCount = downline.filter(u => u.status === 'BLOCKED').length;

  const filteredMembers = downline.filter(member => {
    const matchesSearch = (member.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.username?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;
    const matchesStatus = filterStatus === 'ALL' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-12 pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div className="space-y-1">
           <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none font-tech">
             Team<span className="text-brand-lime">Structure</span>
           </h1>
           <div className="flex items-center gap-3 pl-1">
                <div className="px-4 py-1.5 rounded-full bg-brand-lime/5 border border-brand-lime/20 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-brand-lime animate-pulse"></div>
                    <span className="text-[9px] font-black text-brand-lime uppercase tracking-[0.2em]">System Online</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono uppercase">MEMBERS: {totalMembers}</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-brand-lime/20 backdrop-blur-xl shadow-[0_10px_25px_rgba(148,163,184,0.15)]">
            <div className="relative group w-56 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime/60 z-10" size={16} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-brand-lime/20 rounded-xl pl-12 pr-6 py-3 text-xs text-white outline-none focus:border-brand-lime/50 transition-all font-mono"
                  placeholder="Filter members..."
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: 'Total Members', value: totalMembers, icon: Network, color: 'text-brand-lime' },
            { label: 'Active Members', value: activeCount, icon: UserCheck, color: 'text-brand-lime' },
            { label: 'Inactive Members', value: blockedCount, icon: UserX, color: 'text-rose-500' },
        ].map((stat, i) => (
            <div key={i} className="widget-card-2025 p-8 rounded-[2rem] group relative overflow-hidden bg-brand-surface border-brand-lime/30">
                <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className={`p-4 rounded-xl bg-black/40 border border-brand-lime/20 group-hover:scale-105 transition-all duration-500 ${stat.color} shadow-inner`}>
                            <stat.icon size={28} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1">{stat.label}</p>
                        <h3 className="text-5xl font-black text-white font-tech tracking-tighter leading-none">{stat.value}</h3>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <div className="widget-card-2025 rounded-[2.5rem] bg-brand-surface border-brand-lime/40 overflow-hidden">
        <div className="p-8 border-b border-brand-lime/10 bg-black/20 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
                <div className="p-4 bg-brand-lime/5 rounded-xl border border-brand-lime/20 text-brand-lime"><Users size={32} strokeWidth={1.5}/></div>
                <div>
                    <h3 className="text-3xl font-black text-white font-tech uppercase tracking-tighter">Team List</h3>
                    <p className="text-[10px] text-brand-lime font-black uppercase tracking-[0.4em] mt-1">Member List</p>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
           <table className="protocol-table w-full">
             <thead>
               <tr>
                 <th className="px-8">Member Name</th>
                 <th>Placement</th>
                 <th>Date Joined</th>
                 <th className="text-center px-8">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-brand-lime/10">
                {filteredMembers.map((member, index) => (
                   <tr key={member.id} className="hover:bg-white/[0.02]">
                      <td className="py-6 px-8">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full p-1 bg-black border border-brand-lime/30 relative overflow-hidden shadow-inner">
                               <img src={member.avatar} className="w-full h-full rounded-full object-cover" />
                            </div>
                            <div>
                               <div className="flex items-center gap-2">
                                   <div className="font-black text-slate-100 text-lg tracking-tighter group-hover:text-brand-lime transition-all">{member.name}</div>
                                   {member.kycStatus === 'VERIFIED' && <VerificationBadge size={14} />}
                               </div>
                               <div className="text-[9px] text-slate-600 font-mono font-black uppercase tracking-widest mt-0.5">@{member.username}</div>
                            </div>
                         </div>
                      </td>
                      <td>
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border font-mono ${member.leg === 'LEFT' ? 'bg-black/20 border-brand-lime/20 text-slate-400' : 'bg-brand-lime/5 border-brand-lime/30 text-brand-lime'}`}>
                            {member.leg === 'LEFT' ? 'LEFT' : 'RIGHT'}
                         </span>
                      </td>
                      <td className="text-slate-500 font-mono text-[10px] italic">{member.joinDate}</td>
                      <td className="px-8">
                         <div className="flex justify-center">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-2 transition-all duration-500 ${member.status === 'ACTIVE' ? 'bg-brand-lime/10 text-brand-lime border border-brand-lime/30 shadow-[0_4px_10px_rgba(132,204,22,0.1)]' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                                <div className={`w-1 h-1 rounded-full ${member.status === 'ACTIVE' ? 'bg-brand-lime animate-pulse' : 'bg-rose-500'}`}></div>
                                {member.status}
                             </span>
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};