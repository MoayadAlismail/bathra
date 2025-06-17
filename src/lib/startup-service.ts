import { supabase } from "./supabase";
import { Startup } from "./supabase";
import { StartupBasicInfo, StartupFilters } from "./startup-types";

export class StartupService {
  // Convert database Startup to our simplified StartupBasicInfo
  private static transformStartup(startup: Startup): StartupBasicInfo {
    return {
      id: startup.id.toString(),
      name: startup.startup_name || startup.name,
      industry: startup.industry,
      stage: startup.stage || "Unknown",
      description: startup.problem_solving,
      website: startup.website,
      founders: startup.founder_info,
      team_size: startup.team_size?.toString(),
      founded_date: startup.created_at,
      target_market: startup.problem_solving,
      problem_solved: startup.problem_solving,
      usp: startup.uniqueness,
      traction: startup.achievements,
      key_metrics: startup.achievements,
      previous_funding: startup.funding_already_raised?.toString(),
      funding_required: startup.capital_seeking?.toString(),
      valuation: startup.pre_money_valuation?.toString(),
      use_of_funds: startup.capital_seeking?.toString(),
      roadmap: startup.achievements,
      exit_strategy: startup.exit_strategy,
      status: startup.status,
      created_at: startup.created_at,
      image: startup.logo,
      business_model: "SaaS", // Default as this field doesn't exist in DB
      contact_email: startup.email,
      investment_terms: startup.investment_instrument,
      financials: startup.previous_financial_year_revenue?.toString(),
      market_analysis: startup.problem_solving,
      competition: startup.risks,
      video_url: startup.video_link,
      document_path: startup.pitch_deck,
    };
  }

  // Fetch all approved/vetted startups
  static async getVettedStartups(filters?: StartupFilters): Promise<{
    data: StartupBasicInfo[];
    error: string | null;
  }> {
    try {
      let query = supabase
        .from("startups")
        .select("*")
        .eq("status", "approved")
        .eq("verified", true)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.industry) {
        query = query.ilike("industry", `%${filters.industry}%`);
      }

      if (filters?.stage) {
        query = query.eq("stage", filters.stage);
      }

      if (filters?.searchTerm) {
        query = query.or(
          `startup_name.ilike.%${filters.searchTerm}%,name.ilike.%${filters.searchTerm}%,industry.ilike.%${filters.searchTerm}%,problem_solving.ilike.%${filters.searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        return { data: [], error: error.message };
      }

      const transformedData = (data || []).map(this.transformStartup);
      return { data: transformedData, error: null };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Fetch startups for dashboard (limited number)
  static async getDashboardStartups(limit: number = 6): Promise<{
    data: StartupBasicInfo[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("startups")
        .select("*")
        .eq("status", "approved")
        .eq("verified", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        return { data: [], error: error.message };
      }

      const transformedData = (data || []).map(this.transformStartup);
      return { data: transformedData, error: null };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get startup by ID
  static async getStartupById(id: string): Promise<{
    data: StartupBasicInfo | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("startups")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      const transformedData = data ? this.transformStartup(data) : null;
      return { data: transformedData, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get unique industries for filter options
  static async getIndustries(): Promise<{
    data: string[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("startups")
        .select("industry")
        .eq("status", "approved")
        .eq("verified", true);

      if (error) {
        return { data: [], error: error.message };
      }

      const industries = [
        ...new Set((data || []).map((item) => item.industry).filter(Boolean)),
      ];
      return { data: industries, error: null };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get unique stages for filter options
  static async getStages(): Promise<{
    data: string[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("startups")
        .select("stage")
        .eq("status", "approved")
        .eq("verified", true);

      if (error) {
        return { data: [], error: error.message };
      }

      const stages = [
        ...new Set((data || []).map((item) => item.stage).filter(Boolean)),
      ];
      return { data: stages, error: null };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
