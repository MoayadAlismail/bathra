
import { createClient } from '@supabase/supabase-js';

// Real Supabase credentials
export const SUPABASE_URL = 'https://jufkihpszuolzsreecrs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZmtpaHBzenVvbHpzcmVlY3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcyNDEyMDIsImV4cCI6MjAyMjgxNzIwMn0.Y01Qh1lN7HjzeVapI1IZxqJXU5lglF_vrpW3W6RXtEg';

// Create the Supabase client directly with robust configuration
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      fetch: fetch,
      headers: {
        'X-Client-Info': 'supabase-js-client',
      }
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 5
      }
    }
  }
);

// Function to create a new client with updated credentials
export const updateSupabaseClient = (url: string, key: string) => {
  console.log(`Creating new Supabase client with URL: ${url.substring(0, 15)}... and key: ${key.substring(0, 5)}...`);
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      fetch: fetch,
      headers: {
        'X-Client-Info': 'supabase-js-client',
      }
    }
  });
};

// Set isSupabaseConfigured to true since we're using hardcoded credentials
export const isSupabaseConfigured = true;

// Define sample investor profile for demo account
export const DEMO_INVESTOR = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  name: 'Demo Investor',
  investment_focus: 'Technology',
  investment_range: '$50K - $200K (Angel)',
};

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
