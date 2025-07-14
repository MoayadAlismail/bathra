import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase, Startup } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Edit, ArrowLeft, ExternalLink, DollarSign, Users } from "lucide-react";
import StartupProfileEditModal from "@/components/StartupProfileEditModal";
import Footer from "@/components/Footer";

interface SocialMediaAccount {
  platform: string;
  url: string;
}

interface CoFounder {
  name: string;
  role?: string;
  email?: string;
  linkedin?: string;
}

interface AdditionalFile {
  name: string;
  url: string;
  type?: string;
}

const StartupProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [startupDetails, setStartupDetails] = useState<Startup | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleProfileUpdate = (updatedStartup: Startup) => {
    setStartupDetails(updatedStartup);
  };

  const handleViewPitchDeck = async (pitchDeckUrl: string) => {
    try {
      console.log("pitchDeckUrl", pitchDeckUrl);

      // Since we're using a public bucket, we can open URLs directly
      // Just validate the URL exists and is accessible
      if (pitchDeckUrl && pitchDeckUrl.trim() !== "") {
        window.open(pitchDeckUrl, "_blank");
      } else {
        console.error("No pitch deck URL provided");
      }
    } catch (error) {
      console.error("Error opening pitch deck:", error);
      // Try to open anyway as fallback
      if (pitchDeckUrl) {
        window.open(pitchDeckUrl, "_blank");
      }
    }
  };

  if (!user || !profile) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
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
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="outline"
                onClick={() => navigate("/startup-dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button
                onClick={() => setIsEditModalOpen(true)}
                disabled={!startupDetails}
                className="ml-auto"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-4">
              Startup Profile
            </h1>

            {/* Profile Content */}
            <div className="neo-blur rounded-2xl shadow-lg p-8">
              {/* Basic Information */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-2xl font-bold text-white">
                    {startupDetails?.name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {startupDetails?.name || "Startup Name"}
                    </h2>
                    <p className="text-muted-foreground">
                      {startupDetails?.industry || "Industry"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          startupDetails?.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {startupDetails?.status === "approved"
                          ? "Approved"
                          : "Pending Verification"}
                      </span>
                    </div>
                  </div>
                </div>

                {startupDetails?.website && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(startupDetails.website, "_blank")
                    }
                    className="mb-6"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Website
                  </Button>
                )}
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Company Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Industry
                        </label>
                        <p className="text-foreground">
                          {startupDetails?.industry || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Stage
                        </label>
                        <p className="text-foreground">
                          {startupDetails?.stage || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Team Size
                        </label>
                        <p className="text-foreground">
                          {startupDetails?.team_size || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Social Media
                        </label>
                        <div className="text-foreground">
                          {startupDetails?.social_media_accounts ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {(() => {
                                try {
                                  const socialMedia = JSON.parse(
                                    startupDetails.social_media_accounts
                                  );
                                  return Array.isArray(socialMedia)
                                    ? socialMedia.map(
                                        (
                                          account: SocialMediaAccount,
                                          index: number
                                        ) => (
                                          <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              window.open(account.url, "_blank")
                                            }
                                            className="text-xs"
                                          >
                                            <ExternalLink className="mr-1 h-3 w-3" />
                                            {account.platform}
                                          </Button>
                                        )
                                      )
                                    : null;
                                } catch {
                                  return (
                                    <span className="text-sm break-words">
                                      {startupDetails.social_media_accounts}
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                          ) : (
                            <p className="text-sm">Not specified</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Funding Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Funding Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Capital Seeking
                        </label>
                        <p className="text-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {startupDetails?.capital_seeking
                            ? `$${startupDetails.capital_seeking.toLocaleString()}`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Funding Already Raised
                        </label>
                        <p className="text-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {startupDetails?.funding_already_raised
                            ? `$${startupDetails.funding_already_raised.toLocaleString()}`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Pre-Money Valuation
                        </label>
                        <p className="text-foreground">
                          {startupDetails?.pre_money_valuation ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">About</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Problem We're Solving
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {startupDetails?.problem_solving ||
                            "No description provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Our Solution
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {startupDetails?.solution || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          What Makes Us Unique
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {startupDetails?.uniqueness || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Co-Founders
                        </label>
                        <div className="text-foreground mt-1">
                          {startupDetails?.co_founders ? (
                            <div className="space-y-2">
                              {(() => {
                                try {
                                  const coFounders = JSON.parse(
                                    startupDetails.co_founders
                                  );
                                  return Array.isArray(coFounders)
                                    ? coFounders.map(
                                        (founder: CoFounder, index: number) => (
                                          <div
                                            key={index}
                                            className="bg-muted/50 rounded-lg p-3 text-sm"
                                          >
                                            <div className="font-medium">
                                              {founder.name}
                                            </div>
                                            {founder.role && (
                                              <div className="text-muted-foreground text-xs">
                                                {founder.role}
                                              </div>
                                            )}
                                            {founder.email && (
                                              <div className="text-xs mt-1">
                                                <a
                                                  href={`mailto:${founder.email}`}
                                                  className="text-primary hover:underline"
                                                >
                                                  {founder.email}
                                                </a>
                                              </div>
                                            )}
                                            {founder.linkedin && (
                                              <div className="text-xs mt-1">
                                                <a
                                                  href={founder.linkedin}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-primary hover:underline flex items-center gap-1"
                                                >
                                                  <ExternalLink className="h-3 w-3" />
                                                  LinkedIn
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      )
                                    : null;
                                } catch {
                                  return (
                                    <span className="text-sm break-words">
                                      {startupDetails.co_founders}
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                          ) : (
                            <p className="text-sm">Not specified</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Financial Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Previous Year Revenue
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {startupDetails?.previous_financial_year_revenue
                            ? `$${startupDetails.previous_financial_year_revenue.toLocaleString()}`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Current Year Revenue
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {startupDetails?.current_financial_year_revenue
                            ? `$${startupDetails.current_financial_year_revenue.toLocaleString()}`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Monthly Burn Rate
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {startupDetails?.monthly_burn_rate
                            ? `$${startupDetails.monthly_burn_rate.toLocaleString()}`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Investment Instrument
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {startupDetails?.investment_instrument ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Has Received Funding
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {startupDetails?.has_received_funding !== undefined
                            ? startupDetails.has_received_funding
                              ? "Yes"
                              : "No"
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Traction & Growth */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Traction & Growth
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Key Achievements
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {startupDetails?.achievements || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Risks & Challenges
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {startupDetails?.risks || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Risk Mitigation Strategy
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {startupDetails?.risk_mitigation || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Exit Strategy
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {startupDetails?.exit_strategy || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Participated in Accelerator
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {startupDetails?.participated_in_accelerator
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Team & Resources */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Team & Resources
                    </h3>
                    <div className="space-y-4">
                      {/* Video Link */}
                      {startupDetails?.video_link && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Video Presentation
                          </label>
                          <div className="mt-1">
                            <Button
                              variant="outline"
                              onClick={() =>
                                window.open(startupDetails.video_link, "_blank")
                              }
                              className="text-sm"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Watch Video
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Pitch Deck */}
                      {startupDetails?.pitch_deck && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Pitch Deck
                          </label>
                          <div className="mt-1">
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleViewPitchDeck(startupDetails.pitch_deck!)
                              }
                              className="text-sm"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Pitch Deck
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Additional Files */}
                      {startupDetails?.additional_files && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Additional Files
                          </label>
                          <div className="mt-1">
                            {(() => {
                              try {
                                const files = JSON.parse(
                                  startupDetails.additional_files
                                );
                                return Array.isArray(files) ? (
                                  <div className="flex flex-wrap gap-2">
                                    {files.map(
                                      (file: AdditionalFile, index: number) => (
                                        <Button
                                          key={index}
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            window.open(file.url, "_blank")
                                          }
                                          className="text-xs"
                                        >
                                          <ExternalLink className="mr-1 h-3 w-3" />
                                          {file.name}
                                          {file.type && (
                                            <span className="ml-1 text-muted-foreground">
                                              ({file.type})
                                            </span>
                                          )}
                                        </Button>
                                      )
                                    )}
                                  </div>
                                ) : null;
                              } catch {
                                return (
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      window.open(
                                        startupDetails.additional_files!,
                                        "_blank"
                                      )
                                    }
                                    className="text-sm"
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Files
                                  </Button>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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

export default StartupProfile;
