import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Users, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

interface InvestorBasicInfo {
  id: string;
  name: string;
  preferred_industries: string;
  preferred_company_stage: string;
  average_ticket_size: string;
  company?: string;
  role?: string;
  city?: string;
  country?: string;
  number_of_investments?: number;
}

interface InvestorDetailModalProps {
  investor: InvestorBasicInfo;
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

const InvestorDetailModal: React.FC<InvestorDetailModalProps> = ({
  investor,
  isOpen,
  onClose,
  onConnect,
}) => {
  return (
    <dialog
      open={isOpen}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">{investor.name}</h2>
              <p className="text-muted-foreground">
                {investor.role}{" "}
                {investor.company ? `at ${investor.company}` : ""}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">
                Investment Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Industries
                  </p>
                  <p>{investor.preferred_industries || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Preferred Stage
                  </p>
                  <p>{investor.preferred_company_stage || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ticket Size
                  </p>
                  <p>{investor.average_ticket_size || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Previous Investments
                  </p>
                  <p>{investor.number_of_investments || "0"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Location</h3>
              <p>
                {investor.city && investor.country
                  ? `${investor.city}, ${investor.country}`
                  : "Not specified"}
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" className="mr-2" onClick={onClose}>
                Close
              </Button>
              <Button onClick={onConnect}>Connect</Button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};

interface StartupBrowseInvestorsProps {
  isDashboard?: boolean;
  maxInvestors?: number;
}

const StartupBrowseInvestors = ({
  isDashboard = false,
  maxInvestors,
}: StartupBrowseInvestorsProps) => {
  const [investors, setInvestors] = useState<InvestorBasicInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [selectedInvestor, setSelectedInvestor] =
    useState<InvestorBasicInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedInvestors, setSavedInvestors] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    fetchInvestors();
    if (!isDashboard) {
      fetchFilterOptions();
    }
  }, [isDashboard, maxInvestors]);

  useEffect(() => {
    if (!isDashboard) {
      fetchInvestors();
    }
  }, [searchTerm, selectedIndustry, selectedStage, isDashboard]);

  const fetchInvestors = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from("investors")
        .select(
          "id, name, preferred_industries, preferred_company_stage, average_ticket_size, company, role, city, country, number_of_investments"
        );

      if (isDashboard && maxInvestors) {
        query = query.limit(maxInvestors);
      } else {
        // Apply filters for non-dashboard view
        if (searchTerm) {
          query = query.or(
            `name.ilike.%${searchTerm}%,preferred_industries.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`
          );
        }

        if (selectedIndustry) {
          query = query.ilike("preferred_industries", `%${selectedIndustry}%`);
        }

        if (selectedStage) {
          query = query.eq("preferred_company_stage", selectedStage);
        }
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setInvestors(data || []);
    } catch (error) {
      console.error("Error fetching investors:", error);
      toast({
        title: "Error",
        description: "Failed to load investors",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Fetch unique industries from investors' preferred industries
      const { data: industriesData } = await supabase
        .from("investors")
        .select("preferred_industries");

      if (industriesData) {
        // Split comma-separated industries and flatten the array
        const allIndustries = industriesData
          .map(
            (item) =>
              item.preferred_industries?.split(",").map((i) => i.trim()) || []
          )
          .flat()
          .filter(Boolean);

        // Remove duplicates
        const uniqueIndustries = [...new Set(allIndustries)];
        setIndustries(uniqueIndustries);
      }

      // Fetch unique stages
      const { data: stagesData } = await supabase
        .from("investors")
        .select("preferred_company_stage");

      if (stagesData) {
        const uniqueStages = [
          ...new Set(
            stagesData
              .map((item) => item.preferred_company_stage)
              .filter(Boolean)
          ),
        ];
        setStages(uniqueStages);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const handleInvestorClick = (investor: InvestorBasicInfo) => {
    setSelectedInvestor(investor);
    setIsModalOpen(true);
  };

  const handleConnectInvestor = () => {
    toast({
      title: "Connection Request Sent",
      description: `Your request to connect with ${selectedInvestor?.name} has been sent.`,
    });
    setIsModalOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedIndustry("");
    setSelectedStage("");
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-lg p-6 shadow-md">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );

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
              <h1 className="text-4xl font-bold mb-4">Browse Investors</h1>
              <p className="text-xl text-muted-foreground">
                Connect with investors interested in your industry
              </p>
            </div>
          )}

          {!isDashboard && (
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-1/2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, industry, or company"
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-lg border"
                >
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">
                      Industry Focus
                    </label>
                    <Select
                      value={selectedIndustry}
                      onValueChange={setSelectedIndustry}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Industries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Industries</SelectItem>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">
                      Preferred Stage
                    </label>
                    <Select
                      value={selectedStage}
                      onValueChange={setSelectedStage}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Stages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Stages</SelectItem>
                        {stages.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="h-10"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {isLoading ? (
            renderSkeletons()
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {investors.map((investor) => (
                <motion.div
                  key={investor.id}
                  whileHover={{ y: -5 }}
                  className="bg-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{investor.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {investor.role}{" "}
                          {investor.company ? `at ${investor.company}` : ""}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {investor.preferred_company_stage || "Any Stage"}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div>
                        <span className="text-sm font-medium">Industries:</span>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {investor.preferred_industries ||
                            "Various Industries"}
                        </p>
                      </div>

                      <div>
                        <span className="text-sm font-medium">Location:</span>
                        <p className="text-sm text-muted-foreground">
                          {investor.city && investor.country
                            ? `${investor.city}, ${investor.country}`
                            : "Not specified"}
                        </p>
                      </div>

                      <div>
                        <span className="text-sm font-medium">
                          Ticket Size:
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {investor.average_ticket_size || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={() => handleInvestorClick(investor)}
                        size="sm"
                        className="rounded-full"
                      >
                        Details <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {investors.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No investors found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedIndustry || selectedStage
                  ? "Try adjusting your search criteria or filters."
                  : "No investors available at the moment. Check back later!"}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {selectedInvestor && (
        <InvestorDetailModal
          investor={selectedInvestor}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConnect={handleConnectInvestor}
        />
      )}
    </div>
  );
};

export default StartupBrowseInvestors;
