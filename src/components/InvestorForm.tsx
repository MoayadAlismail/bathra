
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { WifiOff, RefreshCw, Loader, Wifi } from "lucide-react";
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
  const [submissionAttempts, setSubmissionAttempts] = useState(0);
  
  const { toast: uiToast } = useToast();
  const { register, isConfigured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => {
      console.log("Browser reports online status");
      setIsOnline(true);
      setError("");
    };
    
    const handleOffline = () => {
      console.log("Browser reports offline status");
      setIsOnline(false);
      setError("You are currently offline. Please check your internet connection.");
    };

    // Set initial online state but don't trust it completely
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // More reliable connectivity check
    const checkConnectivity = async () => {
      try {
        console.log("Performing initial connectivity check");
        const timestamp = new Date().getTime();
        // Use multiple endpoints with cache busting to prevent false positives
        const endpoints = [
          `https://www.google.com/favicon.ico?_=${timestamp}`,
          `https://www.cloudflare.com/favicon.ico?_=${timestamp}`,
          `https://www.microsoft.com/favicon.ico?_=${timestamp}`
        ];
        
        // Try the endpoints one by one until one succeeds
        for (const endpoint of endpoints) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(endpoint, {
              method: 'HEAD',
              mode: 'no-cors',
              cache: 'no-store',
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            console.log(`Connectivity check succeeded with ${endpoint}`);
            setIsOnline(true);
            setError("");
            return; // Exit after first successful check
          } catch (err) {
            console.warn(`Connectivity check failed for ${endpoint}:`, err);
            // Continue to the next endpoint
          }
        }
        
        // If we get here, all endpoints failed
        if (navigator.onLine) {
          console.log("Browser reports online but all connectivity checks failed");
          // The browser might be wrong about online status, but let's trust it for now
          // to avoid false negatives in corporate networks with firewalls
          setIsOnline(true);
        } else {
          console.log("All connectivity checks failed and browser reports offline");
          setIsOnline(false);
          setError("You appear to be offline. Please check your internet connection.");
        }
      } catch (err) {
        console.warn('Connectivity check error:', err);
        // Fall back to browser's online status
        setIsOnline(navigator.onLine);
      }
    };
    
    checkConnectivity();

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
      setSubmissionAttempts(prevAttempts => prevAttempts + 1);
      
      const toastId = "register-toast-" + Date.now();
      toast.loading("Creating your account...", { id: toastId, duration: 30000 });
      
      console.log("Starting registration process with:", { 
        name, 
        email, 
        passwordLength: password.length,
        investmentFocus,
        investmentRange
      });
      
      await register({
        name,
        email,
        password,
        investmentFocus,
        investmentRange
      });
      
      console.log("Registration completed successfully!");
      toast.dismiss(toastId);
      toast.success("Registration Successful!", {
        description: "Your investor account has been created.",
        duration: 5000
      });
      
      // Small delay before navigation to ensure toast is seen
      setTimeout(() => {
        navigate("/dashboard");
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
        errorMessage.includes('offline') ||
        err.name === 'AbortError' ||
        !navigator.onLine
      ) {
        errorMessage = "Connection error. Please check your internet connection or try again later.";
        setIsOnline(false);
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const retryConnection = async () => {
    setError("");
    try {
      toast.loading("Checking connection...");
      
      // Use the same multi-endpoint approach for retrying
      const timestamp = new Date().getTime();
      const endpoints = [
        `https://www.google.com/favicon.ico?_=${timestamp}`,
        `https://www.cloudflare.com/favicon.ico?_=${timestamp}`,
        `https://www.microsoft.com/favicon.ico?_=${timestamp}`
      ];
      
      let connected = false;
      
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          await fetch(endpoint, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          connected = true;
          break;
        } catch (err) {
          console.warn(`Retry connectivity check failed for ${endpoint}:`, err);
          // Continue to next endpoint
        }
      }
      
      if (connected || navigator.onLine) {
        setIsOnline(true);
        toast.success("Connection verified!");
      } else {
        setIsOnline(false);
        setError("Still experiencing connection issues. Please check your network.");
        toast.error("Connection check failed. Please try again later.");
      }
    } catch (err) {
      console.error("Connection retry error:", err);
      // Fall back to browser's status
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        toast.success("Connection seems to be working");
      } else {
        toast.error("Connection check failed. Please try again later.");
      }
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
            <span className="inline-block px-4 py-2 rounded-full font-medium mb-4 bg-white text-primary">
              For Investors
            </span>
            <h2 className="text-4xl font-bold mb-4">Join Our Investor Network</h2>
            <p className="text-gray-600">
              Create your account to connect with promising startups.
            </p>
          </div>

          {!isOnline && (
            <Alert variant="destructive" className="mb-6">
              <WifiOff className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>You are currently offline. Please check your internet connection to create an account.</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={retryConnection}
                  className="ml-2 whitespace-nowrap"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isOnline && (
            <Alert variant="default" className="mb-6 bg-green-50 border-green-200 text-green-700">
              <Wifi className="h-4 w-4" />
              <AlertDescription>
                You are connected to the internet and can create an account.
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
            <div className="mb-6 p-4 border rounded-lg bg-red-50 border-red-200 text-red-600">
              {error}
              {(error.includes("Connection error") || error.includes("offline") || error.includes("network")) && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={retryConnection}
                    className="text-sm"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" /> Test Connection
                  </Button>
                </div>
              )}
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
              <Label htmlFor="focus" className="mb-2">
                Investment Focus *
              </Label>
              <select
                id="focus"
                value={investmentFocus}
                onChange={(e) => setInvestmentFocus(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
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
              <Label htmlFor="investmentRange" className="mb-2">
                Typical Investment Range *
              </Label>
              <select
                id="investmentRange"
                value={investmentRange}
                onChange={(e) => setInvestmentRange(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
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
                className="w-full"
                disabled={isSubmitting || !isOnline}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </span>
                ) : "Create Investor Account"}
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
