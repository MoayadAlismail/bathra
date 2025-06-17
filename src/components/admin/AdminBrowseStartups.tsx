import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Building, ArrowRight, X, Edit } from "lucide-react";
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
import { AdminStartupInfo, StartupFilters } from "@/lib/startup-types";
import AdminStartupEditModal from "./AdminStartupEditModal";

const AdminBrowseStartups = () => {
  const [startups, setStartups] = useState<AdminStartupInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [selectedStartup, setSelectedStartup] =
    useState<AdminStartupInfo | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [industries, setIndustries] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchStartups();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchStartups();
  }, [searchTerm, selectedIndustry, selectedStage]);

  const fetchStartups = async () => {
    try {
      setIsLoading(true);

      const filters: StartupFilters = {
        searchTerm: searchTerm || undefined,
        industry: selectedIndustry || undefined,
        stage: selectedStage || undefined,
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

      setStartups(data);
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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedIndustry("");
    setSelectedStage("");
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg"
              >
                <Select
                  value={selectedIndustry}
                  onValueChange={setSelectedIndustry}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Industry" />
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

                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Stage" />
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

                <Button variant="outline" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </motion.div>
            )}
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

          {!isLoading && startups.length === 0 && (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No startups found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search filters
              </p>
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
                      <p className="font-medium">
                        {selectedStartup.pitch_deck ? (
                          <a
                            href={selectedStartup.pitch_deck}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View Pitch Deck
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
