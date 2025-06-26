import { supabase, UserInvite } from "./supabase";

export interface CreateUserInviteData {
  email: string;
  name: string;
}

export interface InviteValidationResult {
  valid: boolean;
  invite?: UserInvite;
  error?: string;
}

export class UserInviteService {
  private static instance: UserInviteService;

  public static getInstance(): UserInviteService {
    if (!UserInviteService.instance) {
      UserInviteService.instance = new UserInviteService();
    }
    return UserInviteService.instance;
  }

  // Create a new user invite
  async createUserInvite(
    inviteData: CreateUserInviteData,
    invitedBy: string
  ): Promise<{ success: boolean; error?: string; inviteToken?: string }> {
    try {
      // Check if email already exists in auth
      const { data: existingUser } = await supabase.auth.signInWithOtp({
        email: inviteData.email,
        options: {
          shouldCreateUser: false,
        },
      });

      const userExists = !!existingUser?.user;

      if (userExists) {
        return {
          success: false,
          error: "User with this email already exists",
        };
      }

      // Check if there's already a pending invite
      const { data: existingInvite } = await supabase
        .from("user_invites")
        .select("id")
        .eq("email", inviteData.email)
        .eq("status", "pending")
        .single();

      if (existingInvite) {
        return {
          success: false,
          error: "There's already a pending invite for this email",
        };
      }

      // Generate invite token and expiry
      const inviteToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Create invite record
      const { error } = await supabase.from("user_invites").insert({
        email: inviteData.email,
        name: inviteData.name,
        invited_by: invitedBy,
        invite_token: inviteToken,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        inviteToken,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // Validate invite token
  async validateInviteToken(token: string): Promise<InviteValidationResult> {
    try {
      const { data: invite, error } = await supabase
        .from("user_invites")
        .select("*")
        .eq("invite_token", token)
        .eq("status", "pending")
        .single();

      if (error || !invite) {
        return {
          valid: false,
          error: "Invalid or expired invitation",
        };
      }

      // Check if invite has expired
      const now = new Date();
      const expiresAt = new Date(invite.expires_at);

      if (now > expiresAt) {
        // Mark as expired
        await supabase
          .from("user_invites")
          .update({ status: "expired" })
          .eq("id", invite.id);

        return {
          valid: false,
          error: "Invitation has expired",
        };
      }

      return {
        valid: true,
        invite: invite as UserInvite,
      };
    } catch (error) {
      return {
        valid: false,
        error: (error as Error).message,
      };
    }
  }

  // Accept invite (mark as accepted and store user ID)
  async acceptInvite(
    inviteToken: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("user_invites")
        .update({
          status: "accepted",
          user_id: userId,
        })
        .eq("invite_token", inviteToken);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Get all invites (for admin dashboard)
  async getAllInvites(): Promise<{ data: UserInvite[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("user_invites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data as UserInvite[] };
    } catch (error) {
      return { data: [], error: (error as Error).message };
    }
  }

  // Get accepted invites (users ready for promotion)
  async getAcceptedInvites(): Promise<{ data: UserInvite[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("user_invites")
        .select("*")
        .eq("status", "accepted")
        .order("updated_at", { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data as UserInvite[] };
    } catch (error) {
      return { data: [], error: (error as Error).message };
    }
  }

  // Promote user to admin
  async promoteUserToAdmin(
    inviteId: string,
    adminLevel: "standard" | "super"
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the invite details
      const { data: invite, error: inviteError } = await supabase
        .from("user_invites")
        .select("*")
        .eq("id", inviteId)
        .eq("status", "accepted")
        .single();

      if (inviteError || !invite) {
        return { success: false, error: "Invalid or unaccepted invite" };
      }

      // Check if user_id is available
      if (!invite.user_id) {
        return { success: false, error: "User ID not found in the invitation" };
      }

      // Create admin record
      const { error: adminError } = await supabase.from("admins").insert({
        id: invite.user_id,
        email: invite.email,
        name: invite.name,
        admin_level: adminLevel,
      });

      if (adminError) {
        return { success: false, error: adminError.message };
      }

      // Delete the user invite record after successful promotion
      const { error: deleteError } = await supabase
        .from("user_invites")
        .delete()
        .eq("id", inviteId);

      if (deleteError) {
        console.error(
          "Failed to delete invite after promotion:",
          deleteError.message
        );
        // We don't return an error here since the promotion was successful
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Delete invite
  async deleteInvite(
    inviteId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("user_invites")
        .delete()
        .eq("id", inviteId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Get invitation link
  getInvitationLink(inviteToken: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invite-signup?token=${inviteToken}`;
  }

  // Resend invitation (generate new token)
  async resendInvitation(
    inviteId: string
  ): Promise<{ success: boolean; error?: string; inviteToken?: string }> {
    try {
      const newToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from("user_invites")
        .update({
          invite_token: newToken,
          expires_at: expiresAt.toISOString(),
          status: "pending",
        })
        .eq("id", inviteId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, inviteToken: newToken };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export const userInviteService = UserInviteService.getInstance();
export type { UserInvite };

