
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Upload, Target, Globe, Lightbulb, DollarSign, Users, BarChart } from "lucide-react";
import { useState } from "react";

const StartupForm = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Success!",
      description: `Your pitch${selectedFile ? ' and document' : ''} has been submitted successfully. We'll be in touch soon!`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      toast({
        title: "File selected",
        description: `${file.name} has been selected`,
      });
    }
  };

  return (
    <section id="startup-form" className="py-20 bg-white">
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

          <div className="mb-10 p-6 bg-secondary/50 rounded-xl">
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
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
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
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Enter your startup name"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-foreground mb-2">
                    Website/Social Media
                  </label>
                  <input
                    type="url"
                    id="website"
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label htmlFor="founded" className="block text-sm font-medium text-foreground mb-2">
                    Founded Date
                  </label>
                  <input
                    type="month"
                    id="founded"
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
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
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Founder names"
                  />
                </div>

                <div>
                  <label htmlFor="teamSize" className="block text-sm font-medium text-foreground mb-2">
                    Team Size
                  </label>
                  <select
                    id="teamSize"
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
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

            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
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
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
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
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
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
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Describe your target customers"
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
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Describe your startup and what makes it unique (max 500 characters)"
                    maxLength={500}
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
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="What problem does your startup solve?"
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
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="What makes your solution better than competitors?"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
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
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Users, customers, revenue, growth rate, etc."
                  />
                </div>

                <div>
                  <label htmlFor="keyMetrics" className="block text-sm font-medium text-foreground mb-2">
                    Key Metrics
                  </label>
                  <input
                    type="text"
                    id="keyMetrics"
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="CAC, LTV, Churn Rate, etc."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
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
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="e.g., $100K Angel, $500K Seed"
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
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="How much funding are you seeking?"
                  />
                </div>

                <div>
                  <label htmlFor="valuation" className="block text-sm font-medium text-foreground mb-2">
                    Current Valuation
                  </label>
                  <input
                    type="text"
                    id="valuation"
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Estimated valuation of your startup"
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
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="How will you use the investment?"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
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
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Key milestones for the next 12-24 months"
                  />
                </div>

                <div>
                  <label htmlFor="exitStrategy" className="block text-sm font-medium text-foreground mb-2">
                    Exit Strategy
                  </label>
                  <textarea
                    id="exitStrategy"
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Potential exits (acquisition, IPO, etc.)"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
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
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
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
              className="w-full py-4 bg-primary text-white rounded-lg font-medium transition-colors hover:bg-primary/90"
            >
              Submit Pitch
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default StartupForm;
