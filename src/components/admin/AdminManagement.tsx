import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Crown,
  User,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
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
import {
  adminService,
  AdminUserInfo,
  AdminInvite,
  CreateAdminData,
  AdminLevel,
} from "@/lib/admin-service";
import { useAuth } from "@/context/AuthContext";
import AddAdminModal from "./AddAdminModal";
import AdminDetailModal from "./AdminDetailModal";

const AdminManagement = () => {
  const [admins, setAdmins] = useState<AdminUserInfo[]>([]);
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<AdminLevel | "all">("all");
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUserInfo | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUserInfo | null>(
    null
  );
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    checkSuperAdminStatus();
  }, [user]);

  const checkSuperAdminStatus = async () => {
    if (!user?.id) return;
    try {
      const isSuper = await adminService.isSuperAdmin(user.id);
      setIsSuperAdmin(isSuper);
    } catch (error) {
      console.error("Error checking super admin status:", error);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [adminsResult, invitesResult] = await Promise.all([
        adminService.getAllAdmins(),
        adminService.getPendingInvites(),
      ]);

      if (adminsResult.error) {
        toast({
          title: "Error",
          description: adminsResult.error,
          variant: "destructive",
        });
      } else {
        setAdmins(adminsResult.data);
      }

      if (invitesResult.error) {
        console.error("Error loading invites:", invitesResult.error);
      } else {
        setInvites(invitesResult.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (admin: AdminUserInfo) => {
    setAdminToDelete(admin);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!adminToDelete || !user?.id) return;

    try {
      const result = await adminService.deleteAdmin(adminToDelete.id, user.id);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Admin deleted successfully",
        });
        loadAdminData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete admin",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setAdminToDelete(null);
    }
  };

  const handleViewDetails = (admin: AdminUserInfo) => {
    setSelectedAdmin(admin);
    setIsDetailModalOpen(true);
  };

  const handleCopyInviteLink = async (invite: AdminInvite) => {
    try {
      const inviteLink = adminService.getInvitationLink(invite.invite_token);
      await navigator.clipboard.writeText(inviteLink);

      toast({
        title: "Success",
        description: `Invitation link copied to clipboard for ${invite.email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy invitation link",
        variant: "destructive",
      });
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel =
      levelFilter === "all" || admin.admin_level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  const getAdminLevelColor = (level: AdminLevel) => {
    return level === "super"
      ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
      : "bg-blue-100 text-blue-800 hover:bg-blue-200";
  };

  const getAdminLevelIcon = (level: AdminLevel) => {
    return level === "super" ? Crown : User;
  };

  // Only show admin management to super admins
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
                Only super administrators can manage admin users.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Admin Management
          </h2>
          <p className="text-muted-foreground">
            Manage administrator accounts and invitations
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {admins.filter((admin) => admin.admin_level === "super").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invites
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invites.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
            <CardDescription>
              Admin invitations waiting to be accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{invite.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {invite.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={getAdminLevelColor(
                        invite.admin_level as AdminLevel
                      )}
                    >
                      {invite.admin_level}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Expires:{" "}
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyInviteLink(invite)}
                        className="h-6 w-6 p-0"
                        title="Copy invitation link"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Level</label>
              <Select
                value={levelFilter}
                onValueChange={(value: AdminLevel | "all") =>
                  setLevelFilter(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="super">Super Admin</SelectItem>
                  <SelectItem value="standard">Standard Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>Administrators ({filteredAdmins.length})</CardTitle>
          <CardDescription>
            Manage administrator accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => {
                    const LevelIcon = getAdminLevelIcon(admin.admin_level);
                    return (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {admin.avatar ? (
                              <img
                                src={admin.avatar}
                                alt={admin.name}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Shield className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{admin.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {admin.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${getAdminLevelColor(
                              admin.admin_level
                            )} flex items-center gap-1 w-fit`}
                          >
                            <LevelIcon className="h-3 w-3" />
                            {admin.admin_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {admin.phone_number || "Not provided"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {admin.location || "Not provided"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(admin.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(admin)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {admin.id !== user?.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteAdmin(admin)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredAdmins.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No administrators found
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals and Dialogs */}
      <AddAdminModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAdminAdded={loadAdminData}
      />

      {selectedAdmin && (
        <AdminDetailModal
          admin={selectedAdmin}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          onAdminUpdated={loadAdminData}
        />
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Administrator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {adminToDelete?.name}? This action
              cannot be undone and will immediately revoke their admin access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminManagement;
