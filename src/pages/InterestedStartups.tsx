import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StartupDetailModal from "@/components/StartupDetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvestorStartupConnectionService } from "@/lib/investor-startup-connection-service";
import { StartupService } from "@/lib/startup-service";
import { StartupBasicInfo } from "@/lib/startup-types";
import { InvestorStartupConnection } from "@/lib/supabase";
import {
  Star,
  Building2,
  ArrowRight,
  Calendar,
  Mail,
  ExternalLink,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";

const InterestedStartups = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<InvestorStartupConnection[]>(
    []
  );
  const [startups, setStartups] = useState<StartupBasicInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStartup, setSelectedStartup] =
    useState<StartupBasicInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchInterestedStartups();
  }, [user, navigate]);

  const fetchInterestedStartups = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Get all connections where this investor showed interest
      const { data: connectionsData, error: connectionsError } =
        await InvestorStartupConnectionService.getConnections({
          investor_id: user.id,
          connection_type: "interested",
        });

      if (connectionsError) {
        toast({
          title: "Error",
          description: connectionsError,
          variant: "destructive",
        });
        return;
      }

      setConnections(connectionsData);

      // If there are connections, fetch the startup details
      if (connectionsData.length > 0) {
        const startupIds = connectionsData.map((conn) => conn.startup_id);

        // Fetch detailed startup information
        const { data: startupsData, error: startupsError } =
          await StartupService.getStartupsByIds(startupIds);

        if (startupsError) {
          toast({
            title: "Error",
            description: startupsError,
            variant: "destructive",
          });
          return;
        }

        setStartups(startupsData);
      }
    } catch (error) {
      console.error("Error fetching interested startups:", error);
      toast({
        title: "Error",
        description: "Failed to load interested startups",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartupClick = (startup: StartupBasicInfo) => {
    setSelectedStartup(startup);
    setIsModalOpen(true);
  };

  const handleRemoveInterest = async (startupId: string) => {
    if (!user?.id) return;

    try {
      // Find the connection to archive
      const connection = connections.find(
        (conn) => conn.startup_id === startupId
      );

      if (!connection) return;

      const { success, error } =
        await InvestorStartupConnectionService.archiveConnection(connection.id);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setConnections((prev) =>
        prev.filter((conn) => conn.id !== connection.id)
      );
      setStartups((prev) => prev.filter((startup) => startup.id !== startupId));

      toast({
        title: "Interest Removed",
        description: "You have removed your interest in this startup",
      });
    } catch (error) {
      console.error("Error removing interest:", error);
      toast({
        title: "Error",
        description: "Failed to remove interest",
        variant: "destructive",
      });
    }
  };

  const getConnectionDate = (startupId: string) => {
    const connection = connections.find(
      (conn) => conn.startup_id === startupId
    );
    return connection?.created_at
      ? new Date(connection.created_at).toLocaleDateString()
      : "";
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full mb-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

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
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/startups")}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Browse More Startups
              </Button>
            </div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gradient flex items-center gap-2">
                Interested Startups
              </h1>
              <p className="text-muted-foreground mt-1">
                Startups you've expressed interest in
              </p>
            </div>

            {/* Stats Card */}
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Your Interest Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {connections.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Startups Interested In
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {new Set(startups.map((s) => s.industry)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Industries Covered
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {
                        connections.filter(
                          (conn) =>
                            new Date(conn.created_at).getTime() >
                            Date.now() - 30 * 24 * 60 * 60 * 1000
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      This Month
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            {isLoading ? (
              renderSkeletons()
            ) : connections.length === 0 ? (
              <div className="text-center py-16">
                <Star className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">
                  No Interested Startups Yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You haven't expressed interest in any startups yet. Browse our
                  vetted startups to find exciting investment opportunities.
                </p>
                <Button
                  onClick={() => navigate("/startups")}
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Browse Startups
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {startups.map((startup) => (
                  <motion.div
                    key={startup.id}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-1">
                              {startup.startup_name || startup.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{startup.stage}</Badge>
                              <Badge variant="secondary">
                                {startup.industry}
                              </Badge>
                            </div>
                          </div>
                          <Star className="h-5 w-5 text-black fill-black" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {startup.problem_solved || startup.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Interested on {getConnectionDate(startup.id)}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleStartupClick(startup)}
                            className="flex-1"
                          >
                            View Details
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveInterest(startup.id)}
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                          >
                            Remove
                          </Button>
                        </div>

                        {startup.website && (
                          <div className="pt-2 border-t">
                            <a
                              href={startup.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Visit Website
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Startup Detail Modal */}
      {selectedStartup && (
        <StartupDetailModal
          startup={{
            ...selectedStartup,
            funding_required:
              selectedStartup.funding_required || "Not specified",
            valuation: selectedStartup.valuation || "Not specified",
          }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {}}
          isSaved={false}
          onRequestInfo={() => {}}
          onInterested={() => {}}
          isInterested={true}
        />
      )}

      <Footer />
    </div>
  );
};

export default InterestedStartups;
