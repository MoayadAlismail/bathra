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
import { api } from "@/lib/api";

interface Startup {
  id: string;
  name: string;
  description: string;
  image: string;
  valuation: number;
  raised: number;
  roi: number;
}

const VettedStartups = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchStartups = async () => {
      setLoading(true);
      try {
        const response = await api.get("/startups");
        setStartups(response.data);
      } catch (error) {
        console.error("Failed to fetch startups:", error);
        toast({
          title: "Error",
          description: "Failed to fetch startups. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, [toast]);

  const investInStartup = (startupId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to invest in startups.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    toast({
      title: "Investment Initiated",
      description: `You have initiated investment in startup with ID: ${startupId}.`,
    });
  };

  const filteredStartups = startups.filter((startup) =>
    startup.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${
      theme === "dark" ? "bg-background" : "bg-background"
    }`}>
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
              placeholder="Search startups..."
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
              : filteredStartups.map((startup) => (
                  <motion.div
                    key={startup.id}
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="neo-blur">
                      <CardHeader>
                        <CardTitle>{startup.name}</CardTitle>
                        <CardDescription>{startup.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <img
                          src={startup.image}
                          alt={startup.name}
                          className="rounded-md mb-4 w-full h-48 object-cover"
                        />
                        <div className="space-y-2">
                          <p>
                            <strong>Valuation:</strong> ${startup.valuation}
                          </p>
                          <p>
                            <strong>Raised:</strong> ${startup.raised}
                          </p>
                          <p>
                            <strong>ROI:</strong> {startup.roi}%
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          onClick={() => investInStartup(startup.id)}
                          className="w-full"
                        >
                          Invest Now
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VettedStartups;
