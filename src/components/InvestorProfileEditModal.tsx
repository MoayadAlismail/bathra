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
import { Loader, Plus, X, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase, Investor } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { signupTranslations } from "@/utils/language/signup";
import { investorTranslations } from "@/utils/language/investor";

interface InvestorProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  investor: Investor;
  onUpdate: (updatedInvestor: Investor) => void;
}

interface InvestorFormData {
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
  numberOfInvestments: number;
  hasSecuredLeadInvestor: boolean;
  hasBeenStartupAdvisor: boolean;
  whyStrongCandidate: string;
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

const SOCIAL_PLATFORMS = [
  "Twitter",
  "LinkedIn",
  "AngelList",
  "Instagram",
  "Facebook",
  "Other",
];

const InvestorProfileEditModal = ({
  isOpen,
  onClose,
  investor,
  onUpdate,
}: InvestorProfileEditModalProps) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<InvestorFormData>({
    name: "",
    phone: "",
    birthday: "",
    company: "",
    role: "",
    country: "",
    city: "",
    preferredIndustries: [],
    preferredStage: "",
    averageTicketSize: "",
    linkedinProfile: "",
    otherSocialMedia: [],
    calendlyLink: "",
    howDidYouHear: "",
    numberOfInvestments: 0,
    hasSecuredLeadInvestor: false,
    hasBeenStartupAdvisor: false,
    whyStrongCandidate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && investor) {
      // Parse other social media from JSON string
      let parsedSocialMedia = [];
      try {
        parsedSocialMedia = investor.other_social_media_profile
          ? JSON.parse(investor.other_social_media_profile)
          : [];
      } catch (error) {
        console.error("Error parsing social media:", error);
        parsedSocialMedia = [];
      }

      setFormData({
        name: investor.name || "",
        phone: investor.phone || "",
        birthday: investor.birthday || "",
        company: investor.company || "",
        role: investor.role || "",
        country: investor.country || "",
        city: investor.city || "",
        preferredIndustries: investor.preferred_industries
          ? investor.preferred_industries.split(",").map((s) => s.trim())
          : [],
        preferredStage: investor.preferred_company_stage || "",
        averageTicketSize: investor.average_ticket_size || "",
        linkedinProfile: investor.linkedin_profile || "",
        otherSocialMedia: Array.isArray(parsedSocialMedia)
          ? parsedSocialMedia
          : [],
        calendlyLink: investor.calendly_link || "",
        howDidYouHear: investor.heard_about_us || "",
        numberOfInvestments: investor.number_of_investments || 0,
        hasSecuredLeadInvestor: investor.secured_lead_investor || false,
        hasBeenStartupAdvisor: investor.participated_as_advisor || false,
        whyStrongCandidate: investor.strong_candidate_reason || "",
      });
    }
  }, [isOpen, investor]);

  const handleIndustryToggle = (industry: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredIndustries: prev.preferredIndustries.includes(industry)
        ? prev.preferredIndustries.filter((i) => i !== industry)
        : [...prev.preferredIndustries, industry],
    }));
  };

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

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.name.trim())
      errors.push(signupTranslations.nameRequiredError[language]);
    if (!formData.phone.trim())
      errors.push(signupTranslations.phoneRequiredError[language]);
    if (!formData.birthday)
      errors.push(signupTranslations.birthdayRequiredError[language]);
    if (!formData.role.trim())
      errors.push(signupTranslations.roleRequiredError[language]);
    if (!formData.country.trim())
      errors.push(signupTranslations.countryRequiredError[language]);
    if (!formData.city.trim())
      errors.push(signupTranslations.cityRequiredError[language]);
    if (formData.preferredIndustries.length === 0)
      errors.push(
        signupTranslations.preferredIndustriesRequiredError[language]
      );
    if (!formData.preferredStage)
      errors.push(
        signupTranslations.preferredCompanyStageRequiredError[language]
      );
    if (!formData.averageTicketSize)
      errors.push(signupTranslations.averageTicketSizeRequiredError[language]);
    if (!formData.linkedinProfile.trim())
      errors.push(signupTranslations.linkedinProfileRequiredError[language]);
    if (!formData.howDidYouHear.trim())
      errors.push(signupTranslations.howDidYouHearRequiredError[language]);
    if (!formData.whyStrongCandidate.trim())
      errors.push(signupTranslations.whyStrongCandidateRequiredError[language]);

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: investorTranslations.validationErrorTitle[language],
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        birthday: formData.birthday,
        company: formData.company,
        role: formData.role,
        country: formData.country,
        city: formData.city,
        preferred_industries: formData.preferredIndustries.join(", "),
        preferred_company_stage: formData.preferredStage,
        average_ticket_size: formData.averageTicketSize,
        linkedin_profile: formData.linkedinProfile,
        other_social_media_profile: JSON.stringify(formData.otherSocialMedia),
        calendly_link: formData.calendlyLink,
        heard_about_us: formData.howDidYouHear,
        number_of_investments: formData.numberOfInvestments,
        secured_lead_investor: formData.hasSecuredLeadInvestor,
        participated_as_advisor: formData.hasBeenStartupAdvisor,
        strong_candidate_reason: formData.whyStrongCandidate,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("investors")
        .update(updateData)
        .eq("id", investor.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onUpdate(data);
        toast({
          title: investorTranslations.profileUpdatedTitle[language],
          description: investorTranslations.profileUpdatedDescription[language],
        });
        onClose();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: investorTranslations.updateFailedTitle[language],
        description: investorTranslations.updateFailedDescription[language],
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
            {investorTranslations.editProfileTitle[language]}
          </DialogTitle>
          <DialogDescription>
            {investorTranslations.editProfileDescription[language]}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                {signupTranslations.personalInformation[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    {signupTranslations.fullNameLabel[language]}
                  </Label>
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
                  <Label htmlFor="phone">
                    {signupTranslations.phoneLabel[language]}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="birthday">
                    {signupTranslations.birthdayLabel[language]}
                  </Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        birthday: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company">
                    {signupTranslations.companyOptionalLabel[language]}
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    placeholder="ABC Capital"
                  />
                </div>
                <div>
                  <Label htmlFor="role">
                    {signupTranslations.roleLabel[language]}
                  </Label>
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
                  <Label htmlFor="country">
                    {signupTranslations.countryLabel[language]}
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    placeholder="United States"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">
                    {signupTranslations.cityLabel[language]}
                  </Label>
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
              </div>
            </CardContent>
          </Card>

          {/* Investment Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>
                {signupTranslations.investmentPreferences[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>
                  {signupTranslations.preferredIndustriesLabel[language]}
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {INDUSTRIES.map((industry) => (
                    <Badge
                      key={industry}
                      variant={
                        formData.preferredIndustries.includes(industry)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => handleIndustryToggle(industry)}
                    >
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredStage">
                    {signupTranslations.preferredCompanyStageLabel[language]}
                  </Label>
                  <Select
                    value={formData.preferredStage}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        preferredStage: value,
                      }))
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
                  <Label htmlFor="averageTicketSize">
                    {signupTranslations.averageTicketSizeLabel[language]}
                  </Label>
                  <Select
                    value={formData.averageTicketSize}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        averageTicketSize: value,
                      }))
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
              <CardTitle>
                {signupTranslations.socialProfiles[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="linkedinProfile">
                  {signupTranslations.linkedinProfileLabel[language]}
                </Label>
                <Input
                  id="linkedinProfile"
                  type="url"
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
                <Label htmlFor="calendlyLink">
                  {signupTranslations.calendlyLinkLabel[language]}
                </Label>
                <Input
                  id="calendlyLink"
                  type="url"
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
                <div className="flex justify-between items-center mb-2">
                  <Label>
                    {signupTranslations.otherSocialMediaProfilesLabel[language]}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSocialMedia}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {investorTranslations.addProfileButton[language]}
                  </Button>
                </div>
                {formData.otherSocialMedia.map((social, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Select
                      value={social.platform}
                      onValueChange={(value) =>
                        updateSocialMedia(index, "platform", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={
                        signupTranslations.profileUrlPlaceholder[language]
                      }
                      value={social.url}
                      onChange={(e) =>
                        updateSocialMedia(index, "url", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSocialMedia(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Background Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                {investorTranslations.backgroundInformation[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="howDidYouHear">
                  {signupTranslations.howDidYouHearLabel[language]}
                </Label>
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
                  {signupTranslations.numberOfInvestmentsLabel[language]}
                </Label>
                <Input
                  id="numberOfInvestments"
                  type="number"
                  min="0"
                  value={formData.numberOfInvestments}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      numberOfInvestments: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasSecuredLeadInvestor"
                    checked={formData.hasSecuredLeadInvestor}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasSecuredLeadInvestor: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="hasSecuredLeadInvestor">
                    {signupTranslations.hasSecuredLeadInvestorLabel[language]}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasBeenStartupAdvisor"
                    checked={formData.hasBeenStartupAdvisor}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasBeenStartupAdvisor: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="hasBeenStartupAdvisor">
                    {signupTranslations.hasBeenStartupAdvisorLabel[language]}
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="whyStrongCandidate">
                  {signupTranslations.whyStrongCandidateLabel[language]}
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
                  placeholder="Describe your investment experience, network, and what value you bring to startups..."
                  rows={4}
                  required
                />
              </div>
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
              {investorTranslations.cancelButton[language]}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {investorTranslations.updatingButton[language]}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {investorTranslations.updateProfileButton[language]}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestorProfileEditModal;
