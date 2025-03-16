
import { createClient } from '@supabase/supabase-js';

// Using environment variables for Supabase URL and key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
}

// Create a Supabase client with better network error handling
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      fetch: (...args) => fetch(...args)
    }
  }
);

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
