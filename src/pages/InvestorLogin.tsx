
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

const InvestorLogin = () => {
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, loginWithGoogle, loginWithDemo } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoggingIn(true);
      setLoginError("");
      await login(values.email, values.password);
      navigate("/account-type");
    } catch (error: any) {
      setLoginError(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = (type: 'startup' | 'individual' | 'vc') => {
    loginWithDemo(type);
    
    if (type === 'startup') {
      navigate("/startup-profile");
    } else {
      navigate("/startups");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="neo-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
                <CardDescription>
                  Sign in to your account to access the Bathra platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loginError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your@email.com"
                              {...field}
                              disabled={isLoggingIn}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              disabled={isLoggingIn}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoggingIn}
                              id="remember-me"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel htmlFor="remember-me">
                              Remember me
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 space-y-4">
                  <p className="text-sm text-muted-foreground text-center">Or use a demo account</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => handleDemoLogin('startup')}
                    >
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded mr-2">Demo</span>
                      Startup Account
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => handleDemoLogin('individual')}
                    >
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded mr-2">Demo</span>
                      Individual Investor
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => handleDemoLogin('vc')}
                    >
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded mr-2">Demo</span>
                      Venture Capital
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col">
                <div className="mt-4 text-center text-sm">
                  Don't have an account?{" "}
                  <a href="/invest" className="text-primary hover:underline">
                    Register here
                  </a>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InvestorLogin;
