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
import { Loader, Plus, X, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useSimpleAuth } from "@/lib/simple-auth-service";

interface CoFounder {
  name: string;
  role: string;
  email: string;
  linkedinProfile?: string;
}

interface StartupFormData {
  // Auth fields
  email: string;
  password: string;
  confirmPassword: string;

  // Basic info
  founderName: string;
  phone: string;
  startupName: string;
  website?: string;
  industry: string;
  stage: string;

  // Logo and media
  logoUrl?: string;
  socialMediaAccounts: { platform: string; url: string }[];

  // Business details
  problemSolving: string;
  solutionDescription: string;
  uniqueValueProposition: string;

  // Financial info
  currentRevenue: number;
  hasReceivedFunding: boolean;
  monthlyBurnRate: number;
  investmentInstrument: string;
  capitalSeeking: number;
  preMoneyValuation: number;
  fundingAlreadyRaised: number;

  // Resources
  pitchDeckUrl?: string;
  coFounders: CoFounder[];
  calendlyLink?: string;
  videoLink?: string;
  teamSize: number;

  // Strategic info
  achievements: string;
  risksAndMitigation: string;
  exitStrategy: string;
  participatedAccelerator: boolean;
  acceleratorDetails?: string;
  additionalFiles: string[];

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

const STARTUP_STAGES = ["Idea", "MVP", "Scaling"];

const INVESTMENT_INSTRUMENTS = [
  "Equity",
  "Convertible note",
  "SAFE",
  "Loan",
  "Other",
  "Undecided",
  "Not interested in funding",
];

const EXIT_STRATEGIES = [
  "Competitor buyout",
  "Company buyout",
  "Shareholder/employee buyout",
  "IPO/RPO",
];

export default function StartupSignupForm() {
  const [formData, setFormData] = useState<StartupFormData>({
    // Auth fields
    email: "",
    password: "",
    confirmPassword: "",

    // Basic info
    founderName: "",
    phone: "",
    startupName: "",
    website: "",
    industry: "",
    stage: "",
    logoUrl: "",

    // Social media
    socialMediaAccounts: [],

    // Business details
    problemSolving: "",
    solutionDescription: "",
    uniqueValueProposition: "",

    // Financial info
    currentRevenue: 0,
    hasReceivedFunding: false,
    monthlyBurnRate: 0,
    investmentInstrument: "",
    capitalSeeking: 0,
    preMoneyValuation: 0,
    fundingAlreadyRaised: 0,

    // Resources
    pitchDeckUrl: "",
    coFounders: [],
    calendlyLink: "",
    videoLink: "",
    teamSize: 1,

    // Strategic info
    achievements: "",
    risksAndMitigation: "",
    exitStrategy: "",
    participatedAccelerator: false,
    acceleratorDetails: "",
    additionalFiles: [],

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
      socialMediaAccounts: [
        ...prev.socialMediaAccounts,
        { platform: "", url: "" },
      ],
    }));
  };

  const removeSocialMedia = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socialMediaAccounts: prev.socialMediaAccounts.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateSocialMedia = (
    index: number,
    field: "platform" | "url",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      socialMediaAccounts: prev.socialMediaAccounts.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addCoFounder = () => {
    setFormData((prev) => ({
      ...prev,
      coFounders: [
        ...prev.coFounders,
        { name: "", role: "", email: "", linkedinProfile: "" },
      ],
    }));
  };

  const removeCoFounder = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      coFounders: prev.coFounders.filter((_, i) => i !== index),
    }));
  };

  const updateCoFounder = (
    index: number,
    field: keyof CoFounder,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      coFounders: prev.coFounders.map((coFounder, i) =>
        i === index ? { ...coFounder, [field]: value } : coFounder
      ),
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
    if (!formData.founderName) newErrors.push("Founder name is required");
    if (!formData.phone) newErrors.push("Phone is required");
    if (!formData.startupName) newErrors.push("Startup name is required");
    if (!formData.industry) newErrors.push("Industry is required");
    if (!formData.stage) newErrors.push("Startup stage is required");
    if (!formData.problemSolving)
      newErrors.push("Problem description is required");
    if (!formData.solutionDescription)
      newErrors.push("Solution description is required");
    if (!formData.uniqueValueProposition)
      newErrors.push("Unique value proposition is required");
    if (!formData.investmentInstrument)
      newErrors.push("Investment instrument is required");
    if (!formData.achievements)
      newErrors.push("Achievements description is required");
    if (!formData.risksAndMitigation)
      newErrors.push("Risks and mitigation is required");
    if (!formData.exitStrategy) newErrors.push("Exit strategy is required");
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
        name: formData.founderName,
        accountType: "startup",
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
          name: formData.founderName,
          accountType: "startup" as const,
          // Additional startup-specific data
          phone: formData.phone,
          startupName: formData.startupName,
          website: formData.website,
          industry: formData.industry,
          stage: formData.stage,
          logoUrl: formData.logoUrl,
          socialMediaAccounts: formData.socialMediaAccounts,
          problemSolving: formData.problemSolving,
          solutionDescription: formData.solutionDescription,
          uniqueValueProposition: formData.uniqueValueProposition,
          currentRevenue: formData.currentRevenue,
          hasReceivedFunding: formData.hasReceivedFunding,
          monthlyBurnRate: formData.monthlyBurnRate,
          investmentInstrument: formData.investmentInstrument,
          capitalSeeking: formData.capitalSeeking,
          preMoneyValuation: formData.preMoneyValuation,
          fundingAlreadyRaised: formData.fundingAlreadyRaised,
          pitchDeckUrl: formData.pitchDeckUrl,
          coFounders: formData.coFounders,
          calendlyLink: formData.calendlyLink,
          videoLink: formData.videoLink,
          teamSize: formData.teamSize,
          achievements: formData.achievements,
          risksAndMitigation: formData.risksAndMitigation,
          exitStrategy: formData.exitStrategy,
          participatedAccelerator: formData.participatedAccelerator,
          acceleratorDetails: formData.acceleratorDetails,
          additionalFiles: formData.additionalFiles,
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
              placeholder="founder@startup.com"
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

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="founderName">Founder Name *</Label>
            <Input
              id="founderName"
              value={formData.founderName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  founderName: e.target.value,
                }))
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
            <Label htmlFor="startupName">Startup Name *</Label>
            <Input
              id="startupName"
              value={formData.startupName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  startupName: e.target.value,
                }))
              }
              placeholder="Your startup name"
              required
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, website: e.target.value }))
              }
              placeholder="https://yourstartu.com"
            />
          </div>
          <div>
            <Label htmlFor="industry">Industry *</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, industry: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="stage">Startup Stage *</Label>
            <Select
              value={formData.stage}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, stage: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {STARTUP_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              value={formData.logoUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))
              }
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div>
            <Label htmlFor="teamSize">Team Size</Label>
            <Input
              id="teamSize"
              type="number"
              min="1"
              value={formData.teamSize}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  teamSize: parseInt(e.target.value) || 1,
                }))
              }
              placeholder="1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Label>Social Media Profiles</Label>
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
          {formData.socialMediaAccounts.map((social, index) => (
            <div key={index} className="flex gap-4 items-center mb-3">
              <Input
                placeholder="Platform (Twitter, LinkedIn, etc.)"
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
        </CardContent>
      </Card>

      {/* Business Description */}
      <Card>
        <CardHeader>
          <CardTitle>Business Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="problemSolving">
              What problem are you solving? *
            </Label>
            <Textarea
              id="problemSolving"
              value={formData.problemSolving}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  problemSolving: e.target.value,
                }))
              }
              placeholder="Describe the problem your startup is addressing..."
              rows={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="solutionDescription">
              What solution do you provide? *
            </Label>
            <Textarea
              id="solutionDescription"
              value={formData.solutionDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  solutionDescription: e.target.value,
                }))
              }
              placeholder="Describe your solution..."
              rows={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="uniqueValueProposition">
              What makes your startup unique? *
            </Label>
            <Textarea
              id="uniqueValueProposition"
              value={formData.uniqueValueProposition}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  uniqueValueProposition: e.target.value,
                }))
              }
              placeholder="Describe what differentiates you from competitors..."
              rows={3}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="currentRevenue">
              Current Financial Year Revenue ($)
            </Label>
            <Input
              id="currentRevenue"
              type="number"
              min="0"
              step="0.01"
              value={
                formData.currentRevenue === 0 ? "" : formData.currentRevenue
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currentRevenue: parseFloat(e.target.value) || 0,
                }))
              }
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="monthlyBurnRate">Monthly Burn Rate ($)</Label>
            <Input
              id="monthlyBurnRate"
              type="number"
              min="0"
              step="0.01"
              value={
                formData.monthlyBurnRate === 0 ? "" : formData.monthlyBurnRate
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  monthlyBurnRate: parseFloat(e.target.value) || 0,
                }))
              }
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="capitalSeeking">Capital Seeking ($)</Label>
            <Input
              id="capitalSeeking"
              type="number"
              min="0"
              step="0.01"
              value={
                formData.capitalSeeking === 0 ? "" : formData.capitalSeeking
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  capitalSeeking: parseFloat(e.target.value) || 0,
                }))
              }
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="preMoneyValuation">Pre-Money Valuation ($)</Label>
            <Input
              id="preMoneyValuation"
              type="number"
              min="0"
              step="0.01"
              value={
                formData.preMoneyValuation === 0
                  ? ""
                  : formData.preMoneyValuation
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  preMoneyValuation: parseFloat(e.target.value) || 0,
                }))
              }
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="fundingAlreadyRaised">
              Funding Already Raised ($)
            </Label>
            <Input
              id="fundingAlreadyRaised"
              type="number"
              min="0"
              step="0.01"
              value={
                formData.fundingAlreadyRaised === 0
                  ? ""
                  : formData.fundingAlreadyRaised
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fundingAlreadyRaised: parseFloat(e.target.value) || 0,
                }))
              }
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="investmentInstrument">
              Investment Instrument *
            </Label>
            <Select
              value={formData.investmentInstrument}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  investmentInstrument: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select instrument" />
              </SelectTrigger>
              <SelectContent>
                {INVESTMENT_INSTRUMENTS.map((instrument) => (
                  <SelectItem key={instrument} value={instrument}>
                    {instrument}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Funding Status */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="hasReceivedFunding"
              checked={formData.hasReceivedFunding}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  hasReceivedFunding: !!checked,
                }))
              }
            />
            <Label htmlFor="hasReceivedFunding">
              Has the company received any funding or investments to date?
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Co-Founders */}
      <Card>
        <CardHeader>
          <CardTitle>Co-Founders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Label>Add Co-Founders</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCoFounder}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Co-Founder
            </Button>
          </div>
          {formData.coFounders.map((coFounder, index) => (
            <div key={index} className="border p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  placeholder="Co-Founder Name"
                  value={coFounder.name}
                  onChange={(e) =>
                    updateCoFounder(index, "name", e.target.value)
                  }
                />
                <Input
                  placeholder="Role/Title"
                  value={coFounder.role}
                  onChange={(e) =>
                    updateCoFounder(index, "role", e.target.value)
                  }
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={coFounder.email}
                  onChange={(e) =>
                    updateCoFounder(index, "email", e.target.value)
                  }
                />
                <Input
                  placeholder="LinkedIn Profile (optional)"
                  value={coFounder.linkedinProfile}
                  onChange={(e) =>
                    updateCoFounder(index, "linkedinProfile", e.target.value)
                  }
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeCoFounder(index)}
              >
                <X className="h-4 w-4 mr-2" />
                Remove Co-Founder
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Resources & Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="pitchDeckUrl">Pitch Deck URL</Label>
            <Input
              id="pitchDeckUrl"
              value={formData.pitchDeckUrl}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  pitchDeckUrl: e.target.value,
                }))
              }
              placeholder="https://example.com/pitchdeck.pdf"
            />
          </div>
          <div>
            <Label htmlFor="calendlyLink">Calendly Link</Label>
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
            />
          </div>
          <div>
            <Label htmlFor="videoLink">Video Link (optional)</Label>
            <Input
              id="videoLink"
              value={formData.videoLink}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, videoLink: e.target.value }))
              }
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Strategic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="achievements">
              What have you achieved so far? (revenue, traction, major
              investments) *
            </Label>
            <Textarea
              id="achievements"
              value={formData.achievements}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  achievements: e.target.value,
                }))
              }
              placeholder="Describe your key achievements, milestones, and traction..."
              rows={4}
              required
            />
          </div>
          <div>
            <Label htmlFor="risksAndMitigation">
              What are the risks? What steps will you take to mitigate them? *
            </Label>
            <Textarea
              id="risksAndMitigation"
              value={formData.risksAndMitigation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  risksAndMitigation: e.target.value,
                }))
              }
              placeholder="Identify potential risks and your mitigation strategies..."
              rows={4}
              required
            />
          </div>
          <div>
            <Label htmlFor="exitStrategy">Exit Strategy *</Label>
            <Select
              value={formData.exitStrategy}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, exitStrategy: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select exit strategy" />
              </SelectTrigger>
              <SelectContent>
                {EXIT_STRATEGIES.map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {strategy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accelerator Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Accelerator Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="participatedAccelerator"
              checked={formData.participatedAccelerator}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  participatedAccelerator: !!checked,
                }))
              }
            />
            <Label htmlFor="participatedAccelerator">
              Have you participated in any accelerator or incubator program?
            </Label>
          </div>
          {formData.participatedAccelerator && (
            <div>
              <Label htmlFor="acceleratorDetails">
                Accelerator/Incubator Details
              </Label>
              <Textarea
                id="acceleratorDetails"
                value={formData.acceleratorDetails}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    acceleratorDetails: e.target.value,
                  }))
                }
                placeholder="Which accelerator/incubator did you participate in? What was the outcome?"
                rows={3}
              />
            </div>
          )}
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
            "Create Startup Account"
          )}
        </Button>
      </div>
    </form>
  );
}
