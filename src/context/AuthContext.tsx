import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { AccountType } from '@/lib/account-types';

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
  
  // Demo mode helper function to get startup profile for demo startup user
  const getStartupProfile = () => {
    const demoStartup = supabase
      .from('startups')
      .select('*')
      .eq('id', 'demo-startup-1')
      .single();
    
    return demoStartup.data;
  };
  
  // Simplified fetchUserProfile function for demo mode
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // In our demo mode, check for investor profile first
      const { data: investorData, error: investorError } = await supabase
        .from('investors')
        .select('*')
        .eq('id', userId);

      if (!investorData || investorData.length === 0) {
        console.log('No investor profile found, checking for startup');
        
        // Try to find a startup profile
        const { data: startupData, error: startupError } = await supabase
          .from('startups')
          .select('*')
          .eq('id', userId);
          
        if (!startupData || startupData.length === 0) {
          console.log('No startup profile found either');
          throw new Error('No profile found');
        }
        
        // For demo purposes, create a profile from the startup data
        setProfile({
          id: startupData[0].id,
          name: startupData[0].name,
          email: 'startup@example.com', // Demo email
          accountType: 'startup',
          startupId: startupData[0].id
        });
        return;
      }

      // For demo, we have an investor profile
      setProfile({
        id: investorData[0].id,
        email: investorData[0].email,
        name: investorData[0].name,
        accountType: (investorData[0].account_type as AccountType) || 'individual',
        investmentFocus: investorData[0].investment_focus,
        investmentRange: investorData[0].investment_range,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    // Check for demo user in localStorage
    const demoUser = localStorage.getItem('demoUser');
    const demoProfile = localStorage.getItem('demoProfile');
    
    if (demoUser && demoProfile) {
      try {
        console.log('Found demo user in localStorage');
        setUser(JSON.parse(demoUser));
        setProfile(JSON.parse(demoProfile));
        setIsLoading(false);
      } catch (e) {
        console.error('Error parsing demo user:', e);
        setIsLoading(false);
      }
    } else {
      console.log('No demo user found, checking session');
      setIsLoading(false);
    }
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
      // For demo purposes, we'll just use the demo login
      // Find which demo account matches this email
      let demoType: AccountType = 'individual';
      
      if (email === DEMO_ACCOUNTS.startup.email) {
        demoType = 'startup';
      } else if (email === DEMO_ACCOUNTS.vc.email) {
        demoType = 'vc';
      }
      
      loginWithDemo(demoType);
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    // For demo, just log in as individual investor
    loginWithDemo('individual');
  };

  const register = async (userData: Omit<UserProfile, 'id'> & { password: string, accountType: AccountType }) => {
    // For demo, just log in as the selected account type
    loginWithDemo(userData.accountType);
  };

  const setAccountType = async (accountType: AccountType) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Update local profile
      setProfile(prev => prev ? { ...prev, accountType } : null);
      
      if (profile) {
        // Update localStorage
        localStorage.setItem('demoProfile', JSON.stringify({...profile, accountType}));
      }
      
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
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoProfile');
      setUser(null);
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
