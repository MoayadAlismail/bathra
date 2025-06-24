import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Crown,
  User,
  Trash2,
  RefreshCw,
  Copy,
  AlertTriangle,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { userInviteService } from "@/lib/user-invite-service";
import { UserInvite } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import UserInviteModal from "./UserInviteModal";
import { adminService } from "@/lib/admin-service";

export default function UserInvitesManagement() {
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<UserInvite | null>(null);
  const [selectedAdminLevel, setSelectedAdminLevel] = useState<
    "standard" | "super"
  >("standard");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      checkSuperAdminStatus();
    }
  }, [user]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadInvites();
    }
  }, [isSuperAdmin]);

  const checkSuperAdminStatus = async () => {
    if (!user?.id) return;
    try {
      const isSuper = await adminService.isSuperAdmin(user.id);
      setIsSuperAdmin(isSuper);
    } catch (error) {
      console.error("Error checking super admin status:", error);
    }
  };

  const loadInvites = async () => {
    setLoading(true);
    try {
      const result = await userInviteService.getAllInvites();
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        setInvites(result.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Only show user invites management to super admins
  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">
                Access Restricted
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Only super administrators can manage user invitations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCopyInviteLink = async (invite: UserInvite) => {
    try {
      const link = userInviteService.getInvitationLink(invite.invite_token);
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link Copied",
        description: `Invitation link copied for ${invite.email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy invitation link",
        variant: "destructive",
      });
    }
  };

  const handleResendInvite = async (invite: UserInvite) => {
    try {
      const result = await userInviteService.resendInvitation(invite.id);
      if (result.success) {
        toast({
          title: "Invitation Resent",
          description: `New invitation link generated for ${invite.email}`,
        });
        loadInvites();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resend invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvite = async () => {
    if (!selectedInvite) return;

    try {
      const result = await userInviteService.deleteInvite(selectedInvite.id);
      if (result.success) {
        toast({
          title: "Invitation Deleted",
          description: `Invitation for ${selectedInvite.email} has been deleted`,
        });
        loadInvites();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete invitation",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedInvite(null);
    }
  };

  const handlePromoteUser = async () => {
    if (!selectedInvite) return;

    try {
      const result = await userInviteService.promoteUserToAdmin(
        selectedInvite.id,
        selectedAdminLevel
      );

      if (result.success) {
        toast({
          title: "User Promoted",
          description: `${selectedInvite.name} has been promoted to ${selectedAdminLevel} admin`,
        });
        loadInvites();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to promote user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to promote user",
        variant: "destructive",
      });
    } finally {
      setPromoteDialogOpen(false);
      setSelectedInvite(null);
      setSelectedAdminLevel("standard");
    }
  };

  const getStatusBadge = (status: UserInvite["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-green-500"
          >
            <CheckCircle className="h-3 w-3" />
            Accepted
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date() > new Date(expiresAt);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Invitations</h2>
          <p className="text-muted-foreground">
            Manage user invitations and promote accepted users to admin roles
          </p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                All user invitations and their current status
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadInvites}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Invitations</h3>
              <p className="text-muted-foreground mb-4">
                Create your first user invitation to get started.
              </p>
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.name}</TableCell>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>{getStatusBadge(invite.status)}</TableCell>
                    <TableCell>
                      {new Date(invite.invited_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {isExpired(invite.expires_at) &&
                          invite.status === "pending" && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {invite.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyInviteLink(invite)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendInvite(invite)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {invite.status === "accepted" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInvite(invite);
                              setPromoteDialogOpen(true);
                            }}
                          >
                            <Crown className="h-4 w-4" />
                            Promote
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvite(invite);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UserInviteModal
        isOpen={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        onInviteCreated={loadInvites}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the invitation for{" "}
              <strong>{selectedInvite?.email}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvite}>
              Delete Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote User to Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Promote <strong>{selectedInvite?.name}</strong> to admin?
              <div className="mt-4">
                <label className="text-sm font-medium">Admin Level</label>
                <Select
                  value={selectedAdminLevel}
                  onValueChange={(value: "standard" | "super") =>
                    setSelectedAdminLevel(value)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Admin</SelectItem>
                    <SelectItem value="super">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePromoteUser}>
              Promote to Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
