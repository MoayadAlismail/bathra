
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <BackgroundPaths title="Connecting Startups" />
      </div>
      
      <div className="container mx-auto px-4 py-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <span className="inline-block px-6 py-2 rounded-full bg-secondary text-primary text-sm font-medium mb-6 shadow-sm">
            Transform Your Vision Into Reality
          </span>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Get funded. Invest wisely. Build the future together with strategic partners who believe in your potential.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/pitch')}
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group"
            >
              Pitch Your Startup
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/invest')}
              className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-medium transition-all duration-300 hover:bg-secondary/80 hover:shadow-lg"
            >
              Join as Investor
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
