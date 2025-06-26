import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import InvestorSignupForm from "@/components/auth/InvestorSignupForm";
import Footer from "@/components/Footer";

const InvestorSignup = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Join as an Investor</h1>
            <p className="text-muted-foreground">
              Create your investor profile and discover promising startups
            </p>
          </div>

          <InvestorSignupForm />
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default InvestorSignup;
