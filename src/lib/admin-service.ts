import { supabase } from "./supabase";
import { Investor, Startup, Admin } from "./supabase";

export type UserStatus = "pending" | "approved" | "rejected" | "flagged";
export type VisibilityStatus = "featured" | "hot" | "normal"; // How startups/investors appear to other users
export type UserType = "investor" | "startup";
export type AdminLevel = "super" | "standard";

// Interface for users (startups/investors) as seen by admins
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: UserType;
  verified: boolean;
  status: UserStatus;
  visibility_status?: VisibilityStatus; // How this startup/investor appears to other users
  verified_at?: string;
  verified_by?: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

// Interface for admin users as seen by super admins
export interface AdminUserInfo {
  id: string;
  name: string;
  email: string;
  admin_level: AdminLevel;
  avatar?: string;
  phone_number?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// Interface for creating a new admin
export interface CreateAdminData {
  email: string;
  name: string;
  admin_level: AdminLevel;
  phone_number?: string;
  location?: string;
}

// Interface for admin invite
export interface AdminInvite {
  id: string;
  email: string;
  name: string;
  admin_level: AdminLevel;
  phone_number?: string;
  location?: string;
  invited_by: string;
  invited_at: string;
  status: "pending" | "accepted" | "expired";
  invite_token: string;
  expires_at: string;
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
  [key: string]: unknown;
}

class AdminService {
  private static instance: AdminService;

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // Check if current admin is super admin
  async isSuperAdmin(adminId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("admin_level")
        .eq("id", adminId)
        .single();

      if (error) return false;
      return data.admin_level === "super";
    } catch (error) {
      return false;
    }
  }

  // Get all admins (only for super admins)
  async getAllAdmins(): Promise<{
    data: AdminUserInfo[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      const adminUsers: AdminUserInfo[] = (data as Admin[]).map((admin) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        admin_level: admin.admin_level as AdminLevel,
        avatar: admin.avatar,
        phone_number: admin.phone_number,
        location: admin.location,
        created_at: admin.created_at,
        updated_at: admin.updated_at,
      }));

      return { data: adminUsers, error: null };
    } catch (error) {
      return { data: [], error: (error as Error).message };
    }
  }

  // Create admin invite (generates invitation that needs to be accepted)
  async createAdminInvite(
    adminData: CreateAdminData,
    invitedBy: string
  ): Promise<{ success: boolean; error: string | null; inviteToken?: string }> {
    try {
      // Check if email already exists as admin
      const { data: existingAdmin } = await supabase
        .from("admins")
        .select("id")
        .eq("email", adminData.email)
        .single();

      if (existingAdmin) {
        return {
          success: false,
          error: "Admin with this email already exists",
        };
      }

      // Check if there's already a pending invite for this email
      const { data: existingInvite } = await supabase
        .from("admin_invites")
        .select("id")
        .eq("email", adminData.email)
        .eq("status", "pending")
        .single();

      if (existingInvite) {
        return {
          success: false,
          error: "There's already a pending invite for this email",
        };
      }

      // Generate invite token
      const inviteToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Create invite record
      const inviteData: Partial<AdminInvite> = {
        email: adminData.email,
        name: adminData.name,
        admin_level: adminData.admin_level,
        phone_number: adminData.phone_number,
        location: adminData.location,
        invited_by: invitedBy,
        invited_at: new Date().toISOString(),
        status: "pending",
        invite_token: inviteToken,
        expires_at: expiresAt.toISOString(),
      };

      const { error } = await supabase.from("admin_invites").insert(inviteData);

      if (error) {
        return { success: false, error: error.message };
      }

      // Note: Email sending requires server-side implementation
      // For now, the invitation link will need to be shared manually
      console.log(
        "Invitation created. Email sending requires server-side setup."
      );

      return { success: true, error: null, inviteToken };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Get invitation link for manual sharing
  getInvitationLink(inviteToken: string): string {
    const appUrl = window.location.origin;
    return `${appUrl}/admin/invite?token=${inviteToken}`;
  }

  // Resend admin invitation email
  async resendAdminInvite(
    inviteId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Get invite details
      const { data: invite, error: fetchError } = await supabase
        .from("admin_invites")
        .select("*")
        .eq("id", inviteId)
        .eq("status", "pending")
        .single();

      if (fetchError || !invite) {
        return {
          success: false,
          error: "Invitation not found or already used",
        };
      }

      // Check if invite has expired
      if (new Date() > new Date(invite.expires_at)) {
        return {
          success: false,
          error: "Invitation has expired. Please create a new invitation.",
        };
      }

      // Return invitation details for manual sharing
      const inviteLink = this.getInvitationLink(invite.invite_token);
      console.log(`Invitation link for ${invite.email}: ${inviteLink}`);

      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to resend invitation",
      };
    }
  }

  // Get pending admin invites
  async getPendingInvites(): Promise<{
    data: AdminInvite[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("admin_invites")
        .select("*")
        .eq("status", "pending")
        .order("invited_at", { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data as AdminInvite[], error: null };
    } catch (error) {
      return { data: [], error: (error as Error).message };
    }
  }

  // Accept admin invite and create auth user
  async acceptAdminInvite(
    inviteToken: string,
    password: string
  ): Promise<{ success: boolean; error: string | null; adminId?: string }> {
    try {
      // Get invite details
      const { data: invite, error: inviteError } = await supabase
        .from("admin_invites")
        .select("*")
        .eq("invite_token", inviteToken)
        .eq("status", "pending")
        .single();

      if (inviteError || !invite) {
        return { success: false, error: "Invalid or expired invite" };
      }

      // Check if invite has expired
      if (new Date() > new Date(invite.expires_at)) {
        return { success: false, error: "Invite has expired" };
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invite.email,
        password: password,
        options: {
          data: {
            name: invite.name,
            account_type: "admin",
          },
        },
      });

      if (authError || !authData.user) {
        return {
          success: false,
          error: authError?.message || "Failed to create user",
        };
      }

      // Create admin profile
      const adminProfileData: Partial<Admin> = {
        id: authData.user.id,
        email: invite.email,
        name: invite.name,
        admin_level: invite.admin_level,
        phone_number: invite.phone_number,
        location: invite.location,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from("admins")
        .insert(adminProfileData);

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      // Mark invite as accepted
      await supabase
        .from("admin_invites")
        .update({ status: "accepted" })
        .eq("invite_token", inviteToken);

      return { success: true, error: null, adminId: authData.user.id };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Delete admin (only super admin can delete)
  async deleteAdmin(
    adminId: string,
    deletedBy: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Check if the admin being deleted is a super admin
      const { data: adminToDelete } = await supabase
        .from("admins")
        .select("admin_level")
        .eq("id", adminId)
        .single();

      if (adminToDelete?.admin_level === "super") {
        // Count total super admins
        const { data: superAdmins } = await supabase
          .from("admins")
          .select("id")
          .eq("admin_level", "super");

        if (superAdmins && superAdmins.length <= 1) {
          return {
            success: false,
            error: "Cannot delete the last super admin",
          };
        }
      }

      // Delete from admins table
      const { error } = await supabase
        .from("admins")
        .delete()
        .eq("id", adminId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Note: In a real implementation, you'd also want to delete the auth user
      // For now, we'll just remove from the admins table

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Update admin profile
  async updateAdminProfile(
    adminId: string,
    updateData: Partial<CreateAdminData>
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("admins")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", adminId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
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
  ): Promise<{ data: unknown; error: string | null }> {
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
      const updateData: Record<string, unknown> = {
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
        totalStartups: startups.filter((startup) => startup.verified).length,
        totalInvestors: investors.filter((investor) => investor.verified)
          .length,
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

  // Validate admin invite token
  async validateInviteToken(token: string): Promise<{
    valid: boolean;
    invite?: AdminInvite;
    error: string | null;
  }> {
    try {
      if (!token) {
        return { valid: false, error: "Token is required" };
      }

      const { data: invite, error } = await supabase
        .from("admin_invites")
        .select("*")
        .eq("invite_token", token)
        .eq("status", "pending")
        .single();

      if (error || !invite) {
        return { valid: false, error: "Invalid invite token" };
      }

      // Check if invite has expired
      const now = new Date();
      const expiryDate = new Date(invite.expires_at);

      if (now > expiryDate) {
        // Mark as expired
        await supabase
          .from("admin_invites")
          .update({ status: "expired" })
          .eq("invite_token", token);

        return { valid: false, error: "Invite has expired" };
      }

      return { valid: true, invite: invite as AdminInvite, error: null };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Validation failed",
      };
    }
  }
}

export const adminService = AdminService.getInstance();
