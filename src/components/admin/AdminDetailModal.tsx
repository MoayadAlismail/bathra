import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader,
  Shield,
  Crown,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
} from "lucide-react";
import {
  adminService,
  AdminUserInfo,
  AdminLevel,
  CreateAdminData,
} from "@/lib/admin-service";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  admin_level: z.enum(["super", "standard"], {
    required_error: "Please select an admin level",
  }),
  phone_number: z.string().optional(),
  location: z.string().optional(),
});

interface AdminDetailModalProps {
  admin: AdminUserInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdminUpdated: () => void;
}

const AdminDetailModal = ({
  admin,
  open,
  onOpenChange,
  onAdminUpdated,
}: AdminDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: admin.name,
      admin_level: admin.admin_level as AdminLevel,
      phone_number: admin.phone_number || "",
      location: admin.location || "",
    },
  });

  // Check if current user is super admin
  React.useEffect(() => {
    const checkSuperAdmin = async () => {
      if (user?.id) {
        const isSuper = await adminService.isSuperAdmin(user.id);
        setIsSuperAdmin(isSuper);
      }
    };
    checkSuperAdmin();
  }, [user]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: Partial<CreateAdminData> = {
        name: values.name,
        admin_level: values.admin_level as AdminLevel,
        phone_number: values.phone_number || undefined,
        location: values.location || undefined,
      };

      const result = await adminService.updateAdminProfile(
        admin.id,
        updateData
      );

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Admin profile updated successfully",
        });

        setIsEditing(false);
        onAdminUpdated();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update admin profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset({
      name: admin.name,
      admin_level: admin.admin_level as AdminLevel,
      phone_number: admin.phone_number || "",
      location: admin.location || "",
    });
    setIsEditing(false);
  };

  const getAdminLevelColor = (level: AdminLevel) => {
    return level === "super"
      ? "bg-purple-100 text-purple-800"
      : "bg-blue-100 text-blue-800";
  };

  const getAdminLevelIcon = (level: AdminLevel) => {
    return level === "super" ? Crown : User;
  };

  const LevelIcon = getAdminLevelIcon(admin.admin_level);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administrator Details
          </DialogTitle>
          <DialogDescription>
            View and manage administrator information and permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            {admin.avatar ? (
              <img
                src={admin.avatar}
                alt={admin.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{admin.name}</h3>
              <p className="text-muted-foreground">{admin.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={`${getAdminLevelColor(
                    admin.admin_level
                  )} flex items-center gap-1`}
                >
                  <LevelIcon className="h-3 w-3" />
                  {admin.admin_level} admin
                </Badge>
                {admin.id === user?.id && <Badge variant="outline">You</Badge>}
              </div>
            </div>
            {isSuperAdmin && admin.id !== user?.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isSubmitting}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            )}
          </div>

          {isEditing ? (
            /* Edit Form */
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="admin_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Standard Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="super">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4" />
                              Super Admin
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Not provided" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Not provided" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-medium mb-4">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {admin.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {admin.phone_number || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {admin.location || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(admin.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Permissions */}
              <div>
                <h4 className="text-lg font-medium mb-4">
                  Permissions & Access
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Admin Dashboard Access</p>
                        <p className="text-sm text-muted-foreground">
                          Can access the admin dashboard
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Granted
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">User Management</p>
                        <p className="text-sm text-muted-foreground">
                          Can manage startup and investor accounts
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Granted
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Admin Management</p>
                        <p className="text-sm text-muted-foreground">
                          Can manage other admin accounts
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        admin.admin_level === "super"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {admin.admin_level === "super" ? "Granted" : "Denied"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDetailModal;
