
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StartupData {
  id: string;
  name: string;
  industry: string;
  stage: string;
  description: string;
  website: string;
  founders: string;
  status: string;
  image?: string;
}

const StartupProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [startupData, setStartupData] = useState<StartupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const accountType = profile?.accountType || user?.user_metadata?.accountType;
    if (accountType !== 'startup') {
      toast.error("Only startup accounts can access this page");
      navigate('/account-type');
      return;
    }

    // For demo purposes, we'll use our mock data
    const fetchStartupData = async () => {
      setIsLoading(true);
      try {
        if (user.user_metadata?.startupId) {
          // For demo user with predefined startup ID
          const { data, error } = await supabase
            .from('startups')
            .select('*')
            .eq('id', user.user_metadata.startupId)
            .single();

          if (error) throw error;
          setStartupData(data);
        } else {
          // For demo, show a default startup
          setStartupData({
            id: "demo-startup-1",
            name: "Your Startup",
            industry: "Technology",
            stage: "Seed",
            description: "Your startup description will appear here after you submit your pitch.",
            website: "https://yourstartup.com",
            founders: "Your Name",
            status: "pending"
          });
        }
      } catch (error) {
        console.error("Error fetching startup data:", error);
        toast.error("Failed to load your startup profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStartupData();
  }, [user, profile, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto pt-20 px-4 flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {startupData ? (
            <div className="bg-card shadow-lg rounded-lg overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold">{startupData.name}</h1>
                  <div className="mt-2 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      startupData.status === 'vetted' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : startupData.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {startupData.status === 'vetted' ? 'Vetted' : 
                       startupData.status === 'pending' ? 'Under Review' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">Industry</span>
                    <span className="font-medium">{startupData.industry || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">Stage</span>
                    <span className="font-medium">{startupData.stage || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">Founders</span>
                    <span className="font-medium">{startupData.founders || "Not specified"}</span>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">About</h2>
                  <p className="text-muted-foreground">
                    {startupData.description || "No description available."}
                  </p>
                </div>
                
                {startupData.website && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">Website</h2>
                    <a
                      href={startupData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {startupData.website}
                    </a>
                  </div>
                )}
                
                {startupData.status === 'vetted' ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">Your startup has been vetted!</h2>
                    <p className="text-green-600 dark:text-green-300">
                      Congratulations! Your startup is now visible to our network of investors.
                      Keep your profile updated for the best chances of securing funding.
                    </p>
                  </div>
                ) : startupData.status === 'pending' ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Under Review</h2>
                    <p className="text-yellow-600 dark:text-yellow-300">
                      Your startup is currently being reviewed by our team.
                      We'll notify you once the vetting process is complete.
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-2">Complete Your Profile</h2>
                    <p className="text-blue-600 dark:text-blue-300">
                      Submit your pitch to complete your startup profile and start the vetting process.
                    </p>
                    <Button
                      onClick={() => navigate('/pitch')}
                      className="mt-3"
                    >
                      Submit Pitch
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">No Startup Profile Found</h2>
              <p className="text-muted-foreground mb-6">
                You haven't submitted a startup pitch yet. Complete the form to create your startup profile.
              </p>
              <Button onClick={() => navigate('/pitch')}>Submit Pitch</Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StartupProfile;
