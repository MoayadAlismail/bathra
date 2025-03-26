
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

type AccountType = 'startup' | 'individual' | 'vc';

type UserProfile = {
  id: string;
  email: string;
  name: string;
  accountType: AccountType;
  investmentFocus?: string;
  investmentRange?: string;
  startupId?: string;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithDemo: (type: AccountType) => void;
  register: (userData: Omit<UserProfile, 'id'> & { password: string, accountType: AccountType }) => Promise<void>;
  logout: () => Promise<void>;
  setAccountType: (accountType: AccountType) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts for testing purposes
const DEMO_ACCOUNTS = {
  investor: {
    id: 'demo-investor-id',
    email: 'demo@investor.com',
    name: 'Demo Investor',
    accountType: 'individual' as AccountType,
    investmentFocus: 'Technology',
    investmentRange: '$50K - $200K (Angel)',
  },
  vc: {
    id: 'demo-vc-id',
    email: 'demo@vc.com',
    name: 'Demo VC Fund',
    accountType: 'vc' as AccountType,
    investmentFocus: 'CleanTech, HealthTech',
    investmentRange: '$1M+ (Series B+)',
  },
  startup: {
    id: 'demo-startup-id',
    email: 'demo@startup.com',
    name: 'Demo Startup',
    accountType: 'startup' as AccountType,
    startupId: 'demo-startup-1',
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
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
          accountType: (data.account_type as AccountType) || 'individual',
          investmentFocus: data.investment_focus,
          investmentRange: data.investment_range,
        });
      } else {
        console.log('No profile found for user, checking metadata for profile creation');
        
        // Try to create a profile from user metadata if it doesn't exist
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.user_metadata?.name) {
          const accountType = (user.user_metadata.accountType || 'individual') as AccountType;
          
          const newProfile: UserProfile = {
            id: userId,
            email: user.email || '',
            name: user.user_metadata.name || '',
            accountType,
            investmentFocus: user.user_metadata.investmentFocus || '',
            investmentRange: user.user_metadata.investmentRange || '',
            startupId: user.user_metadata.startupId || '',
          };
          
          console.log('Creating new profile from metadata:', newProfile);
          setProfile(newProfile);
          
          // Store in database if required
          const { error: insertError } = await supabase
            .from('investors')
            .insert({
              id: userId,
              email: user.email || '',
              name: user.user_metadata.name || '',
              investment_focus: user.user_metadata.investmentFocus || '',
              investment_range: user.user_metadata.investmentRange || '',
              account_type: accountType,
            });
            
          if (insertError) {
            console.error('Error creating profile from metadata:', insertError);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        console.log('Initializing session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session fetch error:', error);
          setIsLoading(false);
          return;
        }
        
        // Handle the case where we have a session but no user in state
        if (data.session?.user) {
          console.log('Found existing session with user:', data.session.user.id);
          setUser(data.session.user);
          await fetchUserProfile(data.session.user.id);
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check for demo user in localStorage
    const demoUser = localStorage.getItem('demoUser');
    const demoProfile = localStorage.getItem('demoProfile');
    
    if (demoUser && demoProfile) {
      try {
        setUser(JSON.parse(demoUser));
        setProfile(JSON.parse(demoProfile));
        setIsLoading(false);
      } catch (e) {
        console.error('Error parsing demo user:', e);
        initSession();
      }
    } else {
      initSession();
    }

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithDemo = (type: AccountType = 'individual') => {
    setIsLoading(true);
    
    let demoAccount;
    switch(type) {
      case 'vc':
        demoAccount = DEMO_ACCOUNTS.vc;
        break;
      case 'startup':
        demoAccount = DEMO_ACCOUNTS.startup;
        break;
      case 'individual':
      default:
        demoAccount = DEMO_ACCOUNTS.investor;
        break;
    }
    
    const mockUser = {
      id: demoAccount.id,
      email: demoAccount.email,
      app_metadata: { provider: 'demo' },
      user_metadata: { 
        name: demoAccount.name,
        accountType: demoAccount.accountType,
        startupId: demoAccount.startupId
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;
    
    setUser(mockUser);
    setProfile(demoAccount);
    
    localStorage.setItem('demoUser', JSON.stringify(mockUser));
    localStorage.setItem('demoProfile', JSON.stringify(demoAccount));
    
    setIsLoading(false);
    toast.success(`Logged in as demo ${demoAccount.accountType}`);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
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
      
      let errorMessage = error.message || 'Failed to login';
      
      if (
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError') ||
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('offline') ||
        error.name === 'AbortError' ||
        (error.__isAuthError === true && error.status === 0)
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

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account-type`,
        }
      });

      if (error) {
        throw error;
      }

      // Success will be handled when the user returns to the site
    } catch (error: any) {
      console.error('Google login failed:', error);
      
      let errorMessage = error.message || 'Failed to login with Google';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<UserProfile, 'id'> & { password: string, accountType: AccountType }) => {
    setIsLoading(true);
    
    try {
      console.log('Starting registration process for:', userData.email);
      
      // Add additional logging to track the registration process
      console.log('Calling Supabase auth.signUp...');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            accountType: userData.accountType,
            investmentFocus: userData.investmentFocus,
            investmentRange: userData.investmentRange,
            startupId: userData.startupId
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (!authData?.user) {
        throw new Error('Registration failed - no user was returned');
      }

      console.log('Auth user created successfully with ID:', authData.user.id);

      // Create investor profile in the database
      console.log('Creating investor profile in database...');
      const { error: profileError } = await supabase
        .from('investors')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          investment_focus: userData.investmentFocus,
          investment_range: userData.investmentRange,
          account_type: userData.accountType
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
      
      // Provide more specific error messages for connection issues
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('NetworkError') ||
          error.message?.includes('network error') ||
          error.message?.includes('timeout') ||
          error.message?.includes('connection') ||
          error.status === 0) {
        errorMessage = 'Connection to server failed. Please check your internet connection and try again.';
      } else if (error.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Please try logging in instead.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setAccountType = async (accountType: AccountType) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { accountType }
      });
      
      if (error) throw error;
      
      // Update local profile
      setProfile(prev => prev ? { ...prev, accountType } : null);
      
      // Update user in database if applicable
      await supabase
        .from('investors')
        .update({ account_type: accountType })
        .eq('id', user.id);
      
      toast.success(`Account type set to ${accountType}`);
    } catch (error) {
      console.error('Error setting account type:', error);
      toast.error('Failed to update account type');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('demoUser')) {
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoProfile');
        setUser(null);
        setProfile(null);
        toast.success('Logged out of demo account');
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
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      isLoading, 
      login, 
      loginWithGoogle,
      loginWithDemo,
      register, 
      logout,
      setAccountType
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
