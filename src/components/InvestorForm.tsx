
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const InvestorForm = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Registration Successful!",
      description: "Thank you for joining. We'll review your application and get back to you shortly.",
    });
  };

  return (
    <section id="investor-form" className="py-20 bg-primary-light">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-white rounded-full text-primary-dark text-sm font-medium mb-4">
              For Investors
            </span>
            <h2 className="text-4xl font-bold mb-4">Join Our Investor Network</h2>
            <p className="text-gray-600">
              Connect with promising startups and expand your investment portfolio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="focus" className="block text-sm font-medium text-gray-700 mb-2">
                Investment Focus *
              </label>
              <select
                id="focus"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="">Select your investment focus</option>
                <option value="tech">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="fintech">Fintech</option>
                <option value="ecommerce">E-commerce</option>
                <option value="sustainability">Sustainability</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="investmentRange" className="block text-sm font-medium text-gray-700 mb-2">
                Typical Investment Range *
              </label>
              <select
                id="investmentRange"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="">Select investment range</option>
                <option value="seed">$10K - $50K (Seed)</option>
                <option value="angel">$50K - $200K (Angel)</option>
                <option value="seriesA">$200K - $1M (Series A)</option>
                <option value="seriesB">$1M+ (Series B+)</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-primary text-white rounded-lg font-medium transition-colors hover:bg-primary-hover"
            >
              Register as Investor
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default InvestorForm;
