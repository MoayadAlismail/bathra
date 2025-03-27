import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Building, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import StartupDetailModal from "@/components/StartupDetailModal";

const mockStartups = [
  {
    id: "demo-startup-1",
    name: "EcoSolutions",
    industry: "CleanTech",
    stage: "Seed",
    description: "Developing sustainable energy solutions for residential buildings.",
    website: "ecosolutions-demo.com",
    founders: "Jane Smith, John Doe",
    team_size: "5-10",
    founded_date: "2021-03-15",
    target_market: "Residential property owners",
    problem_solved: "High energy costs and carbon footprint for homeowners",
    usp: "Proprietary solar integration system with 30% higher efficiency",
    traction: "500+ installations in California, growing 25% month-over-month",
    key_metrics: "Customer acquisition cost: $200, LTV: $3,500",
    previous_funding: "$750,000 angel investment",
    funding_required: "$2.5M",
    valuation: "$8M",
    use_of_funds: "Expand to 5 new states and improve manufacturing capacity",
    roadmap: "Q3 2023: Launch new product line, Q1 2024: Series A, Q4 2024: International expansion",
    exit_strategy: "Acquisition by major energy company or IPO within 5-7 years",
    status: "vetted",
    created_at: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1473893604213-3df9c15611c0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    business_model: "SaaS subscription model with hardware sales",
    contact_email: "info@ecosolutions-demo.com",
    investment_terms: "SAFE with $8M cap, 20% discount",
    financials: "Currently at $50K MRR with 15% monthly growth",
    market_analysis: "TAM of $50B in residential energy solutions",
    competition: "Traditional solar providers and emerging battery startups",
    video_url: "https://example.com/pitch-video.mp4"
  },
  {
    id: "demo-startup-2",
    name: "MediTech",
    industry: "HealthTech",
    stage: "Series A",
    description: "AI-powered diagnostic tools for early disease detection.",
    website: "meditech-demo.com",
    founders: "Alex Johnson, Maria Garcia",
    team_size: "10-20",
    founded_date: "2020-05-01",
    target_market: "Hospitals and medical clinics",
    problem_solved: "Delayed diagnostics leading to worse patient outcomes",
    usp: "95% accuracy in early-stage disease detection, 5x faster than traditional methods",
    traction: "In use at 20+ hospitals, 15,000+ patients diagnosed",
    key_metrics: "$1.2M ARR, 92% retention rate",
    previous_funding: "$2.5M Seed",
    funding_required: "$8M",
    valuation: "$30M",
    use_of_funds: "Scale sales team and develop two new diagnostic products",
    roadmap: "Q2 2023: FDA approval for new product, Q1 2024: European market entry",
    exit_strategy: "Strategic acquisition by medical device company",
    status: "vetted",
    created_at: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    business_model: "B2B SaaS with per-scan pricing",
    contact_email: "investors@meditech-demo.com",
    investment_terms: "Equity round with board seat for lead investor",
    financials: "$1.2M ARR with 80% gross margin",
    market_analysis: "Global medical diagnostics market worth $70B annually",
    competition: "Traditional lab testing and 2 competing AI startups",
    document_path: "/files/meditech-deck.pdf"
  },
  {
    id: "demo-startup-3",
    name: "FintechPro",
    industry: "Fintech",
    stage: "Seed",
    description: "Blockchain-based payment solutions for small businesses.",
    website: "fintechpro-demo.com",
    founders: "Sam Wilson",
    team_size: "2-5",
    founded_date: "2022-01-15",
    target_market: "Small and medium-sized businesses",
    problem_solved: "High transaction fees and slow settlement times for cross-border payments",
    usp: "Zero fee transactions, settlement in under 3 seconds",
    traction: "500 businesses onboarded, $1M monthly transaction volume",
    key_metrics: "$30K MRR, 8% MoM growth",
    previous_funding: "$300K pre-seed",
    funding_required: "$1.5M",
    valuation: "$6M",
    use_of_funds: "Product development and marketing expansion",
    roadmap: "Q4 2023: Launch mobile app, Q2 2024: Expand to LATAM",
    exit_strategy: "Acquisition by major payment processor or Series A+",
    status: "vetted",
    created_at: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    business_model: "Transaction fee model (0.5% per transaction)",
    contact_email: "sam@fintechpro-demo.com",
    investment_terms: "Convertible note with 20% discount",
    financials: "$360K projected ARR by EOY",
    market_analysis: "SMB payment processing market valued at $25B",
    competition: "Traditional banks and emerging crypto payment providers",
    document_path: "/files/fintechpro-deck.pdf"
  },
  {
    id: "demo-startup-4",
    name: "AgriTech Solutions",
    industry: "AgTech",
    stage: "Seed",
    description: "Smart farming solutions using IoT sensors and AI analytics.",
    website: "agritech-demo.com",
    founders: "Emma Peterson, David Kim",
    team_size: "5-10",
    founded_date: "2021-09-10",
    target_market: "Commercial farms and agricultural cooperatives",
    problem_solved: "Inefficient resource usage and crop yield optimization",
    usp: "Increases crop yields by 35% while reducing water usage by 40%",
    traction: "Deployed on 25 farms across 3 states, covering 5,000+ acres",
    key_metrics: "$450K ARR, 95% customer retention",
    previous_funding: "$500K angel investment",
    funding_required: "$2M",
    valuation: "$7M",
    use_of_funds: "Scale technology deployment and expand to new regions",
    roadmap: "Q1 2024: Launch predictive analytics module, Q3 2024: International pilot",
    exit_strategy: "Strategic acquisition by agricultural technology company",
    status: "vetted",
    created_at: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    business_model: "Hardware sales with recurring subscription",
    contact_email: "info@agritech-demo.com",
    investment_terms: "Equity round with pro-rata rights",
    financials: "$450K ARR with path to profitability within 18 months",
    market_analysis: "Smart agriculture market expected to reach $20B by 2026",
    competition: "Traditional farm equipment vendors and 3 direct competitors",
    document_path: "/files/agritech-deck.pdf"
  },
  {
    id: "demo-startup-5",
    name: "EdTech Innovations",
    industry: "Education Technology",
    stage: "Series A",
    description: "Personalized learning platform using AI to adapt to individual student needs.",
    website: "edtech-demo.com",
    founders: "Robert Chen, Lisa Johnson",
    team_size: "20-50",
    founded_date: "2019-07-22",
    target_market: "K-12 schools and educational institutions",
    problem_solved: "One-size-fits-all education failing to meet diverse student needs",
    usp: "Adaptive learning algorithms that improve student outcomes by 40%",
    traction: "Used by 150+ schools reaching 50,000+ students",
    key_metrics: "$3.2M ARR, 85% YoY growth",
    previous_funding: "$4M Seed",
    funding_required: "$10M",
    valuation: "$45M",
    use_of_funds: "Product development and international expansion",
    roadmap: "Q4 2023: Launch higher education platform, Q2 2024: Enter Asian markets",
    exit_strategy: "IPO or strategic acquisition by major education company",
    status: "vetted",
    created_at: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    business_model: "School subscription model with per-student pricing",
    contact_email: "robert@edtech-demo.com",
    investment_terms: "Equity round with strategic partnerships",
    financials: "$3.2M ARR with 85% YoY growth",
    market_analysis: "EdTech market projected to reach $400B by 2026",
    competition: "Traditional publishers and 4 competing digital platforms",
    document_path: "/files/edtech-deck.pdf",
    video_url: "https://example.com/edtech-pitch.mp4"
  }
];

const VettedStartups = () => {
  const [startups, setStartups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStartup, setSelectedStartup] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedStartups, setSavedStartups] = useState<string[]>([]);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartups(mockStartups);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handleStartupClick = (startup: any) => {
    setSelectedStartup(startup);
    setIsModalOpen(true);
  };

  const handleSaveStartup = () => {
    if (!selectedStartup) return;
    
    if (savedStartups.includes(selectedStartup.id)) {
      setSavedStartups(prev => prev.filter(id => id !== selectedStartup.id));
      toast({
        title: "Removed from saved",
        description: `${selectedStartup.name} has been removed from your saved startups`,
      });
    } else {
      setSavedStartups(prev => [...prev, selectedStartup.id]);
      toast({
        title: "Startup saved",
        description: `${selectedStartup.name} has been added to your saved startups`,
      });
    }
  };

  const handleRequestInfo = () => {
    toast({
      title: "Request sent",
      description: `Your information request has been sent to ${selectedStartup.name}`,
    });
    setIsModalOpen(false);
  };

  const filteredStartups = startups.filter(
    (startup) =>
      startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <Navbar />
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Vetted Startups</h1>
              <p className="text-xl text-muted-foreground">
                Discover pre-vetted startups with high growth potential
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
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
              <Button variant="outline" className="w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>

            {isLoading ? (
              renderSkeletons()
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {filteredStartups.map((startup) => (
                  <motion.div
                    key={startup.id}
                    whileHover={{ y: -5 }}
                    className="bg-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div 
                      className="h-40 bg-center bg-cover" 
                      style={{ backgroundImage: `url(${startup.image || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop'})` }}
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
                          <span className="ml-1 text-sm">{startup.valuation || 'Undisclosed'}</span>
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

            {filteredStartups.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No startups found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or check back later for new additions.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {selectedStartup && (
        <StartupDetailModal
          startup={selectedStartup}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveStartup}
          isSaved={savedStartups.includes(selectedStartup.id)}
          onRequestInfo={handleRequestInfo}
        />
      )}
    </div>
  );
};

export default VettedStartups;
