
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-[#F8F9FA] to-white">
      <div className="container mx-auto px-4 py-20 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <span className="inline-block px-4 py-2 bg-[#E7F0FD] rounded-full text-[#2D3E50] text-sm font-medium mb-6">
            Transform Your Vision Into Reality
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#2D3E50]">
            Connecting Startups with Investors—
            <span className="text-[#2EC4B6]">Seamlessly</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Get funded. Invest wisely. Build the future together with strategic partners who believe in your potential.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/pitch')}
              className="inline-flex items-center justify-center px-8 py-4 bg-[#2EC4B6] text-white rounded-lg font-medium transition-all duration-300 hover:bg-[#2D3E50] hover:shadow-lg group"
            >
              Pitch Your Startup
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/invest')}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#2D3E50] border-2 border-[#2D3E50] rounded-lg font-medium transition-all duration-300 hover:bg-[#F8F9FA] hover:shadow-lg"
            >
              Join as Investor
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#E7F0FD] rounded-full filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#E7F0FD] rounded-full filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "-3s" }}></div>
      </div>
    </section>
  );
};

export default HeroSection;
