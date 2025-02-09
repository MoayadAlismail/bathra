
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const StartupForm = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Success!",
      description: "Your pitch has been submitted successfully. We'll be in touch soon!",
    });
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
