import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { AdminInvestorInfo } from "@/lib/investor-types";
import { Plus, X } from "lucide-react";

interface AdminInvestorEditModalProps {
  investor: AdminInvestorInfo;
  isOpen: boolean;
  onClose: () => void;
  onInvestorUpdated: () => void;
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

const INVESTMENT_STAGES = [
  "Pre-seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
  "Growth",
  "Late Stage",
  "All Stages",
];

const TICKET_SIZES = [
  "< $10K",
  "$10K - $50K",
  "$50K - $100K",
  "$100K - $250K",
  "$250K - $500K",
  "$500K - $1M",
  "$1M - $5M",
  "> $5M",
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

const AdminInvestorEditModal: React.FC<AdminInvestorEditModalProps> = ({
  investor,
  isOpen,
  onClose,
  onInvestorUpdated,
}) => {
  const [formData, setFormData] = useState({
    // Personal info (matching signup form)
    name: "",
    email: "",
    phone: "",
    birthday: "",
    company: "",
    role: "",
    country: "",
    city: "",

    // Investment preferences
    preferred_industries: [] as string[],
    preferred_company_stage: "",
    average_ticket_size: "",

    // Social profiles
    linkedin_profile: "",
    other_social_media_profile: [] as { platform: string; url: string }[],

    // Background
    heard_about_us: "",
    number_of_investments: 0,
    secured_lead_investor: false,
    participated_as_advisor: false,
    strong_candidate_reason: "",

    // Status
    verified: false,
    status: "pending",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && investor) {
      fetchFullInvestorData();
    }
  }, [isOpen, investor]);

  const fetchFullInvestorData = async () => {
    try {
      const { data, error } = await supabase
        .from("investors")
        .select("*")
        .eq("id", investor.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load investor details",
          variant: "destructive",
        });
        return;
      }

      setFormData({
        // Personal info
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        birthday: data.birthday || "",
        company: data.company || "",
        role: data.role || "",
        country: data.country || "",
        city: data.city || "",

        // Investment preferences
        preferred_industries: data.preferred_industries
          ? data.preferred_industries.split(",").map((s) => s.trim())
          : [],
        preferred_company_stage: data.preferred_company_stage || "",
        average_ticket_size: data.average_ticket_size || "",

        // Social profiles
        linkedin_profile: data.linkedin_profile || "",
        other_social_media_profile: data.other_social_media_profile
          ? typeof data.other_social_media_profile === "string"
            ? JSON.parse(data.other_social_media_profile)
            : data.other_social_media_profile
          : [],

        // Background
        heard_about_us: data.heard_about_us || "",
        number_of_investments: data.number_of_investments || 0,
        secured_lead_investor: data.secured_lead_investor || false,
        participated_as_advisor: data.participated_as_advisor || false,
        strong_candidate_reason: data.strong_candidate_reason || "",

        // Status
        verified: data.verified || false,
        status: data.status || "pending",
      });
    } catch (error) {
      console.error("Error fetching investor data:", error);
      toast({
        title: "Error",
        description: "Failed to load investor details",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = <T extends keyof typeof formData>(
    field: T,
    value: (typeof formData)[T]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSocialMedia = () => {
    setFormData((prev) => ({
      ...prev,
      other_social_media_profile: [
        ...prev.other_social_media_profile,
        { platform: "", url: "" },
      ],
    }));
  };

  const removeSocialMedia = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      other_social_media_profile: prev.other_social_media_profile.filter(
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
      other_social_media_profile: prev.other_social_media_profile.map(
        (item, i) => (i === index ? { ...item, [field]: value } : item)
      ),
    }));
  };

  const toggleIndustry = (industry: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_industries: prev.preferred_industries.includes(industry)
        ? prev.preferred_industries.filter((i) => i !== industry)
        : [...prev.preferred_industries, industry],
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const updateData = {
        // Personal info
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birthday: formData.birthday,
        company: formData.company,
        role: formData.role,
        country: formData.country,
        city: formData.city,

        // Investment preferences
        preferred_industries: JSON.stringify(formData.preferred_industries),
        preferred_company_stage: formData.preferred_company_stage,
        average_ticket_size: formData.average_ticket_size,

        // Social profiles
        linkedin_profile: formData.linkedin_profile,
        other_social_media_profile: JSON.stringify(
          formData.other_social_media_profile
        ),

        // Background
        heard_about_us: formData.heard_about_us,
        number_of_investments: formData.number_of_investments,
        secured_lead_investor: formData.secured_lead_investor,
        participated_as_advisor: formData.participated_as_advisor,
        strong_candidate_reason: formData.strong_candidate_reason,

        // Status
        verified: formData.verified,
        status: formData.status,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("investors")
        .update(updateData)
        .eq("id", investor.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Investor information updated successfully",
      });

      onInvestorUpdated();
    } catch (error) {
      console.error("Error updating investor:", error);
      toast({
        title: "Error",
        description: "Failed to update investor information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Investor: {investor.name}
          </DialogTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={formData.verified ? "default" : "secondary"}>
              {formData.verified ? "Verified" : "Unverified"}
            </Badge>
            <Badge variant="outline">{formData.status}</Badge>
          </div>
        </DialogHeader>

        <div className="flex-grow overflow-auto">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Personal Info</span>
                <span className="sm:hidden">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Investment Preferences</span>
                <span className="sm:hidden">Investment</span>
              </TabsTrigger>
              <TabsTrigger value="background" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Background</span>
                <span className="sm:hidden">Background</span>
              </TabsTrigger>
              <TabsTrigger value="status" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Status</span>
                <span className="sm:hidden">Status</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) =>
                      handleInputChange("birthday", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="linkedin_profile">LinkedIn Profile</Label>
                <Input
                  id="linkedin_profile"
                  value={formData.linkedin_profile}
                  onChange={(e) =>
                    handleInputChange("linkedin_profile", e.target.value)
                  }
                />
              </div>

              {/* Other Social Media */}
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
                {formData.other_social_media_profile.map((social, index) => (
                  <div key={index} className="flex gap-4 items-center mb-3">
                    <Input
                      placeholder="Platform"
                      value={social.platform}
                      onChange={(e) =>
                        updateSocialMedia(index, "platform", e.target.value)
                      }
                    />
                    <Input
                      placeholder="URL"
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
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 mt-4">
              <div>
                <Label>Preferred Industries (Select multiple)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {INDUSTRIES.map((industry) => (
                    <div key={industry} className="flex items-center space-x-2">
                      <Checkbox
                        id={`industry-${industry}`}
                        checked={formData.preferred_industries.includes(
                          industry
                        )}
                        onCheckedChange={() => toggleIndustry(industry)}
                      />
                      <Label
                        htmlFor={`industry-${industry}`}
                        className="text-sm"
                      >
                        {industry}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferred_company_stage">
                    Preferred Company Stage
                  </Label>
                  <Select
                    value={formData.preferred_company_stage}
                    onValueChange={(value) =>
                      handleInputChange("preferred_company_stage", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {INVESTMENT_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="average_ticket_size">
                    Average Ticket Size
                  </Label>
                  <Select
                    value={formData.average_ticket_size}
                    onValueChange={(value) =>
                      handleInputChange("average_ticket_size", value)
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
            </TabsContent>

            <TabsContent value="background" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="heard_about_us">
                  How did you hear about us?
                </Label>
                <Select
                  value={formData.heard_about_us}
                  onValueChange={(value) =>
                    handleInputChange("heard_about_us", value)
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
                <Label htmlFor="number_of_investments">
                  Number of Investments Made
                </Label>
                <Input
                  id="number_of_investments"
                  type="number"
                  min="0"
                  value={formData.number_of_investments}
                  onChange={(e) =>
                    handleInputChange(
                      "number_of_investments",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="secured_lead_investor"
                    checked={formData.secured_lead_investor}
                    onCheckedChange={(checked) =>
                      handleInputChange("secured_lead_investor", !!checked)
                    }
                  />
                  <Label htmlFor="secured_lead_investor">
                    Has secured lead investor before
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="participated_as_advisor"
                    checked={formData.participated_as_advisor}
                    onCheckedChange={(checked) =>
                      handleInputChange("participated_as_advisor", !!checked)
                    }
                  />
                  <Label htmlFor="participated_as_advisor">
                    Has been startup advisor before
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="strong_candidate_reason">
                  Why Strong Candidate
                </Label>
                <Textarea
                  id="strong_candidate_reason"
                  value={formData.strong_candidate_reason}
                  onChange={(e) =>
                    handleInputChange("strong_candidate_reason", e.target.value)
                  }
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4 mt-4">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="verified"
                    checked={formData.verified}
                    onCheckedChange={(checked) =>
                      handleInputChange("verified", checked)
                    }
                  />
                  <Label htmlFor="verified">Verified</Label>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminInvestorEditModal;
