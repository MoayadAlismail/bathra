
import { supabase as defaultClient } from "@/integrations/supabase/client";

// Use the client from integrations directly
export const supabase = defaultClient;

// Set isSupabaseConfigured to true since we're using a mock client
export const isSupabaseConfigured = true;

// Define database types to use with Supabase
export type Tables = {
  investors: {
    id: string;
    email: string;
    name: string;
    investment_focus: string;
    investment_range: string;
    account_type: string;
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
    status: string;
    created_at: string;
    document_path?: string;
    image?: string;
  };
  subscribed_emails: {
    id: string;
    email: string;
    created_at: string;
  };
}
