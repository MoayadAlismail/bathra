import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import UserTypeSelectionModal from "@/components/auth/UserTypeSelectionModal";
import { signupTranslations } from "@/utils/language";

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

const Login = () => {
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const { signIn } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Helper function to get translated text
  const t = (key: keyof typeof signupTranslations) => {
    return signupTranslations[key][language];
  };

  const formSchema = z.object({
    email: z.string().email(t("loginInvalidEmailError")),
    password: z.string().min(1, t("passwordRequiredError")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoggingIn(true);
      setLoginError("");

      const result = await signIn({
        email: values.email,
        password: values.password,
      });

      if (result.success && result.user) {
        // After successful login, redirect based on account type using the returned user data
        const accountType = result.user.accountType;

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
        setLoginError(t("loginFailedError"));
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        error instanceof Error ? error.message : t("unexpectedLoginError")
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-40">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="neo-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {t("signInTitle")}
                </CardTitle>
                <CardDescription>{t("signInDescription")}</CardDescription>
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
                          <FormLabel>
                            {t("emailLabel").replace(" *", "")}
                          </FormLabel>
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
                          <FormLabel>
                            {t("passwordLabel").replace(" *", "")}
                          </FormLabel>
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
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          {t("signingIn")}
                        </>
                      ) : (
                        t("signInButton")
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex-col">
                <div className="mt-4 text-center text-sm">
                  {t("noAccountText")}{" "}
                  <button
                    onClick={() => navigate("/signup")}
                    className="text-primary hover:underline bg-transparent border-none cursor-pointer"
                  >
                    {t("registerHereLink")}
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
