import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Building,
  ArrowRight,
  X,
  Edit,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StartupService } from "@/lib/startup-service";
import {
  AdminStartupInfo,
  StartupFilters,
  PaginatedStartups,
} from "@/lib/startup-types";
import { Pagination } from "@/components/ui/pagination";
import AdminStartupEditModal from "./AdminStartupEditModal";

const ITEMS_PER_PAGE = 12;

// Helper function to convert Google Drive URLs to embeddable format
const getEmbeddablePdfUrl = (url: string): string => {
  // Check if it's a Google Drive URL
  const driveRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:drive\.google\.com\/file\/d\/|docs\.google\.com\/document\/d\/)([a-zA-Z0-9-_]+)/;
  const match = url.match(driveRegex);

  if (match) {
    const fileId = match[1];
    // Convert to preview format for embedding
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // For other PDF URLs, add PDF.js viewer parameters
  if (url.toLowerCase().includes(".pdf") || url.includes("pdf")) {
    return `${url}#toolbar=1&navpanes=1&scrollbar=1`;
  }

  return url;
};

const AdminBrowseStartups = () => {
  const [startups, setStartups] = useState<AdminStartupInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedStartup, setSelectedStartup] =
    useState<AdminStartupInfo | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [industries, setIndustries] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isPdfFullScreen, setIsPdfFullScreen] = useState(false);
  const pdfPreviewRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchStartups();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchStartups();
  }, [searchTerm, selectedIndustry, selectedStage, currentPage]);

  const fetchStartups = async () => {
    try {
      setIsLoading(true);

      const filters: StartupFilters = {
        searchTerm: searchTerm || undefined,
        industry:
          selectedIndustry === "all"
            ? undefined
            : selectedIndustry || undefined,
        stage: selectedStage === "all" ? undefined : selectedStage || undefined,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      };

      const { data, error } = await StartupService.getAllStartups(filters);

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
        setStartups(data);
        setTotalPages(1);
        setTotal(data.length);
      } else {
        const paginatedData = data as PaginatedStartups<AdminStartupInfo>;
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

  const handleStartupClick = (startup: AdminStartupInfo) => {
    setSelectedStartup(startup);
    setIsDetailModalOpen(true);
    setShowPdfPreview(false);
    setIsPdfFullScreen(false);
  };

  const handleShowPreview = () => {
    setShowPdfPreview(!showPdfPreview);
    // Scroll to preview after state update
    if (!showPdfPreview) {
      setTimeout(() => {
        pdfPreviewRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleEditClick = (startup: AdminStartupInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStartup(startup);
    setIsEditModalOpen(true);
  };

  const handleStartupUpdated = () => {
    fetchStartups();
    setIsEditModalOpen(false);
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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedIndustry("all");
    setSelectedStage("all");
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
    <div className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Manage Startups</h1>
            <p className="text-xl text-muted-foreground">
              Browse and edit all startup profiles
            </p>
          </div>

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
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg"
                >
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

                  <Button variant="outline" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isLoading ? (
            renderSkeletons()
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {startups.map((startup) => (
                <motion.div
                  key={startup.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border cursor-pointer"
                  onClick={() => handleStartupClick(startup)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{startup.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="secondary">{startup.industry}</Badge>
                        <Badge variant="outline">{startup.stage}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditClick(startup, e)}
                      className="flex-shrink-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {startup.description || "No description available"}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Funding Required</p>
                      <p className="font-medium">
                        {startup.funding_required || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valuation</p>
                      <p className="font-medium">
                        {startup.valuation || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Results count */}
          {!isLoading && (
            <div className="text-center mb-8">
              <p className="text-muted-foreground">
                {total === 0
                  ? "No startups found"
                  : `${total} startup${total !== 1 ? "s" : ""} found`}
              </p>
            </div>
          )}

          {!isLoading && startups.length === 0 && (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No startups found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search filters
              </p>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
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

      {/* Startup Detail Modal */}
      {selectedStartup && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {selectedStartup.startup_name || selectedStartup.name}
                  </DialogTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">
                      {selectedStartup.industry}
                    </Badge>
                    <Badge variant="outline">{selectedStartup.stage}</Badge>
                    <Badge
                      variant={
                        selectedStartup.verified ? "default" : "secondary"
                      }
                    >
                      {selectedStartup.verified ? "Verified" : "Unverified"}
                    </Badge>
                    <Badge variant="outline">
                      {selectedStartup.status || "Pending"}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </DialogHeader>
            <div className="flex-grow overflow-auto pt-2">
              <div className="space-y-4">
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Founder
                      </p>
                      <p className="font-medium">{selectedStartup.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Email
                      </p>
                      <p className="font-medium">
                        {selectedStartup.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Phone
                      </p>
                      <p className="font-medium">
                        {selectedStartup.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Website
                      </p>
                      <p className="font-medium">
                        {selectedStartup.website ? (
                          <a
                            href={selectedStartup.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {selectedStartup.website}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">
                    Business Overview
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Problem
                      </p>
                      <p className="font-medium">
                        {selectedStartup.problem_solving || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Solution
                      </p>
                      <p className="font-medium">
                        {selectedStartup.solution || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Uniqueness
                      </p>
                      <p className="font-medium">
                        {selectedStartup.uniqueness || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">
                    Financial Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Funding Required
                      </p>
                      <p className="text-xl font-bold">
                        {selectedStartup.capital_seeking
                          ? `$${selectedStartup.capital_seeking.toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Valuation
                      </p>
                      <p className="text-xl font-bold">
                        {selectedStartup.pre_money_valuation
                          ? `$${selectedStartup.pre_money_valuation.toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Previous Year Revenue
                      </p>
                      <p className="font-medium">
                        {selectedStartup.previous_financial_year_revenue
                          ? `$${selectedStartup.previous_financial_year_revenue.toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Monthly Burn Rate
                      </p>
                      <p className="font-medium">
                        {selectedStartup.monthly_burn_rate
                          ? `$${selectedStartup.monthly_burn_rate.toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Investment Instrument
                      </p>
                      <p className="font-medium">
                        {selectedStartup.investment_instrument ||
                          "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Funding Raised
                      </p>
                      <p className="font-medium">
                        {selectedStartup.funding_already_raised
                          ? `$${selectedStartup.funding_already_raised.toLocaleString()}`
                          : "None"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">Team</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Team Size
                      </p>
                      <p className="font-medium">
                        {selectedStartup.team_size || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Pitch Deck
                      </p>
                      <div className="font-medium">
                        {selectedStartup.pitch_deck ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShowPreview}
                                className="flex items-center gap-2"
                              >
                                {showPdfPreview ? (
                                  <>
                                    <EyeOff className="h-4 w-4" />
                                    Hide Preview
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4" />
                                    Show Preview
                                  </>
                                )}
                              </Button>
                              <a
                                href={selectedStartup.pitch_deck}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                              >
                                Open in new tab
                              </a>
                            </div>

                            {showPdfPreview && (
                              <div ref={pdfPreviewRef} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground">
                                    PDF Preview
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setIsPdfFullScreen(true);
                                      setIsDetailModalOpen(false);
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <Maximize className="h-4 w-4" />
                                    Full Screen
                                  </Button>
                                </div>
                                <div className="border rounded-lg overflow-hidden h-[400px]">
                                  <iframe
                                    src={getEmbeddablePdfUrl(
                                      selectedStartup.pitch_deck
                                    )}
                                    className="w-full h-full"
                                    title="Pitch Deck Preview"
                                    sandbox="allow-same-origin allow-scripts"
                                    allow="autoplay"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          "Not provided"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Full Screen PDF Overlay */}
      {isPdfFullScreen && selectedStartup?.pitch_deck && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="w-full h-full max-w-7xl max-h-full p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-medium">
                {selectedStartup.startup_name} - Pitch Deck
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPdfFullScreen(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 bg-white rounded-lg overflow-hidden">
              <iframe
                src={getEmbeddablePdfUrl(selectedStartup.pitch_deck)}
                className="w-full h-full"
                title="Pitch Deck Full Screen"
                sandbox="allow-same-origin allow-scripts"
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedStartup && (
        <AdminStartupEditModal
          startup={selectedStartup}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onStartupUpdated={handleStartupUpdated}
        />
      )}
    </div>
  );
};

export default AdminBrowseStartups;
