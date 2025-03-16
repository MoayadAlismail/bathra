import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Upload, Target, Globe, Lightbulb, DollarSign, Users, BarChart, AlertTriangle } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/components/ThemeProvider";

const StartupForm = () => {
  const { toast: uiToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const { theme } = useTheme();
  
  useEffect(() => {
    // Check if we're in demo mode (no Supabase credentials)
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setIsDemo(true);
    }
  }, []);
  
  const [formData, setFormData] = useState({
    startupName: "",
    website: "",
    founded: "",
    founders: "",
    teamSize: "",
    industry: "",
    stage: "",
    targetMarket: "",
    pitch: "",
    problem: "",
    usp: "",
    traction: "",
    keyMetrics: "",
    previousFunding: "",
    funding: "",
    valuation: "",
    useOfFunds: "",
    roadmap: "",
    exitStrategy: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // In demo mode, just simulate a submission
      if (isDemo) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success("Demo mode: Your pitch would be submitted in a real environment!");
        
        // Reset form in demo mode too
        setFormData({
          startupName: "",
          website: "",
          founded: "",
          founders: "",
          teamSize: "",
          industry: "",
          stage: "",
          targetMarket: "",
          pitch: "",
          problem: "",
          usp: "",
          traction: "",
          keyMetrics: "",
          previousFunding: "",
          funding: "",
          valuation: "",
          useOfFunds: "",
          roadmap: "",
          exitStrategy: ""
        });
        setSelectedFile(null);
        return;
      }
      
      // Real submission to Supabase
      const { data, error } = await supabase
        .from('startups')
        .insert({
          name: formData.startupName,
          website: formData.website,
          founded_date: formData.founded,
          founders: formData.founders,
          team_size: formData.teamSize,
          industry: formData.industry,
          stage: formData.stage,
          target_market: formData.targetMarket,
          description: formData.pitch,
          problem_solved: formData.problem,
          usp: formData.usp,
          traction: formData.traction,
          key_metrics: formData.keyMetrics,
          previous_funding: formData.previousFunding,
          funding_required: formData.funding,
          valuation: formData.valuation,
          use_of_funds: formData.useOfFunds,
          roadmap: formData.roadmap,
          exit_strategy: formData.exitStrategy
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Handle file upload if a file is selected
      if (selectedFile && data) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${data.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `pitch-docs/${fileName}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('startup-documents')
          .upload(filePath, selectedFile);
          
        if (uploadError) throw uploadError;
        
        // Update startup record with document path
        const { error: updateError } = await supabase
          .from('startups')
          .update({ document_path: filePath })
          .eq('id', data.id);
          
        if (updateError) throw updateError;
      }
      
      toast.success("Your pitch has been submitted successfully!");
      
      // Reset form
      setFormData({
        startupName: "",
        website: "",
        founded: "",
        founders: "",
        teamSize: "",
        industry: "",
        stage: "",
        targetMarket: "",
        pitch: "",
        problem: "",
        usp: "",
        traction: "",
        keyMetrics: "",
        previousFunding: "",
        funding: "",
        valuation: "",
        useOfFunds: "",
        roadmap: "",
        exitStrategy: ""
      });
      setSelectedFile(null);
      
    } catch (error: any) {
      console.error('Error submitting pitch:', error);
      toast.error(error.message || "Failed to submit your pitch. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        uiToast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      uiToast({
        title: "File selected",
        description: `${file.name} has been selected`,
      });
    }
  };

  return (
    <section id="startup-form" className={`py-20 ${theme === 'dark' ? 'bg-background' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-secondary rounded-full text-primary-foreground text-sm font-medium mb-4">
              For Startups
            </span>
            <h2 className="text-4xl font-bold mb-4">Pitch Your Startup</h2>
            <p className="text-muted-foreground">
              Share your vision with potential investors and take the first step towards growth.
            </p>
          </div>
          
          {isDemo && (
            <Alert className={`mb-8 ${theme === 'dark' ? 'border-yellow-400 bg-yellow-950/30 text-yellow-300' : 'border-yellow-400 bg-yellow-50 text-yellow-800'}`}>
              <AlertTriangle className={`h-4 w-4 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`} />
              <AlertTitle>Demo Mode Active</AlertTitle>
              <AlertDescription>
                The application is running in demo mode because Supabase credentials are not configured. 
                Form submissions will be simulated but not saved to a database.
              </AlertDescription>
            </Alert>
          )}

          <div className={`mb-10 p-6 ${theme === 'dark' ? 'bg-secondary/30' : 'bg-secondary/50'} rounded-xl`}>
            <h3 className="flex items-center text-lg font-semibold mb-3">
              <Lightbulb className="w-5 h-5 mr-2 text-primary" />
              What Investors Look For
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Investors typically evaluate startups based on the strength of the team, 
              market opportunity, product differentiation, traction, and financial projections.
              The more comprehensive information you provide, the better your chances of securing funding.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className={`${theme === 'dark' ? 'bg-card' : 'bg-white'} p-6 rounded-xl border border-border ${theme === 'dark' ? 'shadow-none' : 'shadow-sm'}`}>
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Company & Team Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="startupName" className="block text-sm font-medium text-foreground mb-2">
                    Startup Name *
                  </label>
                  <input
                    type="text"
                    id="startupName"
                    required
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="Enter your startup name"
                    value={formData.startupName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-foreground mb-2">
                    Website/Social Media
                  </label>
                  <input
                    type="url"
                    id="website"
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="founded" className="block text-sm font-medium text-foreground mb-2">
                    Founded Date
                  </label>
                  <input
                    type="month"
                    id="founded"
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    value={formData.founded}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="founders" className="block text-sm font-medium text-foreground mb-2">
                    Founders *
                  </label>
                  <input
                    type="text"
                    id="founders"
                    required
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="Founder names"
                    value={formData.founders}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="teamSize" className="block text-sm font-medium text-foreground mb-2">
                    Team Size
                  </label>
                  <select
                    id="teamSize"
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    value={formData.teamSize}
                    onChange={handleChange}
                  >
                    <option value="">Select team size</option>
                    <option value="1-5">1-5 employees</option>
                    <option value="6-10">6-10 employees</option>
                    <option value="11-25">11-25 employees</option>
                    <option value="26-50">26-50 employees</option>
                    <option value="51+">51+ employees</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-card' : 'bg-white'} p-6 rounded-xl border border-border ${theme === 'dark' ? 'shadow-none' : 'shadow-sm'}`}>
              <div className="flex items-center mb-4">
                <Globe className="w-5 h-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Market & Product</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-foreground mb-2">
                    Industry *
                  </label>
                  <select
                    id="industry"
                    required
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    value={formData.industry}
                    onChange={handleChange}
                  >
                    <option value="">Select industry</option>
                    <option value="fintech">Fintech</option>
                    <option value="healthtech">Healthtech</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="edtech">Edtech</option>
                    <option value="ai">AI/ML</option>
                    <option value="saas">SaaS</option>
                    <option value="marketplace">Marketplace</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="stage" className="block text-sm font-medium text-foreground mb-2">
                    Development Stage *
                  </label>
                  <select
                    id="stage"
                    required
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    value={formData.stage}
                    onChange={handleChange}
                  >
                    <option value="">Select stage</option>
                    <option value="idea">Idea/Concept</option>
                    <option value="mvp">MVP/Prototype</option>
                    <option value="early">Early Traction</option>
                    <option value="growth">Growth</option>
                    <option value="scaling">Scaling</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="targetMarket" className="block text-sm font-medium text-foreground mb-2">
                    Target Market/Audience *
                  </label>
                  <input
                    type="text"
                    id="targetMarket"
                    required
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="Describe your target customers"
                    value={formData.targetMarket}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="pitch" className="block text-sm font-medium text-foreground mb-2">
                    Pitch Description *
                  </label>
                  <textarea
                    id="pitch"
                    required
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="Describe your startup and what makes it unique (max 500 characters)"
                    maxLength={500}
                    value={formData.pitch}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="problem" className="block text-sm font-medium text-foreground mb-2">
                    Problem Solved *
                  </label>
                  <textarea
                    id="problem"
                    required
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="What problem does your startup solve?"
                    value={formData.problem}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="usp" className="block text-sm font-medium text-foreground mb-2">
                    Unique Value Proposition *
                  </label>
                  <textarea
                    id="usp"
                    required
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="What makes your solution better than competitors?"
                    value={formData.usp}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-card' : 'bg-white'} p-6 rounded-xl border border-border ${theme === 'dark' ? 'shadow-none' : 'shadow-sm'}`}>
              <div className="flex items-center mb-4">
                <BarChart className="w-5 h-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Traction & Metrics</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="traction" className="block text-sm font-medium text-foreground mb-2">
                    Current Traction
                  </label>
                  <textarea
                    id="traction"
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="Users, customers, revenue, growth rate, etc."
                    value={formData.traction}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="keyMetrics" className="block text-sm font-medium text-foreground mb-2">
                    Key Metrics
                  </label>
                  <input
                    type="text"
                    id="keyMetrics"
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="CAC, LTV, Churn Rate, etc."
                    value={formData.keyMetrics}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-card' : 'bg-white'} p-6 rounded-xl border border-border ${theme === 'dark' ? 'shadow-none' : 'shadow-sm'}`}>
              <div className="flex items-center mb-4">
                <DollarSign className="w-5 h-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Funding Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="previousFunding" className="block text-sm font-medium text-foreground mb-2">
                    Previous Funding
                  </label>
                  <input
                    type="text"
                    id="previousFunding"
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="e.g., $100K Angel, $500K Seed"
                    value={formData.previousFunding}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="funding" className="block text-sm font-medium text-foreground mb-2">
                    Funding Requirements *
                  </label>
                  <input
                    type="text"
                    id="funding"
                    required
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="How much funding are you seeking?"
                    value={formData.funding}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="valuation" className="block text-sm font-medium text-foreground mb-2">
                    Current Valuation
                  </label>
                  <input
                    type="text"
                    id="valuation"
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="Estimated valuation of your startup"
                    value={formData.valuation}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="useOfFunds" className="block text-sm font-medium text-foreground mb-2">
                    Use of Funds *
                  </label>
                  <textarea
                    id="useOfFunds"
                    required
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="How will you use the investment?"
                    value={formData.useOfFunds}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-card' : 'bg-white'} p-6 rounded-xl border border-border ${theme === 'dark' ? 'shadow-none' : 'shadow-sm'}`}>
              <div className="flex items-center mb-4">
                <Target className="w-5 h-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Future Plans</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="roadmap" className="block text-sm font-medium text-foreground mb-2">
                    Business Roadmap
                  </label>
                  <textarea
                    id="roadmap"
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="Key milestones for the next 12-24 months"
                    value={formData.roadmap}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="exitStrategy" className="block text-sm font-medium text-foreground mb-2">
                    Exit Strategy
                  </label>
                  <textarea
                    id="exitStrategy"
                    rows={2}
                    className={`w-full px-4 py-3 rounded-lg border border-border ${theme === 'dark' ? 'bg-background' : 'bg-white'} focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    placeholder="Potential exits (acquisition, IPO, etc.)"
                    value={formData.exitStrategy}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-card' : 'bg-white'} p-6 rounded-xl border border-border ${theme === 'dark' ? 'shadow-none' : 'shadow-sm'}`}>
              <div className="flex items-center mb-4">
                <Upload className="w-5 h-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Supporting Documents</h3>
              </div>
              <div>
                <label htmlFor="document" className="block text-sm font-medium text-foreground mb-2">
                  Upload Documents (Optional)
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Pitch deck, financial projections, business plan, market research, etc.
                </p>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors ${theme === 'dark' ? 'bg-background/50' : ''}`}>
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                      <label
                        htmlFor="document"
                        className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                      >
                        <span>Upload a file</span>
                        <input
                          id="document"
                          name="document"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PDF or Word up to 5MB
                    </p>
                    {selectedFile && (
                      <p className="text-sm text-primary mt-2">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? "Submitting..." : "Submit Pitch"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default StartupForm;
