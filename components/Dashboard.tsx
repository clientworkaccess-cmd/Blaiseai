import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { FileList } from './FileList';
import { Upload } from './Upload';
import { Refresh } from './Refresh';
import { Settings } from './Settings';
import { CompanyDetails } from './CompanyDetails';
import { Integration } from './Integration';

type NavItem = 'files' | 'upload' | 'companyProfile' | 'integration' | 'refresh' | 'settings';

const navigation = [
  { name: 'Knowledge Base', id: 'files', icon: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg> },
  { name: 'Upload Content', id: 'upload', icon: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg> },
  { name: 'Company Profile', id: 'companyProfile', icon: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg> },
  { name: 'Integrations', id: 'integration', icon: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg> },
  { name: 'Refresh Index', id: 'refresh', icon: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-11.667 0a8.25 8.25 0 0111.667 0l3.181 3.183M2.985 19.644l3.181-3.183m0 0a8.25 8.25 0 0111.667 0l3.181 3.183" /></svg> },
  { name: 'Settings', id: 'settings', icon: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.43.816 1.035.816 1.73 0 .695-.32 1.3-.816 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg> },
];

export const Dashboard: React.FC = () => {
  // Check if we are returning from a redirect (e.g. GitHub OAuth)
  const initialNav = new URLSearchParams(window.location.search).has('code') ? 'integration' : 'files';
  const [activeNav, setActiveNav] = useState<NavItem>(initialNav as NavItem);
  const { user, profile } = useAuth();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  const renderContent = () => {
    switch (activeNav) {
      case 'files': return <FileList />;
      case 'upload': return <Upload />;
      case 'companyProfile': return <CompanyDetails />;
      case 'integration': return <Integration />;
      case 'refresh': return <Refresh />;
      case 'settings': return <Settings />;
      default: return <FileList />;
    }
  };

  const getPageTitle = () => {
      const item = navigation.find(n => n.id === activeNav);
      return item ? item.name : 'Dashboard';
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r border-white/10 bg-zinc-900/40 backdrop-blur-xl relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <span className="font-bold text-white text-lg">B</span>
                </div>
                <span className="text-lg font-bold tracking-tight font-display">Blaise KB</span>
            </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">Main Menu</div>
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveNav(item.id as NavItem)}
                className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                  ${activeNav === item.id
                    ? 'bg-white/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border border-white/5'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon className={`h-5 w-5 mr-3 transition-colors ${activeNav === item.id ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                {item.name}
              </button>
            ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-zinc-900/50">
            <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-white border border-white/10">
                    {profile?.full_name ? profile.full_name[0].toUpperCase() : user?.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                        {profile?.full_name || user?.email}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">Administrator</p>
                </div>
            </div>
            <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center px-4 py-2 text-xs font-medium text-zinc-400 bg-white/5 hover:bg-white/10 hover:text-white rounded-md transition-colors border border-white/5"
            >
                Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-black relative">
        {/* Ambient background for main area */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-[-200px] left-[20%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Header */}
        <header className="h-16 flex-shrink-0 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-8 relative z-10">
            <h1 className="text-xl font-semibold text-white font-display">{getPageTitle()}</h1>
            <div className="flex items-center gap-4">
                <div className="flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                    System Online
                </div>
            </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 relative z-10">
            <div className="w-full max-w-[95%] xl:max-w-[1400px] mx-auto animate-fadeIn">
                {renderContent()}
            </div>
        </main>
      </div>
    </div>
  );
};