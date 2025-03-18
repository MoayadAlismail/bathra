
import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { ChartBarIcon, UsersIcon, InfoIcon } from "lucide-react";

const Index = () => {
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href') || "");
        target?.scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      
      {/* Information Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto space-y-16"
          >
            {/* Startup Success Stats */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full rainbow-border rainbow-glow">
                <ChartBarIcon className="w-8 h-8 text-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-6 text-foreground rainbow-text">The Startup Reality</h2>
              <p className="text-lg text-muted-foreground mb-8">
                90% of startups fail, and a significant factor is the lack of proper funding and strategic investors. 
                We're here to change that by connecting promising startups with the right investors.
              </p>
            </div>

            {/* About Us */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full rainbow-border rainbow-glow">
                <UsersIcon className="w-8 h-8 text-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-6 text-foreground rainbow-text">About Us</h2>
              <p className="text-lg text-muted-foreground mb-8">
                We're a team of entrepreneurs, investors, and industry experts who understand the challenges of building a successful startup.
                Our platform is designed to bridge the gap between innovative startups and strategic investors,
                creating meaningful connections that drive growth and success.
              </p>
            </div>

            {/* Our Mission */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full rainbow-border rainbow-glow">
                <InfoIcon className="w-8 h-8 text-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-6 text-foreground rainbow-text">Our Mission</h2>
              <p className="text-lg text-muted-foreground">
                To democratize access to funding and expertise, enabling more startups to succeed and innovate.
                We believe that great ideas deserve the chance to become reality, and we're here to make that happen.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
