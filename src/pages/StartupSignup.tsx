import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import StartupSignupForm from "@/components/auth/StartupSignupForm";
import Footer from "@/components/Footer";

const StartupSignup = () => {
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
            <h1 className="text-3xl font-bold mb-2">
              Create Your Startup Profile
            </h1>
            <p className="text-muted-foreground">
              Tell us about your startup and connect with potential investors
            </p>
          </div>

          <StartupSignupForm />
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default StartupSignup;
