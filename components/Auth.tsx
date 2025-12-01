import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useToast } from '../hooks/useToast';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
        
      if (error) throw error;
      if (!isLogin) addToast('Check email for confirmation.', 'info');
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="w-full max-w-md p-8 relative z-10">
        <div className="mb-10 text-center">
            <div className="h-12 w-12 mx-auto bg-white rounded-xl flex items-center justify-center mb-6 shadow-glow">
                <span className="text-2xl font-bold text-black">B</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-display tracking-tight">
                {isLogin ? 'Sign in to Blaise' : 'Create your account'}
            </h2>
            <p className="mt-2 text-zinc-400">
                {isLogin ? 'Welcome back, admin.' : 'Get started with your knowledge base.'}
            </p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
            <form onSubmit={handleAuth} className="space-y-5">
                <Input
                    id="email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                />
                <Input
                    id="password"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                />
                <Button type="submit" isLoading={loading} className="w-full" variant="primary">
                    {isLogin ? 'Sign In' : 'Sign Up'}
                </Button>
            </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-white hover:underline font-medium">
                {isLogin ? 'Sign up' : 'Log in'}
            </button>
        </p>
      </div>
    </div>
  );
};