import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, Mail, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useSimpleAuth } from "@/lib/simple-auth-service";
import { RegistrationData } from "@/lib/auth-types";
import Footer from "@/components/Footer";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { verifyOTP, resendVerificationEmail } = useSimpleAuth();

  // Get email from location state, URL params, or user object
  const email =
    (location.state as { email?: string })?.email ||
    searchParams.get("email") ||
    user?.email ||
    "";

  useEffect(() => {
    // Redirect if user is already verified
    // With simple-auth-service, we assume the user is verified if they're logged in
    // or if the profile exists and has isEmailVerified set to true
    if (user && profile?.isEmailVerified) {
      setIsVerified(true);
    }
  }, [user, profile]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (!email) {
      setError("Email address not found. Please try signing up again.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Get registration data from sessionStorage
      let registrationData: RegistrationData | undefined;
      const storedData = sessionStorage.getItem("pendingRegistration");

      if (storedData) {
        try {
          registrationData = JSON.parse(storedData) as RegistrationData;
        } catch (e) {
          console.error("Failed to parse registration data:", e);
        }
      }

      // Use our auth service to verify OTP and pass registration data
      const user = await verifyOTP({
        email,
        token: otp,
        registrationData,
      });

      if (user) {
        setIsVerified(true);
        toast.success("Email verified successfully!");

        // Clean up the stored registration data
        sessionStorage.removeItem("pendingRegistration");

        // Redirect based on account type
        if (user.accountType === "investor") {
          setTimeout(() => navigate("/investor-dashboard"), 2000);
        } else if (user.accountType === "startup") {
          setTimeout(() => navigate("/startup-dashboard"), 2000);
        } else if (user.accountType === "admin") {
          setTimeout(() => navigate("/admin"), 2000);
        } else {
          // Fallback for unknown account types
          setTimeout(() => navigate("/"), 2000);
        }
      }
    } catch (error: unknown) {
      console.error("Verification error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error("Verification failed: " + errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Email address not found. Please try signing up again.");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      // Use our auth service to resend verification email
      await resendVerificationEmail(email);
      toast.success("Verification email sent! Check your inbox.");
    } catch (error: unknown) {
      console.error("Resend error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to resend verification email. Please try again.";
      setError(errorMessage);
      toast.error("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="mb-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-green-600 mb-2">
                  Email Verified!
                </h1>
                <p className="text-muted-foreground">
                  Your account has been successfully verified. Redirecting you
                  to your dashboard...
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
              <p className="text-muted-foreground">
                We've sent a 6-digit verification code to
              </p>
              <p className="font-medium text-foreground">{email}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  Enter Verification Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div>
                    <Label htmlFor="otp">6-Digit Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // Only allow digits
                        setOtp(value);
                      }}
                      placeholder="123456"
                      className="text-center text-2xl tracking-widest"
                      autoComplete="one-time-code"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Enter the 6-digit code from your email
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isVerifying || otp.length !== 6}
                    className="w-full"
                  >
                    {isVerifying ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Email"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Didn't receive the code?
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="w-full"
                  >
                    {isResending ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      "Resend Code"
                    )}
                  </Button>
                </div>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <p>
                    Wrong email?{" "}
                    <button
                      onClick={() => navigate("/signup")}
                      className="text-primary hover:underline"
                    >
                      Sign up again
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
