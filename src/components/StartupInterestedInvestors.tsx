import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  MessageCircle,
  Building2,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { InvestorStartupConnectionService } from "@/lib/investor-startup-connection-service";

interface InterestedInvestor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role: string;
  city?: string;
  country?: string;
  preferred_industries?: string;
  preferred_company_stage?: string;
  average_ticket_size?: string;
  number_of_investments?: number;
  linkedin_profile?: string;
  calendly_link?: string;
  connection_date: string;
}

interface InvestorDetailModalProps {
  investor: InterestedInvestor | null;
  isOpen: boolean;
  onClose: () => void;
}

const InterestedInvestorDetailModal: React.FC<InvestorDetailModalProps> = ({
  investor,
  isOpen,
  onClose,
}) => {
  if (!investor) return null;

  const handleContactInvestor = (
    method: "email" | "phone" | "calendly" | "linkedin"
  ) => {
    switch (method) {
      case "email":
        window.open(`mailto:${investor.email}`);
        break;
      case "phone":
        if (investor.phone) {
          window.open(`tel:${investor.phone}`);
        }
        break;
      case "calendly":
        if (investor.calendly_link) {
          window.open(investor.calendly_link, "_blank");
        }
        break;
      case "linkedin":
        if (investor.linkedin_profile) {
          window.open(investor.linkedin_profile, "_blank");
        }
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1 pr-2">
              <DialogTitle className="text-xl sm:text-2xl font-bold break-words">
                {investor.name}
              </DialogTitle>
              <p className="text-muted-foreground text-sm sm:text-base break-words">
                {investor.role}{" "}
                {investor.company ? `at ${investor.company}` : ""}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Showed interest on{" "}
                {new Date(investor.connection_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-200">
            <h3 className="text-base sm:text-lg font-medium mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-black flex-shrink-0" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600 hover:text-blue-800 text-left break-all"
                      onClick={() => handleContactInvestor("email")}
                    >
                      {investor.email}
                    </Button>
                  </div>
                </div>

                {investor.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">Phone</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-blue-600 hover:text-blue-800 text-left"
                        onClick={() => handleContactInvestor("phone")}
                      >
                        {investor.phone}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {investor.calendly_link && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">Schedule Meeting</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-blue-600 hover:text-blue-800 text-left"
                        onClick={() => handleContactInvestor("calendly")}
                      >
                        Book a time slot
                      </Button>
                    </div>
                  </div>
                )}

                {investor.linkedin_profile && (
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">LinkedIn</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-blue-600 hover:text-blue-800 text-left"
                        onClick={() => handleContactInvestor("linkedin")}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Investment Preferences */}
          <div>
            <h3 className="text-base sm:text-lg font-medium mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
              Investment Preferences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Industries
                </p>
                <p className="mt-1 text-sm sm:text-base break-words">
                  {investor.preferred_industries || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Preferred Stage
                </p>
                <p className="mt-1 text-sm sm:text-base">
                  {investor.preferred_company_stage || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ticket Size
                </p>
                <p className="mt-1 text-sm sm:text-base">
                  {investor.average_ticket_size || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Previous Investments
                </p>
                <p className="mt-1 text-sm sm:text-base">
                  {investor.number_of_investments || "0"}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-base sm:text-lg font-medium mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
              Location
            </h3>
            <p className="text-sm sm:text-base break-words">
              {investor.city && investor.country
                ? `${investor.city}, ${investor.country}`
                : "Not specified"}
            </p>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="order-last sm:order-first w-full sm:w-auto"
            >
              Close
            </Button>
            <Button
              onClick={() => handleContactInvestor("email")}
              className="w-full sm:flex-1"
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            {investor.calendly_link && (
              <Button
                onClick={() => handleContactInvestor("calendly")}
                variant="secondary"
                className="w-full sm:flex-1"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Call
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface StartupInterestedInvestorsProps {
  isDashboard?: boolean;
  maxInvestors?: number;
}

const StartupInterestedInvestors = ({
  isDashboard = false,
  maxInvestors,
}: StartupInterestedInvestorsProps) => {
  const [investors, setInvestors] = useState<InterestedInvestor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] =
    useState<InterestedInvestor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchInterestedInvestors();
  }, [user?.id, maxInvestors]);

  const fetchInterestedInvestors = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // First, get all connections where this startup is the target
      const { data: connections, error: connectionsError } =
        await InvestorStartupConnectionService.getConnections({
          startup_id: user.id,
          connection_type: "interested",
          status: "active",
        });

      if (connectionsError) {
        toast({
          title: "Error",
          description: connectionsError,
          variant: "destructive",
        });
        return;
      }

      if (!connections || connections.length === 0) {
        setInvestors([]);
        return;
      }

      // Get investor IDs from connections
      const investorIds = connections.map((conn) => conn.investor_id);

      // Fetch full investor details
      let query = supabase
        .from("investors")
        .select(
          `
          id, name, email, phone, company, role, city, country,
          preferred_industries, preferred_company_stage, average_ticket_size,
          number_of_investments, linkedin_profile, calendly_link
        `
        )
        .in("id", investorIds);

      if (isDashboard && maxInvestors) {
        query = query.limit(maxInvestors);
      }

      const { data: investorsData, error: investorsError } = await query;

      if (investorsError) {
        toast({
          title: "Error",
          description: "Failed to load investor details",
          variant: "destructive",
        });
        return;
      }

      // Combine investor data with connection dates
      const enrichedInvestors: InterestedInvestor[] = investorsData.map(
        (investor) => {
          const connection = connections.find(
            (conn) => conn.investor_id === investor.id
          );
          return {
            ...investor,
            connection_date: connection?.created_at || new Date().toISOString(),
          };
        }
      );

      // Sort by connection date (most recent first)
      enrichedInvestors.sort(
        (a, b) =>
          new Date(b.connection_date).getTime() -
          new Date(a.connection_date).getTime()
      );

      setInvestors(enrichedInvestors);
    } catch (error) {
      console.error("Error fetching interested investors:", error);
      toast({
        title: "Error",
        description: "Failed to load interested investors",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvestorClick = (investor: InterestedInvestor) => {
    setSelectedInvestor(investor);
    setIsModalOpen(true);
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-48">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className={`${isDashboard ? "" : "py-20"}`}>
        <div className="container mx-auto px-4">
          {!isDashboard && (
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Interested Investors</h1>
              <p className="text-xl text-muted-foreground">
                Investors who have shown interest in your startup
              </p>
            </div>
          )}
          {renderSkeletons()}
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDashboard ? "" : "py-20"}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!isDashboard && (
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Interested Investors</h1>
              <p className="text-xl text-muted-foreground">
                Investors who have shown interest in your startup
              </p>
            </div>
          )}

          {investors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">
                No interested investors yet
              </h3>
              <p className="text-muted-foreground">
                When investors show interest in your startup, they'll appear
                here with their contact details.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investors.map((investor) => (
                <motion.div key={investor.id} whileHover={{ y: -5 }}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-black-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {investor.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {investor.role}
                            {investor.company ? ` at ${investor.company}` : ""}
                          </p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            Interested{" "}
                            {new Date(
                              investor.connection_date
                            ).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="text-sm">
                          <span className="font-medium">Industries:</span>
                          <p className="text-muted-foreground line-clamp-2">
                            {investor.preferred_industries || "Various"}
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Ticket Size:</span>
                          <p className="text-muted-foreground">
                            {investor.average_ticket_size || "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleInvestorClick(investor)}
                          className="flex-1"
                          size="sm"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() =>
                            window.open(`mailto:${investor.email}`)
                          }
                          variant="outline"
                          size="sm"
                          className="px-3"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <InterestedInvestorDetailModal
        investor={selectedInvestor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default StartupInterestedInvestors;
