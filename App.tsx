import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './hooks/useToast';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';

const AppContent: React.FC = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse">
                        <span className="font-bold text-white text-lg">B</span>
                    </div>
                    <div className="text-sm font-medium text-zinc-500 animate-pulse">Initializing System...</div>
                </div>
            </div>
        );
    }
    
    return session ? <Dashboard /> : <Auth />;
}

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;