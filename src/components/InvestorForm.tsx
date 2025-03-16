
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const InvestorForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [investmentFocus, setInvestmentFocus] = useState("");
  const [investmentRange, setInvestmentRange] = useState("");
  const [error, setError] = useState("");
  
  const { toast } = useToast();
  const { register, isDemo } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate form
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    try {
      await register({
        name,
        email,
        password,
        investmentFocus,
        investmentRange
      });
      
      toast({
        title: isDemo ? "Registration Successful (Demo Mode)!" : "Registration Successful!",
        description: isDemo ? 
          "Your investor account has been created in demo mode. No data is persisted." :
          "Your investor account has been created.",
      });
      
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
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

          {isDemo && (
            <Alert className={`mb-6 ${
              theme === 'dark'
                ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300'
                : 'border-yellow-400 bg-yellow-50 text-yellow-800'
            }`}>
              <AlertTriangle className={`h-4 w-4 ${
                theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'
              }`} />
              <AlertTitle>Demo Mode Active</AlertTitle>
              <AlertDescription>
                The application is running in demo mode because Supabase credentials are not configured.
                Account creation will work, but data is only stored temporarily in memory.
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
              ? 'glass border border-primary/20' 
              : 'bg-white shadow-lg'
          }`}>
            <div>
              <label htmlFor="name" className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-foreground' : 'text-gray-700'
              }`}>
                Full Name *
              </label>
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
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-foreground' : 'text-gray-700'
              }`}>
                Email *
              </label>
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
                <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-700'
                }`}>
                  Password *
                </label>
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
                <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-700'
                }`}>
                  Confirm Password *
                </label>
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
              <label htmlFor="focus" className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-foreground' : 'text-gray-700'
              }`}>
                Investment Focus *
              </label>
              <select
                id="focus"
                value={investmentFocus}
                onChange={(e) => setInvestmentFocus(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-background border-primary/20 focus:border-primary focus:ring-primary text-foreground'
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
              <label htmlFor="investmentRange" className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-foreground' : 'text-gray-700'
              }`}>
                Typical Investment Range *
              </label>
              <select
                id="investmentRange"
                value={investmentRange}
                onChange={(e) => setInvestmentRange(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-background border-primary/20 focus:border-primary focus:ring-primary text-foreground'
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
              <Button type="submit" className="w-full">
                Create Investor Account
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
