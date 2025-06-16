import { supabase as defaultClient } from "@/integrations/supabase/client";

// Use the client from integrations directly
export const supabase = defaultClient;

// Set isSupabaseConfigured to true since we're using a mock client
export const isSupabaseConfigured = true;

// Define database types to use with Supabase
export type Tables = {
  investors: {
    id: string;
    // Basic Info
    name: string;
    email: string;
    phone: string;
    birthday: string;
    company?: string;
    role: string;
    country: string;
    city: string;

    // Investment Preferences
    preferred_industries?: string;
    preferred_company_stage?: string;

    // Social Media & Contact
    linkedin_profile?: string;
    other_social_media_profile?: string;

    // Background Info
    heard_about_us?: string;
    number_of_investments?: number;
    average_ticket_size?: string;
    secured_lead_investor?: boolean;
    participated_as_advisor?: boolean;
    strong_candidate_reason?: string;

    // Admin Management Fields
    verified: boolean;
    status: "pending" | "approved" | "rejected" | "flagged";
    visibility_status?: "featured" | "hot" | "normal";
    admin_notes?: string;
    verified_at?: string;
    verified_by?: string;

    // System fields
    created_at: string;
    updated_at?: string;
  };
  articles: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured_image_url?: string;
    category:
      | "news"
      | "industry_insights"
      | "startup_tips"
      | "investment_guide"
      | "company_updates"
      | "market_analysis"
      | "founder_stories"
      | "investor_spotlight";
    tags: string[];
    status: "draft" | "published" | "archived";
    author_id: string;
    author_name: string;
    published_at?: string;
    created_at: string;
    updated_at: string;
    views_count: number;
    is_featured: boolean;
    seo_title?: string;
    seo_description?: string;
  };
  startups: {
    id: string;

    // Basic Info
    logo?: string;
    name: string;
    founder_info: string;
    email: string;
    phone: string;
    startup_name: string;
    website?: string;
    industry: string;
    stage?: "Idea" | "MVP" | "Scaling";
    social_media_accounts?: string;

    // Problem & Solution
    problem_solving: string;
    solution: string;
    uniqueness: string;

    // Financial Information
    previous_financial_year_revenue?: number;
    current_financial_year_revenue?: number;
    has_received_funding?: boolean;
    monthly_burn_rate?: number;
    investment_instrument?:
      | "Equity"
      | "Convertible note"
      | "SAFE"
      | "Loan"
      | "Other"
      | "Undecided"
      | "Not interested in funding";
    capital_seeking?: number;
    pre_money_valuation?: number;
    funding_already_raised?: number;

    // Team & Resources
    team_size?: number;
    co_founders?: string;
    calendly_link?: string;
    video_link?: string;
    pitch_deck?: string;
    additional_files?: string;

    // Traction & Growth
    achievements?: string;
    risks?: string;
    risk_mitigation?: string;
    exit_strategy?:
      | "Competitor buyout"
      | "Company buyout"
      | "Shareholder/employee buyout"
      | "IPO/RPO";
    participated_in_accelerator?: boolean;

    // Admin Management Fields
    verified: boolean;
    status: "pending" | "approved" | "rejected" | "flagged";
    visibility_status?: "featured" | "hot" | "normal";
    admin_notes?: string;
    verified_at?: string;
    verified_by?: string;

    // System fields
    created_at: string;
    updated_at?: string;
  };
  admins: {
    id: string;
    email: string;
    name: string;
    admin_level: string;
    avatar?: string;
    phone_number?: string;
    location?: string;
    created_at: string;
    updated_at: string;
  };
  subscribed_emails: {
    id: string;
    email: string;
    created_at: string;
    user_id?: string;
  };
};

// Export specific table types for easier usage
export type Investor = Tables["investors"];
export type Startup = Tables["startups"];
export type Article = Tables["articles"];
export type Admin = Tables["admins"];
export type SubscribedEmail = Tables["subscribed_emails"];

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
export const processStartupData = (data: unknown[]): Startup[] => {
  return data.filter((item): item is Startup => {
    if (typeof item !== "object" || item === null) return false;
    const obj = item as Record<string, unknown>;
    return (
      typeof obj.id === "number" &&
      typeof obj.name === "string" &&
      typeof obj.industry === "string" &&
      typeof obj.founder_info === "string" &&
      typeof obj.email === "string" &&
      typeof obj.phone === "string" &&
      typeof obj.startup_name === "string" &&
      typeof obj.problem_solving === "string" &&
      typeof obj.solution === "string" &&
      typeof obj.uniqueness === "string"
    );
  });
};

export const processInvestorData = (data: unknown[]): Investor[] => {
  return data.filter((item): item is Investor => {
    if (typeof item !== "object" || item === null) return false;
    const obj = item as Record<string, unknown>;
    return (
      typeof obj.id === "number" &&
      typeof obj.email === "string" &&
      typeof obj.name === "string" &&
      typeof obj.phone === "string" &&
      typeof obj.birthday === "string" &&
      typeof obj.role === "string" &&
      typeof obj.country === "string" &&
      typeof obj.city === "string"
    );
  });
};

export const processAdminData = (data: unknown[]): Admin[] => {
  return data.filter((item): item is Admin => {
    if (typeof item !== "object" || item === null) return false;
    const obj = item as Record<string, unknown>;
    return (
      typeof obj.id === "string" &&
      typeof obj.email === "string" &&
      typeof obj.name === "string" &&
      typeof obj.admin_level === "string"
    );
  });
};

export const processEmailData = (data: unknown[]): SubscribedEmail[] => {
  return data.filter((item): item is SubscribedEmail => {
    if (typeof item !== "object" || item === null) return false;
    const obj = item as Record<string, unknown>;
    return typeof obj.id === "string" && typeof obj.email === "string";
  });
};

// Helper function to get all subscribed emails
export const getAllSubscribedEmails = async (): Promise<SubscribedEmail[]> => {
  try {
    const { data, error } = await supabase
      .from("subscribed_emails")
      .select("*");

    if (error) throw error;
    return processEmailData(data || []);
  } catch (error) {
    console.error("Error fetching subscribed emails:", error);
    return [];
  }
};

// Helper function to subscribe a new email
export const subscribeEmail = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // First, check if the email already exists
    const { data: existingEmails, error: checkError } = await supabase
      .from("subscribed_emails")
      .select("email")
      .eq("email", email);

    if (checkError) throw checkError;

    // If email already exists, don't add it again
    if (existingEmails && existingEmails.length > 0) {
      return {
        success: false,
        message: "This email is already subscribed to our updates.",
      };
    }

    // Insert the email into the subscribed_emails table
    const { error } = await supabase
      .from("subscribed_emails")
      .insert([{ email }]);

    if (error) throw error;

    return {
      success: true,
      message: "Thank you for subscribing. We'll notify you when we launch!",
    };
  } catch (error: unknown) {
    console.error("Error subscribing email:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to subscribe. Please try again later.";
    return {
      success: false,
      message: errorMessage,
    };
  }
};
