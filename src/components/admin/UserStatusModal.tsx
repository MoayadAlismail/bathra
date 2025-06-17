import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Check,
  X,
  Flag,
  Star,
  TrendingUp,
  AlertTriangle,
  Minus,
} from "lucide-react";
import {
  adminService,
  AdminUser,
  UserStatus,
  VisibilityStatus,
  UpdateUserStatusData,
} from "@/lib/admin-service";

interface UserStatusModalProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const UserStatusModal = ({
  user,
  open,
  onOpenChange,
  onUpdate,
}: UserStatusModalProps) => {
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [visibilityStatus, setVisibilityStatus] = useState<
    VisibilityStatus | "none"
  >(user.visibility_status || "none");
  const [adminNotes, setAdminNotes] = useState(user.admin_notes || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      const statusData: UpdateUserStatusData = {
        status,
        admin_notes: adminNotes,
        verified_by: "current_admin", // In a real app, this would be the current admin's ID
      };

      if (visibilityStatus !== "none") {
        statusData.visibility_status = visibilityStatus as VisibilityStatus;
      }

      const result = await adminService.updateUserStatus(
        user.id,
        user.type,
        statusData
      );

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "User status updated successfully",
      });

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "flagged":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case "approved":
        return <Check className="h-4 w-4" />;
      case "rejected":
        return <X className="h-4 w-4" />;
      case "flagged":
        return <Flag className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getVisibilityIcon = (visibility: VisibilityStatus | "none") => {
    switch (visibility) {
      case "featured":
        return <Star className="h-4 w-4" />;
      case "hot":
        return <TrendingUp className="h-4 w-4" />;
      case "normal":
        return <Minus className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage User Status - {user.name}</DialogTitle>
          <DialogDescription>
            Update the approval status and visibility settings for this{" "}
            {user.type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Current Status</h3>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Approval Status
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(user.status)}>
                    {getStatusIcon(user.status)}
                    {user.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {user.verified ? "Verified" : "Not verified"}
                  </span>
                </div>
              </div>

              {user.visibility_status && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Visibility
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {getVisibilityIcon(user.visibility_status)}
                      {user.visibility_status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Update Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Update Status</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Approval Status</label>
                <Select
                  value={status}
                  onValueChange={(value: UserStatus) => setStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Pending Review
                      </div>
                    </SelectItem>
                    <SelectItem value="approved">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Approved
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-600" />
                        Rejected
                      </div>
                    </SelectItem>
                    <SelectItem value="flagged">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-yellow-600" />
                        Flagged
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Platform Visibility Status
                  <span className="text-xs text-muted-foreground block">
                    How this {user.type} appears to other users on the platform
                  </span>
                </label>
                <Select
                  value={visibilityStatus}
                  onValueChange={(value: VisibilityStatus | "none") =>
                    setVisibilityStatus(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <Minus className="h-4 w-4" />
                        Normal Visibility
                      </div>
                    </SelectItem>
                    <SelectItem value="normal">
                      <div className="flex items-center gap-2">
                        <Minus className="h-4 w-4" />
                        Normal Visibility
                      </div>
                    </SelectItem>
                    <SelectItem value="hot">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        Hot {user.type === "startup" ? "Startup" : "Investor"}
                      </div>
                    </SelectItem>
                    <SelectItem value="featured">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-purple-600" />
                        Featured{" "}
                        {user.type === "startup" ? "Startup" : "Investor"}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Notes</label>
            <Textarea
              placeholder="Add notes about this user's status, reasons for approval/rejection, or any other relevant information..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Status Explanations */}
          <div className="space-y-2">
            <h4 className="font-medium">Status & Visibility Explanations</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                <strong>Approval Status:</strong>
              </div>
              <div className="ml-4">
                • <strong>Pending:</strong> {user.type} awaiting admin review
              </div>
              <div className="ml-4">
                • <strong>Approved:</strong> {user.type} is verified and can
                access all features
              </div>
              <div className="ml-4">
                • <strong>Rejected:</strong> {user.type} does not meet platform
                criteria
              </div>
              <div className="ml-4">
                • <strong>Flagged:</strong> {user.type} requires special
                attention or review
              </div>

              <div className="pt-2">
                <strong>
                  Platform Visibility (for approved {user.type}s):
                </strong>
              </div>
              <div className="ml-4">
                • <strong>Normal:</strong> Standard visibility to{" "}
                {user.type === "startup" ? "investors" : "startups"}
              </div>
              <div className="ml-4">
                • <strong>Featured:</strong> Highlighted prominently to attract{" "}
                {user.type === "startup" ? "investor" : "startup"} attention
              </div>
              <div className="ml-4">
                • <strong>Hot:</strong> Marked as trending or in high demand
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="font-medium">Quick Actions</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setStatus("approved");
                  setVisibilityStatus("normal");
                }}
                className="text-green-600 hover:text-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Quick Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setStatus("rejected");
                  setVisibilityStatus("none");
                }}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Quick Reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setStatus("approved");
                  setVisibilityStatus("featured");
                }}
                className="text-purple-600 hover:text-purple-700"
              >
                <Star className="h-4 w-4 mr-2" />
                Approve & Feature
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserStatusModal;
