
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Startup {
  id: string;
  name: string;
  description: string;
  image: string;
  valuation: string;
  raised: number;
  roi: number;
  industry: string;
  stage: string;
  status: string;
}

const VettedStartups = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast: uiToast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchStartups = async () => {
      setLoading(true);
      try {
        // Fetch only vetted startups
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .eq('status', 'vetted')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;

        // Convert database data to our Startup interface
        const formattedData = (data || []).map((startup) => ({
          id: startup.id,
          name: startup.name,
          description: startup.description || '',
          image: `https://source.unsplash.com/random/800x600/?${startup.industry?.toLowerCase() || 'startup'}`,
          valuation: startup.valuation || 'N/A',
          // Generate some demo data for display
          raised: Math.floor(Math.random() * 5000000),
          roi: Math.floor(Math.random() * 40) + 10,
          industry: startup.industry || 'Technology',
          stage: startup.stage || 'Seed',
          status: startup.status || 'vetted'
        }));

        setStartups(formattedData);
      } catch (error) {
        console.error("Failed to fetch startups:", error);
        toast.error("Failed to fetch startups. Using demo data instead.");
        
        // Fallback to demo data
        setStartups([
          {
            id: "demo-startup-1",
            name: "EcoSolutions",
            industry: "CleanTech",
            stage: "Seed",
            description: "Developing sustainable energy solutions for residential buildings.",
            image: "https://images.unsplash.com/photo-1473893604213-3df9c15611c0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            valuation: "2.5M",
            raised: 750000,
            roi: 22,
            status: "vetted"
          },
          {
            id: "demo-startup-2",
            name: "MediTech",
            industry: "HealthTech",
            stage: "Series A",
            description: "AI-powered diagnostic tools for early disease detection.",
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            valuation: "8M",
            raised: 2500000,
            roi: 35,
            status: "vetted"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  const investInStartup = (startupId: string) => {
    if (!user) {
      toast.error("Please log in to invest in startups.");
      navigate("/login");
      return;
    }

    toast.success("Investment Initiated", {
      description: `You have initiated investment in startup with ID: ${startupId}.`
    });
  };

  const filteredStartups = startups.filter((startup) =>
    startup.name.toLowerCase().includes(search.toLowerCase()) ||
    startup.industry.toLowerCase().includes(search.toLowerCase()) ||
    startup.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gradient mb-4">
              Explore Vetted Startups
            </h2>
            <p className="text-muted-foreground">
              Invest in promising startups and grow your portfolio.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-md mx-auto mb-8"
          >
            <Input
              type="search"
              placeholder="Search startups by name, industry, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background border-border"
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array(6)
                  .fill(null)
                  .map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle>
                          <Skeleton className="h-5 w-4/5" />
                        </CardTitle>
                        <CardDescription>
                          <Skeleton className="h-4 w-3/5" />
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-24 w-full" />
                        <div className="mt-4 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-4/6" />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </CardFooter>
                    </Card>
                  ))
              : filteredStartups.length > 0 ? (
                  filteredStartups.map((startup) => (
                    <motion.div
                      key={startup.id}
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="neo-blur h-full flex flex-col">
                        <CardHeader>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="secondary">{startup.industry}</Badge>
                            <Badge variant="outline">{startup.stage}</Badge>
                          </div>
                          <CardTitle>{startup.name}</CardTitle>
                          <CardDescription className="line-clamp-2">{startup.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <img
                            src={startup.image}
                            alt={startup.name}
                            className="rounded-md mb-4 w-full h-48 object-cover"
                          />
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Valuation:</span>
                              <span className="font-medium">${startup.valuation}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Raised:</span>
                              <span className="font-medium">${startup.raised.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Potential ROI:</span>
                              <span className="font-medium text-green-600">{startup.roi}%</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={() => investInStartup(startup.id)}
                            className="w-full"
                          >
                            Invest Now
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No startups match your search criteria.</p>
                  </div>
                )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VettedStartups;
