
import { motion } from "framer-motion";
import InvestorForm from "@/components/InvestorForm";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

const InvestorJoin = () => {
  const { theme } = useTheme();
  const { isConfigured } = useAuth();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'neo-blur bg-background' : 'bg-background'}`}>
      <Navbar />
      
      {/* Hero section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`py-16 ${theme === 'dark' ? 'hero-gradient border-b border-primary/20' : 'bg-primary text-primary-foreground'}`}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Join Our Network of Investors
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Connect with promising startups and diversify your investment portfolio with innovative companies.
          </p>
          
          {!isConfigured && (
            <Alert variant="destructive" className="mt-6 max-w-2xl mx-auto bg-destructive/20 border-destructive text-white">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                The authentication system is not configured. Please set up Supabase URL and anonymous key in environment variables.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </motion.div>
      
      <div className="container mx-auto px-4 py-10">
        <InvestorForm />
      </div>
    </div>
  );
};

export default InvestorJoin;
