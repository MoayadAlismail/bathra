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
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      setOffset(0);
      setHasMore(true);

      const [notificationData, unreadCountData] = await Promise.all([
        NotificationService.getUserNotifications(userId, {
          limit,
          offset: 0,
          unreadOnly,
          type,
        }),
        NotificationService.getUnreadCount(userId),
      ]);

      setNotifications(notificationData);
      setUnreadCount(unreadCountData);
      setOffset(notificationData.length);
      setHasMore(notificationData.length === limit);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh notifications"
      );
    } finally {
      setLoading(false);
    }
  }, [userId, limit, unreadOnly, type]);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !userId) return;

    try {
      setLoading(true);
      const fetchedNotifications =
        await NotificationService.getUserNotifications(userId, {
          limit,
          offset,
          unreadOnly,
          type,
        });

      setNotifications((prev) => [...prev, ...fetchedNotifications]);
      setOffset((prev) => prev + fetchedNotifications.length);
      setHasMore(fetchedNotifications.length === limit);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more notifications"
      );
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, userId, limit, offset, unreadOnly, type]);

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
      setOffset(0);
      setHasMore(true);
      setLoading(true);
      setError(null);

      // Fetch initial data
      Promise.all([
        NotificationService.getUserNotifications(userId, {
          limit,
          offset: 0,
          unreadOnly,
          type,
        }),
        NotificationService.getUnreadCount(userId),
      ])
        .then(([notificationData, unreadCountData]) => {
          setNotifications(notificationData);
          setUnreadCount(unreadCountData);
          setOffset(notificationData.length);
          setHasMore(notificationData.length === limit);
          setLoading(false);
        })
        .catch((err) => {
          setError(
            err instanceof Error ? err.message : "Failed to fetch notifications"
          );
          setLoading(false);
        });
    }
  }, [userId, limit, unreadOnly, type]); // Stable dependencies

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      // Only refresh unread count to avoid disrupting UI
      NotificationService.getUnreadCount(userId).then(setUnreadCount);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, userId, refreshInterval]); // Removed fetchUnreadCount dependency

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
