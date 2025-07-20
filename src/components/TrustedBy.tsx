import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { homeTranslations } from "@/utils/language/home";

interface TrustedCompany {
  name: string;
  logo: string;
  type: "startup" | "investor";
}

const TrustedBy = () => {
  const [isIOS, setIsIOS] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Detect iOS Safari
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
  }, []);

  // Placeholder for trusted companies - will be populated later
  const trustedCompanies: TrustedCompany[] = [];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block px-4 py-2 bg-secondary rounded-full text-foreground text-sm font-medium mb-4">
            {homeTranslations.trustedByOurNetwork[language]}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {homeTranslations.trustedByTitle[language]}{" "}
            <span className="text-primary">
              {homeTranslations.trustedByTitlePrimary[language]}
            </span>
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            {homeTranslations.trustedBySubtitle[language]}
          </p>

          {trustedCompanies.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center max-w-6xl mx-auto">
              {trustedCompanies.map((company, index) => (
                <motion.div
                  key={company.name}
                  initial={isIOS ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                  whileInView={
                    isIOS ? { opacity: 1 } : { opacity: 1, scale: 1 }
                  }
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: isIOS ? 0 : index * 0.1 }}
                  className={`flex items-center justify-center p-6 rounded-lg border border-primary/10 grayscale hover:grayscale-0 transition-all duration-300 hover:shadow-md ${
                    isIOS ? "bg-white/95" : "bg-white/50 backdrop-blur-sm"
                  }`}
                >
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="max-h-12 max-w-32 object-contain"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedBy;
