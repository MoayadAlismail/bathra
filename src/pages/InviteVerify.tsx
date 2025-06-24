import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  LoaderCircle,
  CheckCircle,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AuthService } from "@/lib/auth-service";
import { userInviteService } from "@/lib/user-invite-service";
import Navbar from "@/components/Navbar";

export default function InviteVerify() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const authService = AuthService.getInstance();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

    if (emailParam && tokenParam) {
      setEmail(emailParam);
      setInviteToken(tokenParam);
    } else {
      toast({
        title: "Invalid Link",
        description: "Missing email or invitation token.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [searchParams, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast({
        title: "Missing Code",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Verification code must be 6 digits.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Verify OTP for invite-based signup and accept invitation
      const result = await authService.verifyInviteOTP(email, otp, inviteToken);

      if (result.success) {
        setVerified(true);
        const inviteAccepted = result.data?.inviteAccepted;

        toast({
          title: "Email Verified",
          description: inviteAccepted
            ? "Your account has been created and invitation accepted!"
            : "Your account has been created successfully!",
        });

        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate(
            "/login?message=Account created successfully. Please log in."
          );
        }, 3000);
      } else {
        toast({
          title: "Verification Failed",
          description:
            result.error?.message || "Invalid or expired verification code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      const result = await authService.resendOTP(email);

      if (result.success) {
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your email.",
        });
      } else {
        toast({
          title: "Failed to Resend",
          description:
            result.error?.message || "Could not resend verification code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification code.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  const handleBackToSignup = () => {
    navigate(`/invite-signup?token=${inviteToken}`);
  };

  if (verified) {
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
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Welcome to Bathra!</h1>
              <p className="text-muted-foreground mb-6">
                Your account has been successfully created and your invitation
                has been accepted. You will be redirected to the login page
                shortly.
              </p>
              <Button onClick={() => navigate("/login")}>
                Continue to Login
              </Button>
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
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
              <p className="text-muted-foreground">
                We've sent a 6-digit verification code to{" "}
                <span className="font-medium">{email}</span>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Enter Verification Code</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="000000"
                      className="text-center text-2xl tracking-widest"
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Enter the 6-digit code from your email
                    </p>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Email"
                    )}
                  </Button>
                </form>

                <div className="mt-6 space-y-3">
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resending}
                      className="text-sm text-primary hover:underline disabled:opacity-50"
                    >
                      {resending ? (
                        <>
                          <RotateCcw className="inline mr-1 h-3 w-3 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        "Didn't receive the code? Resend"
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleBackToSignup}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back to signup
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Check your spam folder if you don't see the email in your inbox.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
