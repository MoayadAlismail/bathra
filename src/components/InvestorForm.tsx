
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AccountType = 'startup' | 'individual' | 'vc';

const InvestorForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [investmentFocus, setInvestmentFocus] = useState("");
  const [investmentRange, setInvestmentRange] = useState("");
  const [mainAccountType, setMainAccountType] = useState<'startup' | 'investor'>("investor");
  const [investorType, setInvestorType] = useState<'individual' | 'vc'>("individual");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast: uiToast } = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();

  // Determine the final account type based on main selection and investor subtype
  const getAccountType = (): AccountType => {
    if (mainAccountType === 'startup') return 'startup';
    return investorType;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const toastId = "register-toast-" + Date.now();
      toast.loading("Creating your account...", { id: toastId, duration: 30000 });
      
      const accountType = getAccountType();
      
      console.log("Starting registration process with:", { 
        name, 
        email, 
        passwordLength: password.length,
        investmentFocus: mainAccountType === 'investor' ? investmentFocus : '',
        investmentRange: mainAccountType === 'investor' ? investmentRange : '',
        accountType
      });
      
      await register({
        name,
        email,
        password,
        investmentFocus: mainAccountType === 'investor' ? investmentFocus : '',
        investmentRange: mainAccountType === 'investor' ? investmentRange : '',
        accountType
      });
      
      console.log("Registration completed successfully!");
      toast.dismiss(toastId);
      toast.success("Registration Successful!", {
        description: "Your account has been created.",
        duration: 5000
      });
      
      // Small delay before navigation to ensure toast is seen
      setTimeout(() => {
        if (accountType === 'startup') {
          navigate("/startup-profile");
        } else {
          navigate("/startups");
        }
      }, 500);
    } catch (err: any) {
      console.error("Registration error:", err);
      
      let errorMessage = err.message || "Registration failed";
      
      if (
        errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') || 
        errorMessage.includes('network') ||
        errorMessage.includes('Connection error') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('offline')
      ) {
        // More specific error message for connection issues
        errorMessage = "There was an issue connecting to our servers. Please try again in a moment. If the problem persists, check your internet connection and browser settings.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      toast.dismiss("register-toast-" + Date.now());
    } finally {
      setIsSubmitting(false);
    }
  };

  const showInvestmentOptions = mainAccountType === 'investor';

  return (
    <section id="investor-form" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full font-medium mb-4 bg-white text-primary">
              Create Account
            </span>
            <h2 className="text-4xl font-bold mb-4">Join Our Platform</h2>
            <p className="text-gray-600">
              Create your account to get started with Bathra.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 border rounded-lg bg-red-50 border-red-200 text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 p-8 rounded-xl bg-white shadow-lg">
            <div>
              <Label htmlFor="name" className="mb-2">
                Full Name *
              </Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2">
                Email *
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                placeholder="your@email.com"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="password" className="mb-2">
                  Password *
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="mb-2">
                  Confirm Password *
                </Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2">
                Account Type *
              </Label>
              <RadioGroup 
                value={mainAccountType} 
                onValueChange={(value) => setMainAccountType(value as 'startup' | 'investor')}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
              >
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value="startup" id="startup" />
                  <Label htmlFor="startup" className="cursor-pointer">Startup</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value="investor" id="investor" />
                  <Label htmlFor="investor" className="cursor-pointer">Investor</Label>
                </div>
              </RadioGroup>
            </div>

            {showInvestmentOptions && (
              <>
                <div>
                  <Label htmlFor="investorType" className="mb-2">
                    Investor Type *
                  </Label>
                  <Select
                    value={investorType}
                    onValueChange={(value) => setInvestorType(value as 'individual' | 'vc')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select investor type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Investor</SelectItem>
                      <SelectItem value="vc">Venture Capital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="focus" className="mb-2">
                    Investment Focus *
                  </Label>
                  <Select value={investmentFocus} onValueChange={setInvestmentFocus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your investment focus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Fintech">Fintech</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Sustainability">Sustainability</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="investmentRange" className="mb-2">
                    Typical Investment Range *
                  </Label>
                  <Select value={investmentRange} onValueChange={setInvestmentRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select investment range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$10K - $50K (Seed)">$10K - $50K (Seed)</SelectItem>
                      <SelectItem value="$50K - $200K (Angel)">$50K - $200K (Angel)</SelectItem>
                      <SelectItem value="$200K - $1M (Series A)">$200K - $1M (Series A)</SelectItem>
                      <SelectItem value="$1M+ (Series B+)">$1M+ (Series B+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </span>
                ) : "Create Account"}
              </Button>
              
              <div className="text-center mt-4 text-sm text-gray-600">
                Already have an account? <a href="/login" className="text-primary hover:underline">Log in</a>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default InvestorForm;
