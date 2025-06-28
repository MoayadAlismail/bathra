import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  X,
  Eye,
  ExternalLink,
  Mail,
  Users,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  Calendar,
  Settings,
  Archive,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/context/AuthContext";
import { Notification } from "@/lib/supabase";
import { NotificationService } from "@/lib/notification-service";
import { canBrowseContent } from "@/lib/auth-utils";

interface NotificationDropdownProps {
  onToggle?: (isOpen: boolean) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onToggle,
}) => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);

  // Check if user is approved to see notifications
  const isApproved = profile ? canBrowseContent(profile) : false;

  // Use single hook without autoRefresh to avoid conflicts
  const {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  } = useNotifications(isApproved && user?.id ? user.id : null, {
    limit: 5,
    autoRefresh: false, // Disable autoRefresh to prevent re-rendering issues
  });

  // State for all notifications modal
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [allHasMore, setAllHasMore] = useState(true);

  // Refresh data when dropdown is opened
  useEffect(() => {
    if (isOpen && isApproved && user?.id) {
      refresh();
    }
  }, [isOpen, user?.id, isApproved]); // Added isApproved dependency

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onToggle?.(newIsOpen);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  const handleShowAll = async () => {
    setShowAllModal(true);
    if (isApproved && user?.id) {
      setAllLoading(true);
      try {
        const allNotificationData =
          await NotificationService.getUserNotifications(user.id, {
            limit: 20,
            offset: 0,
          });
        setAllNotifications(allNotificationData);
        setAllHasMore(allNotificationData.length === 20);
      } catch (error) {
        console.error("Failed to fetch all notifications:", error);
      } finally {
        setAllLoading(false);
      }
    }
  };

  const loadMoreAll = async () => {
    if (!allHasMore || allLoading || !isApproved || !user?.id) return;

    setAllLoading(true);
    try {
      const moreNotifications = await NotificationService.getUserNotifications(
        user.id,
        {
          limit: 20,
          offset: allNotifications.length,
        }
      );
      setAllNotifications((prev) => [...prev, ...moreNotifications]);
      setAllHasMore(moreNotifications.length === 20);
    } catch (error) {
      console.error("Failed to load more notifications:", error);
    } finally {
      setAllLoading(false);
    }
  };

  const refreshAll = async () => {
    if (isApproved && user?.id) {
      setAllLoading(true);
      try {
        const allNotificationData =
          await NotificationService.getUserNotifications(user.id, {
            limit: 20,
            offset: 0,
          });
        setAllNotifications(allNotificationData);
        setAllHasMore(allNotificationData.length === 20);
      } catch (error) {
        console.error("Failed to refresh all notifications:", error);
      } finally {
        setAllLoading(false);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "newsletter":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "admin_action":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "connection_request":
        return <Users className="h-4 w-4 text-green-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "investment_interest":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "meeting_request":
        return <Calendar className="h-4 w-4 text-indigo-500" />;
      case "system_update":
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatNotificationTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const truncateContent = (content: string, maxLength: number = 80) => {
    return content.length > maxLength
      ? `${content.substring(0, maxLength)}...`
      : content;
  };

  if (!user || !isApproved) return null;

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          className="flex items-center gap-2 text-sm relative"
          disabled={loading}
        >
          <Bell className="h-4 w-4" />
          {loading ? "Loading..." : "Notifications"}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[1.25rem]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-96 bg-background border rounded-lg shadow-xl z-50"
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggle}
                      className="text-xs"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    You have {unreadCount} unread notification
                    {unreadCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <ScrollArea className="max-h-80">
                <div className="p-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((notification) => (
                        <Card
                          key={notification.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            !notification.is_read
                              ? "bg-blue-50/50 border-blue-200 hover:bg-blue-100/70"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm truncate">
                                    {notification.title}
                                  </h4>
                                  {!notification.is_read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {truncateContent(notification.content)}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {formatNotificationTime(
                                    notification.created_at
                                  )}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>

              {notifications.length > 0 && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowAll}
                    className="w-full"
                  >
                    View All Notifications
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog
        open={!!selectedNotification}
        onOpenChange={() => setSelectedNotification(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {getNotificationIcon(selectedNotification.type)}
                  <div>
                    <DialogTitle className="text-xl">
                      {selectedNotification.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      {formatNotificationTime(selectedNotification.created_at)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {selectedNotification.content}
                  </p>
                </div>

                {selectedNotification.action_url && (
                  <div className="mt-4">
                    <Button
                      onClick={() => {
                        window.open(selectedNotification.action_url, "_blank");
                      }}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {selectedNotification.action_label || "Take Action"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAllModal} onOpenChange={setShowAllModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">All Notifications</DialogTitle>
            <DialogDescription>
              Manage all your notifications in one place
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {allNotifications.length} notification
                  {allNotifications.length !== 1 ? "s" : ""}
                </Badge>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount} unread</Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAll}
                disabled={allLoading}
              >
                Refresh
              </Button>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {allLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : allNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  allNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        !notification.is_read
                          ? "bg-blue-50/50 border-blue-200 hover:bg-blue-100/70"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium truncate">
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {notification.type.replace("_", " ")}
                                </Badge>
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.content.substring(0, 150)}
                              {notification.content.length > 150 && "..."}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-muted-foreground">
                                {formatNotificationTime(
                                  notification.created_at
                                )}
                              </span>
                              <Badge
                                variant={
                                  notification.priority === "urgent"
                                    ? "destructive"
                                    : notification.priority === "high"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {allHasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={loadMoreAll}
                    disabled={allLoading}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationDropdown;
