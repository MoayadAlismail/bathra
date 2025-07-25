import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader, Plus, X, Save, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase, Startup } from "@/lib/supabase";
import {
  uploadPitchDeck,
  extractFilePathFromUrl,
  deletePitchDeck,
} from "@/lib/storage-service";
import { useLanguage } from "@/context/LanguageContext";
import { signupTranslations } from "@/utils/language/signup";
import { startupTranslations } from "@/utils/language/startup";

interface StartupProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  startup: Startup;
  onUpdate: (updatedStartup: Startup) => void;
}

interface CoFounder {
  name: string;
  role: string;
  email: string;
  linkedinProfile?: string;
}

interface StartupFormData {
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
  previousRevenue: number;
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
  additionalVideoUrl?: string;
  teamSize: number;

  // Strategic info
  achievements: string;
  risksAndMitigation: string;
  exitStrategy: string;
  participatedAccelerator: boolean;
  acceleratorDetails?: string;
  additionalFiles: string[];
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

const StartupProfileEditModal = ({
  isOpen,
  onClose,
  startup,
  onUpdate,
}: StartupProfileEditModalProps) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<StartupFormData>({
    founderName: "",
    phone: "",
    startupName: "",
    website: "",
    industry: "",
    stage: "",
    logoUrl: "",
    socialMediaAccounts: [],
    problemSolving: "",
    solutionDescription: "",
    uniqueValueProposition: "",
    currentRevenue: 0,
    previousRevenue: 0,
    hasReceivedFunding: false,
    monthlyBurnRate: 0,
    investmentInstrument: "",
    capitalSeeking: 0,
    preMoneyValuation: 0,
    fundingAlreadyRaised: 0,
    pitchDeckUrl: "",
    coFounders: [],
    calendlyLink: "",
    videoLink: "",
    additionalVideoUrl: "",
    teamSize: 1,
    achievements: "",
    risksAndMitigation: "",
    exitStrategy: "",
    participatedAccelerator: false,
    acceleratorDetails: "",
    additionalFiles: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  useEffect(() => {
    if (isOpen && startup) {
      // Parse social media accounts from JSON string
      let parsedSocialMedia = [];
      try {
        parsedSocialMedia = startup.social_media_accounts
          ? JSON.parse(startup.social_media_accounts)
          : [];
      } catch (error) {
        console.error("Error parsing social media accounts:", error);
        parsedSocialMedia = [];
      }

      // Parse co-founders from JSON string
      let parsedCoFounders = [];
      try {
        parsedCoFounders = startup.co_founders
          ? JSON.parse(startup.co_founders)
          : [];
      } catch (error) {
        console.error("Error parsing co-founders:", error);
        parsedCoFounders = [];
      }

      // Parse additional files from JSON string
      let parsedAdditionalFiles = [];
      try {
        parsedAdditionalFiles = startup.additional_files
          ? JSON.parse(startup.additional_files)
          : [];
      } catch (error) {
        console.error("Error parsing additional files:", error);
        parsedAdditionalFiles = [];
      }

      setFormData({
        founderName: startup.founder_info || "",
        phone: startup.phone || "",
        startupName: startup.startup_name || startup.name || "",
        website: startup.website || "",
        industry: startup.industry || "",
        stage: startup.stage || "",
        logoUrl: startup.logo || "",
        socialMediaAccounts: Array.isArray(parsedSocialMedia)
          ? parsedSocialMedia
          : [],
        problemSolving: startup.problem_solving || "",
        solutionDescription: startup.solution || "",
        uniqueValueProposition: startup.uniqueness || "",
        currentRevenue: startup.current_financial_year_revenue || 0,
        previousRevenue: startup.previous_financial_year_revenue || 0,
        hasReceivedFunding: startup.has_received_funding || false,
        monthlyBurnRate: startup.monthly_burn_rate || 0,
        investmentInstrument: startup.investment_instrument || "",
        capitalSeeking: startup.capital_seeking || 0,
        preMoneyValuation: startup.pre_money_valuation || 0,
        fundingAlreadyRaised: startup.funding_already_raised || 0,
        pitchDeckUrl: startup.pitch_deck || "",
        coFounders: Array.isArray(parsedCoFounders) ? parsedCoFounders : [],
        calendlyLink: startup.calendly_link || "",
        videoLink: startup.video_link || "",
        additionalVideoUrl: startup.additional_video_url || "",
        teamSize: startup.team_size || 1,
        achievements: startup.achievements || "",
        risksAndMitigation: startup.risk_mitigation || startup.risks || "",
        exitStrategy: startup.exit_strategy || "",
        participatedAccelerator: startup.participated_in_accelerator || false,
        acceleratorDetails: "", // This field might not exist in the current schema
        additionalFiles: Array.isArray(parsedAdditionalFiles)
          ? parsedAdditionalFiles
          : [],
      });
    }
  }, [isOpen, startup]);

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
    const errors: string[] = [];

    if (!formData.founderName.trim())
      errors.push(signupTranslations.founderNameRequiredError[language]);
    if (!formData.phone.trim())
      errors.push(signupTranslations.phoneRequiredError[language]);
    if (!formData.startupName.trim())
      errors.push(signupTranslations.startupNameRequiredError[language]);
    if (!formData.industry.trim())
      errors.push(signupTranslations.industryRequiredError[language]);
    if (!formData.stage.trim())
      errors.push(signupTranslations.startupStageRequiredError[language]);
    if (!formData.problemSolving.trim())
      errors.push(signupTranslations.problemDescriptionRequiredError[language]);
    if (!formData.solutionDescription.trim())
      errors.push(
        signupTranslations.solutionDescriptionRequiredError[language]
      );
    if (!formData.uniqueValueProposition.trim())
      errors.push(
        signupTranslations.uniqueValuePropositionRequiredError[language]
      );
    if (!formData.investmentInstrument.trim())
      errors.push(
        signupTranslations.investmentInstrumentRequiredError[language]
      );
    if (!formData.achievements.trim())
      errors.push(
        signupTranslations.achievementsDescriptionRequiredError[language]
      );
    if (!formData.risksAndMitigation.trim())
      errors.push(signupTranslations.risksAndMitigationRequiredError[language]);
    if (!formData.exitStrategy.trim())
      errors.push(signupTranslations.exitStrategyRequiredError[language]);

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: startupTranslations.validationErrorTitle[language],
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new pitch deck if provided
      let updatedPitchDeck = formData.pitchDeckUrl;
      if (pitchDeckFile) {
        setIsUploadingFile(true);

        // Delete old pitch deck if it exists and is from our storage
        if (
          formData.pitchDeckUrl &&
          (formData.pitchDeckUrl.includes("supabase") ||
            formData.pitchDeckUrl.includes("pitchdecks"))
        ) {
          const oldFilePath = extractFilePathFromUrl(formData.pitchDeckUrl);
          if (oldFilePath) {
            const deleteResult = await deletePitchDeck(oldFilePath);
            if (!deleteResult.success) {
              console.warn(
                "Failed to delete old pitch deck:",
                deleteResult.error
              );
              // Continue anyway - don't block the upload
            }
          }
        }

        // Upload new pitch deck
        const uploadResult = await uploadPitchDeck(pitchDeckFile, startup.id);
        setIsUploadingFile(false);

        if (!uploadResult.success) {
          toast({
            title: startupTranslations.uploadErrorTitle[language],
            description:
              uploadResult.error ||
              startupTranslations.uploadErrorDescription[language],
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        updatedPitchDeck = uploadResult.url;
      }

      const updateData = {
        founder_info: formData.founderName,
        phone: formData.phone,
        startup_name: formData.startupName,
        name: formData.startupName, // Update both fields
        website: formData.website,
        industry: formData.industry,
        stage: formData.stage as "Idea" | "MVP" | "Scaling",
        logo: formData.logoUrl,
        social_media_accounts: JSON.stringify(formData.socialMediaAccounts),
        problem_solving: formData.problemSolving,
        solution: formData.solutionDescription,
        uniqueness: formData.uniqueValueProposition,
        current_financial_year_revenue: formData.currentRevenue,
        previous_financial_year_revenue: formData.previousRevenue,
        has_received_funding: formData.hasReceivedFunding,
        monthly_burn_rate: formData.monthlyBurnRate,
        investment_instrument: formData.investmentInstrument as
          | "Equity"
          | "Convertible note"
          | "SAFE"
          | "Loan"
          | "Other"
          | "Undecided"
          | "Not interested in funding",
        capital_seeking: formData.capitalSeeking,
        pre_money_valuation: formData.preMoneyValuation,
        funding_already_raised: formData.fundingAlreadyRaised,
        pitch_deck: updatedPitchDeck,
        co_founders: JSON.stringify(formData.coFounders),
        calendly_link: formData.calendlyLink,
        video_link: formData.videoLink,
        additional_video_url: formData.additionalVideoUrl,
        team_size: formData.teamSize,
        achievements: formData.achievements,
        risk_mitigation: formData.risksAndMitigation,
        risks: formData.risksAndMitigation, // Update both fields
        exit_strategy: formData.exitStrategy as
          | "Competitor buyout"
          | "Company buyout"
          | "Shareholder/employee buyout"
          | "IPO/RPO",
        participated_in_accelerator: formData.participatedAccelerator,
        additional_files: JSON.stringify(formData.additionalFiles),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("startups")
        .update(updateData)
        .eq("id", startup.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onUpdate(data);
        toast({
          title: startupTranslations.profileUpdatedTitle[language],
          description:
            startupTranslations.startupProfileUpdatedDescription[language],
        });
        onClose();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: startupTranslations.updateFailedTitle[language],
        description:
          startupTranslations.startupUpdateFailedDescription[language],
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {startupTranslations.editStartupProfileTitle[language]}
          </DialogTitle>
          <DialogDescription>
            {startupTranslations.editStartupProfileDescription[language]}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                {signupTranslations.basicInformation[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="founderName">
                  {signupTranslations.founderNameLabel[language]}
                </Label>
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
                <Label htmlFor="phone">
                  {signupTranslations.phoneLabel[language]}
                </Label>
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
                <Label htmlFor="startupName">
                  {signupTranslations.startupNameLabel[language]}
                </Label>
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
                <Label htmlFor="website">
                  {signupTranslations.websiteLabel[language]}
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder="https://yourstartu.com"
                />
              </div>
              <div>
                <Label htmlFor="industry">
                  {signupTranslations.industryLabel[language]}
                </Label>
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
                <Label htmlFor="stage">
                  {signupTranslations.startupStageLabel[language]}
                </Label>
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
                <Label htmlFor="logoUrl">
                  {signupTranslations.logoUrlLabel[language]}
                </Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      logoUrl: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="teamSize">
                  {signupTranslations.teamSizeLabel[language]}
                </Label>
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
              <CardTitle>
                {signupTranslations.socialMediaAccounts[language]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Label>
                  {signupTranslations.socialMediaProfilesLabel[language]}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSocialMedia}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {signupTranslations.addSocialMediaButton[language]}
                </Button>
              </div>
              {formData.socialMediaAccounts.map((social, index) => (
                <div key={index} className="flex gap-4 items-center mb-3">
                  <Input
                    placeholder={
                      signupTranslations.socialMediaProfilePlaceholder[language]
                    }
                    value={social.platform}
                    onChange={(e) =>
                      updateSocialMedia(index, "platform", e.target.value)
                    }
                  />
                  <Input
                    placeholder={
                      signupTranslations.profileUrlPlaceholder[language]
                    }
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
              <CardTitle>
                {signupTranslations.businessDescription[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="problemSolving">
                  {signupTranslations.problemSolvingLabel[language]}
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
                  {signupTranslations.solutionDescriptionLabel[language]}
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
                  {signupTranslations.uniqueValuePropositionLabel[language]}
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
              <CardTitle>
                {signupTranslations.financialInformation[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="currentRevenue">
                  {signupTranslations.currentRevenueLabel[language]}
                </Label>
                <Input
                  id="currentRevenue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.currentRevenue}
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
                <Label htmlFor="previousRevenue">
                  Previous Financial Year Revenue ($)
                </Label>
                <Input
                  id="previousRevenue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.previousRevenue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      previousRevenue: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="monthlyBurnRate">
                  {signupTranslations.monthlyBurnRateLabel[language]}
                </Label>
                <Input
                  id="monthlyBurnRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyBurnRate}
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
                <Label htmlFor="capitalSeeking">
                  {signupTranslations.capitalSeekingLabel[language]}
                </Label>
                <Input
                  id="capitalSeeking"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.capitalSeeking}
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
                <Label htmlFor="preMoneyValuation">
                  {signupTranslations.preMoneyValuationLabel[language]}
                </Label>
                <Input
                  id="preMoneyValuation"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.preMoneyValuation}
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
                  {signupTranslations.fundingAlreadyRaisedLabel[language]}
                </Label>
                <Input
                  id="fundingAlreadyRaised"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.fundingAlreadyRaised}
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
                  {signupTranslations.investmentInstrumentLabel[language]}
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
              <CardTitle>
                {signupTranslations.fundingStatus[language]}
              </CardTitle>
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
                  {signupTranslations.hasReceivedFundingLabel[language]}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Co-Founders */}
          <Card>
            <CardHeader>
              <CardTitle>{signupTranslations.coFounders[language]}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Label>{signupTranslations.addCoFoundersLabel[language]}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCoFounder}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {signupTranslations.addCoFounderButton[language]}
                </Button>
              </div>
              {formData.coFounders.map((coFounder, index) => (
                <div key={index} className="border p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      placeholder={
                        signupTranslations.coFounderNamePlaceholder[language]
                      }
                      value={coFounder.name}
                      onChange={(e) =>
                        updateCoFounder(index, "name", e.target.value)
                      }
                    />
                    <Input
                      placeholder={
                        signupTranslations.roleTitlePlaceholder[language]
                      }
                      value={coFounder.role}
                      onChange={(e) =>
                        updateCoFounder(index, "role", e.target.value)
                      }
                    />
                    <Input
                      placeholder={
                        signupTranslations.emailPlaceholder[language]
                      }
                      type="email"
                      value={coFounder.email}
                      onChange={(e) =>
                        updateCoFounder(index, "email", e.target.value)
                      }
                    />
                    <Input
                      placeholder={
                        signupTranslations.linkedinProfileOptionalPlaceholder[
                          language
                        ]
                      }
                      value={coFounder.linkedinProfile}
                      onChange={(e) =>
                        updateCoFounder(
                          index,
                          "linkedinProfile",
                          e.target.value
                        )
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
                    {signupTranslations.removeCoFounderButton[language]}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Resources & Links */}
          <Card>
            <CardHeader>
              <CardTitle>
                {signupTranslations.resourcesAndLinks[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="pitchDeckFile">
                  {signupTranslations.pitchDeckLabel[language]}
                </Label>
                <div className="space-y-2">
                  <div className="flex flex-col space-y-1">
                    <Input
                      id="pitchDeckFile"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setPitchDeckFile(file || null);
                      }}
                      className="w-full h-auto min-h-[40px] py-1 file:mr-2 file:py-1 file:px-2 sm:file:py-1.5 sm:file:px-3 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer file:transition-colors"
                    />
                  </div>
                  {pitchDeckFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-4 w-4" />
                      <span>{pitchDeckFile.name}</span>
                      <span>
                        ({(pitchDeckFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  )}
                  {formData.pitchDeckUrl && !pitchDeckFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{startupTranslations.currentPrefix[language]}</span>
                      <a
                        href={formData.pitchDeckUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {startupTranslations.viewCurrentPitchDeck[language]}
                      </a>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {startupTranslations.pitchDeckUploadHelp[language]}
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="calendlyLink">
                  {signupTranslations.calendlyLinkLabel[language]}
                </Label>
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
                <Label htmlFor="videoLink">
                  {signupTranslations.videoLinkLabel[language]}
                </Label>
                <Input
                  id="videoLink"
                  value={formData.videoLink}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      videoLink: e.target.value,
                    }))
                  }
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <Label htmlFor="additionalVideoUrl">
                  {signupTranslations.additionalVideoLinkLabel[language]}
                </Label>
                <Input
                  id="additionalVideoUrl"
                  value={formData.additionalVideoUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalVideoUrl: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/additional-video"
                />
              </div>
            </CardContent>
          </Card>

          {/* Strategic Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                {signupTranslations.strategicInformation[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="achievements">
                  {signupTranslations.achievementsLabel[language]}
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
                  {signupTranslations.risksAndMitigationLabel[language]}
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
                <Label htmlFor="exitStrategy">
                  {signupTranslations.exitStrategyLabel[language]}
                </Label>
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
              <CardTitle>
                {signupTranslations.acceleratorExperience[language]}
              </CardTitle>
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
                  {signupTranslations.participatedAcceleratorLabel[language]}
                </Label>
              </div>
              {formData.participatedAccelerator && (
                <div>
                  <Label htmlFor="acceleratorDetails">
                    {signupTranslations.acceleratorDetailsLabel[language]}
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

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {startupTranslations.cancelButton[language]}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {isUploadingFile
                    ? startupTranslations.uploadingPitchDeckButton[language]
                    : startupTranslations.updatingButton[language]}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {startupTranslations.updateProfileButton[language]}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StartupProfileEditModal;
