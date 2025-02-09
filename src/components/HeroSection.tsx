
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-[#E7F0FD]">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <span className="inline-block px-4 py-2 bg-[#E7F0FD] rounded-full text-[#1EAEDB] text-sm font-medium mb-6">
            Connect with the right partners
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#1EAEDB] to-[#33C3F0]">
            Where Innovative Startups Meet Strategic Investors
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Transform your vision into reality. Connect with investors who believe in your potential and can help scale your startup to new heights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#startup-form"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#1EAEDB] text-white rounded-lg font-medium transition-colors hover:bg-[#0FA0CE] group"
            >
              Pitch Your Startup
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#investor-form"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#1EAEDB] border-2 border-[#1EAEDB] rounded-lg font-medium transition-colors hover:bg-[#E7F0FD]"
            >
              Join as Investor
            </motion.a>
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
