
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  loginWithGoogle: () => Promise<void>;
  loginWithDemo: () => void;
  register: (userData: Omit<InvestorProfile, 'id'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isConfigured: boolean;
  updateSupabaseConfig: (url: string, key: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo investor for testing purposes
const DEMO_INVESTOR = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  name: 'Demo Investor',
  investment_focus: 'Technology',
  investment_range: '$50K - $200K (Angel)',
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const supabaseClientRef = useRef<SupabaseClient>(supabase);
  
  const updateSupabaseConfig = (url: string, key: string) => {
    console.log('Updating Supabase config with:', { url: url.substring(0, 10) + '...', keyLength: key.length });
    
    // Create a new client with the provided credentials
    const newClient = supabase;
    supabaseClientRef.current = newClient;
    
    // Check if the session exists
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
        console.log('No profile found for user, checking metadata for profile creation');
        
        // Try to create a profile from user metadata if it doesn't exist
        const { data: { user } } = await supabaseClientRef.current.auth.getUser();
        
        if (user?.user_metadata?.name) {
          const newProfile = {
            id: userId,
            email: user.email || '',
            name: user.user_metadata.name || '',
            investmentFocus: user.user_metadata.investment_focus || '',
            investmentRange: user.user_metadata.investment_range || '',
          };
          
          console.log('Creating new profile from metadata:', newProfile);
          
          const { error: insertError } = await supabaseClientRef.current
            .from('investors')
            .insert({
              id: userId,
              email: user.email || '',
              name: user.user_metadata.name || '',
              investment_focus: user.user_metadata.investment_focus || '',
              investment_range: user.user_metadata.investment_range || '',
            });
            
          if (insertError) {
            console.error('Error creating profile from metadata:', insertError);
          } else {
            setProfile(newProfile);
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
        const { data, error } = await supabaseClientRef.current.auth.getSession();
        
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
    const { data: { subscription } } = supabaseClientRef.current.auth.onAuthStateChange(async (event, session) => {
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
    if (!isConfigured) {
      toast.error('Authentication is not configured. Please set up Supabase credentials.');
      throw new Error('Authentication is not configured');
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClientRef.current.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
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

  const register = async (userData: Omit<InvestorProfile, 'id'> & { password: string }) => {
    if (!isConfigured) {
      toast.error('Authentication is not configured. Please set up Supabase credentials.');
      throw new Error('Authentication is not configured');
    }
    
    setIsLoading(true);
    
    try {
      console.log('Starting registration process for:', userData.email);
      
      // Add additional logging to track the registration process
      console.log('Calling Supabase auth.signUp...');
      
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
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (!authData?.user) {
        throw new Error('Registration failed - no user was returned');
      }

      console.log('Auth user created successfully with ID:', authData.user.id);

      // Create investor profile in the database
      console.log('Creating investor profile in database...');
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
      loginWithGoogle,
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
