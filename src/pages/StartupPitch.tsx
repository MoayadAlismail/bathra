
import StartupForm from "@/components/StartupForm";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

const StartupPitch = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      
      <div className="bg-gradient-to-b from-primary/10 to-background pt-20 pb-10">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get Funded by Top Investors</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Bathra connects promising startups with investors looking for the next big opportunity.
              Complete the form below with detailed information to maximize your chances of securing funding.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="bg-secondary px-3 py-1 rounded-full text-sm font-medium">Thorough Vetting</span>
              <span className="bg-secondary px-3 py-1 rounded-full text-sm font-medium">Direct Connections</span>
              <span className="bg-secondary px-3 py-1 rounded-full text-sm font-medium">Expert Guidance</span>
            </div>
          </motion.div>
        </div>
      </div>
      
      <StartupForm />
    </div>
  );
};

export default StartupPitch;
