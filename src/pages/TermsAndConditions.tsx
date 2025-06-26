import Navbar from "@/components/Navbar";
import { Footer } from "@/components";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-foreground text-center mb-8">
            Terms and Conditions
          </h1>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
