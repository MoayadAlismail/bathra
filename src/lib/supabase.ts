
import { createClient } from '@supabase/supabase-js';
import { supabase as defaultClient } from "@/integrations/supabase/client";

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
      headers: {
        'X-Client-Info': 'supabase-js-client',
      }
    }
  });
};

// Use the client from integrations for consistency
export const supabase = defaultClient;

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
