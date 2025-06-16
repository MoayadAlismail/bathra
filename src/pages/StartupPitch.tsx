
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StartupForm from "@/components/StartupForm";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const StartupPitch = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in and has the 'startup' account type
    if (!isLoading) {
      if (!user) {
        toast.error("You must be logged in to submit a startup pitch");
        navigate('/login');
        return;
      }
      
      const accountType = profile?.accountType
      
      if (accountType !== 'startup') {
        toast.error("Only startup accounts can submit pitches");
        navigate('/login');
      }
    }
  }, [user, profile, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="bg-gradient-to-b from-primary/10 to-background pt-20 pb-10">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Get Funded by Top Investors</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Bathra connects promising startups with investors looking for the next big opportunity.
              Complete the form below with detailed information to maximize your chances of securing funding.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="bg-secondary px-3 py-1 rounded-full text-sm font-medium text-secondary-foreground">Thorough Vetting</span>
              <span className="bg-secondary px-3 py-1 rounded-full text-sm font-medium text-secondary-foreground">Direct Connections</span>
              <span className="bg-secondary px-3 py-1 rounded-full text-sm font-medium text-secondary-foreground">Expert Guidance</span>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-10">
        <StartupForm />
      </div>
    </div>
  );
};

export default StartupPitch;
