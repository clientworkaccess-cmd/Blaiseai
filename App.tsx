import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './hooks/useToast';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';

const AppContent: React.FC = () => {
    const { session } = useAuth();
    // Directly render content based on session availability
    // This removes the "Initializing System" loader and prevents getting stuck on a loading screen
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