import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase, Investor } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { User, ArrowRight, Building, Eye } from "lucide-react";
import MatchmakingOrb from "@/components/MatchmakingOrb";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { TranslationKey } from "@/context/LanguageContext";
import { MatchmakingService } from "@/lib/matchmaking-service";
import InvestorBrowseStartups from "@/components/InvestorBrowseStartups";

const InvestorDashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [investorDetails, setInvestorDetails] = useState<Investor | null>(null);
  const [hasMatchedStartups, setHasMatchedStartups] = useState(false);
  const [matchedStartupsCount, setMatchedStartupsCount] = useState(0);

  useEffect(() => {
    const fetchInvestorData = async () => {
      try {
        if (!user?.id) return;

        // Fetch investor details and matchmakings in parallel
        const [investorResult, matchmakingsResult] = await Promise.all([
          supabase.from("investors").select("*").eq("id", user.id).single(),
          MatchmakingService.getMatchmakingsByInvestor(user.id),
        ]);

        if (investorResult.error) throw investorResult.error;

        if (investorResult.data) {
          setInvestorDetails(investorResult.data);
        }

        // Check for active matchmakings
        if (matchmakingsResult.data) {
          // Get current date and date from 7 days ago
          const currentDate = new Date();
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(currentDate.getDate() - 7);

          // Filter out archived matchmakings and those older than 7 days
          const activeMatchmakings = matchmakingsResult.data.filter((m) => {
            // Check if not archived
            if (m.is_archived) return false;

            // Check if created within last 7 days
            const createdDate = new Date(m.created_at);
            return createdDate >= sevenDaysAgo;
          });

          const uniqueStartupIds = [
            ...new Set(activeMatchmakings.map((m) => m.startup_id)),
          ];
          setHasMatchedStartups(uniqueStartupIds.length > 0);
          setMatchedStartupsCount(uniqueStartupIds.length);
        }
      } catch (error) {
        console.error("Error fetching investor data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!user) {
      navigate("/login");
    } else {
      fetchInvestorData();
    }
  }, [user, navigate]);

  if (!user || !profile) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {t("loadingDashboard" as TranslationKey)}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gradient">
                  {t("investorDashboardTitle" as TranslationKey)}
                </h1>
                <Button
                  onClick={() => navigate("/investor-profile")}
                  className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                >
                  <User className="h-4 w-4" />
                  {t("viewProfile" as TranslationKey)}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 glass rounded-xl border border-white/10">
                <h2 className="text-xl font-semibold mb-2">
                  {t("welcomeBack" as TranslationKey)}
                  {profile?.name ||
                    t("investorRolePlaceholder" as TranslationKey)}
                </h2>
                <p className="text-muted-foreground">
                  {t("investorProfileActive" as TranslationKey)}
                </p>
              </div>
            </div>

            {/* Matchmaking Section */}
            <div className="neo-blur rounded-2xl shadow-lg p-8">
              {hasMatchedStartups ? (
                <div className="space-y-6">
                  {/* Matched Startups Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gradient mb-4">
                      Your Matched Startups
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      {matchedStartupsCount} startup
                      {matchedStartupsCount !== 1 ? "s" : ""} carefully selected
                      for you
                    </p>
                  </div>

                  {/* Preview of Matched Startups */}
                  <div className="mb-6">
                    <InvestorBrowseStartups
                      isDashboard={true}
                      maxStartups={3}
                    />
                  </div>

                  {/* View All Button */}
                  <div className="text-center">
                    <Button
                      onClick={() => navigate("/startups")}
                      size="lg"
                      className="gap-2"
                    >
                      View All Matched Startups
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gradient mb-4">
                      Finding Your Perfect Matches
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      Our team is working to find startups that align with your
                      investment preferences
                    </p>
                  </div>
                  <MatchmakingOrb userType="investor" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InvestorDashboard;
