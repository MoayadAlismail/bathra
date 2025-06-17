import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Building,
  Users,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  Edit,
  Save,
  X,
  ExternalLink,
} from "lucide-react";
import {
  adminService,
  AdminUser,
  UpdateUserProfileData,
} from "@/lib/admin-service";

interface UserDetailModalProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const UserDetailModal = ({
  user,
  open,
  onOpenChange,
  onUpdate,
}: UserDetailModalProps) => {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      loadUserDetails();
    }
  }, [open, user]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      const result = await adminService.getUserDetails(user.id, user.type);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      setUserDetails(result.data);
      setEditForm(result.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updateData: UpdateUserProfileData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      };

      // Add type-specific fields
      if (user.type === "startup") {
        updateData.startup_name = editForm.startup_name;
        updateData.industry = editForm.industry;
        updateData.website = editForm.website;
        updateData.problem_solving = editForm.problem_solving;
        updateData.solution = editForm.solution;
        updateData.uniqueness = editForm.uniqueness;
      } else if (user.type === "investor") {
        updateData.company = editForm.company;
        updateData.role = editForm.role;
        updateData.country = editForm.country;
        updateData.city = editForm.city;
        updateData.linkedin_profile = editForm.linkedin_profile;
      }

      const result = await adminService.updateUserProfile(
        user.id,
        user.type,
        updateData
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
        description: "User profile updated successfully",
      });

      setEditing(false);
      loadUserDetails();
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user profile",
        variant: "destructive",
      });
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        {user.type === "startup" ? (
          <Building className="h-5 w-5" />
        ) : (
          <Users className="h-5 w-5" />
        )}
        Basic Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Name
          </label>
          {editing ? (
            <Input
              value={editForm.name || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
          ) : (
            <p className="flex items-center gap-2 mt-1">{userDetails?.name}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Email
          </label>
          {editing ? (
            <Input
              value={editForm.email || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              type="email"
            />
          ) : (
            <p className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" />
              {userDetails?.email}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Phone
          </label>
          {editing ? (
            <Input
              value={editForm.phone || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
            />
          ) : (
            <p className="flex items-center gap-2 mt-1">
              <Phone className="h-4 w-4" />
              {userDetails?.phone}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Created
          </label>
          <p className="flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            {new Date(userDetails?.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );

  const renderStartupDetails = () => {
    if (user.type !== "startup" || !userDetails) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Startup Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Startup Name
            </label>
            {editing ? (
              <Input
                value={editForm.startup_name || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, startup_name: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">{userDetails.startup_name}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Industry
            </label>
            {editing ? (
              <Input
                value={editForm.industry || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, industry: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">{userDetails.industry}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Website
            </label>
            {editing ? (
              <Input
                value={editForm.website || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, website: e.target.value })
                }
              />
            ) : (
              <p className="flex items-center gap-2 mt-1">
                <Globe className="h-4 w-4" />
                {userDetails.website && (
                  <a
                    href={userDetails.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {userDetails.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Stage
            </label>
            <p className="mt-1">
              <Badge variant="outline">{userDetails.stage}</Badge>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Problem Solving
            </label>
            {editing ? (
              <Textarea
                value={editForm.problem_solving || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, problem_solving: e.target.value })
                }
                rows={3}
              />
            ) : (
              <p className="mt-1 text-sm">{userDetails.problem_solving}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Solution
            </label>
            {editing ? (
              <Textarea
                value={editForm.solution || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, solution: e.target.value })
                }
                rows={3}
              />
            ) : (
              <p className="mt-1 text-sm">{userDetails.solution}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Uniqueness
            </label>
            {editing ? (
              <Textarea
                value={editForm.uniqueness || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, uniqueness: e.target.value })
                }
                rows={3}
              />
            ) : (
              <p className="mt-1 text-sm">{userDetails.uniqueness}</p>
            )}
          </div>
        </div>

        {/* Financial Information */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Capital Seeking
              </label>
              <p className="mt-1">
                $
                {userDetails.capital_seeking?.toLocaleString() ||
                  "Not specified"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Pre-money Valuation
              </label>
              <p className="mt-1">
                $
                {userDetails.pre_money_valuation?.toLocaleString() ||
                  "Not specified"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Current Revenue
              </label>
              <p className="mt-1">
                $
                {userDetails.current_financial_year_revenue?.toLocaleString() ||
                  "Not specified"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Monthly Burn Rate
              </label>
              <p className="mt-1">
                $
                {userDetails.monthly_burn_rate?.toLocaleString() ||
                  "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInvestorDetails = () => {
    if (user.type !== "investor" || !userDetails) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Investor Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Company
            </label>
            {editing ? (
              <Input
                value={editForm.company || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, company: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">{userDetails.company}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Role
            </label>
            {editing ? (
              <Input
                value={editForm.role || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">{userDetails.role}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Location
            </label>
            {editing ? (
              <div className="flex gap-2">
                <Input
                  placeholder="City"
                  value={editForm.city || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, city: e.target.value })
                  }
                />
                <Input
                  placeholder="Country"
                  value={editForm.country || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, country: e.target.value })
                  }
                />
              </div>
            ) : (
              <p className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" />
                {userDetails.city}, {userDetails.country}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              LinkedIn
            </label>
            {editing ? (
              <Input
                value={editForm.linkedin_profile || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, linkedin_profile: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">
                {userDetails.linkedin_profile && (
                  <a
                    href={userDetails.linkedin_profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    LinkedIn Profile
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Average Ticket Size
            </label>
            <p className="mt-1">
              {userDetails.average_ticket_size || "Not specified"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Number of Investments
            </label>
            <p className="mt-1">
              {userDetails.number_of_investments || "Not specified"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Preferred Industries
            </label>
            <p className="mt-1">
              {userDetails.preferred_industries || "Not specified"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Preferred Stage
            </label>
            <p className="mt-1">
              {userDetails.preferred_company_stage || "Not specified"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminInfo = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Admin Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Status
          </label>
          <p className="mt-1">
            <Badge
              className={
                user.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : user.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : user.status === "flagged"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {user.status}
            </Badge>
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Verified
          </label>
          <p className="mt-1">
            <Badge variant={user.verified ? "default" : "secondary"}>
              {user.verified ? "Yes" : "No"}
            </Badge>
          </p>
        </div>

        {user.visibility_status && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Visibility Status
            </label>
            <p className="mt-1">
              <Badge variant="outline">{user.visibility_status}</Badge>
            </p>
          </div>
        )}

        {user.verified_at && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Verified At
            </label>
            <p className="mt-1">
              {new Date(user.verified_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {user.admin_notes && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Admin Notes
          </label>
          <p className="mt-1 p-3 bg-muted rounded-lg text-sm">
            {user.admin_notes}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>User Details - {user.name}</span>
            <div className="flex items-center gap-2">
              {!editing ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setEditForm(userDetails);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            View and edit detailed information for this {user.type}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {renderBasicInfo()}
            <Separator />
            {user.type === "startup"
              ? renderStartupDetails()
              : renderInvestorDetails()}
            <Separator />
            {renderAdminInfo()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
