
import InvestorForm from "@/components/InvestorForm";
import Navbar from "@/components/Navbar";

const InvestorJoin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <InvestorForm />
      </div>
    </div>
  );
};

export default InvestorJoin;
