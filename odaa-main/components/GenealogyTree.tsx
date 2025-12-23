import React, { useMemo, useState, useContext, useEffect, useRef } from 'react';
import { User, Rank } from '../types';
import { 
  User as UserIcon, ShieldCheck, ZoomIn, ZoomOut, Maximize, Search, 
  ChevronDown, ChevronUp, Loader2, ArrowUpCircle, MapPin, X, 
  UserCircle, FileText, Mail, Activity, GitBranch, ShieldAlert,
  Zap, TrendingUp, Network, Info, ArrowRight, Share2, Target,
  ChevronRight, Circle, UserMinus, Grab, ChevronLeft, RotateCcw,
  ArrowDownLeft, ArrowDownRight, ArrowUp
} from 'lucide-react';

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
  <div className="flex flex-col items-center opacity-20 animate-fade-in mx-6">
    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center bg-slate-900/40 mb-3 group-hover:border-brand-lime/40 transition-all duration-500">
      <div className="w-2 h-2 bg-slate-700 rounded-full animate-pulse"></div>
    </div>
    <div className="text-[10px] text-slate-700 font-mono uppercase tracking-[0.3em]">{leg} LEG</div>
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
    <div className="flex flex-col items-center animate-fade-in origin-top mx-4">
      <div className={`flex flex-col items-center relative z-20 group/node transition-all duration-500 ${isRoot ? 'scale-110' : ''}`}>
        {/* CIRCULAR NODE CONTAINER */}
        <div 
          className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-10 shadow-huge cursor-pointer bg-slate-950
            hover:scale-110 hover:shadow-glow-lime hover:rotate-6
            ${isRoot ? 'border-brand-lime shadow-glow-lime text-white' 
            : isHighlighted ? 'border-emerald-400 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-110'
            : 'border-slate-800 text-slate-500 hover:border-brand-lime hover:text-white'}
          `}
          onClick={() => isRoot ? setShowMenu(!showMenu) : onFocus(user.id)}
        >
          {/* USER ICON */}
          {user.rank.includes('Diamond') ? <ShieldCheck size={36} strokeWidth={1.5} /> : <UserIcon size={36} strokeWidth={1.5} />}
          
          {/* STATUS DOT */}
          <div className={`absolute top-0.5 right-2 w-4 h-4 rounded-full border-4 border-slate-950 ${user.status === 'ACTIVE' ? 'bg-brand-lime' : 'bg-rose-500'}`}></div>
          
          {hasChildren && (
             <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="absolute -bottom-2 w-7 h-7 rounded-full flex items-center justify-center border-2 bg-slate-900 border-slate-700 text-slate-500 shadow-huge transition-all z-20 hover:scale-110 hover:border-brand-lime hover:text-brand-lime">
                {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
             </button>
          )}
        </div>

        {/* Console-Styled Tooltip */}
        <div className={`absolute top-24 left-1/2 -translate-x-1/2 w-[280px] bg-slate-950/98 backdrop-blur-3xl rounded-3xl border border-slate-800 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] z-50 transition-all duration-300 origin-top overflow-hidden flex flex-col ${showMenu || isHighlighted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 -translate-y-4 pointer-events-none group-hover/node:opacity-100 group-hover/node:scale-100 group-hover/node:translate-y-0 group-hover/node:pointer-events-auto'}`}>
           <div className="bg-black p-6 border-b border-white/5 relative">
               <div className={`absolute top-0 left-0 w-1.5 h-full ${user.status === 'ACTIVE' ? 'bg-brand-lime' : 'bg-rose-500'}`}></div>
               <div className="flex justify-between items-start mb-2">
                 <div className="min-w-0">
                    <h4 className="font-black text-base text-white truncate uppercase tracking-tighter">{user.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono tracking-widest mt-1 uppercase">ID: @{user.username}</p>
                 </div>
               </div>
               <span className="inline-block text-[10px] px-3 py-1 rounded-lg bg-brand-lime/10 border border-brand-lime/30 text-brand-lime font-black uppercase tracking-[0.2em] mt-3 font-tech">{user.rank}</span>
           </div>

           <div className="p-6 space-y-4 font-mono">
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 shadow-inner">
                      <span className="block text-slate-600 font-black uppercase text-[9px] mb-1.5 tracking-widest">LEFT VOL</span>
                      <span className="text-white font-bold">{user.binaryLeftCount || 0}</span>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 shadow-inner">
                      <span className="block text-slate-600 font-black uppercase text-[9px] mb-1.5 tracking-widest">RIGHT VOL</span>
                      <span className="text-white font-bold">{user.binaryRightCount || 0}</span>
                  </div>
              </div>
           </div>

           <div className="bg-black border-t border-white/5 p-2 flex justify-around">
              <button className="p-3 text-slate-600 hover:text-cyan-400 transition-all hover:scale-110" title="Profile"><UserCircle size={20} /></button>
              <button className="p-3 text-slate-600 hover:text-amber-400 transition-all hover:scale-110" title="History"><FileText size={20} /></button>
              <button onClick={() => onFocus(user.id)} className="p-3 text-slate-600 hover:text-brand-lime transition-all hover:scale-110" title="Focus"><Maximize size={20} /></button>
           </div>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col items-center animate-fade-in-up origin-top relative z-10 pt-4">
          <div className="w-px h-12 bg-gradient-to-b from-slate-700 to-slate-800"></div>
          <div className="relative flex justify-center gap-24">
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-slate-800"></div>
            <div className="flex flex-col items-center">
              <div className="w-px h-8 bg-slate-800"></div>
              {leftChild ? <TreeNode userId={leftChild.id} depth={depth + 1} /> : <EmptySlot leg="LEFT" />}
            </div>
            <div className="flex flex-col items-center">
              <div className="w-px h-8 bg-slate-800"></div>
              {rightChild ? <TreeNode userId={rightChild.id} depth={depth + 1} /> : <EmptySlot leg="RIGHT" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export const GenealogyTree: React.FC<{ users: User[], rootId: string }> = ({ users, rootId }) => {
  const [scale, setScale] = useState(0.8);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewRootId, setViewRootId] = useState(rootId);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedPath, setHighlightedPath] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

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

  const pan = (dx: number, dy: number) => {
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const resetView = () => {
    setScale(0.8);
    setOffset({ x: 0, y: 0 });
    setViewRootId(rootId);
    setHighlightedPath(new Set());
  };

  // Jump to extreme Logic
  const jumpToExtreme = (direction: 'LEFT' | 'RIGHT') => {
      let curr = userMap.get(rootId);
      if (!curr) return;
      
      let nextId = curr.id;
      let iterations = 0;
      
      while (iterations < 100) { // Safety break
          const children = childrenMap.get(nextId) || [];
          const nextChild = children.find(c => c.leg === direction);
          
          if (nextChild) {
              nextId = nextChild.id;
          } else {
              break; // Found the bottom
          }
          iterations++;
      }
      
      setViewRootId(nextId);
      // Center view?
      setOffset({ x: 0, y: 0 });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.toLowerCase();
    const target = users.find(u => u.username.toLowerCase() === term || u.name.toLowerCase().includes(term));
    if (target) {
        let path = new Set<string>();
        let curr: User | undefined = target;
        while (curr) {
            path.add(curr.id);
            if (curr.id === viewRootId || !curr.parentId) break;
            curr = userMap.get(curr.parentId);
        }
        setHighlightedPath(path);
        if (!path.has(viewRootId)) setViewRootId(target.id);
        setSearchTerm('');
        setOffset({ x: 0, y: 0 }); 
    } else {
        alert("Node synchronization failure: Identity not found.");
    }
  };

  return (
    <TreeContext.Provider value={{ userMap, childrenMap, onFocus: setViewRootId, rootId: viewRootId, highlightedPath, baseRootId: rootId }}>
      <div className="flex flex-col h-[calc(100vh-140px)] space-y-8 animate-fade-in relative">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
              <div className="space-y-2">
                  <h2 className="text-4xl font-black text-white font-tech tracking-tighter uppercase leading-none">Network <span className="text-brand-lime">Tree</span></h2>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.4em] font-lora italic">Genealogy View</p>
              </div>
              <div className="flex items-center gap-4">
                   <form onSubmit={handleSearch} className="relative group w-72">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime/60 z-10" />
                      <input type="text" placeholder="Identity Handle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="tech-input-new w-full pl-12 pr-6 py-3.5 text-sm" />
                   </form>
                  <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-2xl border border-white/5 shadow-huge">
                      <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"><ZoomOut size={20} /></button>
                      <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"><ZoomIn size={20} /></button>
                      <button onClick={resetView} className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all" title="Recalibrate View"><Maximize size={20} /></button>
                  </div>
              </div>
          </div>
          
          <div 
            className={`flex-1 bg-black/40 rounded-[3rem] border border-white/5 shadow-inner overflow-hidden relative select-none cursor-grab active:cursor-grabbing`} 
            ref={containerRef}
            onMouseDown={(e) => {
                if (e.button !== 0) return; 
                setIsDragging(true);
                setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
            }}
            onMouseMove={(e) => {
                if (!isDragging) return;
                setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
              <div 
                className="w-full h-full relative"
                style={{ 
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                  <div className="min-w-fit min-h-fit flex justify-center origin-top pt-20">
                      <TreeNode userId={viewRootId} depth={0} />
                  </div>
              </div>

              {/* TACTICAL HUD COMMAND HUB */}
              <div className="absolute bottom-10 left-10 flex flex-col items-center gap-1 z-40 animate-pop-in">
                  <div className="bg-slate-950/80 backdrop-blur-2xl p-8 rounded-[3.5rem] border border-white/10 shadow-premium flex flex-col items-center gap-4 relative group/hud">
                      {/* Decorative HUD Ring */}
                      <div className="absolute inset-0 rounded-[3.5rem] border border-brand-lime/5 group-hover/hud:border-brand-lime/20 transition-colors pointer-events-none"></div>
                      
                      <button onClick={() => pan(0, 200)} className="mover-key group/btn" title="PAN_UP">
                        <ChevronUp size={24}/>
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[6px] font-black opacity-0 group-hover/btn:opacity-50 tracking-widest">N</div>
                      </button>
                      
                      <div className="flex gap-4">
                        <button onClick={() => pan(200, 0)} className="mover-key group/btn" title="PAN_LEFT">
                          <ChevronLeft size={24}/>
                          <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[6px] font-black opacity-0 group-hover/btn:opacity-50 tracking-widest rotate-[-90deg]">W</div>
                        </button>
                        
                        <button onClick={resetView} className="mover-key !bg-brand-lime/10 border-brand-lime/20 text-brand-lime hover:!bg-brand-lime hover:!text-black group/center" title="RECALIBRATE_HUD">
                          <RotateCcw size={20} className="group-hover/center:rotate-[-45deg] transition-transform"/>
                        </button>
                        
                        <button onClick={() => pan(-200, 0)} className="mover-key group/btn" title="PAN_RIGHT">
                          <ChevronRight size={24}/>
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[6px] font-black opacity-0 group-hover/btn:opacity-50 tracking-widest rotate-[90deg]">E</div>
                        </button>
                      </div>
                      
                      <button onClick={() => pan(0, -200)} className="mover-key group/btn" title="PAN_DOWN">
                        <ChevronDown size={24}/>
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[6px] font-black opacity-0 group-hover/btn:opacity-50 tracking-widest">S</div>
                      </button>
                      
                      <div className="mt-2 space-y-1 text-center">
                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.4em] font-tech leading-none">Navigation</p>
                        <div className="flex items-center justify-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-brand-lime animate-pulse"></div>
                            <span className="text-[6px] text-brand-lime/60 font-mono">STATUS: OK</span>
                        </div>
                      </div>
                  </div>
              </div>

              {/* QUICK JUMP CONTROLS */}
              <div className="absolute top-10 right-10 flex flex-col gap-3 z-40">
                  <button onClick={() => setViewRootId(rootId)} className="bg-slate-900/80 backdrop-blur border border-white/10 p-4 rounded-2xl hover:bg-slate-800 hover:border-brand-lime/30 transition-all group flex items-center gap-3 text-slate-400 hover:text-white" title="Jump to Root">
                      <ArrowUp size={20} /> <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:inline">Top Node</span>
                  </button>
                  <button onClick={() => jumpToExtreme('LEFT')} className="bg-slate-900/80 backdrop-blur border border-white/10 p-4 rounded-2xl hover:bg-slate-800 hover:border-brand-lime/30 transition-all group flex items-center gap-3 text-slate-400 hover:text-white" title="Jump Bottom Left">
                      <ArrowDownLeft size={20} /> <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:inline">Bottom Left</span>
                  </button>
                  <button onClick={() => jumpToExtreme('RIGHT')} className="bg-slate-900/80 backdrop-blur border border-white/10 p-4 rounded-2xl hover:bg-slate-800 hover:border-brand-lime/30 transition-all group flex items-center gap-3 text-slate-400 hover:text-white" title="Jump Bottom Right">
                      <ArrowDownRight size={20} /> <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:inline">Bottom Right</span>
                  </button>
              </div>

              <div className="absolute bottom-10 right-10 flex flex-col items-end gap-3 text-slate-600 font-mono text-[11px] pointer-events-none uppercase tracking-[0.2em] font-black">
                  <div className="bg-black/60 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/5 flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-brand-lime animate-pulse shadow-glow-lime"></div> NAVIGATION READY
                  </div>
                  <div className="bg-black/60 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/5">
                      ZOOM: {Math.round(scale * 100)}%
                  </div>
              </div>
          </div>
      </div>
    </TreeContext.Provider>
  );
};