import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Building,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { adminService } from "@/lib/admin-service";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalStartups: 0,
    totalInvestors: 0,
    pendingApprovals: 0,
    approvedUsers: 0,
    rejectedUsers: 0,
    flaggedUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await adminService.getDashboardStats();

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      setStats(result.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Startups",
      value: stats.totalStartups.toString(),
      change: null,
      icon: Building,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Investors",
      value: stats.totalInvestors.toString(),
      change: null,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals.toString(),
      change: null,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Approved Users",
      value: stats.approvedUsers.toString(),
      change: null,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejected Users",
      value: stats.rejectedUsers.toString(),
      change: null,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Flagged Users",
      value: stats.flaggedUsers.toString(),
      change: null,
      icon: Flag,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground">
            Real-time platform statistics and user metrics
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                {stat.change && (
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.change}</span> from
                    last month
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Summary
          </CardTitle>
          <CardDescription>Platform status at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Status Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium">User Status Breakdown</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Approved
                  </span>
                  <span className="text-sm font-medium">
                    {stats.approvedUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    Pending
                  </span>
                  <span className="text-sm font-medium">
                    {stats.pendingApprovals}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Flag className="h-4 w-4 text-orange-600" />
                    Flagged
                  </span>
                  <span className="text-sm font-medium">
                    {stats.flaggedUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Rejected
                  </span>
                  <span className="text-sm font-medium">
                    {stats.rejectedUsers}
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Health */}
            <div className="space-y-3">
              <h4 className="font-medium">Platform Health</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Users</span>
                  <span className="text-sm font-medium">
                    {stats.totalStartups + stats.totalInvestors}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Approval Rate</span>
                  <span className="text-sm font-medium">
                    {stats.totalStartups + stats.totalInvestors > 0
                      ? Math.round(
                          (stats.approvedUsers /
                            (stats.totalStartups + stats.totalInvestors)) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Reviews</span>
                  <span className="text-sm font-medium">
                    {stats.pendingApprovals > 0 ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        {stats.pendingApprovals} waiting
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        All caught up
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
