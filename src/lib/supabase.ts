import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials
// IMPORTANT: Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://your-actual-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-actual-anon-key';

// Create a Supabase client with the hardcoded credentials
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
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

// Function to create a new client with updated credentials (kept for compatibility)
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
