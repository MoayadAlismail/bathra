
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Define startup type for the dashboard
type Startup = {
  id: string;
  name: string;
  industry: string;
  stage: string;
  description: string;
};

const InvestorDashboard = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openStartup, setOpenStartup] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/login");
    } else {
      // Fetch startups from Supabase
      fetchStartups();
    }
  }, [user, navigate]);

  const fetchStartups = async () => {
    try {
      setIsLoading(true);
      
      // For this example, we'll fetch all startups, but in a real application,
      // you might filter based on investor preferences
      const { data, error } = await supabase
        .from('startups')
        .select('id, name, industry, stage, description')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      setStartups(data || []);
    } catch (error) {
      console.error('Error fetching startups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Investor Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
              
              <div className="p-6 bg-blue-50 rounded-xl mb-8">
                <h2 className="text-xl font-semibold mb-2">Welcome back, {profile.name}</h2>
                <p className="text-gray-700">Your investment profile is active and visible to startups in your focus area.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Your Profile</h3>
                  <ul className="space-y-2">
                    <li><span className="text-gray-600">Investment Focus:</span> {profile.investmentFocus}</li>
                    <li><span className="text-gray-600">Investment Range:</span> {profile.investmentRange}</li>
                    <li><span className="text-gray-600">Email:</span> {profile.email}</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Activity</h3>
                  <p className="text-gray-700">You have no recent activity.</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Recommended Startups</h3>
                {isLoading ? (
                  <div className="p-8 text-center bg-gray-50 rounded-xl">
                    <p className="text-gray-500">Loading startups...</p>
                  </div>
                ) : startups.length > 0 ? (
                  <div className="space-y-4">
                    {startups.map((startup) => (
                      <Card key={startup.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{startup.name}</CardTitle>
                            <Collapsible open={openStartup === startup.id} onOpenChange={() => {
                              setOpenStartup(openStartup === startup.id ? null : startup.id);
                            }}>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                                  {openStartup === startup.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </Button>
                              </CollapsibleTrigger>
                            </Collapsible>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded">{startup.industry}</span>
                            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded">{startup.stage}</span>
                          </div>
                        </CardHeader>
                        <Collapsible open={openStartup === startup.id}>
                          <CollapsibleContent>
                            <CardContent className="pt-2">
                              <p className="text-sm text-gray-600">{startup.description}</p>
                              <Button className="mt-3" size="sm">View Details</Button>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No startups to display yet. Check back soon!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default InvestorDashboard;
