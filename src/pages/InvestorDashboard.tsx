import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { isInvestorAccount } from '@/lib/account-types';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Startup } from '@/lib/supabase';

const InvestorDashboard = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openStartup, setOpenStartup] = useState<string | null>(null);
  const [recentStartups, setRecentStartups] = useState<Startup[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchStartups();
      fetchRecentStartups();
    }
  }, [user, navigate]);

  const fetchStartups = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('startups')
        .select('id, name, industry, stage, description')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      if (data) {
        // Ensure we only process startup data that matches our type
        const typedStartups: Startup[] = data
          .filter((item: any): item is Startup => 
            typeof item.id === 'string' && 
            typeof item.name === 'string' && 
            typeof item.industry === 'string' && 
            typeof item.stage === 'string' && 
            typeof item.description === 'string'
          );
        
        setStartups(typedStartups);
      }
    } catch (error) {
      console.error('Error fetching startups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentStartups = async () => {
    try {
      const { data, error } = await supabase
        .from('startups')
        .select('id, name, industry, stage, description')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      if (data) {
        // Ensure we only process startup data that matches our type
        const typedStartups: Startup[] = data
          .filter((item: any): item is Startup => 
            typeof item.id === 'string' && 
            typeof item.name === 'string' && 
            typeof item.industry === 'string' && 
            typeof item.stage === 'string' && 
            typeof item.description === 'string'
          );
        
        setRecentStartups(typedStartups);
      }
    } catch (error) {
      console.error('Error fetching recent startups:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="neo-blur rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gradient">Investor Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
              
              <div className="p-6 glass rounded-xl mb-8 border border-white/10">
                <h2 className="text-xl font-semibold mb-2">Welcome back, {profile.name || "Investor"}</h2>
                <p className="text-muted-foreground">Your investment profile is active and visible to startups in your focus area.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="glass p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold mb-3">Your Profile</h3>
                  <ul className="space-y-2">
                    <li><span className="text-muted-foreground">Investment Focus:</span> <span className="text-foreground">{profile.investmentFocus}</span></li>
                    <li><span className="text-muted-foreground">Investment Range:</span> <span className="text-foreground">{profile.investmentRange}</span></li>
                    <li><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{profile.email}</span></li>
                  </ul>
                </div>
                <div className="glass p-6 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-white/10 hover:bg-white/5" 
                      onClick={() => navigate('/startups')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Browse Vetted Startups
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gradient">Recommended Startups</h3>
                {isLoading ? (
                  <div className="p-8 text-center glass rounded-xl border border-white/10">
                    <p className="text-muted-foreground">Loading startups...</p>
                  </div>
                ) : startups.length > 0 ? (
                  <div className="space-y-4">
                    {startups.map((startup) => (
                      <Card key={startup.id} className="overflow-hidden bg-card border-white/10">
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
                            <span className="bg-secondary/30 text-foreground text-xs px-2.5 py-0.5 rounded">{startup.industry}</span>
                            <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded">{startup.stage}</span>
                          </div>
                        </CardHeader>
                        <Collapsible open={openStartup === startup.id}>
                          <CollapsibleContent>
                            <CardContent className="pt-2">
                              <p className="text-sm text-muted-foreground">{startup.description}</p>
                              <Button className="mt-3" size="sm">View Details</Button>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center glass rounded-xl border border-white/10">
                    <p className="text-muted-foreground">No startups to display yet. Check back soon!</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 text-center">
                <Button onClick={() => navigate('/startups')}>
                  View All Vetted Startups
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default InvestorDashboard;
