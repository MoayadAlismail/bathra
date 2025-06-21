import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { NotificationService } from "@/lib/notification-service";
import { NewsletterCampaign } from "@/lib/supabase";
import {
  Send,
  Plus,
  Eye,
  Calendar,
  Users,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";

interface NewsletterFormData {
  title: string;
  subject: string;
  content: string;
  recipient_type: "all" | "investors" | "startups" | "specific";
  scheduled_for?: string;
}

const NewsletterManagement: React.FC = () => {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<NewsletterCampaign | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<NewsletterFormData>({
    title: "",
    subject: "",
    content: "",
    recipient_type: "all",
  });
  const [recipientCount, setRecipientCount] = useState(0);
  const [confirmingSend, setConfirmingSend] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load existing campaigns
  useEffect(() => {
    loadCampaigns();
    updateRecipientCount("all"); // Initialize with default recipient type
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const campaignList = await NotificationService.getCampaigns({
        limit: 50,
      });
      setCampaigns(campaignList);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to load newsletter campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof NewsletterFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Update recipient count when recipient type changes
    if (field === "recipient_type") {
      updateRecipientCount(value as "all" | "investors" | "startups");
    }
  };

  const updateRecipientCount = async (
    type: "all" | "investors" | "startups"
  ) => {
    try {
      const count = await NotificationService.getRecipientCount(type);
      setRecipientCount(count);
    } catch (error) {
      console.error("Error getting recipient count:", error);
      setRecipientCount(0);
    }
  };

  const handleCreateCampaign = async () => {
    if (!formData.title || !formData.subject || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const campaign = await NotificationService.createCampaign(
        formData,
        user.id
      );

      if (campaign) {
        toast({
          title: "Success",
          description: "Newsletter campaign created successfully",
        });
        setFormData({
          title: "",
          subject: "",
          content: "",
          recipient_type: "all",
        });
        setShowCreateForm(false);
        loadCampaigns();
      } else {
        throw new Error("Failed to create campaign");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create newsletter campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      setLoading(true);
      const result = await NotificationService.sendCampaign(campaignId);

      if (result.success) {
        toast({
          title: "Success",
          description: `Newsletter sent to ${result.sentCount} recipients`,
        });
        loadCampaigns();
        setConfirmingSend(null);
      } else {
        throw new Error("Failed to send campaign");
      }
    } catch (error) {
      console.error("Error sending campaign:", error);
      toast({
        title: "Error",
        description: "Failed to send newsletter campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "sending":
        return "bg-yellow-100 text-yellow-800";
      case "sent":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileText className="h-4 w-4" />;
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "sending":
        return <Send className="h-4 w-4" />;
      case "sent":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case "all":
        return "All Users";
      case "investors":
        return "Investors Only";
      case "startups":
        return "Startups Only";
      case "specific":
        return "Specific Users";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Management</h2>
          <p className="text-muted-foreground">
            Create and send newsletters to your users
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Newsletter
        </Button>
      </div>

      {/* Create Newsletter Form */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Newsletter Campaign</DialogTitle>
            <DialogDescription>
              Create a new newsletter to send to your users.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                placeholder="Enter campaign title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                placeholder="Enter email subject"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="recipient_type">Recipients</Label>
              <Select
                value={formData.recipient_type}
                onValueChange={(value) =>
                  handleInputChange(
                    "recipient_type",
                    value as "all" | "investors" | "startups" | "specific"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="investors">Investors Only</SelectItem>
                  <SelectItem value="startups">Startups Only</SelectItem>
                </SelectContent>
              </Select>
              {recipientCount > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  This will be sent to {recipientCount} recipient
                  {recipientCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="content">Newsletter Content</Label>
              <Textarea
                id="content"
                placeholder="Enter your newsletter content here..."
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={10}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} disabled={loading}>
                {loading ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaigns List */}
      <div className="grid gap-4">
        {loading && campaigns.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Loading campaigns...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No newsletters yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first newsletter campaign to get started.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Newsletter
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {campaign.title}
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusIcon(campaign.status)}
                          <span className="ml-1 capitalize">
                            {campaign.status}
                          </span>
                        </Badge>
                      </CardTitle>
                      <CardDescription>{campaign.subject}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{campaign.title}</DialogTitle>
                            <DialogDescription>
                              {campaign.subject}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">Content:</h4>
                            <div className="bg-muted p-4 rounded-lg">
                              <p className="whitespace-pre-wrap">
                                {campaign.content}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {campaign.status === "draft" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => setConfirmingSend(campaign.id)}
                            disabled={loading}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </Button>

                          {/* Send Confirmation Dialog */}
                          <Dialog
                            open={confirmingSend === campaign.id}
                            onOpenChange={() => setConfirmingSend(null)}
                          >
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Confirm Newsletter Send
                                </DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to send this newsletter?
                                  This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg">
                                  <h4 className="font-semibold">
                                    Campaign Details:
                                  </h4>
                                  <p>
                                    <strong>Title:</strong> {campaign.title}
                                  </p>
                                  <p>
                                    <strong>Subject:</strong> {campaign.subject}
                                  </p>
                                  <p>
                                    <strong>Recipients:</strong>{" "}
                                    {getRecipientTypeLabel(
                                      campaign.recipient_type
                                    )}
                                  </p>
                                  <p>
                                    <strong>Total Recipients:</strong>{" "}
                                    {campaign.total_recipients ||
                                      "Calculating..."}
                                  </p>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setConfirmingSend(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleSendCampaign(campaign.id)
                                    }
                                    disabled={loading}
                                  >
                                    {loading ? "Sending..." : "Send Newsletter"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Recipients</p>
                      <p className="font-medium">
                        {getRecipientTypeLabel(campaign.recipient_type)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Recipients</p>
                      <p className="font-medium">{campaign.total_recipients}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {campaign.sent_at ? "Sent" : "Status"}
                      </p>
                      <p className="font-medium">
                        {campaign.sent_at
                          ? new Date(campaign.sent_at).toLocaleDateString()
                          : campaign.status}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsletterManagement;
