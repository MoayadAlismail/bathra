
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Building, ArrowRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import StartupDetailModal from "@/components/StartupDetailModal";

const VettedStartups = () => {
  const [startups, setStartups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStartup, setSelectedStartup] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching startups...");
      
      // For demo purposes, we're filtering 'vetted' startups
      const { data, error } = supabase
        .from('startups')
        .select('*')
        .eq('status', 'vetted');
      
      if (error) {
        throw error;
      }
      
      console.log("Fetched startups:", data);
      setStartups(data || []);
    } catch (error) {
      console.error("Error fetching startups:", error);
      toast({
        title: "Error",
        description: "Failed to load startups",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartupClick = (startup: any) => {
    setSelectedStartup(startup);
    setIsModalOpen(true);
  };

  const handleInvest = (startupId: string) => {
    // In a real app, this would initiate the investment process
    toast({
      title: "Success",
      description: "Investment interest recorded",
    });
    setIsModalOpen(false);
  };

  // Filter startups based on search term
  const filteredStartups = startups.filter(
    (startup) =>
      startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render loading skeletons
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
                          <span className="ml-1 text-sm">${startup.valuation || 'Undisclosed'}</span>
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
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          startup={selectedStartup}
          onInvest={handleInvest}
        />
      )}
    </div>
  );
};

export default VettedStartups;
