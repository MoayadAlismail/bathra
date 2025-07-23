import { motion } from "framer-motion";
import { Search, Handshake, LineChart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { homeTranslations } from "@/utils/language/home";

const HowItWorks = () => {
  const { language } = useLanguage();
  const steps = [
    {
      icon: Search,
      title: homeTranslations.howItWorksConnectTitle[language],
      description: homeTranslations.howItWorksConnectDescription[language],
      price: null,
    },
    {
      icon: Handshake,
      title: homeTranslations.howItWorksMatchTitle[language],
      description: homeTranslations.howItWorksMatchDescription[language],
      price: null,
    },
    {
      icon: LineChart,
      title: homeTranslations.howItWorksGrowTitle[language],
      description: homeTranslations.howItWorksGrowDescription[language],
      price: null,
    },
  ];
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-secondary rounded-full text-foreground text-sm font-medium mb-4">
            {homeTranslations.howItWorksSimpleProcess[language]}
          </span>
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            {homeTranslations.howItWorksTitle[language]}{" "}
            <span className="text-primary">
              {homeTranslations.howItWorksTitlePrimary[language]}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {homeTranslations.howItWorksSubtitle[language]}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative p-8 rounded-xl border border-primary/30 bg-white shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              {step.price && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="price-tag">{step.price}</div>
                </div>
              )}
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-primary/10">
                <p className="text-center text-sm text-muted-foreground">
                  {index === 0
                    ? homeTranslations.howItWorksStartJourney[language]
                    : index === 1
                    ? homeTranslations.howItWorksBuildConnections[language]
                    : homeTranslations.howItWorksAchieveSuccess[language]}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
