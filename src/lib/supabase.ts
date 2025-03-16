
import { createClient } from '@supabase/supabase-js';

// Try to get credentials from localStorage first, then fallback to env vars
const getSupabaseCredentials = () => {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_anon_key') : null;
  
  return {
    url: localUrl || import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co',
    key: localKey || import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'
  };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseCredentials();

// Create a Supabase client with better handling for missing configuration
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      fetch: (...args: Parameters<typeof fetch>) => fetch(...args)
    }
  }
);

// Log warning if using placeholder values
const isUsingPlaceholders = supabaseUrl === 'https://placeholder-url.supabase.co' || 
                           supabaseAnonKey === 'placeholder-key';

if (isUsingPlaceholders) {
  console.warn('Using placeholder Supabase credentials. Authentication and database operations will not work. Please configure Supabase credentials.');
}

// Function to create a new client with updated credentials
export const updateSupabaseClient = (url: string, key: string) => {
  // Return a new client instance with the updated credentials
  return createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      fetch: (...args: Parameters<typeof fetch>) => fetch(...args)
    }
  });
};

// Export the flag for checking if using placeholders
export const isSupabaseConfigured = !isUsingPlaceholders;

// Define database types to use with Supabase
export type Tables = {
  investors: {
    id: string;
    email: string;
    name: string;
    investment_focus: string;
    investment_range: string;
    created_at: string;
  };
  startups: {
    id: string;
    name: string;
    industry: string;
    stage: string;
    description: string;
    website: string;
    founders: string;
    team_size: string;
    founded_date: string;
    target_market: string;
    problem_solved: string;
    usp: string;
    traction: string;
    key_metrics: string;
    previous_funding: string;
    funding_required: string;
    valuation: string;
    use_of_funds: string;
    roadmap: string;
    exit_strategy: string;
    created_at: string;
    document_path?: string;
  };
}
