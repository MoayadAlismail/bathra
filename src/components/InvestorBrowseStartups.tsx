import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Building, ArrowRight, X, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import StartupDetailModal from "@/components/StartupDetailModal";
import { StartupService } from "@/lib/startup-service";
import {
  StartupBasicInfo,
  StartupFilters,
  PaginatedStartups,
} from "@/lib/startup-types";
import { Pagination } from "@/components/ui/pagination";
import { InvestorStartupConnectionService } from "@/lib/investor-startup-connection-service";

interface InvestorBrowseStartupsProps {
  isDashboard?: boolean;
  maxStartups?: number;
}

const ITEMS_PER_PAGE = 12;

const InvestorBrowseStartups = ({
  isDashboard = false,
  maxStartups,
}: InvestorBrowseStartupsProps) => {
  const navigate = useNavigate();
  const [startups, setStartups] = useState<StartupBasicInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] =
    useState<string>("all-industries");
  const [selectedStage, setSelectedStage] = useState<string>("all-stages");
  const [selectedStartup, setSelectedStartup] =
    useState<StartupBasicInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedStartups, setSavedStartups] = useState<string[]>([]);
  const [interestedStartups, setInterestedStartups] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { user, profile } = useAuth();

  useEffect(() => {
    fetchStartups();
    if (!isDashboard) {
      fetchFilterOptions();
    }
    if (user?.id) {
      loadInterestedStartups();
    }
  }, [isDashboard, maxStartups, user?.id]);

  useEffect(() => {
    if (!isDashboard) {
      fetchStartups();
    }
  }, [searchTerm, selectedIndustry, selectedStage, currentPage, isDashboard]);

  const fetchStartups = async () => {
    try {
      setIsLoading(true);

      const filters: StartupFilters = {
        searchTerm: searchTerm || undefined,
        industry:
          selectedIndustry && selectedIndustry !== "all-industries"
            ? selectedIndustry
            : undefined,
        stage:
          selectedStage && selectedStage !== "all-stages"
            ? selectedStage
            : undefined,
      };

      const { data, error } = isDashboard
        ? await StartupService.getDashboardStartups(maxStartups || 6)
        : await StartupService.getVettedStartups({
            ...filters,
            limit: ITEMS_PER_PAGE,
            offset: (currentPage - 1) * ITEMS_PER_PAGE,
          });

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      // Handle both paginated and non-paginated responses
      if (isDashboard || Array.isArray(data)) {
        setStartups(data as StartupBasicInfo[]);
        setTotalPages(1);
        setTotal(Array.isArray(data) ? data.length : 0);
      } else {
        const paginatedData = data as PaginatedStartups;
        setStartups(paginatedData.startups);
        setTotalPages(paginatedData.totalPages);
        setTotal(paginatedData.total);
      }
    } catch (error) {
      console.error("Error fetching startups:", error);
      toast({
        title: "Error",
        description: "Failed to load startups",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [industriesResult, stagesResult] = await Promise.all([
        StartupService.getIndustries(),
        StartupService.getStages(),
      ]);

      if (industriesResult.data) {
        setIndustries(industriesResult.data);
      }

      if (stagesResult.data) {
        setStages(stagesResult.data);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const loadInterestedStartups = async () => {
    if (!user?.id) return;

    try {
      const { data } = await InvestorStartupConnectionService.getConnections({
        investor_id: user.id,
        connection_type: "interested",
      });

      if (data) {
        const startupIds = data.map((connection) => connection.startup_id);
        setInterestedStartups(startupIds);
      }
    } catch (error) {
      console.error("Error loading interested startups:", error);
    }
  };

  const handleStartupClick = (startup: StartupBasicInfo) => {
    setSelectedStartup(startup);
    setIsModalOpen(true);
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value);
    setCurrentPage(1);
  };

  const handleStageChange = (value: string) => {
    setSelectedStage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSaveStartup = () => {
    if (!selectedStartup) return;

    if (savedStartups.includes(selectedStartup.id)) {
      setSavedStartups((prev) =>
        prev.filter((id) => id !== selectedStartup.id)
      );
      toast({
        title: "Removed from saved",
        description: `${selectedStartup.name} has been removed from your saved startups`,
      });
    } else {
      setSavedStartups((prev) => [...prev, selectedStartup.id]);
      toast({
        title: "Startup saved",
        description: `${selectedStartup.name} has been added to your saved startups`,
      });
    }
  };

  const handleRequestInfo = () => {
    // This is now handled by the InfoRequestModal component
    // The old toast functionality is replaced by the modal
  };

  const handleInterested = async () => {
    if (!selectedStartup || !user || !profile) {
      toast({
        title: "Error",
        description: "You must be logged in to show interest",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } =
        await InvestorStartupConnectionService.createConnection({
          investor_id: user.id,
          startup_id: selectedStartup.id,
          connection_type: "interested",
          investor_name: profile.name || "Unknown Investor",
          investor_email: profile.email || user.email || "",
          investor_calendly_link: profile.calendly_link,
          startup_name: selectedStartup.startup_name || selectedStartup.name,
          startup_email: selectedStartup.email,
        });

      if (error) {
        if (error === "Connection already exists") {
          toast({
            title: "Already Interested",
            description: "You have already shown interest in this startup",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          });
        }
        return;
      }

      // Update local state
      setInterestedStartups((prev) => [...prev, selectedStartup.id]);

      toast({
        title: "Interest Recorded!",
        description: `Your interest in ${
          selectedStartup.startup_name || selectedStartup.name
        } has been recorded. The startup will be notified.`,
      });
    } catch (error) {
      console.error("Error showing interest:", error);
      toast({
        title: "Error",
        description: "Failed to record interest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedIndustry("all-industries");
    setSelectedStage("all-stages");
    setCurrentPage(1);
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-lg p-6 shadow-md">
          <Skeleton className="h-40 w-full mb-4" />
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
              <h1 className="text-4xl font-bold mb-4">Browse Startups</h1>
              <p className="text-xl text-muted-foreground">
                Discover verified startups with high growth potential
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
                    placeholder="Search by name, industry, or description"
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => handleSearchTermChange(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none"
                    onClick={() => navigate("/startups/interested")}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Interested ({interestedStartups.length})
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </Button>
                </div>
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
                      Industry
                    </label>
                    <Select
                      value={selectedIndustry}
                      onValueChange={handleIndustryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Industries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-industries">
                          All Industries
                        </SelectItem>
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
                      Stage
                    </label>
                    <Select
                      value={selectedStage}
                      onValueChange={handleStageChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Stages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-stages">All Stages</SelectItem>
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
              {startups.map((startup) => (
                <motion.div
                  key={startup.id}
                  whileHover={{ y: -5 }}
                  className="bg-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div
                    className="h-40 bg-center bg-cover"
                    style={{
                      backgroundImage: `url(${
                        startup.image ||
                        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop"
                      })`,
                    }}
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{startup.name}</h3>
                      <div className="flex space-x-2">
                        <Badge variant="outline">{startup.stage}</Badge>
                        <Badge variant="secondary">{startup.industry}</Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {startup.description}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium">Valuation:</span>
                        <span className="ml-1 text-sm">
                          {startup.valuation
                            ? `$${startup.valuation}`
                            : "Undisclosed"}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleStartupClick(startup)}
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

          {/* Results count */}
          {!isDashboard && !isLoading && (
            <div className="text-center mb-8">
              <p className="text-muted-foreground">
                {total === 0
                  ? "No startups found"
                  : `${total} startup${total !== 1 ? "s" : ""} found`}
              </p>
            </div>
          )}

          {startups.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No startups found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedIndustry || selectedStage
                  ? "Try adjusting your search criteria or filters."
                  : "No verified startups available at the moment. Check back later!"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {!isDashboard && !isLoading && totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={isLoading}
              />
            </div>
          )}
        </motion.div>
      </div>

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
          onSave={handleSaveStartup}
          isSaved={savedStartups.includes(selectedStartup.id)}
          onRequestInfo={handleRequestInfo}
          onInterested={handleInterested}
          isInterested={interestedStartups.includes(selectedStartup.id)}
        />
      )}
    </div>
  );
};

export default InvestorBrowseStartups;
