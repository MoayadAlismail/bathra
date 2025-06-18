import { supabase } from "./supabase";
import { Notification, NewsletterCampaign } from "./supabase";

export type NotificationType =
  | "newsletter"
  | "admin_action"
  | "connection_request"
  | "message"
  | "profile_update"
  | "match_suggestion"
  | "investment_interest"
  | "meeting_request"
  | "system_update"
  | "reminder"
  | "other";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type RecipientType = "all" | "investors" | "startups" | "specific";
export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "cancelled";

export interface CreateNotificationData {
  user_id: string;
  type?: NotificationType;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  priority?: NotificationPriority;
  newsletter_id?: string;
  recipient_type?: RecipientType;
  action_url?: string;
  action_label?: string;
  scheduled_for?: string;
}

export interface CreateCampaignData {
  title: string;
  subject: string;
  content: string;
  recipient_type: RecipientType;
  specific_recipients?: string[];
  scheduled_for?: string;
  metadata?: Record<string, unknown>;
}

export interface BulkNotificationData {
  user_ids: string[];
  type?: NotificationType;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  newsletter_id?: string;
  priority?: NotificationPriority;
  action_url?: string;
  action_label?: string;
}

export class NotificationService {
  // Create a single notification
  static async createNotification(
    data: CreateNotificationData
  ): Promise<Notification | null> {
    try {
      const { data: notification, error } = await supabase
        .from("notifications")
        .insert({
          ...data,
          type: data.type || "other",
          priority: data.priority || "normal",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating notification:", error);
        return null;
      }

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  }

  // Send notifications to multiple users using the database function
  static async sendBulkNotifications(
    data: BulkNotificationData
  ): Promise<number> {
    try {
      const { data: result, error } = await supabase.rpc(
        "send_notification_to_users",
        {
          p_user_ids: data.user_ids,
          p_type: data.type || "other",
          p_title: data.title,
          p_content: data.content,
          p_metadata: data.metadata || {},
          p_newsletter_id: data.newsletter_id || null,
          p_priority: data.priority || "normal",
          p_action_url: data.action_url || null,
          p_action_label: data.action_label || null,
        }
      );

      if (error) {
        console.error("Error sending bulk notifications:", error);
        return 0;
      }

      return result || 0;
    } catch (error) {
      console.error("Error sending bulk notifications:", error);
      return 0;
    }
  }

  // Get notifications for a user
  static async getUserNotifications(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      type?: NotificationType;
    }
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (options?.unreadOnly) {
        query = query.eq("is_read", false);
      }

      if (options?.type) {
        query = query.eq("type", options.type);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (error) {
        console.error("Error marking notification as read:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  // Mark multiple notifications as read
  static async markMultipleAsRead(notificationIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .in("id", notificationIds);

      if (error) {
        console.error("Error marking notifications as read:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      return false;
    }
  }

  // Archive notification
  static async archiveNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          is_archived: true,
        })
        .eq("id", notificationId);

      if (error) {
        console.error("Error archiving notification:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error archiving notification:", error);
      return false;
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc(
        "get_unread_notification_count",
        {
          p_user_id: userId,
        }
      );

      if (error) {
        console.error("Error getting unread count:", error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  // Newsletter Campaign Methods

  // Create a newsletter campaign
  static async createCampaign(
    data: CreateCampaignData,
    createdBy: string
  ): Promise<NewsletterCampaign | null> {
    try {
      const { data: campaign, error } = await supabase
        .from("newsletter_campaigns")
        .insert({
          ...data,
          created_by: createdBy,
          status: "draft",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating campaign:", error);
        return null;
      }

      return campaign;
    } catch (error) {
      console.error("Error creating campaign:", error);
      return null;
    }
  }

  // Get all newsletter campaigns
  static async getCampaigns(options?: {
    limit?: number;
    offset?: number;
    status?: CampaignStatus;
  }): Promise<NewsletterCampaign[]> {
    try {
      let query = supabase
        .from("newsletter_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (options?.status) {
        query = query.eq("status", options.status);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching campaigns:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  }

  // Get a specific campaign
  static async getCampaign(
    campaignId: string
  ): Promise<NewsletterCampaign | null> {
    try {
      const { data, error } = await supabase
        .from("newsletter_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (error) {
        console.error("Error fetching campaign:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching campaign:", error);
      return null;
    }
  }

  // Update campaign
  static async updateCampaign(
    campaignId: string,
    updates: Partial<CreateCampaignData>
  ): Promise<NewsletterCampaign | null> {
    try {
      const { data, error } = await supabase
        .from("newsletter_campaigns")
        .update(updates)
        .eq("id", campaignId)
        .select()
        .single();

      if (error) {
        console.error("Error updating campaign:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error updating campaign:", error);
      return null;
    }
  }

  // Send newsletter campaign (creates notifications for all target users)
  static async sendCampaign(
    campaignId: string
  ): Promise<{ success: boolean; sentCount: number }> {
    try {
      // Get campaign details
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) {
        return { success: false, sentCount: 0 };
      }

      // Get target user IDs based on recipient type
      let userIds: string[] = [];

      if (campaign.recipient_type === "all") {
        // Get all user IDs from investors and startups tables
        const [investorsResult, startupsResult] = await Promise.all([
          supabase.from("investors").select("id"),
          supabase.from("startups").select("id"),
        ]);

        if (investorsResult.data)
          userIds.push(...investorsResult.data.map((inv) => inv.id));
        if (startupsResult.data)
          userIds.push(...startupsResult.data.map((startup) => startup.id));
      } else if (campaign.recipient_type === "investors") {
        const { data } = await supabase.from("investors").select("id");
        if (data) userIds = data.map((inv) => inv.id);
      } else if (campaign.recipient_type === "startups") {
        const { data } = await supabase.from("startups").select("id");
        if (data) userIds = data.map((startup) => startup.id);
      } else if (
        campaign.recipient_type === "specific" &&
        campaign.specific_recipients
      ) {
        userIds = campaign.specific_recipients;
      }

      // Send notifications to all target users
      const sentCount = await this.sendBulkNotifications({
        user_ids: userIds,
        type: "newsletter",
        title: campaign.subject,
        content: campaign.content,
        newsletter_id: campaignId,
        priority: "normal",
      });

      // Update campaign status
      await supabase
        .from("newsletter_campaigns")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          total_recipients: userIds.length,
        })
        .eq("id", campaignId);

      return { success: true, sentCount };
    } catch (error) {
      console.error("Error sending campaign:", error);
      return { success: false, sentCount: 0 };
    }
  }

  // Helper method to send admin action notifications
  static async sendAdminActionNotification(
    userId: string,
    action: string,
    details: string
  ): Promise<boolean> {
    const notification = await this.createNotification({
      user_id: userId,
      type: "admin_action",
      title: `Account Update: ${action}`,
      content: details,
      priority: "high",
      metadata: {
        action,
        timestamp: new Date().toISOString(),
      },
    });

    return notification !== null;
  }

  // Helper method to get recipient count for a campaign type
  static async getRecipientCount(
    recipientType: RecipientType
  ): Promise<number> {
    try {
      let count = 0;

      if (recipientType === "all") {
        const [investorsResult, startupsResult] = await Promise.all([
          supabase.from("investors").select("id", { count: "exact" }),
          supabase.from("startups").select("id", { count: "exact" }),
        ]);
        count = (investorsResult.count || 0) + (startupsResult.count || 0);
      } else if (recipientType === "investors") {
        const { count: investorCount } = await supabase
          .from("investors")
          .select("id", { count: "exact" });
        count = investorCount || 0;
      } else if (recipientType === "startups") {
        const { count: startupCount } = await supabase
          .from("startups")
          .select("id", { count: "exact" });
        count = startupCount || 0;
      }

      return count;
    } catch (error) {
      console.error("Error getting recipient count:", error);
      return 0;
    }
  }

  // Helper method to send connection request notifications
  static async sendConnectionRequestNotification(
    recipientId: string,
    requesterName: string,
    requesterType: "investor" | "startup"
  ): Promise<boolean> {
    const notification = await this.createNotification({
      user_id: recipientId,
      type: "connection_request",
      title: "New Connection Request",
      content: `${requesterName} wants to connect with you.`,
      priority: "normal",
      action_url: "/connections",
      action_label: "View Request",
      metadata: {
        requester_type: requesterType,
        requester_name: requesterName,
      },
    });

    return notification !== null;
  }
}
