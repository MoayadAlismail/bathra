import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StartupInterestedInvestors from "@/components/StartupInterestedInvestors";
import { motion } from "framer-motion";

const InterestedInvestors = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StartupInterestedInvestors isDashboard={false} />
      </motion.div>
      <Footer />
    </div>
  );
};

export default InterestedInvestors;
