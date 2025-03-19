import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { supabase, updateSupabaseClient, SUPABASE_URL, DEMO_INVESTOR } from '@/lib/supabase';
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
  loginWithDemo: () => void;
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
    console.log('Updating Supabase config with:', { url: url.substring(0, 10) + '...', keyLength: key.length });
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
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabaseClientRef.current
        .from('investors')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        console.log('Profile fetched successfully:', data);
        setProfile({
          id: data.id,
          email: data.email,
          name: data.name,
          investmentFocus: data.investment_focus,
          investmentRange: data.investment_range,
        });
      } else {
        console.log('No profile found for user');
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

  const loginWithDemo = () => {
    setIsLoading(true);
    
    const mockUser = {
      id: DEMO_INVESTOR.id,
      email: DEMO_INVESTOR.email,
      app_metadata: { provider: 'demo' },
      user_metadata: { name: DEMO_INVESTOR.name },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;
    
    setUser(mockUser);
    setProfile({
      id: DEMO_INVESTOR.id,
      email: DEMO_INVESTOR.email,
      name: DEMO_INVESTOR.name,
      investmentFocus: DEMO_INVESTOR.investment_focus,
      investmentRange: DEMO_INVESTOR.investment_range,
    });
    
    localStorage.setItem('demoUser', JSON.stringify(mockUser));
    localStorage.setItem('demoProfile', JSON.stringify({
      id: DEMO_INVESTOR.id,
      email: DEMO_INVESTOR.email,
      name: DEMO_INVESTOR.name,
      investmentFocus: DEMO_INVESTOR.investment_focus,
      investmentRange: DEMO_INVESTOR.investment_range,
    }));
    
    setIsLoading(false);
    toast.success('Logged in with demo account');
  };

  const login = async (email: string, password: string) => {
    if (!isConfigured) {
      toast.error('Authentication is not configured. Please set up Supabase credentials.');
      throw new Error('Authentication is not configured');
    }
    
    setIsLoading(true);
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('You are currently offline. Please check your internet connection.');
      }

      const loginPromise = supabaseClientRef.current.auth.signInWithPassword({
        email,
        password,
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Login timed out. Please try again.")), 15000);
      });
      
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        throw error;
      }

      toast.success('Logged in successfully');
    } catch (error: any) {
      console.error('Login failed:', error);
      
      let errorMessage = error.message || 'Failed to login';
      
      if (
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError') ||
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('offline') ||
        error.name === 'AbortError' ||
        (error.__isAuthError === true && error.status === 0) ||
        !navigator.onLine
      ) {
        errorMessage = 'Connection error. Please check your internet connection and try again.';
      } else if (error.status === 400 || error.status === 401) {
        errorMessage = 'Invalid email or password';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
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
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('You are currently offline. Please check your internet connection.');
      }

      console.log('Starting registration process for:', userData.email);
      
      const { data: authData, error: authError } = await supabaseClientRef.current.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (!authData?.user) {
        throw new Error('Registration failed - no user was returned');
      }

      console.log('Auth user created successfully with ID:', authData.user.id);

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
        console.error('Profile creation error:', profileError);
        toast.warning('Account created, but profile setup had an issue. Some features may be limited.');
      } else {
        console.log('Profile created successfully');
      }

      toast.success('Account created successfully');
    } catch (error: any) {
      console.error('Registration failed (outer catch):', error);
      
      let errorMessage = error.message || 'Failed to create account';
      
      if (errorMessage.includes(SUPABASE_URL)) {
        errorMessage = errorMessage.replace(SUPABASE_URL, '[Supabase URL]');
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!isConfigured) return;
    
    try {
      if (localStorage.getItem('demoUser')) {
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoProfile');
        setUser(null);
        setProfile(null);
        toast.success('Logged out of demo account');
        return;
      }
      
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
      loginWithDemo,
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
