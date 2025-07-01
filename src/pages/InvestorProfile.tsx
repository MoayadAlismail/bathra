import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase, Investor } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Edit,
  ArrowLeft,
  Building2,
  DollarSign,
  ExternalLink,
  Calendar,
} from "lucide-react";
import InvestorProfileEditModal from "@/components/InvestorProfileEditModal";
import Footer from "@/components/Footer";

interface SocialMediaAccount {
  platform: string;
  url: string;
}

const InvestorProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [investorDetails, setInvestorDetails] = useState<Investor | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
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
      } finally {
        setIsLoading(false);
      }
    };

    if (!user) {
      navigate("/login");
    } else {
      fetchInvestorDetails();
    }
  }, [user, navigate]);

  const handleProfileUpdate = (updatedInvestor: Investor) => {
    setInvestorDetails(updatedInvestor);
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
                onClick={() => navigate("/investor-dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button
                onClick={() => setIsEditModalOpen(true)}
                disabled={!investorDetails}
                className="ml-auto"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-4">
              Investor Profile
            </h1>

            {/* Profile Content */}
            <div className="neo-blur rounded-2xl shadow-lg p-8">
              {/* Basic Information */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-2xl font-bold text-white">
                    {investorDetails?.name?.charAt(0) || "I"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {investorDetails?.name || "Investor Name"}
                    </h2>
                    <p className="text-muted-foreground">
                      {investorDetails?.role || "Investor"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          investorDetails?.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {investorDetails?.status === "approved"
                          ? "Verified Investor"
                          : "Pending Verification"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Company/Organization
                        </label>
                        <p className="text-foreground">
                          {investorDetails?.company || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Role/Title
                        </label>
                        <p className="text-foreground">
                          {investorDetails?.role || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Location
                        </label>
                        <p className="text-foreground">
                          {investorDetails?.city && investorDetails?.country
                            ? `${investorDetails.city}, ${investorDetails.country}`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          How They Heard About Us
                        </label>
                        <p className="text-foreground">
                          {investorDetails?.heard_about_us || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Investment Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Investment Profile
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Preferred Industries
                        </label>
                        <p className="text-foreground">
                          {investorDetails?.preferred_industries ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Preferred Company Stage
                        </label>
                        <p className="text-foreground">
                          {investorDetails?.preferred_company_stage ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Average Ticket Size
                        </label>
                        <p className="text-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {investorDetails?.average_ticket_size ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Number of Investments
                        </label>
                        <p className="text-foreground flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {investorDetails?.number_of_investments ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Experience & Background
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Strong Candidate Reason
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {investorDetails?.strong_candidate_reason ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Secured Lead Investor
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {investorDetails?.secured_lead_investor !== undefined
                            ? investorDetails.secured_lead_investor
                              ? "Yes"
                              : "No"
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Participated as Advisor
                        </label>
                        <p className="text-foreground text-sm leading-relaxed mt-1">
                          {investorDetails?.participated_as_advisor !==
                          undefined
                            ? investorDetails.participated_as_advisor
                              ? "Yes"
                              : "No"
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Media & Contact */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Contact & Social
                    </h3>
                    <div className="space-y-4">
                      {investorDetails?.linkedin_profile && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            LinkedIn Profile
                          </label>
                          <div className="mt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  investorDetails.linkedin_profile,
                                  "_blank"
                                )
                              }
                              className="text-xs"
                            >
                              <ExternalLink className="mr-1 h-3 w-3" />
                              LinkedIn
                            </Button>
                          </div>
                        </div>
                      )}

                      {investorDetails?.other_social_media_profile && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Other Social Media
                          </label>
                          <div className="text-foreground mt-1">
                            {(() => {
                              try {
                                const socialMedia = JSON.parse(
                                  investorDetails.other_social_media_profile
                                );
                                return Array.isArray(socialMedia) ? (
                                  <div className="flex flex-wrap gap-2">
                                    {socialMedia.map(
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
                                    )}
                                  </div>
                                ) : null;
                              } catch {
                                return (
                                  <span className="text-sm break-words">
                                    {investorDetails.other_social_media_profile}
                                  </span>
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

export default InvestorProfile;
