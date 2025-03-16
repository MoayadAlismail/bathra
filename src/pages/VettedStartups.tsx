import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { SearchIcon, Filter, ArrowUpDown, File, ExternalLink, Bookmark, MessageCircle, Info } from "lucide-react";
import StartupDetailModal from "@/components/StartupDetailModal";

// Define detailed startup type
type VettedStartup = {
  id: string;
  name: string;
  industry: string;
  stage: string;
  funding_required: string;
  valuation: string;
  document_path?: string;
  business_model?: string;
  key_metrics?: string;
  founders?: string;
  website?: string;
  contact_email?: string;
  investment_terms?: string;
  created_at: string;
  description?: string;
  video_url?: string;
  market_analysis?: string;
  competition?: string;
  financials?: string;
};

const VettedStartups = () => {
  const { user, profile, isDemo } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [startups, setStartups] = useState<VettedStartup[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<VettedStartup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [savedStartups, setSavedStartups] = useState<string[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<VettedStartup | null>(null);
  
  // Mock data for demo mode
  const mockStartups: VettedStartup[] = [
    {
      id: "1",
      name: "EcoTech Solutions",
      industry: "CleanTech",
      stage: "Seed",
      funding_required: "$750,000",
      valuation: "$3.5M",
      business_model: "B2B SaaS for renewable energy optimization",
      key_metrics: "250 beta users, $15k MRR",
      founders: "Dr. Jane Smith (PhD, MIT), Mark Johnson (Ex-Tesla)",
      website: "ecotechsolutions.co",
      contact_email: "founders@ecotechsolutions.co",
      investment_terms: "SAFE with $3.5M cap, 20% discount",
      created_at: new Date().toISOString(),
      description: "EcoTech Solutions is developing AI-powered software to optimize renewable energy systems, improving efficiency by up to 30%.",
      market_analysis: "The renewable energy optimization market is projected to reach $26B by 2028, growing at 18% CAGR.",
      competition: "Current solutions are hardware-dependent. Our software-only approach reduces costs by 60%.",
      financials: "Projecting $1.2M ARR by EOY 2024, $5M by 2025.",
      document_path: "/path/to/pitch.pdf",
    },
    {
      id: "2",
      name: "MediChain",
      industry: "HealthTech",
      stage: "Series A",
      funding_required: "$2.5M",
      valuation: "$12M",
      business_model: "Healthcare data platform with subscription model",
      key_metrics: "12 hospital partnerships, $45k MRR",
      founders: "Dr. Robert Chen (Former Chief of Surgery), Lisa Park (Ex-Epic)",
      website: "medichain.health",
      contact_email: "info@medichain.health",
      investment_terms: "Equity, 15% of company",
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      description: "MediChain is building a secure blockchain-based platform for medical records that improves data portability while maintaining privacy.",
      market_analysis: "Healthcare IT market estimated at $390B globally with 8% annual growth.",
      competition: "Current solutions lack interoperability. We offer seamless data exchange across systems.",
      financials: "Currently at $540k ARR, projecting $2.1M by end of 2024.",
      document_path: "/path/to/pitch.pdf",
    },
    {
      id: "3",
      name: "RetailAI",
      industry: "Retail Tech",
      stage: "Pre-seed",
      funding_required: "$350,000",
      valuation: "$1.8M",
      business_model: "AI-powered inventory management for retailers",
      key_metrics: "5 pilot customers, 30% average inventory cost reduction",
      founders: "Alex Rivera (Ex-Amazon), Sarah Chen (MS CS, Stanford)",
      website: "retailai.tech",
      contact_email: "founders@retailai.tech",
      investment_terms: "Convertible note, 20% discount, $2M cap",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      description: "RetailAI uses computer vision and predictive analytics to help retailers optimize inventory and reduce waste by up to 40%.",
      market_analysis: "Retail inventory management software market valued at $3B with 15% YoY growth.",
      competition: "Existing solutions require expensive hardware installations. Our system works with standard security cameras.",
      financials: "Projecting $500k ARR in year 1, $2M in year 2 post-funding.",
      document_path: "/path/to/pitch.pdf",
    },
  ];

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Load saved startups from localStorage
    const saved = localStorage.getItem("savedStartups");
    if (saved) {
      setSavedStartups(JSON.parse(saved));
    }
    
    fetchStartups();
  }, [user, navigate]);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...startups];
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        startup => 
          startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          startup.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
          startup.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply industry filter
    if (industryFilter) {
      filtered = filtered.filter(startup => startup.industry === industryFilter);
    }
    
    // Apply stage filter
    if (stageFilter) {
      filtered = filtered.filter(startup => startup.stage === stageFilter);
    }
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "funding":
        filtered.sort((a, b) => 
          Number(a.funding_required.replace(/[^0-9.-]+/g, "")) - 
          Number(b.funding_required.replace(/[^0-9.-]+/g, ""))
        );
        break;
      case "valuation":
        filtered.sort((a, b) => 
          Number(a.valuation.replace(/[^0-9.-]+/g, "")) - 
          Number(b.valuation.replace(/[^0-9.-]+/g, ""))
        );
        break;
      default:
        break;
    }
    
    setFilteredStartups(filtered);
  }, [startups, searchQuery, industryFilter, stageFilter, sortBy]);

  const fetchStartups = async () => {
    setIsLoading(true);
    
    try {
      if (isDemo) {
        // In demo mode, use mock data
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
        setStartups(mockStartups);
      } else {
        // Fetch real data from Supabase
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setStartups(data || []);
      }
    } catch (error) {
      console.error('Error fetching vetted startups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaveStartup = (id: string) => {
    let newSaved;
    if (savedStartups.includes(id)) {
      newSaved = savedStartups.filter(sid => sid !== id);
    } else {
      newSaved = [...savedStartups, id];
    }
    setSavedStartups(newSaved);
    localStorage.setItem("savedStartups", JSON.stringify(newSaved));
  };

  const showStartupDetails = (startup: VettedStartup) => {
    setSelectedStartup(startup);
  };

  const closeStartupDetails = () => {
    setSelectedStartup(null);
  };

  const requestMoreInfo = (startup: VettedStartup) => {
    // In a real app, this would send a request or open a contact form
    alert(`Request for more information about ${startup.name} has been sent.`);
  };

  // Get unique industries and stages for filters
  const industries = Array.from(new Set(startups.map(s => s.industry)));
  const stages = Array.from(new Set(startups.map(s => s.stage)));

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'neo-blur' : 'bg-[#F8F9FA]'}`}>
      <Navbar />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-4">Vetted Startups</h1>
            <p className={`max-w-3xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Exclusive access to our curated list of promising startups seeking investment. 
              All startups have been vetted by our team for viability and growth potential.
            </p>
            
            {isDemo && (
              <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-800/50' : 'bg-yellow-50 border border-yellow-200'}`}>
                <h3 className={`font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>Demo Mode Active</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  You are viewing mock startup data. In production, this page would display real vetted startups from the database.
                </p>
              </div>
            )}
          </motion.div>

          <div className={`rounded-xl shadow-md p-6 mb-8 ${theme === 'dark' ? 'glass border border-white/10' : 'bg-white'}`}>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="relative flex-grow">
                <SearchIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                <Input 
                  className="pl-10" 
                  placeholder="Search startups..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
              
              <div className="flex gap-2 flex-wrap md:flex-nowrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                      <Filter className="h-4 w-4 mr-2" />
                      Industry: {industryFilter || "All"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setIndustryFilter(null)}>
                      All Industries
                    </DropdownMenuItem>
                    {industries.map((industry) => (
                      <DropdownMenuItem 
                        key={industry} 
                        onClick={() => setIndustryFilter(industry)}
                      >
                        {industry}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                      <Filter className="h-4 w-4 mr-2" />
                      Stage: {stageFilter || "All"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStageFilter(null)}>
                      All Stages
                    </DropdownMenuItem>
                    {stages.map((stage) => (
                      <DropdownMenuItem 
                        key={stage} 
                        onClick={() => setStageFilter(stage)}
                      >
                        {stage}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Sort: {sortBy === "newest" ? "Newest" : sortBy === "funding" ? "Funding" : "Valuation"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortBy("newest")}>
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("funding")}>
                      Funding Amount
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("valuation")}>
                      Valuation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === "grid" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </Button>
                <Button 
                  variant={viewMode === "table" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setViewMode("table")}
                >
                  Table
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Startups</TabsTrigger>
                <TabsTrigger value="saved">Saved Startups</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="pt-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <p>Loading startups...</p>
                  </div>
                ) : filteredStartups.length === 0 ? (
                  <div className="text-center py-12">
                    <p>No startups match your search criteria.</p>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStartups.map((startup) => (
                      <Card key={startup.id} className={`overflow-hidden flex flex-col ${theme === 'dark' ? 'border-primary/20' : ''}`}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">{startup.name}</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSaveStartup(startup.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Bookmark 
                                className={`h-5 w-5 ${savedStartups.includes(startup.id) ? "fill-primary text-primary" : ""}`}
                              />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full ${
                              theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {startup.industry}
                            </span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full ${
                              theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {startup.stage}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="space-y-2 text-sm">
                            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              {startup.description?.substring(0, 120)}...
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Funding Sought
                                </p>
                                <p className="font-medium">{startup.funding_required}</p>
                              </div>
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Valuation
                                </p>
                                <p className="font-medium">{startup.valuation}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className={`flex justify-between pt-4 ${theme === 'dark' ? 'border-t border-primary/20' : 'border-t'}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => showStartupDetails(startup)}
                          >
                            View Details
                          </Button>
                          <div className="flex gap-2">
                            {startup.document_path && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="View Pitch Deck"
                              >
                                <File className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Request More Information"
                              onClick={() => requestMoreInfo(startup)}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                            {startup.website && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Visit Website"
                                onClick={() => window.open(`https://${startup.website}`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Startup Name</TableHead>
                          <TableHead>Industry</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead>Funding</TableHead>
                          <TableHead>Valuation</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStartups.map((startup) => (
                          <TableRow key={startup.id}>
                            <TableCell className="font-medium">{startup.name}</TableCell>
                            <TableCell>{startup.industry}</TableCell>
                            <TableCell>{startup.stage}</TableCell>
                            <TableCell>{startup.funding_required}</TableCell>
                            <TableCell>{startup.valuation}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => toggleSaveStartup(startup.id)}
                                >
                                  <Bookmark 
                                    className={`h-4 w-4 ${savedStartups.includes(startup.id) ? "fill-primary text-primary" : ""}`}
                                  />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => showStartupDetails(startup)}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                                {startup.document_path && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <File className="h-4 w-4" />
                                  </Button>
                                )}
                                {startup.website && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => window.open(`https://${startup.website}`, '_blank')}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="saved" className="pt-4">
                {filteredStartups.filter(s => savedStartups.includes(s.id)).length === 0 ? (
                  <div className="text-center py-12">
                    <p>You haven't saved any startups yet.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Click the bookmark icon on startups you're interested in to save them for later.
                    </p>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStartups
                      .filter(s => savedStartups.includes(s.id))
                      .map((startup) => (
                        <Card key={startup.id} className={`overflow-hidden flex flex-col ${theme === 'dark' ? 'border-primary/20' : ''}`}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-xl">{startup.name}</CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSaveStartup(startup.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Bookmark className="h-5 w-5 fill-primary text-primary" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className={`text-xs px-2.5 py-0.5 rounded-full ${
                                theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {startup.industry}
                              </span>
                              <span className={`text-xs px-2.5 py-0.5 rounded-full ${
                                theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {startup.stage}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            <div className="space-y-2 text-sm">
                              <p className="text-gray-700">{startup.description?.substring(0, 120)}...</p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                                <div>
                                  <p className="text-gray-500 text-xs">Funding Sought</p>
                                  <p className="font-medium">{startup.funding_required}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">Valuation</p>
                                  <p className="font-medium">{startup.valuation}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className={`flex justify-between pt-4 ${theme === 'dark' ? 'border-t border-primary/20' : 'border-t'}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => showStartupDetails(startup)}
                            >
                              View Details
                            </Button>
                            <div className="flex gap-2">
                              {startup.document_path && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="View Pitch Deck"
                                >
                                  <File className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Request More Information"
                                onClick={() => requestMoreInfo(startup)}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                              {startup.website && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Visit Website"
                                  onClick={() => window.open(`https://${startup.website}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Startup Name</TableHead>
                          <TableHead>Industry</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead>Funding</TableHead>
                          <TableHead>Valuation</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStartups
                          .filter(s => savedStartups.includes(s.id))
                          .map((startup) => (
                            <TableRow key={startup.id}>
                              <TableCell className="font-medium">{startup.name}</TableCell>
                              <TableCell>{startup.industry}</TableCell>
                              <TableCell>{startup.stage}</TableCell>
                              <TableCell>{startup.funding_required}</TableCell>
                              <TableCell>{startup.valuation}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => toggleSaveStartup(startup.id)}
                                  >
                                    <Bookmark className="h-4 w-4 fill-primary text-primary" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => showStartupDetails(startup)}
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                  {startup.document_path && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                      <File className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {startup.website && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => window.open(`https://${startup.website}`, '_blank')}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className={`mt-8 p-4 rounded-lg ${theme === 'dark' ? 'bg-secondary/50' : 'bg-gray-50'}`}>
              <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Disclaimer</h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                The information provided is for informational purposes only and does not constitute investment advice. 
                Past performance is not indicative of future results. All investments involve risk, and the past performance 
                of a security, industry, sector, market, or financial product does not guarantee future results or returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {selectedStartup && (
        <StartupDetailModal 
          startup={selectedStartup} 
          isOpen={!!selectedStartup} 
          onClose={closeStartupDetails}
          onSave={() => toggleSaveStartup(selectedStartup.id)}
          isSaved={savedStartups.includes(selectedStartup.id)}
          onRequestInfo={() => requestMoreInfo(selectedStartup)}
        />
      )}
    </div>
  );
};

export default VettedStartups;
