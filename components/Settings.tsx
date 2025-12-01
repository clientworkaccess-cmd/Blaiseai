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
    if (!password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      addToast('Password updated.', 'success');
      setPassword('');
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <Card title="Account Profile" description="Your personal information.">
            <div className="grid grid-cols-2 gap-6 mt-2">
                <div>
                    <label className="text-xs text-zinc-500 uppercase font-semibold">Email Address</label>
                    <div className="mt-1 text-white font-medium">{user?.email}</div>
                </div>
                <div>
                    <label className="text-xs text-zinc-500 uppercase font-semibold">User ID</label>
                    <div className="mt-1 text-white font-mono text-sm truncate">{user?.id}</div>
                </div>
            </div>
       </Card>

       <Card title="Security" description="Update your password.">
            <form onSubmit={handlePasswordUpdate} className="flex gap-4 items-end mt-2">
                <div className="flex-1">
                    <Input
                        id="new-password"
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
                <Button type="submit" isLoading={loading}>Update</Button>
            </form>
       </Card>
    </div>
  );
};