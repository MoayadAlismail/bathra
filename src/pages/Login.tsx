import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import UserTypeSelectionModal from "@/components/auth/UserTypeSelectionModal";

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

const Login = () => {
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const { signIn, signInWithOAuth, user } = useAuth();
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

      const result = await signIn({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (result.success && result.user) {
        // After successful login, redirect based on account type using the returned user data
        const accountType = result.user.accountType;
        console.log("accountType", accountType, result.user);
        if (accountType === "investor") {
          navigate("/investor-dashboard");
        } else if (accountType === "startup") {
          navigate("/startup-dashboard");
        } else if (accountType === "admin") {
          navigate("/admin");
        } else {
          // Default fallback
          navigate("/");
        }
      } else {
        // Error will be handled by signIn function via toast, but we should also set local error
        setLoginError(
          "Login failed. Please check your credentials and try again."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during login"
      );
    } finally {
      setIsLoggingIn(false);
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
              </CardContent>
              <CardFooter className="flex-col">
                <div className="mt-4 text-center text-sm">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setShowUserTypeModal(true)}
                    className="text-primary hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Register here
                  </button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>

      <UserTypeSelectionModal
        open={showUserTypeModal}
        onOpenChange={setShowUserTypeModal}
      />
    </div>
  );
};

export default Login;
