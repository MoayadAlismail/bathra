import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, Plus, X } from "lucide-react";
import { useSimpleAuth } from "@/lib/simple-auth-service";
import { toast } from "sonner";

interface InvestorFormData {
  // Auth fields
  email: string;
  password: string;
  confirmPassword: string;

  // Personal info
  name: string;
  phone: string;
  birthday: string;
  company?: string;
  role: string;
  country: string;
  city: string;

  // Investment preferences
  preferredIndustries: string[];
  preferredStage: string;
  averageTicketSize: string;

  // Social profiles
  linkedinProfile: string;
  otherSocialMedia: { platform: string; url: string }[];
  calendlyLink?: string;

  // Background
  howDidYouHear: string;
  numberOfInvestments: number | null;
  hasSecuredLeadInvestor: boolean;
  hasBeenStartupAdvisor: boolean;
  whyStrongCandidate: string;

  // Agreement checkboxes
  agreeToTerms: boolean;
  acceptNewsletter: boolean;
}

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Fintech",
  "E-commerce",
  "SaaS",
  "AI/ML",
  "Biotech",
  "Clean Energy",
  "Real Estate",
  "EdTech",
  "FoodTech",
  "AgTech",
  "Gaming",
  "Media",
  "Transportation",
  "Manufacturing",
  "Other",
];

const COMPANY_STAGES = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
  "Growth Stage",
  "Any Stage",
];

const TICKET_SIZES = [
  "$1K - $10K",
  "$10K - $50K",
  "$50K - $100K",
  "$100K - $500K",
  "$500K - $1M",
  "$1M - $5M",
  "$5M+",
];

const HOW_DID_YOU_HEAR = [
  "Google Search",
  "Social Media",
  "Referral from Friend",
  "Industry Event",
  "Newsletter",
  "Blog/Article",
  "Existing Investor",
  "Other",
];

export default function InvestorSignupForm() {
  const [formData, setFormData] = useState<InvestorFormData>({
    // Auth fields
    email: "",
    password: "",
    confirmPassword: "",

    // Personal info
    name: "",
    phone: "",
    birthday: "",
    company: "",
    role: "",
    country: "",
    city: "",

    // Investment preferences
    preferredIndustries: [],
    preferredStage: "",
    averageTicketSize: "",

    // Social profiles
    linkedinProfile: "",
    otherSocialMedia: [],
    calendlyLink: "",

    // Background
    howDidYouHear: "",
    numberOfInvestments: null,
    hasSecuredLeadInvestor: false,
    hasBeenStartupAdvisor: false,
    whyStrongCandidate: "",

    // Agreement checkboxes
    agreeToTerms: false,
    acceptNewsletter: false,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useSimpleAuth();
  const navigate = useNavigate();

  const addSocialMedia = () => {
    setFormData((prev) => ({
      ...prev,
      otherSocialMedia: [...prev.otherSocialMedia, { platform: "", url: "" }],
    }));
  };

  const removeSocialMedia = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      otherSocialMedia: prev.otherSocialMedia.filter((_, i) => i !== index),
    }));
  };

  const updateSocialMedia = (
    index: number,
    field: "platform" | "url",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      otherSocialMedia: prev.otherSocialMedia.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const toggleIndustry = (industry: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredIndustries: prev.preferredIndustries.includes(industry)
        ? prev.preferredIndustries.filter((i) => i !== industry)
        : [...prev.preferredIndustries, industry],
    }));
  };

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!formData.email) newErrors.push("Email is required");
    if (!formData.password) newErrors.push("Password is required");
    if (formData.password !== formData.confirmPassword)
      newErrors.push("Passwords don't match");
    if (formData.password.length < 8)
      newErrors.push("Password must be at least 8 characters");
    if (!formData.name) newErrors.push("Name is required");
    if (!formData.phone) newErrors.push("Phone is required");
    if (!formData.birthday) newErrors.push("Birthday is required");
    if (!formData.role) newErrors.push("Role is required");
    if (!formData.country) newErrors.push("Country is required");
    if (!formData.city) newErrors.push("City is required");
    if (formData.preferredIndustries.length === 0)
      newErrors.push("Please select at least one preferred industry");
    if (!formData.preferredStage)
      newErrors.push("Preferred company stage is required");
    if (!formData.averageTicketSize)
      newErrors.push("Average ticket size is required");
    if (!formData.linkedinProfile)
      newErrors.push("LinkedIn profile is required");
    if (!formData.calendlyLink) newErrors.push("Calendly link is required");
    if (!formData.howDidYouHear)
      newErrors.push("Please tell us how you heard about us");
    if (!formData.whyStrongCandidate)
      newErrors.push("Please explain why you're a strong candidate");
    if (!formData.agreeToTerms)
      newErrors.push("You must agree to the terms and conditions");

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      // First, sign up with basic credentials
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        accountType: "investor",
      });

      // Check if user already exists by examining the identities array
      // An empty identities array indicates the user already exists
      if (
        result.user &&
        result.user.id &&
        result.emailVerificationSent &&
        "identities" in result.user &&
        Array.isArray(result.user.identities) &&
        result.user.identities.length === 0
      ) {
        setErrors([
          "An account with this email already exists. Please sign in instead.",
        ]);
        setIsSubmitting(false);
        return;
      }

      if (result.emailVerificationSent) {
        // Store the full registration data in sessionStorage for OTP verification
        const fullRegistrationData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          accountType: "investor" as const,
          // Additional investor-specific data
          phone: formData.phone,
          birthday: formData.birthday,
          company: formData.company,
          role: formData.role,
          country: formData.country,
          city: formData.city,
          preferredIndustries: formData.preferredIndustries,
          preferredStage: formData.preferredStage,
          averageTicketSize: formData.averageTicketSize,
          linkedinProfile: formData.linkedinProfile,
          otherSocialMedia: formData.otherSocialMedia,
          calendlyLink: formData.calendlyLink,
          howDidYouHear: formData.howDidYouHear,
          numberOfInvestments: formData.numberOfInvestments,
          hasSecuredLeadInvestor: formData.hasSecuredLeadInvestor,
          hasBeenStartupAdvisor: formData.hasBeenStartupAdvisor,
          whyStrongCandidate: formData.whyStrongCandidate,
          agreeToTerms: formData.agreeToTerms,
          newsletterSubscribed: formData.acceptNewsletter,
        };

        sessionStorage.setItem(
          "pendingRegistration",
          JSON.stringify(fullRegistrationData)
        );

        toast.success(
          "Registration successful! Please check your email to verify your account."
        );
        navigate("/verify-email", { state: { email: formData.email } });
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Check for specific error types from Supabase
      if (error instanceof Error) {
        if (
          error.message.includes("email already in use") ||
          error.message.includes("User already registered")
        ) {
          setErrors([
            "An account with this email already exists. Please sign in instead.",
          ]);
        } else {
          setErrors([error.message]);
        }
      } else {
        setErrors(["Registration failed. Please try again."]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Minimum 8 characters"
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="Confirm your password"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="+1 234 567 8900"
              required
            />
          </div>
          <div>
            <Label htmlFor="birthday">Birthday *</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, birthday: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, company: e.target.value }))
              }
              placeholder="Company name"
            />
          </div>
          <div>
            <Label htmlFor="role">Role *</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value }))
              }
              placeholder="Investor, Partner, CEO, etc."
              required
            />
          </div>
          <div>
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, country: e.target.value }))
              }
              placeholder="United States"
              required
            />
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, city: e.target.value }))
              }
              placeholder="New York"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Investment Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Preferred Industries * (Select multiple)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {INDUSTRIES.map((industry) => (
                <div key={industry} className="flex items-center space-x-2">
                  <Checkbox
                    id={industry}
                    checked={formData.preferredIndustries.includes(industry)}
                    onCheckedChange={() => toggleIndustry(industry)}
                  />
                  <Label htmlFor={industry} className="text-sm">
                    {industry}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="preferredStage">Preferred Company Stage *</Label>
              <Select
                value={formData.preferredStage}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, preferredStage: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred stage" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="averageTicketSize">Average Ticket Size *</Label>
              <Select
                value={formData.averageTicketSize}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, averageTicketSize: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ticket size" />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Profiles */}
      <Card>
        <CardHeader>
          <CardTitle>Social Profiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="linkedinProfile">LinkedIn Profile *</Label>
            <Input
              id="linkedinProfile"
              value={formData.linkedinProfile}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  linkedinProfile: e.target.value,
                }))
              }
              placeholder="https://linkedin.com/in/yourprofile"
              required
            />
          </div>

          <div>
            <Label htmlFor="calendlyLink">Calendly Link *</Label>
            <Input
              id="calendlyLink"
              value={formData.calendlyLink}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  calendlyLink: e.target.value,
                }))
              }
              placeholder="https://calendly.com/yourlink"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Other Social Media Profiles</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSocialMedia}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Social Media
              </Button>
            </div>
            {formData.otherSocialMedia.map((social, index) => (
              <div key={index} className="flex gap-4 items-center mb-3">
                <Input
                  placeholder="Platform (Twitter, Instagram, etc.)"
                  value={social.platform}
                  onChange={(e) =>
                    updateSocialMedia(index, "platform", e.target.value)
                  }
                />
                <Input
                  placeholder="Profile URL"
                  value={social.url}
                  onChange={(e) =>
                    updateSocialMedia(index, "url", e.target.value)
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSocialMedia(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Background & Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Background & Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="howDidYouHear">How did you hear about us? *</Label>
            <Select
              value={formData.howDidYouHear}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, howDidYouHear: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select how you heard about us" />
              </SelectTrigger>
              <SelectContent>
                {HOW_DID_YOU_HEAR.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="numberOfInvestments">
              Number of investments made *
            </Label>
            <Input
              id="numberOfInvestments"
              type="number"
              min="0"
              value={
                formData.numberOfInvestments === null
                  ? ""
                  : formData.numberOfInvestments
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  numberOfInvestments:
                    e.target.value === "" ? null : parseInt(e.target.value),
                }))
              }
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasSecuredLeadInvestor"
                checked={formData.hasSecuredLeadInvestor}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    hasSecuredLeadInvestor: !!checked,
                  }))
                }
              />
              <Label htmlFor="hasSecuredLeadInvestor">
                Have you ever secured a lead investor?
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasBeenStartupAdvisor"
                checked={formData.hasBeenStartupAdvisor}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    hasBeenStartupAdvisor: !!checked,
                  }))
                }
              />
              <Label htmlFor="hasBeenStartupAdvisor">
                Have you participated as a startup advisor before?
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="whyStrongCandidate">
              What makes you a strong candidate for Bathra? *
            </Label>
            <Textarea
              id="whyStrongCandidate"
              value={formData.whyStrongCandidate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  whyStrongCandidate: e.target.value,
                }))
              }
              placeholder="Tell us about your investment experience, expertise, and what you can bring to the Bathra community..."
              rows={4}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Agreement Checkboxes */}
      <Card>
        <CardHeader>
          <CardTitle>Agreement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  agreeToTerms: !!checked,
                }))
              }
              required
            />
            <Label
              htmlFor="agreeToTerms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <a
                href="/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                terms and conditions
              </a>{" "}
              *
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptNewsletter"
              checked={formData.acceptNewsletter}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  acceptNewsletter: !!checked,
                }))
              }
            />
            <Label
              htmlFor="acceptNewsletter"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I accept receiving newsletter
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex">
        <Button
          type="submit"
          disabled={isSubmitting || !formData.agreeToTerms}
          className="flex-1"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Investor Account"
          )}
        </Button>
      </div>
    </form>
  );
}
