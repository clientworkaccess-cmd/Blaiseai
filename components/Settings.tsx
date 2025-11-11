
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { useToast } from '../hooks/useToast';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      addToast('Password cannot be empty.', 'error');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      addToast('Password updated successfully!', 'success');
      setPassword('');
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      
      <div className="mt-8 grid grid-cols-1 gap-y-6 lg:grid-cols-3 lg:gap-x-12">
        <div className="lg:col-span-1">
          <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
          <p className="mt-1 text-sm text-gray-500">View your account details and update your password.</p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <dl className="divide-y divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="flex-grow">{user?.email}</span>
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Last Sign In</dt>
                <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="flex-grow">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</span>
                </dd>
              </div>
            </dl>
          </Card>
          <Card className="mt-6">
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <h3 className="text-base font-medium text-gray-900">Update Password</h3>
              <Input
                id="new-password"
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a new password"
              />
              <div className="text-right">
                <Button type="submit" isLoading={loading}>Update Password</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-3 lg:gap-x-12">
            <div className="lg:col-span-1">
              <h2 className="text-lg font-medium text-gray-900">Integrations</h2>
              <p className="mt-1 text-sm text-gray-500">Manage API keys for external services (Placeholder).</p>
            </div>
            <div className="lg:col-span-2">
              <Card>
                <p className="text-sm text-gray-500">API key management will be available here in a future update.</p>
              </Card>
            </div>
          </div>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-3 lg:gap-x-12">
            <div className="lg:col-span-1">
              <h2 className="text-lg font-medium text-gray-900">Data Export</h2>
              <p className="mt-1 text-sm text-gray-500">Export your file metadata.</p>
            </div>
            <div className="lg:col-span-2">
              <Card>
                <Button variant="secondary">Export as CSV (Placeholder)</Button>
              </Card>
            </div>
          </div>
      </div>
    </div>
  );
};
