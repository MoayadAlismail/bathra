
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { supabase, updateSupabaseClient, SUPABASE_URL } from '@/lib/supabase';
import { User, SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

type InvestorProfile = {
  id: string;
  email: string;
  name: string;
  investmentFocus: string;
  investmentRange: string;
};

type AuthContextType = {
  user: User | null;
  profile: InvestorProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<InvestorProfile, 'id'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isConfigured: boolean;
  updateSupabaseConfig: (url: string, key: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const supabaseClientRef = useRef<SupabaseClient>(supabase);
  
  const updateSupabaseConfig = (url: string, key: string) => {
    supabaseClientRef.current = updateSupabaseClient(url, key);
    
    supabaseClientRef.current.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    }).catch(error => {
      console.error('Session fetch error:', error);
    });
  };

  const fetchUserProfile = async (userId: string) => {
    if (!isConfigured) return;
    
    try {
      const { data, error } = await supabaseClientRef.current
        .from('investors')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          name: data.name,
          investmentFocus: data.investment_focus,
          investmentRange: data.investment_range,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data, error } = await supabaseClientRef.current.auth.getSession();
        
        if (error) {
          console.error('Session fetch error:', error);
          setIsLoading(false);
          return;
        }
        
        setUser(data.session?.user || null);
        if (data.session?.user) {
          fetchUserProfile(data.session.user.id);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initSession();

    const { data: { subscription } } = supabaseClientRef.current.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!isConfigured) {
      toast.error('Authentication is not configured. Please set up Supabase credentials.');
      throw new Error('Authentication is not configured');
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClientRef.current.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Logged in successfully');
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.message === 'Failed to fetch') {
        toast.error('Connection error. Please check your internet connection or try again later.');
      } else {
        toast.error(error.message || 'Failed to login');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<InvestorProfile, 'id'> & { password: string }) => {
    if (!isConfigured) {
      toast.error('Authentication is not configured. Please set up Supabase credentials.');
      throw new Error('Authentication is not configured');
    }
    
    setIsLoading(true);
    
    try {
      // Skip the health check and directly try to register the user
      // The customFetch in the Supabase client will handle retries and timeouts
      const { data: authData, error: authError } = await supabaseClientRef.current.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            investment_focus: userData.investmentFocus,
            investment_range: userData.investmentRange,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Registration failed');
      }

      const { error: profileError } = await supabaseClientRef.current
        .from('investors')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          investment_focus: userData.investmentFocus,
          investment_range: userData.investmentRange,
        });

      if (profileError) {
        console.warn('Profile creation had an issue, but user was created:', profileError);
      }

      toast.success('Account created successfully');
    } catch (error: any) {
      console.error('Registration failed:', error);
      if (error.message && (
          error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('network') ||
          error.message.includes('timeout')
        )) {
        toast.error('Connection error. Please check your internet connection or try again later.');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!isConfigured) return;
    
    try {
      const { error } = await supabaseClientRef.current.auth.signOut();
      if (error) {
        throw error;
      }
      setProfile(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast.error(error.message || 'Failed to logout');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      isLoading, 
      login, 
      register, 
      logout, 
      isConfigured,
      updateSupabaseConfig
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
