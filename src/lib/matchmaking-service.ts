import { supabase } from "./supabase";
import { Matchmaking } from "./supabase";

export interface CreateMatchmakingRequest {
  investorId: string;
  investorName: string;
  investorEmail: string;
  startups: {
    id: string;
    name: string;
    email: string;
    comment?: string;
  }[];
  adminId: string;
  expiryDays?: number;
}

export interface MatchmakingResponse {
  data: Matchmaking[] | null;
  error: string | null;
}

export class MatchmakingService {
  // Create multiple matchmaking records for one investor and multiple startups
  static async createMatchmakings(
    request: CreateMatchmakingRequest
  ): Promise<MatchmakingResponse> {
    try {
      if (request.startups.length === 0) {
        return { data: null, error: "At least one startup must be selected" };
      }

      if (request.startups.length > 3) {
        return { data: null, error: "Maximum 3 startups can be selected" };
      }

      // Calculate expiry date (default 7 days)
      const expiryDays = request.expiryDays || 7;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      // Create matchmaking records for each startup
      const matchmakingRecords = request.startups.map((startup) => ({
        investor_id: request.investorId,
        investor_name: request.investorName,
        investor_email: request.investorEmail,
        startup_id: startup.id,
        startup_name: startup.name,
        startup_email: startup.email,
        expiry_date: expiryDate.toISOString(),
        is_interested: false,
        is_archived: false,
        matched_by: request.adminId,
        comment: startup.comment || null,
      }));

      const { data, error } = await supabase
        .from("matchmakings")
        .insert(matchmakingRecords)
        .select();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get all matchmakings for an investor
  static async getMatchmakingsByInvestor(
    investorId: string
  ): Promise<MatchmakingResponse> {
    try {
      const { data, error } = await supabase
        .from("matchmakings")
        .select("*")
        .eq("investor_id", investorId)
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get all matchmakings for a startup
  static async getMatchmakingsByStartup(
    startupId: string
  ): Promise<MatchmakingResponse> {
    try {
      const { data, error } = await supabase
        .from("matchmakings")
        .select("*")
        .eq("startup_id", startupId)
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get all matchmakings (for admin)
  static async getAllMatchmakings(): Promise<MatchmakingResponse> {
    try {
      const { data, error } = await supabase
        .from("matchmakings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Update matchmaking status (interested/not interested)
  static async updateMatchmakingStatus(
    matchmakingId: string,
    isInterested: boolean
  ): Promise<{ data: Matchmaking | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("matchmakings")
        .update({ is_interested: isInterested })
        .eq("id", matchmakingId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || null, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Archive matchmaking
  static async archiveMatchmaking(
    matchmakingId: string
  ): Promise<{ data: Matchmaking | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("matchmakings")
        .update({ is_archived: true })
        .eq("id", matchmakingId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || null, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Delete matchmaking
  static async deleteMatchmaking(
    matchmakingId: string
  ): Promise<{ data: null; error: string | null }> {
    try {
      const { error } = await supabase
        .from("matchmakings")
        .delete()
        .eq("id", matchmakingId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
