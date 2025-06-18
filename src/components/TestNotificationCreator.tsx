import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { NotificationService } from "@/lib/notification-service";
import { useAuth } from "@/context/AuthContext";

const TestNotificationCreator: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "other" as const,
    priority: "normal" as const,
    action_url: "",
    action_label: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateNotification = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const notification = await NotificationService.createNotification({
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
        action_url: formData.action_url || undefined,
        action_label: formData.action_label || undefined,
      });

      if (notification) {
        toast({
          title: "Success",
          description: "Test notification created!",
        });
        setFormData({
          title: "",
          content: "",
          type: "other",
          priority: "normal",
          action_url: "",
          action_label: "",
        });
      } else {
        throw new Error("Failed to create notification");
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      toast({
        title: "Error",
        description: "Failed to create test notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Test Notification Creator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Notification title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Notification content"
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleInputChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="admin_action">Admin Action</SelectItem>
              <SelectItem value="connection_request">
                Connection Request
              </SelectItem>
              <SelectItem value="message">Message</SelectItem>
              <SelectItem value="investment_interest">
                Investment Interest
              </SelectItem>
              <SelectItem value="meeting_request">Meeting Request</SelectItem>
              <SelectItem value="system_update">System Update</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleInputChange("priority", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="action_url">Action URL (optional)</Label>
          <Input
            id="action_url"
            placeholder="https://example.com"
            value={formData.action_url}
            onChange={(e) => handleInputChange("action_url", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="action_label">Action Label (optional)</Label>
          <Input
            id="action_label"
            placeholder="Take Action"
            value={formData.action_label}
            onChange={(e) => handleInputChange("action_label", e.target.value)}
          />
        </div>

        <Button
          onClick={handleCreateNotification}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Creating..." : "Create Test Notification"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TestNotificationCreator;
