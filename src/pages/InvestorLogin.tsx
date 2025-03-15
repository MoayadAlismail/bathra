
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const InvestorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { login, isDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await login(email, password);
      toast({
        title: isDemo ? "Login Successful (Demo Mode)!" : "Login Successful!",
        description: isDemo ? 
          "You are now logged in with demo credentials." : 
          "Welcome back to your dashboard.",
      });
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
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

            {isDemo && (
              <Alert className="mb-6 dark:border-yellow-400 dark:bg-yellow-900/20 dark:text-yellow-300 
                                light:border-yellow-500 light:bg-yellow-50 light:text-yellow-700">
                <AlertTriangle className="h-4 w-4 dark:text-yellow-300 light:text-yellow-500" />
                <AlertTitle>Demo Mode Active</AlertTitle>
                <AlertDescription>
                  Enter any email and password to log in with demo credentials.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <div className="mb-6 p-3 bg-destructive/20 border border-destructive/30 text-destructive-foreground rounded-lg text-sm">
                {error}
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
                />
              </div>

              <Button type="submit" className="w-full">
                Log In
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{" "}
                <Link to="/invest" className="text-primary hover:underline">
                  Register here
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default InvestorLogin;
