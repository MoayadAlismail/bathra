
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";

const InvestorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, loginWithDemo, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "Login Successful!",
        description: "Welcome back to your dashboard.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    loginWithDemo();
    toast({
      title: "Demo Login Successful!",
      description: "You now have access to all investor features.",
    });
    navigate("/dashboard");
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    
    try {
      await loginWithGoogle();
      // Note: We don't navigate here as Google login will redirect the user
    } catch (err: any) {
      setError(err.message || "Google login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto neo-blur p-8 rounded-xl shadow-lg"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 text-gradient">Investor Login</h2>
              <p className="text-muted-foreground">
                Access your investment dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-destructive/20 border border-destructive/30 text-destructive-foreground rounded-lg text-sm flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background border-border"
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-background border-border"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{" "}
                <Link to="/invest" className="text-primary hover:underline">
                  Register here
                </Link>
              </div>
            </form>

            <div className="mt-8">
              <div className="flex items-center gap-4 mb-6">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>
              
              {/* Google login button */}
              <Button 
                variant="outline" 
                className="w-full mb-3 flex items-center justify-center" 
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                Continue with Demo Account
              </Button>
              
              <p className="text-xs text-muted-foreground mt-3 text-center">
                No sign-up required. Access all features instantly.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default InvestorLogin;
