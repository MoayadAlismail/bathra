
import { motion } from "framer-motion";
import InvestorForm from "@/components/InvestorForm";
import Navbar from "@/components/Navbar";

const InvestorJoin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="py-16 bg-primary text-primary-foreground"
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Join Our Network of Investors
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Connect with promising startups and diversify your investment portfolio with innovative companies.
          </p>
        </div>
      </motion.div>
      
      <div className="container mx-auto px-4 py-10">
        <InvestorForm />
      </div>
    </div>
  );
};

export default InvestorJoin;
