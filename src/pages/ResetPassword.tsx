import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { signupTranslations } from "@/utils/language";
import { simpleAuthService } from "@/lib/simple-auth-service";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

const ResetPassword = () => {
  const [resetError, setResetError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Helper function to get translated text
  const t = (key: keyof typeof signupTranslations) => {
    return signupTranslations[key][language];
  };

  const formSchema = z
    .object({
      password: z.string().min(6, t("passwordMinLength")),
      confirmPassword: z.string().min(6, t("passwordMinLength")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Establish a session from recovery tokens in URL (hash or query)
  useEffect(() => {
    const establishSessionFromUrl = async () => {
      try {
        // Try to read tokens from URL hash first (Supabase default), then from query
        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, "")
        );
        const hashType = hashParams.get("type");
        const hashAccess = hashParams.get("access_token");
        const hashRefresh = hashParams.get("refresh_token");

        const queryAccess = searchParams.get("access_token");
        const queryRefresh = searchParams.get("refresh_token");
        const queryType = searchParams.get("type");

        const accessToken = hashAccess || queryAccess || undefined;
        const refreshToken = hashRefresh || queryRefresh || undefined;
        const flowType = hashType || queryType || undefined;

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          // If it's not a recovery flow, block usage of this page
          if (flowType && flowType !== "recovery") {
            toast.error("Invalid reset link type");
            navigate("/login");
            return;
          }
        } else {
          // No tokens found; ensure a valid session already exists (e.g., Supabase already processed the hash)
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            toast.error("Invalid or expired reset link");
            navigate("/login");
            return;
          }
        }
      } catch (err) {
        console.error("Failed to establish session for password reset:", err);
        toast.error("Invalid or expired reset link");
        navigate("/login");
      }
    };

    void establishSessionFromUrl();
  }, [searchParams, navigate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsResetting(true);
      setResetError("");

      await simpleAuthService.setPassword(values.password);

      setResetSuccess(true);
      toast.success(t("passwordResetSuccessDescription"));
    } catch (error) {
      console.error("Password reset error:", error);
      setResetError(
        error instanceof Error ? error.message : "Failed to reset password"
      );
      toast.error(t("passwordResetFailedTitle"));
    } finally {
      setIsResetting(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      await simpleAuthService.logout();
    } catch (_) {
      // ignore
    } finally {
      navigate("/login");
    }
  };

  if (resetSuccess) {
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
                <CardHeader className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <CardTitle className="text-2xl font-bold">
                    {t("passwordResetSuccessTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t("passwordResetSuccessDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleBackToLogin} className="w-full">
                    {t("backToLogin")}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

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
                  {t("resetPasswordTitle")}
                </CardTitle>
                <CardDescription>
                  {t("resetPasswordDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resetError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{resetError}</AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("newPasswordLabel").replace(" *", "")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              disabled={isResetting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("confirmNewPasswordLabel").replace(" *", "")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              disabled={isResetting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToLogin}
                        disabled={isResetting}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isResetting}
                      >
                        {isResetting ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            {t("resettingPassword")}
                          </>
                        ) : (
                          t("resetPasswordButton")
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
