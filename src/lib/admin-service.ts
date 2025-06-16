import { supabase } from "./supabase";
import { Investor, Startup } from "./supabase";

export type UserStatus = "pending" | "approved" | "rejected" | "flagged";
export type VisibilityStatus = "featured" | "hot" | "normal";
export type UserType = "investor" | "startup";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: UserType;
  verified: boolean;
  status: UserStatus;
  visibility_status?: VisibilityStatus;
  admin_notes?: string;
  verified_at?: string;
  verified_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface UpdateUserStatusData {
  status: UserStatus;
  visibility_status?: VisibilityStatus;
  admin_notes?: string;
  verified_by?: string;
}

export interface UpdateUserProfileData {
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

class AdminService {
  private static instance: AdminService;

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // Get all users (both investors and startups) with filtering
  async getAllUsers(filters?: {
    type?: UserType;
    status?: UserStatus;
    verified?: boolean;
    search?: string;
  }): Promise<{ data: AdminUser[]; error: string | null }> {
    try {
      const users: AdminUser[] = [];

      // Get investors
      if (!filters?.type || filters.type === "investor") {
        const { data: investors, error: investorError } = await supabase
          .from("investors")
          .select("*");

        if (investorError) {
          return { data: [], error: investorError.message };
        }

        if (investors) {
          const investorUsers = investors.map((investor: Investor) => ({
            id: investor.id,
            name: investor.name,
            email: investor.email,
            phone: investor.phone,
            type: "investor" as UserType,
            verified: investor.verified || false,
            status: (investor.status as UserStatus) || "pending",
            visibility_status: investor.visibility_status as VisibilityStatus,
            admin_notes: investor.admin_notes,
            verified_at: investor.verified_at,
            verified_by: investor.verified_by,
            created_at: investor.created_at,
            updated_at: investor.updated_at,
          }));
          users.push(...investorUsers);
        }
      }

      // Get startups
      if (!filters?.type || filters.type === "startup") {
        const { data: startups, error: startupError } = await supabase
          .from("startups")
          .select("*");

        if (startupError) {
          return { data: [], error: startupError.message };
        }

        if (startups) {
          const startupUsers = startups.map((startup: Startup) => ({
            id: startup.id,
            name: startup.name,
            email: startup.email,
            phone: startup.phone,
            type: "startup" as UserType,
            verified: startup.verified || false,
            status: (startup.status as UserStatus) || "pending",
            visibility_status: startup.visibility_status as VisibilityStatus,
            admin_notes: startup.admin_notes,
            verified_at: startup.verified_at,
            verified_by: startup.verified_by,
            created_at: startup.created_at,
            updated_at: startup.updated_at,
          }));
          users.push(...startupUsers);
        }
      }

      // Apply filters
      let filteredUsers = users;

      if (filters?.status) {
        filteredUsers = filteredUsers.filter(
          (user) => user.status === filters.status
        );
      }

      if (filters?.verified !== undefined) {
        filteredUsers = filteredUsers.filter(
          (user) => user.verified === filters.verified
        );
      }

      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
      }

      // Sort by created_at (newest first)
      filteredUsers.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return { data: filteredUsers, error: null };
    } catch (error) {
      return { data: [], error: (error as Error).message };
    }
  }

  // Get user details by ID and type
  async getUserDetails(
    userId: string,
    userType: UserType
  ): Promise<{ data: any; error: string | null }> {
    try {
      const tableName = userType === "investor" ? "investors" : "startups";
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Update user status (approve, reject, flag)
  async updateUserStatus(
    userId: string,
    userType: UserType,
    statusData: UpdateUserStatusData
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const tableName = userType === "investor" ? "investors" : "startups";
      const updateData: any = {
        status: statusData.status,
        verified: statusData.status === "approved",
        updated_at: new Date().toISOString(),
      };

      if (statusData.status === "approved") {
        updateData.verified_at = new Date().toISOString();
        updateData.verified_by = statusData.verified_by;
      }

      if (statusData.visibility_status) {
        updateData.visibility_status = statusData.visibility_status;
      }

      if (statusData.admin_notes) {
        updateData.admin_notes = statusData.admin_notes;
      }

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq("id", userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Update user profile
  async updateUserProfile(
    userId: string,
    userType: UserType,
    profileData: UpdateUserProfileData
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const tableName = userType === "investor" ? "investors" : "startups";
      const updateData = {
        ...profileData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq("id", userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Delete user
  async deleteUser(
    userId: string,
    userType: UserType
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const tableName = userType === "investor" ? "investors" : "startups";
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<{
    data: {
      totalStartups: number;
      totalInvestors: number;
      pendingApprovals: number;
      approvedUsers: number;
      rejectedUsers: number;
      flaggedUsers: number;
    };
    error: string | null;
  }> {
    try {
      // Get startup counts
      const { data: startups, error: startupError } = await supabase
        .from("startups")
        .select("status, verified");

      if (startupError) {
        return {
          data: {
            totalStartups: 0,
            totalInvestors: 0,
            pendingApprovals: 0,
            approvedUsers: 0,
            rejectedUsers: 0,
            flaggedUsers: 0,
          },
          error: startupError.message,
        };
      }

      // Get investor counts
      const { data: investors, error: investorError } = await supabase
        .from("investors")
        .select("status, verified");

      if (investorError) {
        return {
          data: {
            totalStartups: 0,
            totalInvestors: 0,
            pendingApprovals: 0,
            approvedUsers: 0,
            rejectedUsers: 0,
            flaggedUsers: 0,
          },
          error: investorError.message,
        };
      }

      const allUsers = [...(startups || []), ...(investors || [])];

      const stats = {
        totalStartups: startups?.length || 0,
        totalInvestors: investors?.length || 0,
        pendingApprovals: allUsers.filter(
          (user) => user.status === "pending" || !user.status
        ).length,
        approvedUsers: allUsers.filter(
          (user) => user.status === "approved" || user.verified
        ).length,
        rejectedUsers: allUsers.filter((user) => user.status === "rejected")
          .length,
        flaggedUsers: allUsers.filter((user) => user.status === "flagged")
          .length,
      };

      return { data: stats, error: null };
    } catch (error) {
      return {
        data: {
          totalStartups: 0,
          totalInvestors: 0,
          pendingApprovals: 0,
          approvedUsers: 0,
          rejectedUsers: 0,
          flaggedUsers: 0,
        },
        error: (error as Error).message,
      };
    }
  }
}

export const adminService = AdminService.getInstance();
