import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../firebase';
import { ChatSession } from '../types';
import { 
  LogOut, 
  MessageSquare, 
  X, 
  Cpu, 
  Code, 
  Globe, 
  Image, 
  FileText, 
  BarChart, 
  Mic, 
  Languages, 
  BrainCircuit, 
  Sparkles,
  Trash2,
  Plus,
  Settings
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  onOpenSettings?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  sidebarOpen, 
  setSidebarOpen,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onOpenSettings
}) => {
  const { user } = useAuth();

  const features = [
    { icon: Code, label: 'Advanced Coding' },
    { icon: Globe, label: 'Global Search' },
    { icon: Image, label: 'Vision Analysis' },
    { icon: FileText, label: 'Creative Writing' },
    { icon: BarChart, label: 'Data Analytics' },
    { icon: BrainCircuit, label: 'Logical Reasoning' },
    { icon: Languages, label: 'Translation' },
    { icon: Mic, label: 'Voice Processing' },
    { icon: Sparkles, label: 'Exclusive Content' },
    { icon: Cpu, label: 'System Design' },
  ];

  return (
    <div className="flex h-screen bg-brand-900 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-72 bg-brand-800 border-r border-white/5 shadow-2xl
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-brand-gold/20">
               <span className="font-bold text-black text-lg">F</span>
             </div>
             <h1 className="font-bold text-xl text-white tracking-tight">FullTask <span className="text-brand-gold font-light">Pro</span></h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* User Profile Snippet */}
        {user && (
          <div className="p-6 pb-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border border-brand-gold/50" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center text-brand-gold font-bold">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.displayName || 'User'}</p>
                <p className="text-xs text-brand-gold truncate">Premium Member</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-brand-600">
          
          <div className="mb-6">
             <button 
                onClick={onNewSession}
                className="w-full flex items-center gap-3 px-3 py-3 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 rounded-lg transition-colors border border-brand-accent/20"
             >
               <Plus size={18} />
               <span className="font-medium text-sm">New Conversation</span>
             </button>
          </div>

          {sessions.length > 0 && (
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">History</h3>
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div 
                    key={session.id} 
                    onClick={() => onSelectSession(session.id)}
                    className={`
                      group flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors
                      ${session.id === currentSessionId ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                    `}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <MessageSquare size={14} className={session.id === currentSessionId ? 'text-brand-gold' : 'text-slate-600'} />
                      <span className="truncate max-w-[140px]">{session.title}</span>
                    </div>
                    <button 
                      onClick={(e) => onDeleteSession(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-1"
                      title="Delete chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Exclusive Features</h3>
            <div className="space-y-1">
              {features.slice(0, 5).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-brand-accent hover:bg-white/5 rounded-lg transition-colors cursor-default group">
                  <feat.icon size={16} className="text-slate-500 group-hover:text-brand-accent transition-colors" />
                  <span>{feat.label}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>

        <div className="p-4 border-t border-white/5 space-y-2">
           <div className="bg-gradient-to-r from-brand-gold/10 to-transparent p-3 rounded-lg border border-brand-gold/20 mb-2">
              <p className="text-xs text-brand-gold mb-1 font-semibold">Created by Akin S. Sokpah</p>
              <p className="text-[10px] text-slate-400">Liberia • Nimba County</p>
           </div>
          {onOpenSettings && (
            <button onClick={onOpenSettings} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:bg-white/5 rounded-lg transition-colors">
              <Settings size={16} />
              <span>Settings</span>
            </button>
          )}
          <button onClick={logoutUser} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-brand-900">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/40 via-brand-900 to-brand-900 z-0" />
        <div className="relative z-10 flex-1 flex flex-col h-full">
           {children}
        </div>
      </main>
    </div>
  );
};
