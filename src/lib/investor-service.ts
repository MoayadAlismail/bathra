import { supabase } from "./supabase";
import { Investor } from "./supabase";
import {
  InvestorBasicInfo,
  AdminInvestorInfo,
  InvestorFilters,
  PaginatedInvestors,
} from "./investor-types";

export class InvestorService {
  // Convert database Investor to our simplified InvestorBasicInfo for regular users
  private static transformInvestor(investor: Investor): InvestorBasicInfo {
    return {
      id: investor.id.toString(),
      name: investor.name,
      preferred_industries: investor.preferred_industries || "",
      preferred_company_stage: investor.preferred_company_stage || "",
      average_ticket_size: investor.average_ticket_size || "",
      company: investor.company,
      role: investor.role,
      city: investor.city,
      country: investor.country,
      number_of_investments: investor.number_of_investments,
      verified: investor.verified,
    };
  }

  // Convert database Investor to AdminInvestorInfo with all fields for admin views
  private static transformInvestorForAdmin(
    investor: Investor
  ): AdminInvestorInfo {
    return {
      // Include all basic info
      ...this.transformInvestor(investor),

      // Add admin-specific fields
      email: investor.email,
      phone: investor.phone,
      birthday: investor.birthday,
      linkedin_profile: investor.linkedin_profile,
      other_social_media_profile: investor.other_social_media_profile
        ? typeof investor.other_social_media_profile === "string"
          ? JSON.parse(investor.other_social_media_profile)
          : investor.other_social_media_profile
        : [],
      heard_about_us: investor.heard_about_us,
      secured_lead_investor: investor.secured_lead_investor,
      participated_as_advisor: investor.participated_as_advisor,
      strong_candidate_reason: investor.strong_candidate_reason,
      status: investor.status,
      visibility_status: investor.visibility_status,
      admin_notes: investor.admin_notes,
      verified_at: investor.verified_at,
      verified_by: investor.verified_by,
      created_at: investor.created_at,
      updated_at: investor.updated_at,
    };
  }

  // Fetch all approved/verified investors
  static async getVerifiedInvestors(filters?: InvestorFilters): Promise<{
    data: InvestorBasicInfo[];
    error: string | null;
  }> {
    try {
      let query = supabase
        .from("investors")
        .select("*")
        .eq("status", "approved")
        .eq("verified", true)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.industry) {
        query = query.ilike("preferred_industries", `%${filters.industry}%`);
      }

      if (filters?.stage) {
        query = query.eq("preferred_company_stage", filters.stage);
      }

      if (filters?.searchTerm) {
        query = query.or(
          `name.ilike.%${filters.searchTerm}%,company.ilike.%${filters.searchTerm}%,preferred_industries.ilike.%${filters.searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        return { data: [], error: error.message };
      }

      const transformedData = (data || []).map((investor) =>
        InvestorService.transformInvestor(investor)
      );
      return { data: transformedData, error: null };
    } catch (error) {
      return {
        data: [],
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
        .from("investors")
        .select("preferred_industries")
        .not("preferred_industries", "is", null);

      if (error) {
        return { data: [], error: error.message };
      }

      const industries = Array.from(
        new Set(
          data
            .map((item) => item.preferred_industries?.split(","))
            .flat()
            .filter((industry) => industry && industry.trim() !== "")
            .map((industry) => industry.trim())
        )
      );

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
        .from("investors")
        .select("preferred_company_stage")
        .not("preferred_company_stage", "is", null);

      if (error) {
        return { data: [], error: error.message };
      }

      const stages = Array.from(
        new Set(
          data
            .map((item) => item.preferred_company_stage)
            .filter((stage) => stage && stage.trim() !== "")
        )
      );

      return { data: stages, error: null };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Fetch ALL investors for admin use (not just verified/approved)
  static async getAllInvestors(filters?: InvestorFilters): Promise<{
    data: PaginatedInvestors<AdminInvestorInfo> | AdminInvestorInfo[];
    error: string | null;
  }> {
    try {
      // If no pagination parameters are provided, return all results (for backward compatibility)
      if (!filters?.limit && !filters?.offset) {
        let query = supabase
          .from("investors")
          .select("*")
          .order("created_at", { ascending: false });

        // Apply filters
        if (filters?.industry) {
          query = query.ilike("preferred_industries", `%${filters.industry}%`);
        }

        if (filters?.stage) {
          query = query.eq("preferred_company_stage", filters.stage);
        }

        if (filters?.searchTerm) {
          query = query.or(
            `name.ilike.%${filters.searchTerm}%,company.ilike.%${filters.searchTerm}%,preferred_industries.ilike.%${filters.searchTerm}%`
          );
        }

        const { data, error } = await query;

        if (error) {
          return { data: [], error: error.message };
        }

        const transformedData = (data || []).map((investor) =>
          InvestorService.transformInvestorForAdmin(investor)
        );
        return { data: transformedData, error: null };
      }

      // Paginated request
      const page = Math.max(
        1,
        Math.floor((filters?.offset || 0) / (filters?.limit || 10)) + 1
      );
      const limit = Math.min(50, Math.max(1, filters?.limit || 12));
      const offset = (page - 1) * limit;

      let query = supabase
        .from("investors")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters?.industry) {
        query = query.ilike("preferred_industries", `%${filters.industry}%`);
      }

      if (filters?.stage) {
        query = query.eq("preferred_company_stage", filters.stage);
      }

      if (filters?.searchTerm) {
        query = query.or(
          `name.ilike.%${filters.searchTerm}%,company.ilike.%${filters.searchTerm}%,preferred_industries.ilike.%${filters.searchTerm}%`
        );
      }

      const { data, error, count } = await query;

      if (error) {
        return { data: [], error: error.message };
      }

      const transformedData = (data || []).map((investor) =>
        InvestorService.transformInvestorForAdmin(investor)
      );

      const totalPages = Math.ceil((count || 0) / limit);

      const paginatedResult: PaginatedInvestors<AdminInvestorInfo> = {
        investors: transformedData,
        total: count || 0,
        page,
        limit,
        totalPages,
      };

      return { data: paginatedResult, error: null };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get investor by ID
  static async getInvestorById(id: string): Promise<{
    data: AdminInvestorInfo | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("investors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      const transformedData = data
        ? InvestorService.transformInvestorForAdmin(data)
        : null;
      return { data: transformedData, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
