
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, AlertCircle, Clock, Building, Edit, Plus, ExternalLink, Award, TrendingUp, Users, Briefcase, Target, Rocket, FileText } from 'lucide-react';
import { isStartupAccount } from '@/lib/account-types';

interface Startup {
  id: string;
  name: string;
  industry: string;
  stage: string;
  description: string;
  website: string;
  founders: string;
  team_size: string;
  valuation: string;
  raised?: number;
  roi?: number;
  status: string;
  created_at: string;
  image?: string;
  founded_date: string;
  target_market: string;
  problem_solved: string;
  usp: string;
  traction: string;
  key_metrics: string;
  previous_funding: string;
  funding_required: string;
  use_of_funds: string;
  roadmap: string;
  exit_strategy: string;
  document_path?: string;
}

const StartupProfile = () => {
  const [startup, setStartup] = useState<Startup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStartupProfile();
  }, [profile]);

  const fetchStartupProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const startupId = profile?.startupId || profile?.id;
      
      if (!startupId) {
        setError('No startup profile found');
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('startups')
        .select('*')
        .eq('id', startupId);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setError('Startup profile not found');
      } else {
        setStartup(data[0] as Startup);
      }
    } catch (err: any) {
      console.error('Error fetching startup profile:', err);
      setError(err.message || 'Failed to load your startup profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading Startup Profile...</h2>
          <Clock className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-destructive mb-2" />
          <h2 className="text-2xl font-semibold text-destructive mb-4">Error: {error}</h2>
          <p className="text-muted-foreground">Please try again later.</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Go Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No Startup Profile Found</h2>
          <p className="text-muted-foreground">
            It seems you haven't created a startup profile yet.
          </p>
          <Button onClick={() => navigate('/startup-form')}>Create Startup Profile</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16"
      >
        <Card className="w-full max-w-5xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">
              {startup?.name}
              <Badge variant="secondary" className="ml-2">
                {startup?.status === 'vetted' ? (
                  <div className="flex items-center">
                    <Check className="mr-1 h-4 w-4" />
                    Vetted
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 animate-pulse" />
                    Pending
                  </div>
                )}
              </Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/startup-form')}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <h3 className="text-sm font-medium leading-none">Industry</h3>
                <p className="text-muted-foreground">{startup?.industry}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium leading-none">Stage</h3>
                <p className="text-muted-foreground">{startup?.stage}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium leading-none">Valuation</h3>
                <p className="text-muted-foreground">{startup?.valuation}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium leading-none">ROI</h3>
                <p className="text-muted-foreground">{startup?.roi || 'N/A'}%</p>
              </div>
              <div>
                <h3 className="text-sm font-medium leading-none">Raised</h3>
                <p className="text-muted-foreground">${startup?.raised || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium leading-none">Team Size</h3>
                <p className="text-muted-foreground">{startup?.team_size}</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold leading-none mb-2">Description</h3>
              <p className="text-muted-foreground">{startup?.description}</p>
            </div>
            <div className="mt-6">
              <Button variant="link" asChild>
                <a href={startup?.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Visit Website
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StartupProfile;
