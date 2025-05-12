
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

// Export specific table types for easier usage
export type Investor = Tables['investors'];
export type Startup = Tables['startups'];
export type SubscribedEmail = Tables['subscribed_emails'];

// Define specific response types to help with TypeScript safety
export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

// Helper types for filtering
export type DataFilter<T> = {
  [K in keyof T]?: T[K];
};

// Define helper functions to properly type the responses from our mock client
export const processStartupData = (data: any[]): Startup[] => {
  return data.filter((item): item is Startup => 
    typeof item.id === 'string' && 
    typeof item.name === 'string' && 
    typeof item.industry === 'string'
  );
};

export const processInvestorData = (data: any[]): Investor[] => {
  return data.filter((item): item is Investor => 
    typeof item.id === 'string' && 
    typeof item.email === 'string' &&
    typeof item.name === 'string'
  );
};

export const processEmailData = (data: any[]): SubscribedEmail[] => {
  return data.filter((item): item is SubscribedEmail => 
    typeof item.id === 'string' && 
    typeof item.email === 'string'
  );
};

// Helper function to get all subscribed emails
export const getAllSubscribedEmails = async (): Promise<SubscribedEmail[]> => {
  try {
    const { data, error } = await supabase
      .from('subscribed_emails')
      .select('*');
      
    if (error) throw error;
    return processEmailData(data || []);
  } catch (error) {
    console.error('Error fetching subscribed emails:', error);
    return [];
  }
};

// Helper function to subscribe a new email
export const subscribeEmail = async (email: string): Promise<{ success: boolean; message: string; }> => {
  try {
    // First, check if the email already exists
    const { data: existingEmails, error: checkError } = await supabase
      .from('subscribed_emails')
      .select('email')
      .eq('email', email);
    
    if (checkError) throw checkError;
    
    // If email already exists, don't add it again
    if (existingEmails && existingEmails.length > 0) {
      return { 
        success: false, 
        message: "This email is already subscribed to our updates." 
      };
    }
    
    // Insert the email into the subscribed_emails table
    const { error } = await supabase
      .from('subscribed_emails')
      .insert([{ email }]);
    
    if (error) throw error;
    
    return { 
      success: true, 
      message: "Thank you for subscribing. We'll notify you when we launch!" 
    };
  } catch (error: any) {
    console.error('Error subscribing email:', error);
    return { 
      success: false, 
      message: error.message || "Failed to subscribe. Please try again later." 
    };
  }
};
