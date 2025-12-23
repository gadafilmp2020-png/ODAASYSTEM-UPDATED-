import React, { useMemo, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { User as UserIcon, ShieldCheck, ZoomIn, ZoomOut, Maximize, Search, ChevronDown, ChevronUp, Loader2, ArrowUpCircle, MapPin, X, UserCircle, FileText, Mail, Activity } from 'lucide-react';

interface TreeContextType {
  userMap: Map<string, User>;
  childrenMap: Map<string, User[]>;
  onFocus: (id: string) => void;
  rootId: string;
  highlightedPath: Set<string>;
  baseRootId: string;
}

const TreeContext = React.createContext<TreeContextType | null>(null);

const EmptySlot = React.memo(({ leg }: { leg: string }) => (
  <div className="flex flex-col items-center opacity-30 animate-fade-in mx-4">
    <div className="w-12 h-12 rounded-full border border-dashed border-slate-600 flex items-center justify-center bg-slate-900/20 mb-2 group-hover:border-lime-500/50 transition-colors">
      <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
    </div>
    <div className="text-[9px] text-slate-600 font-mono uppercase tracking-wider">{leg} LEG</div>
  </div>
));

interface TreeNodeProps {
  userId: string;
  depth: number;
}

const TreeNode = React.memo(({ userId, depth }: TreeNodeProps) => {
  const { userMap, childrenMap, onFocus, rootId, highlightedPath } = useContext(TreeContext)!;
  const user = userMap.get(userId);
  
  const isHighlighted = highlightedPath.has(userId);
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (isHighlighted) setIsExpanded(true);
  }, [isHighlighted]);

  if (!user) return null;

  const children = childrenMap.get(userId) || [];
  const leftChild = children.find(c => c.leg === 'LEFT');
  const rightChild = children.find(c => c.leg === 'RIGHT');
  const hasChildren = children.length > 0;
  const isRoot = userId === rootId;

  return (
    <div className="flex flex-col items-center animate-fade-in origin-top mx-2">
      <div className={`flex flex-col items-center relative z-20 group/node transition-all duration-300 ${isRoot ? 'scale-110' : ''}`}>
        <div 
          className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10 shadow-lg cursor-pointer bg-slate-950
            hover:scale-110 hover:shadow-[0_0_25px_rgba(132,204,22,0.5)]
            ${isRoot ? 'border-lime-500 shadow-[0_0_25px_rgba(132,204,22,0.6)] text-white' 
            : isHighlighted ? 'border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110'
            : 'border-slate-700 text-slate-500 hover:border-lime-400 hover:text-white'}
          `}
          onClick={() => isRoot ? setShowMenu(!showMenu) : onFocus(user.id)}
        >
          {user.rank.includes('Diamond') ? <ShieldCheck size={24} /> : <UserIcon size={24} />}
          <div className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          
          {hasChildren && (
             <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="absolute -bottom-3 w-6 h-6 rounded-full flex items-center justify-center border bg-slate-800 border-slate-600 text-slate-400 shadow-md transition-all z-20 hover:scale-110">
                {isExpanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
             </button>
          )}
        </div>

        <div className={`absolute top-16 left-1/2 -translate-x-1/2 w-[200px] bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700 shadow-2xl z-50 transition-all duration-200 origin-top overflow-hidden flex flex-col ${showMenu || isHighlighted ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none group-hover/node:opacity-100 group-hover/node:scale-100 group-hover/node:pointer-events-auto'}`}>
           <div className="bg-slate-950 p-3 border-b border-slate-800 relative">
               <div className="absolute top-0 left-0 w-1 h-full bg-lime-500"></div>
               <h4 className="font-bold text-sm text-white truncate">{user.name}</h4>
               <p className="text-[10px] text-slate-400 font-mono">@{user.username}</p>
               <span className="inline-block text-[9px] px-2 py-0.5 rounded bg-lime-900/30 border border-lime-500/30 text-lime-400 font-bold uppercase mt-1">{user.rank}</span>
           </div>
           <div className="p-3 grid grid-cols-2 gap-2 text-[10px]">
               <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                   <span className="block text-slate-500 font-bold uppercase text-[8px]">Left Vol</span>
                   <span className="text-white font-mono">{user.binaryLeftCount || 0}</span>
               </div>
               <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50 text-right">
                   <span className="block text-slate-500 font-bold uppercase text-[8px]">Right Vol</span>
                   <span className="text-white font-mono">{user.binaryRightCount || 0}</span>
               </div>
           </div>
           <div className="bg-slate-950 border-t border-slate-800 p-1 flex justify-around">
              <button className="p-2 text-slate-400 hover:text-cyan-400"><UserCircle size={14} /></button>
              <button className="p-2 text-slate-400 hover:text-amber-400"><FileText size={14} /></button>
              <button onClick={() => onFocus(user.id)} className="p-2 text-slate-400 hover:text-white"><Maximize size={14} /></button>
           </div>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col items-center animate-fade-in-up origin-top relative z-10">
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="relative flex justify-center gap-12">
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-slate-700"></div>
            <div className="flex flex-col items-center">
              <div className="w-px h-6 bg-slate-700"></div>
              {leftChild ? <TreeNode userId={leftChild.id} depth={depth + 1} /> : <EmptySlot leg="L" />}
            </div>
            <div className="flex flex-col items-center">
              <div className="w-px h-6 bg-slate-700"></div>
              {rightChild ? <TreeNode userId={rightChild.id} depth={depth + 1} /> : <EmptySlot leg="R" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export const GenealogyTree: React.FC<{ users: User[], rootId: string }> = ({ users, rootId }) => {
  const [scale, setScale] = useState(0.85);
  const [viewRootId, setViewRootId] = useState(rootId);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedPath, setHighlightedPath] = useState<Set<string>>(new Set());

  const { userMap, childrenMap } = useMemo(() => {
    const uMap = new Map<string, User>();
    const cMap = new Map<string, User[]>();
    users.forEach(u => {
      uMap.set(u.id, u);
      if (u.parentId) {
        if (!cMap.has(u.parentId)) cMap.set(u.parentId, []);
        cMap.get(u.parentId)!.push(u);
      }
    });
    return { userMap: uMap, childrenMap: cMap };
  }, [users]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const target = users.find(u => u.username.toLowerCase() === searchTerm.toLowerCase() || u.name.toLowerCase() === searchTerm.toLowerCase());
    if (target) {
        let path = new Set<string>();
        let curr = target;
        while (curr) {
            path.add(curr.id);
            if (curr.id === viewRootId || !curr.parentId) break;
            curr = userMap.get(curr.parentId)!;
        }
        setHighlightedPath(path);
        if (!path.has(viewRootId)) setViewRootId(target.id);
        setSearchTerm('');
    } else {
        alert("User not found in your network.");
    }
  };

  return (
    <TreeContext.Provider value={{ userMap, childrenMap, onFocus: setViewRootId, rootId: viewRootId, highlightedPath, baseRootId: rootId }}>
      <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                  <h2 className="text-2xl font-bold text-white font-tech tracking-tight">GENEALOGY TREE</h2>
                  <p className="text-slate-400 text-xs">Viewing downline of: <span className="text-cyan-400 font-bold uppercase">{userMap.get(viewRootId)?.name}</span></p>
              </div>
              <div className="flex items-center gap-3">
                   <form onSubmit={handleSearch} className="relative group w-64">
                      <input type="text" placeholder="Search downline..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-lime-500 outline-none transition-all font-tech" />
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                   </form>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 shadow-lg">
                      <button onClick={() => setScale(s => Math.max(0.3, s - 0.1))} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"><ZoomOut size={16} /></button>
                      <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"><ZoomIn size={16} /></button>
                      <button onClick={() => { setViewRootId(rootId); setHighlightedPath(new Set()); }} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"><Maximize size={16} /></button>
                  </div>
              </div>
          </div>
          
          <div className="flex-1 bg-slate-950/50 rounded-2xl border border-slate-800/50 shadow-inner overflow-hidden relative">
              {viewRootId !== rootId && (
                  <button onClick={() => setViewRootId(userMap.get(viewRootId)?.parentId || rootId)} className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 backdrop-blur border border-slate-700 text-slate-300 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold hover:bg-lime-900/30 hover:border-lime-500 transition-all font-tech uppercase">
                      <ArrowUpCircle size={16} className="text-lime-400" /> Up Level
                  </button>
              )}
              <div className="w-full h-full overflow-auto p-10 custom-scrollbar">
                  <div className="min-w-fit min-h-fit flex justify-center origin-top pt-12 transition-transform duration-300" style={{ transform: `scale(${scale})` }}>
                      <TreeNode userId={viewRootId} depth={0} />
                  </div>
              </div>
          </div>
      </div>
    </TreeContext.Provider>
  );
};
