import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";

const InvestorForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [investmentFocus, setInvestmentFocus] = useState("");
  const [investmentRange, setInvestmentRange] = useState("");
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast: uiToast } = useToast();
  const { register, isConfigured } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!isOnline) {
      setError("You are currently offline. Please check your internet connection.");
      return;
    }
    
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
      
      toast.loading("Creating your account...", { id: "register-toast" });
      
      await register({
        name,
        email,
        password,
        investmentFocus,
        investmentRange
      });
      
      toast.dismiss("register-toast");
      toast.success("Registration Successful!", {
        description: "Your investor account has been created.",
        duration: 5000
      });
      
      navigate("/dashboard");
    } catch (err: any) {
      toast.dismiss("register-toast");
      
      console.error("Registration error:", err);
      if (
        err.message?.includes('Failed to fetch') || 
        err.message?.includes('NetworkError') || 
        err.message?.includes('network') ||
        err.message?.includes('timeout') ||
        err.name === 'AbortError'
      ) {
        setError("Connection error. Please check your internet connection or try again later.");
      } else {
        setError(err.message || "Registration failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className={`inline-block px-4 py-2 rounded-full font-medium mb-4 ${
              theme === 'dark' 
                ? 'bg-primary/20 text-primary-foreground' 
                : 'bg-white text-primary'
            }`}>
              For Investors
            </span>
            <h2 className="text-4xl font-bold mb-4">Join Our Investor Network</h2>
            <p className={theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'}>
              Create your account to connect with promising startups.
            </p>
          </div>

          {!isOnline && (
            <Alert variant="destructive" className="mb-6">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                You are currently offline. Please check your internet connection to create an account.
              </AlertDescription>
            </Alert>
          )}

          {!isConfigured && (
            <Alert variant="destructive" className="mb-6">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                Supabase is not properly configured. Authentication will not work. Please configure Supabase URL and anonymous key in environment variables.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <div className={`mb-6 p-4 border rounded-lg ${
              theme === 'dark'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-6 p-8 rounded-xl ${
            theme === 'dark' 
              ? 'bg-background/30 backdrop-blur-xl border border-primary/20 shadow-lg shadow-primary/5' 
              : 'bg-white shadow-lg'
          }`}>
            <div>
              <Label htmlFor="name" className={`mb-2 ${theme === 'dark' ? 'text-foreground' : ''}`}>
                Full Name *
              </Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`w-full ${theme === 'dark' ? 'bg-background/80 border-primary/20 text-foreground' : ''}`}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="email" className={`mb-2 ${theme === 'dark' ? 'text-foreground' : ''}`}>
                Email *
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full ${theme === 'dark' ? 'bg-background/80 border-primary/20 text-foreground' : ''}`}
                placeholder="your@email.com"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="password" className={`mb-2 ${theme === 'dark' ? 'text-foreground' : ''}`}>
                  Password *
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full ${theme === 'dark' ? 'bg-background/80 border-primary/20 text-foreground' : ''}`}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className={`mb-2 ${theme === 'dark' ? 'text-foreground' : ''}`}>
                  Confirm Password *
                </Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full ${theme === 'dark' ? 'bg-background/80 border-primary/20 text-foreground' : ''}`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="focus" className={`mb-2 ${theme === 'dark' ? 'text-foreground' : ''}`}>
                Investment Focus *
              </Label>
              <select
                id="focus"
                value={investmentFocus}
                onChange={(e) => setInvestmentFocus(e.target.value)}
                required
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-background/80 border-primary/20 text-foreground focus:border-primary focus:ring-1 focus:ring-primary'
                    : 'border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent'
                }`}
              >
                <option value="">Select your investment focus</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Fintech">Fintech</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Sustainability">Sustainability</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="investmentRange" className={`mb-2 ${theme === 'dark' ? 'text-foreground' : ''}`}>
                Typical Investment Range *
              </Label>
              <select
                id="investmentRange"
                value={investmentRange}
                onChange={(e) => setInvestmentRange(e.target.value)}
                required
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-background/80 border-primary/20 text-foreground focus:border-primary focus:ring-1 focus:ring-primary'
                    : 'border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent'
                }`}
              >
                <option value="">Select investment range</option>
                <option value="$10K - $50K (Seed)">$10K - $50K (Seed)</option>
                <option value="$50K - $200K (Angel)">$50K - $200K (Angel)</option>
                <option value="$200K - $1M (Series A)">$200K - $1M (Series A)</option>
                <option value="$1M+ (Series B+)">$1M+ (Series B+)</option>
              </select>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className={`w-full ${theme === 'dark' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
                disabled={isSubmitting || !isOnline}
              >
                {isSubmitting ? "Creating Account..." : "Create Investor Account"}
              </Button>
              
              <div className={`text-center mt-4 text-sm ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
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
