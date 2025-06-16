import { motion } from "framer-motion";
import AdminNavbar from "@/components/AdminNavbar";
import DashboardStats from "@/components/admin/DashboardStats";
import UserManagement from "@/components/admin/UserManagement";
import BlogManagement from "@/components/admin/BlogManagement";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  Building,
  Mail,
  TrendingUp,
  Settings,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Admin = () => {
  // Determine initial tab based on current path
  const getInitialTab = (): "dashboard" | "users" | "blog" => {
    const path = window.location.pathname;
    if (path.includes("/admin/users")) return "users";
    if (path.includes("/admin/blog")) return "blog";
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "blog">(
    getInitialTab()
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      {/* Admin Dashboard Content */}
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your startup-investor platform from here
            </p>

            {/* Tab Navigation */}
            <div className="flex gap-2 mt-6">
              <Button
                variant={activeTab === "dashboard" ? "default" : "outline"}
                onClick={() => setActiveTab("dashboard")}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === "users" ? "default" : "outline"}
                onClick={() => setActiveTab("users")}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                User Management
              </Button>
              <Button
                variant={activeTab === "blog" ? "default" : "outline"}
                onClick={() => setActiveTab("blog")}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Blog Management
              </Button>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "dashboard" ? (
              <DashboardStats />
            ) : activeTab === "users" ? (
              <UserManagement />
            ) : (
              <BlogManagement />
            )}
          </motion.div>

          {/* Recent Activity - Only show on dashboard */}
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
            >
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest actions on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">New startup registered</p>
                        <p className="text-sm text-muted-foreground">
                          EcoSolutions - CleanTech
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        2 hours ago
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Investor match made</p>
                        <p className="text-sm text-muted-foreground">
                          MediTech matched with VC Fund
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        5 hours ago
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">New email subscriber</p>
                        <p className="text-sm text-muted-foreground">
                          investor@example.com
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        1 day ago
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Overview
                  </CardTitle>
                  <CardDescription>
                    Platform health and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Platform Status
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Operational
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Database Health
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Excellent
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        API Response Time
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ~120ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Active Sessions
                      </span>
                      <span className="text-sm text-muted-foreground">143</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
