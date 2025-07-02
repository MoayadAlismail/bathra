import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase, Startup } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { User, ArrowRight } from "lucide-react";
import MatchmakingOrb from "@/components/MatchmakingOrb";
import Footer from "@/components/Footer";

const StartupDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [startupDetails, setStartupDetails] = useState<Startup | null>(null);

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

    if (!user) {
      navigate("/login");
    } else {
      fetchStartupDetails();
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
            <p className="text-muted-foreground">Loading dashboard...</p>
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
                  Startup Dashboard
                </h1>
                <Button
                  onClick={() => navigate("/startup-profile")}
                  className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                >
                  <User className="h-4 w-4" />
                  View Profile
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 glass rounded-xl border border-white/10">
                <h2 className="text-xl font-semibold mb-2">
                  Welcome back, {startupDetails?.name || "Startup"}
                </h2>
                <p className="text-muted-foreground">
                  Your startup profile is{" "}
                  {startupDetails?.status === "approved"
                    ? "approved"
                    : "pending verification"}{" "}
                  and ready for matchmaking.
                </p>
              </div>
            </div>

            {/* Matchmaking Section */}
            <div className="neo-blur rounded-2xl shadow-lg p-8">
              <MatchmakingOrb userType="startup" />
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StartupDashboard;
