import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { FileList } from './FileList';
import { Upload } from './Upload';
import { Refresh } from './Refresh';
import { Settings } from './Settings';
import { CompanyDetails } from './CompanyDetails';

type NavItem = 'files' | 'upload' | 'companyProfile' | 'refresh' | 'settings';

const navigation = [
  { name: 'Files', id: 'files', icon: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" /></svg> },
  { name: 'Upload', id: 'upload', icon: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg> },
  { name: 'Company Profile', id: 'companyProfile', icon: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18h16.5M4.5 3h15M5.25 4.5v16.5m13.5-16.5v16.5M9 6.75h6M9 11.25h6M9 15.75h6" /></svg> },
  { name: 'Refresh KB', id: 'refresh', icon: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-11.667 0a8.25 8.25 0 0111.667 0l3.181 3.183M2.985 19.644l3.181-3.183m0 0a8.25 8.25 0 0111.667 0l3.181 3.183" /></svg> },
  { name: 'Settings', id: 'settings', icon: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226.554-.22 1.196-.22 1.75 0 .554.22 1.02.684 1.11 1.226l.08 1.018c.27.09.52.21.74.35l.9.45c.52.26.88.78.91 1.35.03.57-.22 1.11-.64 1.48l-.7 1.41c-.18.36-.28.76-.28 1.17s.1 1.18.28 1.54l.7 1.41c.42.37.67.91.64 1.48-.03.57-.39 1.09-.91 1.35l-.9.45c-.22.14-.47.26-.74.35l-.08 1.018c-.09.542-.56 1.007-1.11 1.226-.554-.22-1.196-.22-1.75 0-.554-.22-1.02-.684-1.11-1.226l-.08-1.018c-.27-.09-.52-.21-.74-.35l-.9-.45c-.52-.26-.88-.78-.91-1.35-.03-.57.22-1.11.64-1.48l.7-1.41c.18-.36.28-.76.28-1.17s-.1-.81-.28-1.17l-.7-1.41c-.42-.37-.67-.91-.64-1.48.03-.57.39-1.09.91-1.35l.9-.45c.22-.14.47-.26.74.35l.08-1.018z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

export const Dashboard: React.FC = () => {
  const [activeNav, setActiveNav] = useState<NavItem>('files');
  const { user } = useAuth();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  const renderContent = () => {
    switch (activeNav) {
      case 'files':
        return <FileList />;
      case 'upload':
        return <Upload />;
      case 'companyProfile':
        return <CompanyDetails />;
      case 'refresh':
        return <Refresh />;
      case 'settings':
        return <Settings />;
      default:
        return <FileList />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col w-64 bg-gray-800">
        <div className="flex items-center justify-center h-16 bg-gray-900 text-white">
          <svg className="h-8 w-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
          </svg>
          <span className="ml-2 text-xl font-semibold">Blaise KB</span>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 bg-gray-800">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveNav(item.id as NavItem)}
                className={`flex items-center px-4 py-2 mt-2 text-sm font-semibold rounded-lg w-full text-left
                  ${activeNav === item.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <item.icon className="h-6 w-6 mr-3" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-700">
            <div className="text-sm text-gray-400 truncate">{user?.email}</div>
            <button onClick={handleLogout} className="w-full mt-2 text-left flex items-center px-4 py-2 text-sm font-semibold text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white">
                <svg className="h-6 w-6 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                Logout
            </button>
        </div>
      </div>
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};