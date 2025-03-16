
import { createClient } from '@supabase/supabase-js';

// Real Supabase credentials
const SUPABASE_URL = 'https://jufkihpszuolzsreecrs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZmtpaHBzenVvbHpzcmVlY3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcyNDEyMDIsImV4cCI6MjAyMjgxNzIwMn0.Y01Qh1lN7HjzeVapI1IZxqJXU5lglF_vrpW3W6RXtEg';

// Create a more resilient fetch function with timeout
const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
    
    // Merge the signal from AbortController with any existing init options
    const fetchOptions = {
      ...init,
      signal: controller.signal,
      credentials: 'include' as RequestCredentials
    };
    
    const response = await fetch(input, fetchOptions);
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Create a Supabase client with the credentials and improved fetch
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      fetch: customFetch
    }
  }
);

// Function to create a new client with updated credentials (kept for compatibility)
export const updateSupabaseClient = (url: string, key: string) => {
  return createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      fetch: customFetch
    }
  });
};

// Set isSupabaseConfigured to true since we're using hardcoded credentials
export const isSupabaseConfigured = true;

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
