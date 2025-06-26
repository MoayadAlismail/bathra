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
} from "lucide-react";
import StartupProfileEditModal from "@/components/StartupProfileEditModal";
import InvestorDetailModal from "@/components/InvestorDetailModal";
import { toast } from "@/components/ui/use-toast";
import TestNotificationCreator from "@/components/TestNotificationCreator";
import Footer from "@/components/Footer";

const StartupDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  //const [investors, setInvestors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startupDetails, setStartupDetails] = useState<Startup | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  //const [recentInvestors, setRecentInvestors] = useState([]);
  //const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [isInvestorModalOpen, setIsInvestorModalOpen] = useState(false);

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

    // const fetchRecentInvestors = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from("investors")
    //       .select(
    //         "id, name, preferred_industries, preferred_company_stage, average_ticket_size"
    //       )
    //       .order("created_at", { ascending: false })
    //       .limit(5);

    //     if (error) throw error;

    //     if (data) {
    //       setRecentInvestors(data);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching recent investors:", error);
    //   }
    // };

    if (!user) {
      navigate("/login");
    } else {
      fetchStartupDetails();
      //fetchRecentInvestors();
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

  // const handleInvestorClick = (investor: Investor) => {
  //   setSelectedInvestor(investor);
  //   setIsInvestorModalOpen(true);
  // };

  // const handleConnectInvestor = () => {
  //   toast({
  //     title: "Connection Request Sent",
  //     description: `Your request to connect with ${selectedInvestor?.name} has been sent.`,
  //   });
  //   setIsInvestorModalOpen(false);
  // };

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
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Profile Views
                    </CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Investors who viewed your profile
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Discussions
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Ongoing investment discussions
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Funding Goal
                    </CardTitle>
                    <FileText className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {startupDetails?.pre_money_valuation || "$0"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Target funding amount
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
                      <span className="text-muted-foreground">Industry:</span>{" "}
                      <span className="text-foreground">
                        {startupDetails?.industry || "Not specified"}
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">Stage:</span>{" "}
                      <span className="text-foreground">
                        {startupDetails?.stage || "Not specified"}
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">Valuation:</span>{" "}
                      <span className="text-foreground">
                        {startupDetails?.pre_money_valuation || "Not specified"}
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">Team Size:</span>{" "}
                      <span className="text-foreground">
                        {startupDetails?.team_size || "Not specified"}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="glass p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold mb-4">
                    Business Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Problem We Solve:
                      </span>
                      <p className="text-sm mt-1 text-foreground leading-relaxed">
                        {startupDetails?.problem_solving || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Our Solution:
                      </span>
                      <p className="text-sm mt-1 text-foreground leading-relaxed">
                        {startupDetails?.solution || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Unique Value Proposition:
                      </span>
                      <p className="text-sm mt-1 text-foreground leading-relaxed">
                        {startupDetails?.uniqueness || "Not specified"}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Funding Raised:
                          </span>
                          <p className="text-sm text-foreground">
                            $
                            {startupDetails?.funding_already_raised?.toLocaleString() ||
                              0}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Monthly Burn:
                          </span>
                          <p className="text-sm text-foreground">
                            $
                            {startupDetails?.monthly_burn_rate?.toLocaleString() ||
                              0}
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

            {/* Recent Investors Section */}
            {/* <div className="neo-blur rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gradient mb-2">
                    Recent Investors
                  </h2>
                  <p className="text-muted-foreground">
                    Potential investors who might be interested in your startup
                  </p>
                </div>
                <Button onClick={() => navigate("/investors")}>
                  View All Investors
                </Button>
              </div> */}

            {/* Recent Investors List */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentInvestors.length > 0 ? (
                  recentInvestors.map((investor: Investor) => (
                    <Card
                      key={investor.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle>{investor.name}</CardTitle>
                        <CardDescription>
                          {investor.preferred_industries ||
                            "Various Industries"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">
                              Preferred Stage:
                            </span>{" "}
                            <span className="text-sm">
                              {investor.preferred_company_stage || "Any"}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">
                              Ticket Size:
                            </span>{" "}
                            <span className="text-sm">
                              {investor.average_ticket_size || "Varies"}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => handleInvestorClick(investor)}
                          >
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      No investors found
                    </h3>
                    <p className="text-muted-foreground">
                      No investors available at the moment. Check back later!
                    </p>
                  </div>
                )}
              </div>
            </div> */}
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

      {/* Investor Detail Modal */}
      {/* {selectedInvestor && (
        <InvestorDetailModal
          investor={selectedInvestor}
          isOpen={isInvestorModalOpen}
          onClose={() => setIsInvestorModalOpen(false)}
          onConnect={handleConnectInvestor}
        />
      )} */}
      <Footer />
    </div>
  );
};

export default StartupDashboard;
