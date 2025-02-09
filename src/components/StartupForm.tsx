
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { useState } from "react";

const StartupForm = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Include file in submission logic
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
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-primary-light rounded-full text-primary-dark text-sm font-medium mb-4">
              For Startups
            </span>
            <h2 className="text-4xl font-bold mb-4">Pitch Your Startup</h2>
            <p className="text-gray-600">
              Share your vision with potential investors and take the first step towards growth.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="startupName" className="block text-sm font-medium text-gray-700 mb-2">
                Startup Name *
              </label>
              <input
                type="text"
                id="startupName"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Enter your startup name"
              />
            </div>

            <div>
              <label htmlFor="founders" className="block text-sm font-medium text-gray-700 mb-2">
                Founders *
              </label>
              <input
                type="text"
                id="founders"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Founder names"
              />
            </div>

            <div>
              <label htmlFor="pitch" className="block text-sm font-medium text-gray-700 mb-2">
                Pitch Description *
              </label>
              <textarea
                id="pitch"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Describe your startup and what makes it unique (max 500 characters)"
                maxLength={500}
              />
            </div>

            <div>
              <label htmlFor="funding" className="block text-sm font-medium text-gray-700 mb-2">
                Funding Requirements *
              </label>
              <input
                type="text"
                id="funding"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="How much funding are you seeking?"
              />
            </div>

            <div>
              <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Documents (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="document"
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
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
                  <p className="text-xs text-gray-500">
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

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-primary text-white rounded-lg font-medium transition-colors hover:bg-primary-hover"
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
