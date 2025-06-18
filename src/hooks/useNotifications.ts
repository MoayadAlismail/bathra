import { useState, useEffect, useCallback } from "react";
import {
  NotificationService,
  NotificationType,
} from "../lib/notification-service";
import { Notification } from "../lib/supabase";

export interface UseNotificationsOptions {
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (notificationId: string) => Promise<void>;
}

export function useNotifications(
  userId: string | null,
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const {
    limit = 10,
    unreadOnly = false,
    type,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (reset = false) => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const currentOffset = reset ? 0 : offset;
        const fetchedNotifications =
          await NotificationService.getUserNotifications(userId, {
            limit,
            offset: currentOffset,
            unreadOnly,
            type,
          });

        if (reset) {
          setNotifications(fetchedNotifications);
          setOffset(fetchedNotifications.length);
        } else {
          setNotifications((prev) => [...prev, ...fetchedNotifications]);
          setOffset((prev) => prev + fetchedNotifications.length);
        }

        setHasMore(fetchedNotifications.length === limit);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch notifications"
        );
      } finally {
        setLoading(false);
      }
    },
    [userId, limit, offset, unreadOnly, type]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const count = await NotificationService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [userId]);

  // Refresh notifications
  const refresh = useCallback(async () => {
    setOffset(0);
    await Promise.all([fetchNotifications(true), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchNotifications(false);
  }, [fetchNotifications, hasMore, loading]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const success = await NotificationService.markAsRead(notificationId);
        if (success) {
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === notificationId
                ? {
                    ...notification,
                    is_read: true,
                    read_at: new Date().toISOString(),
                  }
                : notification
            )
          );
          await fetchUnreadCount();
        }
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    },
    [fetchUnreadCount]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.is_read);
      const unreadIds = unreadNotifications.map((n) => n.id);

      if (unreadIds.length === 0) return;

      const success = await NotificationService.markMultipleAsRead(unreadIds);
      if (success) {
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            is_read: true,
            read_at: notification.read_at || new Date().toISOString(),
          }))
        );
        await fetchUnreadCount();
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, [notifications, fetchUnreadCount]);

  // Archive notification
  const archiveNotification = useCallback(
    async (notificationId: string) => {
      try {
        const success = await NotificationService.archiveNotification(
          notificationId
        );
        if (success) {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId)
          );
          await fetchUnreadCount();
        }
      } catch (err) {
        console.error("Failed to archive notification:", err);
      }
    },
    [fetchUnreadCount]
  );

  // Initial load
  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId, refresh]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, userId, refreshInterval, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  };
}
