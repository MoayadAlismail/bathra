import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Investor, supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Startup } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { isStartupAccount } from "@/lib/account-types";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  TrendingUp,
  Edit,
  LogOut,
  Building2,
  ExternalLink,
  DollarSign,
} from "lucide-react";
import StartupProfileEditModal from "@/components/StartupProfileEditModal";
import InvestorDetailModal from "@/components/InvestorDetailModal";
import StartupInterestedInvestors from "@/components/StartupInterestedInvestors";
import { toast } from "@/components/ui/use-toast";
import TestNotificationCreator from "@/components/TestNotificationCreator";
import Footer from "@/components/Footer";
import { InvestorStartupConnectionService } from "@/lib/investor-startup-connection-service";

const StartupDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [startupDetails, setStartupDetails] = useState<Startup | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [interestedInvestorsCount, setInterestedInvestorsCount] = useState(0);
  const [recentInterestCount, setRecentInterestCount] = useState(0);

  useEffect(() => {
    const fetchStartupDetails = async () => {
      try {
        if (!user?.id) return;

        const { data, error } = await supabase
          .from("startups")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setStartupDetails(data);
        }
      } catch (error) {
        console.error("Error fetching startup details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDashboardStats = async () => {
      if (!user?.id) return;

      try {
        // Fetch interested investors
        const { data: interestedConnections, error: interestedError } =
          await InvestorStartupConnectionService.getConnections({
            startup_id: user.id,
            connection_type: "interested",
            status: "active",
          });

        if (!interestedError && interestedConnections) {
          setInterestedInvestorsCount(interestedConnections.length);

          // Count recent interest (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const recentConnections = interestedConnections.filter(
            (conn) => new Date(conn.created_at) > thirtyDaysAgo
          );
          setRecentInterestCount(recentConnections.length);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    if (!user) {
      navigate("/login");
    } else {
      fetchStartupDetails();
      fetchDashboardStats();
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfileUpdate = (updatedStartup: Startup) => {
    setStartupDetails(updatedStartup);
  };

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            {/* Dashboard Header */}
            <div className="neo-blur rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gradient">
                  Startup Dashboard
                </h1>
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                  disabled={!startupDetails}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              <div className="p-6 glass rounded-xl mb-8 border border-white/10">
                <h2 className="text-xl font-semibold mb-2">
                  Welcome back, {startupDetails?.name || "Startup"}
                </h2>
                <p className="text-muted-foreground">
                  Your startup profile is{" "}
                  {startupDetails?.status === "approved"
                    ? "approved"
                    : "pending verification"}{" "}
                  and visible to investors in your industry.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate("/interested-investors")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Interested Investors
                    </CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {interestedInvestorsCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Investors showing interest
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Funding Raised
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      $
                      {startupDetails?.funding_already_raised?.toLocaleString() ||
                        0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total funding raised to date
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Recent Activity
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {recentInterestCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      New interest this month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold mb-4">Your Profile</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Industry:</span>
                      <span className="text-foreground font-medium">
                        {startupDetails?.industry || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Stage:</span>
                      <span className="text-foreground font-medium">
                        {startupDetails?.stage || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Team Size:</span>
                      <span className="text-foreground font-medium">
                        {startupDetails?.team_size || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-foreground font-medium capitalize">
                        {startupDetails?.status || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold mb-4">Key Highlights</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">
                        Our Solution
                      </span>
                      <p className="text-sm text-foreground line-clamp-2">
                        {startupDetails?.solution || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">
                        What Makes Us Unique
                      </span>
                      <p className="text-sm text-foreground line-clamp-2">
                        {startupDetails?.uniqueness || "Not specified"}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground block">
                            Seeking
                          </span>
                          <p className="text-sm text-foreground font-medium">
                            {startupDetails?.capital_seeking
                              ? `$${startupDetails.capital_seeking.toLocaleString()}`
                              : "TBD"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground block">
                            Valuation
                          </span>
                          <p className="text-sm text-foreground font-medium">
                            {startupDetails?.pre_money_valuation || "TBD"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {startupDetails?.website && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start border-white/10 hover:bg-white/5 hover:text-black"
                          onClick={() =>
                            window.open(startupDetails.website, "_blank")
                          }
                        >
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Visit Website
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interested Investors Section */}
            <div className="neo-blur rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gradient mb-2">
                    Interested Investors
                  </h2>
                  <p className="text-muted-foreground">
                    Investors who have shown interest in your startup
                  </p>
                </div>
                <Button onClick={() => navigate("/interested-investors")}>
                  View All Investors
                </Button>
              </div>

              <StartupInterestedInvestors isDashboard={true} maxInvestors={6} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {startupDetails && (
        <StartupProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          startup={startupDetails}
          onUpdate={handleProfileUpdate}
        />
      )}

      <Footer />
    </div>
  );
};

export default StartupDashboard;
