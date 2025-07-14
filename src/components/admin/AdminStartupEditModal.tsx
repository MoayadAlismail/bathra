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
import { AdminStartupInfo } from "@/lib/startup-types";
import { Plus, X, Upload } from "lucide-react";
import {
  uploadPitchDeck,
  extractFilePathFromUrl,
  deletePitchDeck,
} from "@/lib/storage-service";

interface AdminStartupEditModalProps {
  startup: AdminStartupInfo;
  isOpen: boolean;
  onClose: () => void;
  onStartupUpdated: () => void;
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

const AdminStartupEditModal: React.FC<AdminStartupEditModalProps> = ({
  startup,
  isOpen,
  onClose,
  onStartupUpdated,
}) => {
  const [formData, setFormData] = useState({
    // Basic info (matching signup form)
    name: "",
    startup_name: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    stage: "",
    logo: "",

    // Social media accounts
    social_media_accounts: [] as { platform: string; url: string }[],

    // Business description
    problem_solving: "",
    solution: "",
    uniqueness: "",

    // Financial info
    previous_financial_year_revenue: 0,
    has_received_funding: false,
    monthly_burn_rate: 0,
    investment_instrument: "",
    capital_seeking: 0,
    pre_money_valuation: 0,
    funding_already_raised: 0,

    // Team and resources
    founder_info: "",
    co_founders: [] as {
      name: string;
      role: string;
      email: string;
      linkedinProfile?: string;
    }[],
    team_size: 1,
    pitch_deck: "",
    calendly_link: "",
    video_link: "",

    // Strategic info
    achievements: "",
    risks: "",
    risk_mitigation: "",
    exit_strategy: "",
    participated_in_accelerator: false,
    additional_files: [] as string[],

    // Status
    verified: false,
    status: "pending",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  useEffect(() => {
    if (isOpen && startup) {
      fetchFullStartupData();
    }
  }, [isOpen, startup]);

  const fetchFullStartupData = async () => {
    try {
      const { data, error } = await supabase
        .from("startups")
        .select("*")
        .eq("id", startup.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load startup details",
          variant: "destructive",
        });
        return;
      }

      setFormData({
        // Basic info
        name: data.name || "",
        startup_name: data.startup_name || "",
        email: data.email || "",
        phone: data.phone || "",
        website: data.website || "",
        industry: data.industry || "",
        stage: data.stage || "",
        logo: data.logo || "",

        // Social media accounts
        social_media_accounts: data.social_media_accounts
          ? typeof data.social_media_accounts === "string"
            ? JSON.parse(data.social_media_accounts)
            : data.social_media_accounts
          : [],

        // Business description
        problem_solving: data.problem_solving || "",
        solution: data.solution || "",
        uniqueness: data.uniqueness || "",

        // Financial info
        previous_financial_year_revenue:
          data.previous_financial_year_revenue || 0,
        has_received_funding: data.has_received_funding || false,
        monthly_burn_rate: data.monthly_burn_rate || 0,
        investment_instrument: data.investment_instrument || "",
        capital_seeking: data.capital_seeking || 0,
        pre_money_valuation: data.pre_money_valuation || 0,
        funding_already_raised: data.funding_already_raised || 0,

        // Team and resources
        founder_info: data.founder_info || "",
        co_founders: data.co_founders
          ? typeof data.co_founders === "string"
            ? JSON.parse(data.co_founders)
            : data.co_founders
          : [],
        team_size: data.team_size || 1,
        pitch_deck: data.pitch_deck || "",
        calendly_link: data.calendly_link || "",
        video_link: data.video_link || "",

        // Strategic info
        achievements: data.achievements || "",
        risks: data.risks || "",
        risk_mitigation: data.risk_mitigation || "",
        exit_strategy: data.exit_strategy || "",
        participated_in_accelerator: data.participated_in_accelerator || false,
        additional_files: data.additional_files
          ? typeof data.additional_files === "string"
            ? JSON.parse(data.additional_files)
            : data.additional_files
          : [],

        // Status
        verified: data.verified || false,
        status: data.status || "pending",
      });
    } catch (error) {
      console.error("Error fetching startup data:", error);
      toast({
        title: "Error",
        description: "Failed to load startup details",
        variant: "destructive",
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSocialMedia = () => {
    setFormData((prev) => ({
      ...prev,
      social_media_accounts: [
        ...prev.social_media_accounts,
        { platform: "", url: "" },
      ],
    }));
  };

  const removeSocialMedia = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      social_media_accounts: prev.social_media_accounts.filter(
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
      social_media_accounts: prev.social_media_accounts.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addCoFounder = () => {
    setFormData((prev) => ({
      ...prev,
      co_founders: [
        ...prev.co_founders,
        { name: "", role: "", email: "", linkedinProfile: "" },
      ],
    }));
  };

  const removeCoFounder = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      co_founders: prev.co_founders.filter((_, i) => i !== index),
    }));
  };

  const updateCoFounder = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      co_founders: prev.co_founders.map((coFounder, i) =>
        i === index ? { ...coFounder, [field]: value } : coFounder
      ),
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Upload new pitch deck if provided
      let updatedPitchDeck = formData.pitch_deck;
      if (pitchDeckFile) {
        setIsUploadingFile(true);

        // Delete old pitch deck if it exists and is from our storage
        if (
          formData.pitch_deck &&
          (formData.pitch_deck.includes("supabase") ||
            formData.pitch_deck.includes("pitchdecks"))
        ) {
          const oldFilePath = extractFilePathFromUrl(formData.pitch_deck);
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
            title: "Upload Error",
            description: uploadResult.error || "Failed to upload pitch deck",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        updatedPitchDeck = uploadResult.url;
      }

      const updateData = {
        // Basic info
        name: formData.name,
        startup_name: formData.startup_name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        industry: formData.industry,
        stage: formData.stage,
        logo: formData.logo,

        // Social media accounts
        social_media_accounts: JSON.stringify(formData.social_media_accounts),

        // Business description
        problem_solving: formData.problem_solving,
        solution: formData.solution,
        uniqueness: formData.uniqueness,

        // Financial info
        previous_financial_year_revenue:
          formData.previous_financial_year_revenue,
        has_received_funding: formData.has_received_funding,
        monthly_burn_rate: formData.monthly_burn_rate,
        investment_instrument: formData.investment_instrument,
        capital_seeking: formData.capital_seeking,
        pre_money_valuation: formData.pre_money_valuation,
        funding_already_raised: formData.funding_already_raised,

        // Team and resources
        founder_info: formData.founder_info,
        co_founders: JSON.stringify(formData.co_founders),
        team_size: formData.team_size,
        pitch_deck: updatedPitchDeck,
        calendly_link: formData.calendly_link,
        video_link: formData.video_link,

        // Strategic info
        achievements: formData.achievements,
        risks: formData.risks,
        risk_mitigation: formData.risk_mitigation,
        exit_strategy: formData.exit_strategy,
        participated_in_accelerator: formData.participated_in_accelerator,
        additional_files: JSON.stringify(formData.additional_files),

        // Status
        verified: formData.verified,
        status: formData.status,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("startups")
        .update(updateData)
        .eq("id", startup.id);

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
        description: "Startup information updated successfully",
      });

      onStartupUpdated();
    } catch (error) {
      console.error("Error updating startup:", error);
      toast({
        title: "Error",
        description: "Failed to update startup information",
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
            Edit Startup: {startup.name}
          </DialogTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={formData.verified ? "default" : "secondary"}>
              {formData.verified ? "Verified" : "Unverified"}
            </Badge>
            <Badge variant="outline">{formData.status}</Badge>
          </div>
        </DialogHeader>

        <div className="flex-grow overflow-auto">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Founder Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="startup_name">Startup Name</Label>
                  <Input
                    id="startup_name"
                    value={formData.startup_name}
                    onChange={(e) =>
                      handleInputChange("startup_name", e.target.value)
                    }
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
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) =>
                      handleInputChange("industry", value)
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
                  <Label htmlFor="stage">Stage</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value) => handleInputChange("stage", value)}
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
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => handleInputChange("logo", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="team_size">Team Size</Label>
                  <Input
                    id="team_size"
                    type="number"
                    min="1"
                    value={formData.team_size}
                    onChange={(e) =>
                      handleInputChange(
                        "team_size",
                        parseInt(e.target.value) || 1
                      )
                    }
                  />
                </div>
              </div>

              {/* Social Media Accounts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Social Media Accounts</Label>
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
                {formData.social_media_accounts.map((social, index) => (
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

            <TabsContent value="business" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="problem_solving">
                  What problem are you solving?
                </Label>
                <Textarea
                  id="problem_solving"
                  value={formData.problem_solving}
                  onChange={(e) =>
                    handleInputChange("problem_solving", e.target.value)
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="solution">What solution do you provide?</Label>
                <Textarea
                  id="solution"
                  value={formData.solution}
                  onChange={(e) =>
                    handleInputChange("solution", e.target.value)
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="uniqueness">
                  What makes your startup unique?
                </Label>
                <Textarea
                  id="uniqueness"
                  value={formData.uniqueness}
                  onChange={(e) =>
                    handleInputChange("uniqueness", e.target.value)
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="achievements">Achievements</Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) =>
                    handleInputChange("achievements", e.target.value)
                  }
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="risks">Risks</Label>
                <Textarea
                  id="risks"
                  value={formData.risks}
                  onChange={(e) => handleInputChange("risks", e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="risk_mitigation">Risk Mitigation</Label>
                <Textarea
                  id="risk_mitigation"
                  value={formData.risk_mitigation}
                  onChange={(e) =>
                    handleInputChange("risk_mitigation", e.target.value)
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="exit_strategy">Exit Strategy</Label>
                <Select
                  value={formData.exit_strategy}
                  onValueChange={(value) =>
                    handleInputChange("exit_strategy", value)
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="participated_in_accelerator"
                  checked={formData.participated_in_accelerator}
                  onCheckedChange={(checked) =>
                    handleInputChange("participated_in_accelerator", !!checked)
                  }
                />
                <Label htmlFor="participated_in_accelerator">
                  Participated in accelerator
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="financials" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="previous_financial_year_revenue">
                    Previous Financial Year Revenue ($)
                  </Label>
                  <Input
                    id="previous_financial_year_revenue"
                    type="number"
                    min="0"
                    value={formData.previous_financial_year_revenue}
                    onChange={(e) =>
                      handleInputChange(
                        "previous_financial_year_revenue",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="monthly_burn_rate">
                    Monthly Burn Rate ($)
                  </Label>
                  <Input
                    id="monthly_burn_rate"
                    type="number"
                    min="0"
                    value={formData.monthly_burn_rate}
                    onChange={(e) =>
                      handleInputChange(
                        "monthly_burn_rate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="capital_seeking">Capital Seeking ($)</Label>
                  <Input
                    id="capital_seeking"
                    type="number"
                    min="0"
                    value={formData.capital_seeking}
                    onChange={(e) =>
                      handleInputChange(
                        "capital_seeking",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pre_money_valuation">
                    Pre-Money Valuation ($)
                  </Label>
                  <Input
                    id="pre_money_valuation"
                    type="number"
                    min="0"
                    value={formData.pre_money_valuation}
                    onChange={(e) =>
                      handleInputChange(
                        "pre_money_valuation",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="funding_already_raised">
                    Funding Already Raised ($)
                  </Label>
                  <Input
                    id="funding_already_raised"
                    type="number"
                    min="0"
                    value={formData.funding_already_raised}
                    onChange={(e) =>
                      handleInputChange(
                        "funding_already_raised",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="investment_instrument">
                    Investment Instrument
                  </Label>
                  <Select
                    value={formData.investment_instrument}
                    onValueChange={(value) =>
                      handleInputChange("investment_instrument", value)
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
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_received_funding"
                  checked={formData.has_received_funding}
                  onCheckedChange={(checked) =>
                    handleInputChange("has_received_funding", !!checked)
                  }
                />
                <Label htmlFor="has_received_funding">
                  Has received funding
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="founder_info">Founder Information</Label>
                <Textarea
                  id="founder_info"
                  value={formData.founder_info}
                  onChange={(e) =>
                    handleInputChange("founder_info", e.target.value)
                  }
                  rows={3}
                />
              </div>

              {/* Co-Founders */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Co-Founders</Label>
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
                {formData.co_founders.map((coFounder, index) => (
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
                        value={coFounder.linkedinProfile || ""}
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
                      Remove Co-Founder
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pitch_deck_file">Pitch Deck (PDF)</Label>
                  <div className="space-y-2">
                    <div className="flex flex-col space-y-1">
                      <Input
                        id="pitch_deck_file"
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
                    {formData.pitch_deck && !pitchDeckFile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Current: </span>
                        <a
                          href={formData.pitch_deck}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View current pitch deck
                        </a>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Upload a new pitch deck as a PDF file (max 10MB) or keep
                      the current one
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="calendly_link">Calendly Link</Label>
                  <Input
                    id="calendly_link"
                    value={formData.calendly_link}
                    onChange={(e) =>
                      handleInputChange("calendly_link", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="video_link">Video Link</Label>
                  <Input
                    id="video_link"
                    value={formData.video_link}
                    onChange={(e) =>
                      handleInputChange("video_link", e.target.value)
                    }
                  />
                </div>
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
            {isLoading
              ? isUploadingFile
                ? "Uploading Pitch Deck..."
                : "Saving..."
              : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminStartupEditModal;
