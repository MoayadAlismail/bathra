
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
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
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<InvestorProfile, 'id'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  // Check if we're in demo mode
  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setIsDemo(true);
    }
  }, []);

  // Check for user session on initial load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

  // Fetch the user's profile data from the database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
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

  // Login with Supabase
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (isDemo) {
        // Demo mode login
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
        
        // Create a mock user and profile
        const mockUser = {
          id: 'demo-user-' + Date.now(),
          email: email,
        } as User;
        
        setUser(mockUser);
        setProfile({
          id: mockUser.id,
          email: email,
          name: 'Demo User',
          investmentFocus: 'Technology',
          investmentRange: '$50K - $200K (Angel)',
        });
        
        toast.success('Logged in successfully (Demo Mode)');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Logged in successfully');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Failed to login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register with Supabase
  const register = async (userData: Omit<InvestorProfile, 'id'> & { password: string }) => {
    setIsLoading(true);
    try {
      if (isDemo) {
        // Demo mode registration
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        // Create a mock user and profile
        const mockUser = {
          id: 'demo-user-' + Date.now(),
          email: userData.email,
        } as User;
        
        setUser(mockUser);
        setProfile({
          id: mockUser.id,
          email: userData.email,
          name: userData.name,
          investmentFocus: userData.investmentFocus,
          investmentRange: userData.investmentRange,
        });
        
        toast.success('Account created successfully (Demo Mode)');
        return;
      }
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Registration failed');
      }

      // Store additional user data in the database
      const { error: profileError } = await supabase
        .from('investors')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          investment_focus: userData.investmentFocus,
          investment_range: userData.investmentRange,
        });

      if (profileError) {
        throw profileError;
      }

      toast.success('Account created successfully');
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout with Supabase
  const logout = async () => {
    try {
      if (isDemo) {
        // Demo mode logout
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setUser(null);
        setProfile(null);
        toast.success('Logged out successfully (Demo Mode)');
        return;
      }
      
      const { error } = await supabase.auth.signOut();
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
    <AuthContext.Provider value={{ user, profile, isLoading, isDemo, login, register, logout }}>
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
