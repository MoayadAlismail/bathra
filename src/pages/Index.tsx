
import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import StartupForm from "@/components/StartupForm";
import InvestorForm from "@/components/InvestorForm";
import HowItWorks from "@/components/HowItWorks";

const Index = () => {
  // Smooth scroll functionality
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
    <div className="min-h-screen bg-white">
      <HeroSection />
      <HowItWorks />
      <StartupForm />
      <InvestorForm />
    </div>
  );
};

export default Index;
