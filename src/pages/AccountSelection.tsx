
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader, Building, User, Briefcase } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AccountType = 'startup' | 'individual' | 'vc';

const AccountSelection = () => {
  const [mainAccountType, setMainAccountType] = useState<'startup' | 'investor'>("investor");
  const [investorType, setInvestorType] = useState<'individual' | 'vc'>("individual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setAccountType: saveAccountType, user } = useAuth();
  const navigate = useNavigate();

  // Determine the final account type based on main selection and investor subtype
  const getAccountType = (): AccountType => {
    if (mainAccountType === 'startup') return 'startup';
    return investorType;
  };

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      const accountType = getAccountType();
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
                  value={mainAccountType} 
                  onValueChange={(value) => setMainAccountType(value as 'startup' | 'investor')}
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
                    <RadioGroupItem value="investor" id="investor" />
                    <div className="flex-1 ml-2">
                      <Label htmlFor="investor" className="font-medium flex items-center cursor-pointer">
                        <Briefcase className="mr-2 h-5 w-5 text-primary" />
                        Investor
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Browse and invest in promising startups
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {mainAccountType === 'investor' && (
                <div className="mb-6">
                  <Label htmlFor="investorType" className="mb-2 block">
                    Investor Type
                  </Label>
                  <Select
                    value={investorType}
                    onValueChange={(value) => setInvestorType(value as 'individual' | 'vc')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select investor type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Individual Investor</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="vc">
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>Venture Capital</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

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
