import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import InvestorBrowseStartups from "@/components/InvestorBrowseStartups";
import InvestorProfileEditModal from "@/components/InvestorProfileEditModal";
import { Investor } from "@/lib/supabase";
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
import { isInvestorAccount } from "@/lib/account-types";
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
  Building2,
  TrendingUp,
  Edit,
  LogOut,
} from "lucide-react";
import { Startup, processStartupData } from "@/lib/supabase";
import { InvestorStartupConnectionService } from "@/lib/investor-startup-connection-service";
import Footer from "@/components/Footer";

const InvestorDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openStartup, setOpenStartup] = useState<string | null>(null);
  const [recentStartups, setRecentStartups] = useState<Startup[]>([]);
  const [investorDetails, setInvestorDetails] = useState<Investor | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [interestedStartupsCount, setInterestedStartupsCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchStartups();
      fetchRecentStartups();
      fetchInvestorDetails();
      fetchInterestedStartupsCount();
    }
  }, [user, navigate]);

  const fetchStartups = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("startups")
        .select("id, name, industry, stage, description")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        // Process data using our helper function to ensure correct types
        const typedStartups = processStartupData(data);
        setStartups(typedStartups);
      }
    } catch (error) {
      console.error("Error fetching startups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentStartups = async () => {
    try {
      const { data, error } = await supabase
        .from("startups")
        .select("id, name, industry, stage, description")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        // Process data using our helper function to ensure correct types
        const typedStartups = processStartupData(data);
        setRecentStartups(typedStartups);
      }
    } catch (error) {
      console.error("Error fetching recent startups:", error);
    }
  };

  const fetchInvestorDetails = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("investors")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setInvestorDetails(data);
      }
    } catch (error) {
      console.error("Error fetching investor details:", error);
    }
  };

  const fetchInterestedStartupsCount = async () => {
    try {
      if (!user?.id) return;

      const { data, error } =
        await InvestorStartupConnectionService.getConnections({
          investor_id: user.id,
          connection_type: "interested",
        });

      if (error) {
        console.error("Error fetching interested startups count:", error);
        return;
      }

      setInterestedStartupsCount(data.length);
    } catch (error) {
      console.error("Error fetching interested startups count:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfileUpdate = (updatedInvestor: Investor) => {
    setInvestorDetails(updatedInvestor);
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
                  Investor Dashboard
                </h1>
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                  disabled={!investorDetails}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              <div className="p-6 glass rounded-xl mb-8 border border-white/10">
                <h2 className="text-xl font-semibold mb-2">
                  Welcome back, {profile.name || "Investor"}
                </h2>
                <p className="text-muted-foreground">
                  Your investment profile is active and you can start browsing
                  startups now.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate("/startups/interested")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Interested Startups
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {interestedStartupsCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Startups you've shown interest in
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Investment Range
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {investorDetails?.average_ticket_size || "Not set"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average ticket size
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Investments
                    </CardTitle>
                    <FileText className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {investorDetails?.number_of_investments || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Investment experience
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold mb-3">Your Profile</h3>
                  <ul className="space-y-2">
                    <li>
                      <span className="text-muted-foreground">
                        Preferred Industries:
                      </span>{" "}
                      <span className="text-foreground">
                        {investorDetails?.preferred_industries ||
                          "Not specified"}
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">
                        Preferred Stage:
                      </span>{" "}
                      <span className="text-foreground">
                        {investorDetails?.preferred_company_stage ||
                          "Not specified"}
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">
                        Average Ticket Size:
                      </span>{" "}
                      <span className="text-foreground">
                        {investorDetails?.average_ticket_size ||
                          "Not specified"}
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">Location:</span>{" "}
                      <span className="text-foreground">
                        {investorDetails?.city
                          ? `${investorDetails.city}, ${investorDetails.country}`
                          : "Not specified"}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="glass p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/10 hover:bg-white/5 hover:text-black"
                      onClick={() => navigate("/startups")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Browse All Startups
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/10 hover:bg-white/5 hover:text-black"
                      onClick={() => navigate("/startups/interested")}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      View Interested Startups
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/10 hover:bg-white/5 text-red-400 hover:text-red-500"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Browse Startups Section */}
            <div className="neo-blur rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gradient mb-2">
                    Browse Startups
                  </h2>
                  <p className="text-muted-foreground">
                    Discover and connect with promising startups
                  </p>
                </div>
                <Button onClick={() => navigate("/startups")}>
                  View All Startups
                </Button>
              </div>

              {/* Browse Startups Component */}
              <InvestorBrowseStartups isDashboard={true} maxStartups={6} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {investorDetails && (
        <InvestorProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          investor={investorDetails}
          onUpdate={handleProfileUpdate}
        />
      )}
      <Footer />
    </div>
  );
};

export default InvestorDashboard;
