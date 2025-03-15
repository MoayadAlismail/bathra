
import { motion } from "framer-motion";
import { Search, Handshake, LineChart } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Connect",
    description: "Submit your startup pitch or register as an investor to join our network.",
  },
  {
    icon: Handshake,
    title: "Match",
    description: "We'll match startups with investors based on mutual interests and goals.",
  },
  {
    icon: LineChart,
    title: "Grow",
    description: "Work together to achieve growth and success in your venture.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-secondary rounded-full text-primary text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl font-bold mb-4 text-foreground">How It <span className="text-gradient">Works</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform makes it easy for startups and investors to connect and collaborate.
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
              className="relative p-8 rounded-2xl bg-white border border-secondary hover:shadow-lg transition-all duration-300 group"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:tech-gradient transition-colors duration-300">
                  <step.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <div className="mt-8 text-center">
                <h3 className="text-xl font-semibold mb-4 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
