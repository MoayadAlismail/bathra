import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Users, ArrowRight, X, Edit } from "lucide-react";
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
import AdminInvestorEditModal from "./AdminInvestorEditModal";
import { AdminInvestorInfo, InvestorFilters } from "@/lib/investor-types";
import { InvestorService } from "@/lib/investor-service";

const AdminBrowseInvestors = () => {
  const [investors, setInvestors] = useState<AdminInvestorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedInvestor, setSelectedInvestor] =
    useState<AdminInvestorInfo | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [industries, setIndustries] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchInvestors();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchInvestors();
  }, [searchTerm, selectedIndustry, selectedStage]);

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

      setInvestors(data);
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
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const handleInvestorClick = (investor: AdminInvestorInfo) => {
    setSelectedInvestor(investor);
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (
    investor: AdminInvestorInfo,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setSelectedInvestor(investor);
    setIsEditModalOpen(true);
  };

  const handleInvestorUpdated = () => {
    fetchInvestors();
    setIsEditModalOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedIndustry("all");
    setSelectedStage("all");
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
            <h1 className="text-4xl font-bold mb-4">Manage Investors</h1>
            <p className="text-xl text-muted-foreground">
              Browse and edit all investor profiles
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, company, or industries"
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
                    onValueChange={setSelectedIndustry}
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
                    onValueChange={setSelectedStage}
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
              {investors.map((investor) => (
                <motion.div
                  key={investor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border cursor-pointer"
                  onClick={() => handleInvestorClick(investor)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        {investor.name}
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        {investor.role}{" "}
                        {investor.company ? `at ${investor.company}` : ""}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge
                          variant={investor.verified ? "default" : "secondary"}
                        >
                          {investor.verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge variant="outline">
                          {investor.status || "Pending"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditClick(investor, e)}
                      className="flex-shrink-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Industries
                      </p>
                      <p className="text-sm font-medium line-clamp-2">
                        {investor.preferred_industries || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Stage Preference
                      </p>
                      <p className="text-sm font-medium">
                        {investor.preferred_company_stage || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ticket Size</p>
                      <p className="font-medium">
                        {investor.average_ticket_size || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Investments</p>
                      <p className="font-medium">
                        {investor.number_of_investments || "0"}
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

          {!isLoading && investors.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No investors found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search filters
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Investor Detail Modal */}
      {selectedInvestor && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {selectedInvestor.name}
                  </DialogTitle>
                  <p className="text-muted-foreground">
                    {selectedInvestor.role}{" "}
                    {selectedInvestor.company
                      ? `at ${selectedInvestor.company}`
                      : ""}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      variant={
                        selectedInvestor.verified ? "default" : "secondary"
                      }
                    >
                      {selectedInvestor.verified ? "Verified" : "Unverified"}
                    </Badge>
                    <Badge variant="outline">
                      {selectedInvestor.status || "Pending"}
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
              <div className="space-y-6">
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Email
                      </p>
                      <p className="font-medium">
                        {selectedInvestor.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Phone
                      </p>
                      <p className="font-medium">
                        {selectedInvestor.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Location
                      </p>
                      <p className="font-medium">
                        {selectedInvestor.city && selectedInvestor.country
                          ? `${selectedInvestor.city}, ${selectedInvestor.country}`
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">
                    Investment Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Industries
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedInvestor.preferred_industries
                          ? selectedInvestor.preferred_industries
                              .split(",")
                              .map((industry, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-primary/10"
                                >
                                  {industry.trim()}
                                </Badge>
                              ))
                          : "Not specified"}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Preferred Stage
                      </p>
                      <p className="font-medium">
                        {selectedInvestor.preferred_company_stage ||
                          "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Ticket Size
                      </p>
                      <p className="font-medium">
                        {selectedInvestor.average_ticket_size ||
                          "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Previous Investments
                      </p>
                      <p className="font-medium">
                        {selectedInvestor.number_of_investments || "0"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">
                    Experience & Background
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Lead Investor Experience
                      </p>
                      <p className="font-medium">
                        {selectedInvestor.secured_lead_investor ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Advisor Experience
                      </p>
                      <p className="font-medium">
                        {selectedInvestor.participated_as_advisor
                          ? "Yes"
                          : "No"}
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
      {selectedInvestor && (
        <AdminInvestorEditModal
          investor={selectedInvestor}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onInvestorUpdated={handleInvestorUpdated}
        />
      )}
    </div>
  );
};

export default AdminBrowseInvestors;
