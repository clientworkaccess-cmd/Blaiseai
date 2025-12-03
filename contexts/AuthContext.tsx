import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { AuthContextType, UserProfile } from '../types';

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.warn('Error fetching profile:', error.message);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            }
        } catch (error) {
            console.error('Error getting session:', error);
        } finally {
            if (mounted) setLoading(false);
        }
    }
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
            await fetchProfile(session.user.id);
        } else {
            setProfile(null);
        }
        
        // Ensure loading is set to false for auth state changes
        if (_event !== 'INITIAL_SESSION') {
             setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]); 

  const refreshProfile = async () => {
    if (user) {
        await fetchProfile(user.id);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};