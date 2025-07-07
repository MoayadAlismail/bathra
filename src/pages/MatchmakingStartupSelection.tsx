import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Building,
  ArrowLeft,
  X,
  Plus,
  Trash2,
  Check,
  MessageSquare,
} from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminNavbar from "@/components/AdminNavbar";
import Footer from "@/components/Footer";
import { StartupService } from "@/lib/startup-service";
import { MatchmakingService } from "@/lib/matchmaking-service";
import {
  AdminStartupInfo,
  StartupFilters,
  PaginatedStartups,
} from "@/lib/startup-types";
import { AdminInvestorInfo } from "@/lib/investor-types";
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 12;
const MAX_STARTUPS = 3;

interface SelectedStartup {
  id: string;
  name: string;
  email: string;
  industry: string;
  stage: string;
  description: string;
  comment?: string;
}

const MatchmakingStartupSelection = () => {
  const { investorId } = useParams<{ investorId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const investor = location.state?.investor as AdminInvestorInfo;

  const [startups, setStartups] = useState<AdminStartupInfo[]>([]);
  const [selectedStartups, setSelectedStartups] = useState<SelectedStartup[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [industries, setIndustries] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [editingStartupId, setEditingStartupId] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState("");

  useEffect(() => {
    if (!investor) {
      navigate("/admin/matchmaking");
      return;
    }
    fetchStartups();
    fetchFilterOptions();
  }, [investor, navigate]);

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

      const { data, error } = await StartupService.getVettedStartups(filters);

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
        setStartups(data as AdminStartupInfo[]);
        setTotalPages(1);
        setTotal(data.length);
      } else {
        const paginatedData = data as PaginatedStartups;
        setStartups(paginatedData.startups as AdminStartupInfo[]);
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

  const handleStartupSelect = (startup: AdminStartupInfo) => {
    if (selectedStartups.length >= MAX_STARTUPS) {
      toast({
        title: "Maximum reached",
        description: `You can only select up to ${MAX_STARTUPS} startups`,
        variant: "destructive",
      });
      return;
    }

    if (selectedStartups.some((s) => s.id === startup.id)) {
      toast({
        title: "Already selected",
        description: "This startup is already selected",
        variant: "destructive",
      });
      return;
    }

    const newSelectedStartup: SelectedStartup = {
      id: startup.id,
      name: startup.name,
      email: startup.email,
      industry: startup.industry,
      stage: startup.stage,
      description: startup.description,
    };

    setSelectedStartups([...selectedStartups, newSelectedStartup]);
    toast({
      title: "Startup selected",
      description: `${startup.name} has been added to your selection`,
    });
  };

  const handleStartupRemove = (startupId: string) => {
    setSelectedStartups(selectedStartups.filter((s) => s.id !== startupId));
    toast({
      title: "Startup removed",
      description: "Startup has been removed from your selection",
    });
  };

  const handleCommentUpdate = (startupId: string, comment: string) => {
    setSelectedStartups(
      selectedStartups.map((s) => (s.id === startupId ? { ...s, comment } : s))
    );
  };

  const handleCommentEdit = (startupId: string, currentComment: string) => {
    setEditingStartupId(startupId);
    setTempComment(currentComment || "");
    setCommentDialogOpen(true);
  };

  const handleCommentSave = () => {
    if (editingStartupId) {
      handleCommentUpdate(editingStartupId, tempComment);
    }
    setCommentDialogOpen(false);
    setEditingStartupId(null);
    setTempComment("");
  };

  const handleCreateMatch = async () => {
    if (!investor || !user?.id) {
      toast({
        title: "Error",
        description: "Missing investor or admin information",
        variant: "destructive",
      });
      return;
    }

    if (selectedStartups.length === 0) {
      toast({
        title: "No startups selected",
        description: "Please select at least one startup to create a match",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingMatch(true);

      const { data, error } = await MatchmakingService.createMatchmakings({
        investorId: investor.id,
        investorName: investor.name,
        investorEmail: investor.email,
        startups: selectedStartups.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          comment: s.comment,
        })),
        adminId: user.id,
        expiryDays: 7,
      });

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Match created successfully!",
        description: `Created ${selectedStartups.length} matches for ${investor.name}`,
      });

      // Navigate back to matchmaking list
      navigate("/admin/matchmaking");
    } catch (error) {
      console.error("Error creating match:", error);
      toast({
        title: "Error",
        description: "Failed to create match",
        variant: "destructive",
      });
    } finally {
      setIsCreatingMatch(false);
    }
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

  const handleBackClick = () => {
    navigate(`/admin/matchmaking/investor/${investorId}`, {
      state: { investor },
    });
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

  if (!investor) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="py-28">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Investor not found</h2>
              <Button
                onClick={() => navigate("/admin/matchmaking")}
                variant="outline"
              >
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
                Back to Investor Details
              </Button>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Select Startups</h1>
                  <p className="text-xl text-muted-foreground">
                    Creating matches for:{" "}
                    <span className="font-semibold">{investor.name}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Startups Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Selected Startups ({selectedStartups.length}/{MAX_STARTUPS})
                  </span>
                  {selectedStartups.length > 0 && (
                    <Button
                      onClick={handleCreateMatch}
                      disabled={isCreatingMatch}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      {isCreatingMatch ? "Creating Match..." : "Create Match"}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStartups.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No startups selected yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Select up to {MAX_STARTUPS} startups from the list below
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedStartups.map((startup) => (
                      <div
                        key={startup.id}
                        className="bg-muted/50 p-4 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {startup.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {startup.email}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartupRemove(startup.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {startup.industry}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {startup.stage}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {startup.description}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Comment:
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                {startup.comment || "No comment added"}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCommentEdit(
                                  startup.id,
                                  startup.comment || ""
                                )
                              }
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search and Filters */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search startups by name, industry, or description..."
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-card rounded-lg">
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

                      <div className="md:col-span-2">
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="w-full flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results Summary */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {isLoading ? "Loading..." : `${total} startups found`}
                  </span>
                </div>
              </div>
            </div>

            {/* Startups Grid */}
            {isLoading ? (
              renderSkeletons()
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {startups.map((startup) => {
                  const isSelected = selectedStartups.some(
                    (s) => s.id === startup.id
                  );
                  const canSelect = selectedStartups.length < MAX_STARTUPS;

                  return (
                    <motion.div
                      key={startup.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className={`bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow ${
                        isSelected ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-foreground">
                          {startup.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {startup.status}
                          </Badge>
                          {startup.visibility_status && (
                            <Badge variant="outline" className="text-xs">
                              {startup.visibility_status}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground">
                          {startup.email}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {startup.industry}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {startup.stage}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {startup.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <p>Team Size: {startup.team_size || "N/A"}</p>
                          <p>Funding: {startup.funding_required || "N/A"}</p>
                        </div>

                        {isSelected ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStartupRemove(startup.id)}
                            className="flex items-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Selected
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartupSelect(startup)}
                            disabled={!canSelect}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Select
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
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
            {!isLoading && startups.length === 0 && (
              <div className="text-center py-12">
                <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-2xl font-bold mb-2">No startups found</h3>
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

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Add a comment for this startup that will help explain the match
                reasoning:
              </p>
              <Textarea
                value={tempComment}
                onChange={(e) => setTempComment(e.target.value)}
                placeholder="e.g., Great fit for investor's portfolio, strong team, good traction..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setCommentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCommentSave}>Save Comment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MatchmakingStartupSelection;
