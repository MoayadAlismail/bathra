import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Users, ArrowRight, X, Axis3D } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import Footer from "@/components/Footer";
import {
  AdminInvestorInfo,
  InvestorFilters,
  PaginatedInvestors,
} from "@/lib/investor-types";
import { InvestorService } from "@/lib/investor-service";
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 12;

const MatchmakingInvestors = () => {
  const [investors, setInvestors] = useState<AdminInvestorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [industries, setIndustries] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvestors();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchInvestors();
  }, [
    searchTerm,
    selectedIndustry,
    selectedStage,
    selectedStatus,
    selectedCountry,
    currentPage,
  ]);

  const fetchInvestors = async () => {
    try {
      setIsLoading(true);

      const filters: InvestorFilters = {
        searchTerm: searchTerm || undefined,
        industry:
          selectedIndustry === "all"
            ? undefined
            : selectedIndustry || undefined,
        stage: selectedStage === "all" ? undefined : selectedStage || undefined,
        status:
          selectedStatus === "all" ? undefined : selectedStatus || undefined,
        country:
          selectedCountry === "all" ? undefined : selectedCountry || undefined,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      };

      const { data, error } = await InvestorService.getAllInvestors(filters);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      // Handle both paginated and non-paginated responses
      if (Array.isArray(data)) {
        setInvestors(data);
        setTotalPages(1);
        setTotal(data.length);
      } else {
        const paginatedData = data as PaginatedInvestors<AdminInvestorInfo>;
        setInvestors(paginatedData.investors);
        setTotalPages(paginatedData.totalPages);
        setTotal(paginatedData.total);
      }
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
      const [industriesResult, stagesResult] = await Promise.all([
        InvestorService.getIndustries(),
        InvestorService.getStages(),
      ]);

      if (industriesResult.data) {
        setIndustries(industriesResult.data);
      }

      if (stagesResult.data) {
        setStages(stagesResult.data);
      }

      // Get unique countries from investors
      const uniqueCountries = [
        ...new Set(investors.map((inv) => inv.country).filter(Boolean)),
      ];
      setCountries(uniqueCountries);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const handleInvestorClick = (investor: AdminInvestorInfo) => {
    navigate(`/admin/matchmaking/investor/${investor.id}`, {
      state: { investor },
    });
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

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedIndustry("all");
    setSelectedStage("all");
    setSelectedStatus("all");
    setSelectedCountry("all");
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
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                <Axis3D className="h-8 w-8 text-primary" />
                Matchmaking
              </h1>
              <p className="text-xl text-muted-foreground">
                Select an investor to start creating matches with startups
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search investors by name, email, or company..."
                    value={searchTerm}
                    onChange={(e) => handleSearchTermChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {showFilters && <X className="h-4 w-4" />}
                </Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-card rounded-lg">
                      <Select
                        value={selectedIndustry}
                        onValueChange={handleIndustryChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Industries</SelectItem>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedStage}
                        onValueChange={handleStageChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Stages</SelectItem>
                          {stages.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedStatus}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="flagged">Flagged</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedCountry}
                        onValueChange={handleCountryChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Countries</SelectItem>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results Summary */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {isLoading ? "Loading..." : `${total} investors found`}
                  </span>
                </div>
              </div>
            </div>

            {/* Investors Grid */}
            {isLoading ? (
              renderSkeletons()
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {investors.map((investor) => (
                  <motion.div
                    key={investor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleInvestorClick(investor)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {investor.name}
                      </h3>
                      <div className="flex items-center gap-2">
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
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-muted-foreground">
                        {investor.email}
                      </p>
                      <p className="text-sm font-medium">{investor.company}</p>
                      <p className="text-sm text-muted-foreground">
                        {investor.role} • {investor.country}
                      </p>
                    </div>

                    <div className="mb-4 space-y-2">
                      {investor.preferred_industries && (
                        <div className="flex flex-wrap gap-2">
                          {investor.preferred_industries
                            .split(",")
                            .map((industry, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {industry.trim()}
                              </Badge>
                            ))}
                        </div>
                      )}
                      {investor.preferred_company_stage && (
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {investor.preferred_company_stage}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <p>
                          Investments: {investor.number_of_investments || 0}
                        </p>
                        <p>
                          Ticket Size: {investor.average_ticket_size || "N/A"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Select
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && investors.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-2xl font-bold mb-2">No investors found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear all filters
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MatchmakingInvestors;
