import { motion } from "framer-motion";

interface TrustedCompany {
  name: string;
  logo: string;
  type: "startup" | "investor";
}

const TrustedBy = () => {
  // Placeholder for trusted companies - will be populated later
  const trustedCompanies: TrustedCompany[] = [];

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block px-4 py-2 bg-secondary rounded-full text-foreground text-sm font-medium mb-4">
            Our Network
          </span>
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Trusted by{" "}
            <span className="text-primary">innovative companies</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-16">
            Join a network of successful startups and experienced investors who
            are driving innovation across the region.
          </p>

          {trustedCompanies.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center max-w-6xl mx-auto">
              {trustedCompanies.map((company, index) => (
                <motion.div
                  key={company.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center justify-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-primary/10 grayscale hover:grayscale-0 transition-all duration-300 hover:shadow-md"
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
