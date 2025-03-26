
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader, Building, User, Briefcase } from "lucide-react";

type AccountType = 'startup' | 'individual' | 'vc';

const AccountSelection = () => {
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setAccountType: saveAccountType, user } = useAuth();
  const navigate = useNavigate();

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      await saveAccountType(accountType);
      
      if (accountType === 'startup') {
        navigate('/startup-profile');
      } else {
        navigate('/startups');
      }
    } catch (error) {
      console.error('Error setting account type:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Choose Account Type</h1>
              <p className="text-muted-foreground">
                Select the type of account that best represents you on our platform.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-lg">
              <div className="mb-6">
                <RadioGroup 
                  value={accountType} 
                  onValueChange={(value) => setAccountType(value as AccountType)}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-muted/30">
                    <RadioGroupItem value="startup" id="startup" />
                    <div className="flex-1 ml-2">
                      <Label htmlFor="startup" className="font-medium flex items-center cursor-pointer">
                        <Building className="mr-2 h-5 w-5 text-primary" />
                        Startup
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create a profile for your startup and connect with investors
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-muted/30">
                    <RadioGroupItem value="individual" id="individual" />
                    <div className="flex-1 ml-2">
                      <Label htmlFor="individual" className="font-medium flex items-center cursor-pointer">
                        <User className="mr-2 h-5 w-5 text-primary" />
                        Individual Investor
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Browse and invest in promising startups as an individual
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-muted/30">
                    <RadioGroupItem value="vc" id="vc" />
                    <div className="flex-1 ml-2">
                      <Label htmlFor="vc" className="font-medium flex items-center cursor-pointer">
                        <Briefcase className="mr-2 h-5 w-5 text-primary" />
                        Venture Capital
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Represent a VC firm and explore investment opportunities
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                onClick={handleContinue} 
                disabled={isSubmitting} 
                className="w-full"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AccountSelection;
