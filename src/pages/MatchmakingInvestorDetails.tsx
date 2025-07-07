import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Axis3D,
  Unplug,
  Building,
  Users,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdminNavbar from "@/components/AdminNavbar";
import Footer from "@/components/Footer";
import { AdminInvestorInfo } from "@/lib/investor-types";
import { InvestorService } from "@/lib/investor-service";

const MatchmakingInvestorDetails = () => {
  const { investorId } = useParams<{ investorId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [investor, setInvestor] = useState<AdminInvestorInfo | null>(
    location.state?.investor || null
  );
  const [isLoading, setIsLoading] = useState(!investor);

  useEffect(() => {
    if (!investor && investorId) {
      fetchInvestorDetails();
    }
  }, [investorId, investor]);

  const fetchInvestorDetails = async () => {
    if (!investorId) return;

    try {
      setIsLoading(true);
      const { data, error } = await InvestorService.getInvestorById(investorId);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        navigate("/admin/matchmaking");
        return;
      }

      setInvestor(data);
    } catch (error) {
      console.error("Error fetching investor details:", error);
      toast({
        title: "Error",
        description: "Failed to load investor details",
        variant: "destructive",
      });
      navigate("/admin/matchmaking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/admin/matchmaking");
  };

  const handleCreateMatch = () => {
    navigate(`/admin/matchmaking/investor/${investorId}/select-startups`, {
      state: { investor },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="py-28">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Investor not found</h2>
              <Button onClick={handleBackClick} variant="outline">
                Back to Matchmaking
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={handleBackClick}
                className="mb-4 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Matchmaking
              </Button>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Unplug className="h-8 w-8 text-primary" />
                    Create Match
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Selected investor: {investor.name}
                  </p>
                </div>
                <Button
                  onClick={handleCreateMatch}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <Building className="h-4 w-4" />
                  Select Startups
                </Button>
              </div>
            </div>

            {/* Investor Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{investor.name}</h3>
                    <p className="text-muted-foreground">{investor.role}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{investor.email}</span>
                  </div>

                  {investor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{investor.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {investor.city}, {investor.country}
                    </span>
                  </div>

                  {investor.company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{investor.company}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Born: {investor.birthday}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        investor.status === "approved"
                          ? "default"
                          : investor.status === "pending"
                          ? "secondary"
                          : investor.status === "rejected"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {investor.status}
                    </Badge>
                    {investor.visibility_status && (
                      <Badge variant="outline">
                        {investor.visibility_status}
                      </Badge>
                    )}
                    {investor.verified && (
                      <Badge variant="default">Verified</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Investment Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Axis3D className="h-5 w-5" />
                    Investment Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {investor.preferred_industries && (
                    <div>
                      <h4 className="font-medium mb-2">Preferred Industries</h4>
                      <div className="flex flex-wrap gap-2">
                        {investor.preferred_industries
                          .split(",")
                          .map((industry, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-sm"
                            >
                              {industry.trim()}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {investor.preferred_company_stage && (
                    <div>
                      <h4 className="font-medium mb-2">
                        Preferred Company Stage
                      </h4>
                      <Badge variant="outline">
                        {investor.preferred_company_stage}
                      </Badge>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Investment Experience</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Investments:
                        </span>
                        <p className="font-medium">
                          {investor.number_of_investments || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Avg. Ticket Size:
                        </span>
                        <p className="font-medium">
                          {investor.average_ticket_size || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={investor.secured_lead_investor}
                        disabled
                        className="rounded"
                      />
                      <span className="text-sm">Secured Lead Investor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={investor.participated_as_advisor}
                        disabled
                        className="rounded"
                      />
                      <span className="text-sm">Participated as Advisor</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {investor.strong_candidate_reason && (
                    <div>
                      <h4 className="font-medium mb-2">
                        Strong Candidate Reason
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {investor.strong_candidate_reason}
                      </p>
                    </div>
                  )}

                  {investor.heard_about_us && (
                    <div>
                      <h4 className="font-medium mb-2">
                        How They Heard About Us
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {investor.heard_about_us}
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {investor.linkedin_profile && (
                      <div>
                        <h4 className="font-medium mb-2">LinkedIn</h4>
                        <a
                          href={investor.linkedin_profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {investor.linkedin_profile}
                        </a>
                      </div>
                    )}

                    {investor.calendly_link && (
                      <div>
                        <h4 className="font-medium mb-2">Calendly</h4>
                        <a
                          href={investor.calendly_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {investor.calendly_link}
                        </a>
                      </div>
                    )}
                  </div>

                  {investor.admin_notes && (
                    <div>
                      <h4 className="font-medium mb-2">Admin Notes</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {investor.admin_notes}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      Created:{" "}
                      {new Date(investor.created_at).toLocaleDateString()}
                    </p>
                    {investor.updated_at && (
                      <p>
                        Updated:{" "}
                        {new Date(investor.updated_at).toLocaleDateString()}
                      </p>
                    )}
                    {investor.verified_at && (
                      <p>
                        Verified:{" "}
                        {new Date(investor.verified_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MatchmakingInvestorDetails;
