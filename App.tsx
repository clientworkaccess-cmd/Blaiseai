
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './hooks/useToast';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { FileList } from './components/FileList';
import { Upload } from './components/Upload';
import { Refresh } from './components/Refresh';
import { Settings } from './components/Settings';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/auth" />;
};

const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
      return <div className="h-screen w-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />}>
                <Route index element={<FileList />} />
                <Route path="upload" element={<Upload />} />
                <Route path="refresh" element={<Refresh />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
             <Route path="*" element={<Navigate to={user ? "/" : "/auth"} />} />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <HashRouter>
            <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
