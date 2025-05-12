import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const startupSchema = z.object({
  name: z.string().min(2, {
    message: "Startup name must be at least 2 characters.",
  }),
  industry: z.string().min(2, {
    message: "Industry must be at least 2 characters.",
  }),
  stage: z.string().min(2, {
    message: "Stage must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }),
  founders: z.string().min(2, {
    message: "Founders must be at least 2 characters.",
  }),
  team_size: z.string().min(1, {
    message: "Team size is required.",
  }),
  founded_date: z.string().min(1, {
    message: "Founded date is required.",
  }),
  target_market: z.string().min(2, {
    message: "Target market must be at least 2 characters.",
  }),
  problem_solved: z.string().min(10, {
    message: "Problem solved must be at least 10 characters.",
  }),
  usp: z.string().min(10, {
    message: "Unique selling proposition must be at least 10 characters.",
  }),
  traction: z.string().min(10, {
    message: "Traction must be at least 10 characters.",
  }),
  key_metrics: z.string().min(10, {
    message: "Key metrics must be at least 10 characters.",
  }),
  previous_funding: z.string().min(2, {
    message: "Previous funding must be at least 2 characters.",
  }),
  funding_required: z.string().min(2, {
    message: "Funding required must be at least 2 characters.",
  }),
  valuation: z.string().min(2, {
    message: "Valuation must be at least 2 characters.",
  }),
  use_of_funds: z.string().min(10, {
    message: "Use of funds must be at least 10 characters.",
  }),
  roadmap: z.string().min(10, {
    message: "Roadmap must be at least 10 characters.",
  }),
  exit_strategy: z.string().min(10, {
    message: "Exit strategy must be at least 10 characters.",
  }),
});

const StartupForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [startupExists, setStartupExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startup, setStartup] = useState<any>(null);

  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const form = useForm<z.infer<typeof startupSchema>>({
    resolver: zodResolver(startupSchema),
    defaultValues: {
      name: "",
      industry: "",
      stage: "",
      description: "",
      website: "",
      founders: "",
      team_size: "",
      founded_date: "",
      target_market: "",
      problem_solved: "",
      usp: "",
      traction: "",
      key_metrics: "",
      previous_funding: "",
      funding_required: "",
      valuation: "",
      use_of_funds: "",
      roadmap: "",
      exit_strategy: "",
    },
  });

  useEffect(() => {
    if (user) {
      checkExistingStartup(user.id);
      fetchStartupProfile();
    }
  }, [user, profile]);

  const checkExistingStartup = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('startups')
        .select('*');
      
      if (error) throw error;
      
      // Filter the data manually since our mock client may not support .eq() properly
      const filteredData = data ? data.filter((item: any) => item.id === userId) : [];
      setStartupExists(filteredData && filteredData.length > 0);
    } catch (err) {
      console.error("Error checking existing startup:", err);
      setError("Error occurred while checking startup profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStartupProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get the startup ID from the user's profile
      const startupId = profile?.startupId || profile?.id;
      
      if (!startupId) {
        setError('No startup profile found');
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('startups')
        .select('*');
      
      if (error) throw error;
      
      // Filter the data manually since our mock client may not support .eq() properly
      const filteredData = data ? data.filter((item: any) => item.id === startupId) : [];
      
      if (!filteredData || filteredData.length === 0) {
        setError('Startup profile not found');
      } else {
        setStartup(filteredData[0]);
      }
    } catch (err: any) {
      console.error('Error fetching startup profile:', err);
      setError(err.message || 'Failed to load your startup profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: z.infer<typeof startupSchema>) => {
    setIsSubmitting(true);
    setError('');

    try {
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const startupData = {
        id: user.id,
        name: data.name,
        industry: data.industry,
        stage: data.stage,
        description: data.description,
        website: data.website,
        founders: data.founders,
        team_size: data.team_size,
        founded_date: data.founded_date,
        target_market: data.target_market,
        problem_solved: data.problem_solved,
        usp: data.usp,
        traction: data.traction,
        key_metrics: data.key_metrics,
        previous_funding: data.previous_funding,
        funding_required: data.funding_required,
        valuation: data.valuation,
        use_of_funds: data.use_of_funds,
        roadmap: data.roadmap,
        exit_strategy: data.exit_strategy,
        status: 'pending',
        document_path: fileUrl || null,
        created_at: new Date().toISOString(),
      };

      if (startupExists) {
        // Update existing startup profile
        // For mock client, we may need to handle update differently
        const { error } = await supabase
          .from('startups')
          .update(startupData);

        if (error) {
          throw error;
        }
        toast.success("Startup profile updated successfully!");
      } else {
        // Insert new startup profile
        const { error } = await supabase
          .from('startups')
          .insert(startupData);

        if (error) {
          throw error;
        }
        toast.success("Startup profile created successfully!");
      }

      navigate("/startup-profile");
    } catch (err: any) {
      console.error("Form submission error:", err);
      setError(err.message || "Failed to save startup profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadDocument = async (file: File) => {
    setUploading(true);
    setUploadError('');
    setIsUploaded(false);
    setUploadProgress(0);

    try {
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `startups/${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) {
        console.error("File upload error:", error);
        setUploadError(error.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setFileUrl(publicUrlData.publicUrl);
      setIsUploaded(true);
      toast.success("Document uploaded successfully!");
    } catch (err: any) {
      console.error("File upload error:", err);
      setUploadError(err.message || "Failed to upload document.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDocument(file);
  };

  return (
    <motion.section
      id="startup-form"
      className="py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              {startupExists ? "Update Your Startup Profile" : "Create Your Startup Profile"}
            </h2>
            <p className="text-muted-foreground">
              Provide detailed information about your startup to attract potential investors.
            </p>
          </div>

          <Card className="bg-card shadow-lg rounded-lg">
            <CardContent className="p-8">
              {error && (
                <div className="mb-4 p-4 border rounded-lg bg-red-50 border-red-200 text-red-600">
                  <AlertCircle className="mr-2 h-5 w-5 inline-block align-middle" />
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="text-center">
                  <Loader className="mr-2 h-6 w-6 inline-block align-middle animate-spin" />
                  Loading...
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Startup Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your startup name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Fintech, HealthTech" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stage *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Ideation">Ideation</SelectItem>
                              <SelectItem value="Seed">Seed</SelectItem>
                              <SelectItem value="Series A">Series A</SelectItem>
                              <SelectItem value="Series B">Series B</SelectItem>
                              <SelectItem value="Series C">Series C</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your startup"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your website URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="founders"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founders *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter founder names" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="team_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Size *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter team size" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="founded_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founded Date *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter founded date (YYYY-MM-DD)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target_market"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Market *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter target market" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="problem_solved"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Problem Solved *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the problem you are solving"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="usp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unique Selling Proposition (USP) *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your unique selling proposition"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="traction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Traction *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe your traction" className="resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="key_metrics"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Metrics *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your key metrics"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="previous_funding"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Funding *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter previous funding details" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="funding_required"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Funding Required *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter funding required" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="valuation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valuation *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter valuation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="use_of_funds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Use of Funds *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe use of funds"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="roadmap"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roadmap *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe your roadmap" className="resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exit_strategy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exit Strategy *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your exit strategy"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>Upload Document</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={handleFileChange}
                          disabled={uploading}
                        />
                      </FormControl>
                      {uploading && (
                        <div className="mt-2">
                          <Progress value={uploadProgress} />
                          <p className="text-sm text-muted-foreground mt-1">
                            Uploading... {uploadProgress}%
                          </p>
                        </div>
                      )}
                      {uploadError && (
                        <p className="text-sm text-red-500 mt-1">{uploadError}</p>
                      )}
                      {isUploaded && (
                        <div className="flex items-center mt-2">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <p className="text-sm text-green-500">Document uploaded!</p>
                        </div>
                      )}
                    </div>

                    <Button disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.section>
  );
};

export default StartupForm;
