
import { createClient } from '@supabase/supabase-js';

// Real Supabase credentials
export const SUPABASE_URL = 'https://jufkihpszuolzsreecrs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZmtpaHBzenVvbHpzcmVlY3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcyNDEyMDIsImV4cCI6MjAyMjgxNzIwMn0.Y01Qh1lN7HjzeVapI1IZxqJXU5lglF_vrpW3W6RXtEg';

// Create a more resilient fetch function with timeout and retries
const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  // Maximum number of retries
  const MAX_RETRIES = 3;
  let retries = 0;
  let lastError;

  while (retries < MAX_RETRIES) {
    try {
      const controller = new AbortController();
      // Set a timeout of 10 seconds
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // Merge the signal from AbortController with any existing init options
      const fetchOptions = {
        ...init,
        signal: controller.signal,
        // Don't include credentials for cross-origin requests to avoid CORS issues
        mode: 'cors' as RequestMode
      };
      
      const response = await fetch(input, fetchOptions);
      clearTimeout(timeoutId);
      
      // If successful, return the response
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`Fetch attempt ${retries + 1} failed:`, error);
      retries++;
      
      // Wait before retrying (exponential backoff)
      if (retries < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** retries, 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // If all retries failed, throw the last error
  console.error('All fetch attempts failed:', lastError);
  throw lastError;
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
