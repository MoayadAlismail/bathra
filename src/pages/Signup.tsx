import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Building, Briefcase } from "lucide-react";
import { AccountType } from "@/lib/account-types";
import InvestorSignupForm from "@/components/auth/InvestorSignupForm";
import StartupSignupForm from "@/components/auth/StartupSignupForm";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { signupTranslations } from "@/utils/language";

export default function Signup() {
  const [step, setStep] = useState<"selection" | "form">("selection");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const { language } = useLanguage();

  // Helper function to get translated text
  const t = (key: keyof typeof signupTranslations) => {
    return signupTranslations[key][language];
  };

  const handleAccountTypeSelection = (type: AccountType) => {
    setAccountType(type);
    setStep("form");
  };

  const handleBackToSelection = () => {
    setStep("selection");
    setAccountType(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20">
        <div className="container mx-auto px-4">
          {step === "selection" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">{t("joinBathra")}</h1>
                <p className="text-muted-foreground">
                  {t("chooseAccountType")}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    {t("selectAccountType")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={accountType || ""}
                    onValueChange={(value) =>
                      setAccountType(value as AccountType)
                    }
                    className="space-y-4"
                  >
                    <div
                      className="flex items-center space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-muted/30"
                      onClick={() => setAccountType("investor")}
                    >
                      <RadioGroupItem value="investor" id="investor" />
                      <div className="flex-1">
                        <Label
                          htmlFor="investor"
                          className="font-medium flex items-center cursor-pointer"
                        >
                          <Briefcase className="mr-2 h-5 w-5 text-primary" />
                          {t("imAnInvestor")}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("investorDescription")}
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-muted/30"
                      onClick={() => setAccountType("startup")}
                    >
                      <RadioGroupItem value="startup" id="startup" />
                      <div className="flex-1">
                        <Label
                          htmlFor="startup"
                          className="font-medium flex items-center cursor-pointer"
                        >
                          <Building className="mr-2 h-5 w-5 text-primary" />
                          {t("imAStartup")}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("startupDescription")}
                        </p>
                      </div>
                    </div>
                  </RadioGroup>

                  <Button
                    onClick={() =>
                      accountType && handleAccountTypeSelection(accountType)
                    }
                    disabled={!accountType}
                    className="w-full"
                  >
                    {t("continueButton")}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    {t("alreadyHaveAccount")}{" "}
                    <a href="/login" className="text-primary hover:underline">
                      {t("signInLink")}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "form" && accountType && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={handleBackToSelection}
                  className="mb-4"
                >
                  {t("backToAccountType")}
                </Button>
                <h1 className="text-3xl font-bold mb-2">
                  {accountType === "investor"
                    ? t("investorRegistration")
                    : t("startupRegistration")}
                </h1>
                <p className="text-muted-foreground">{t("completeProfile")}</p>
              </div>

              {accountType === "investor" ? (
                <InvestorSignupForm />
              ) : (
                <StartupSignupForm />
              )}
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
