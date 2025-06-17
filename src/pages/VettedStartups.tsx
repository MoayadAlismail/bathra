import Navbar from "@/components/Navbar";
import InvestorBrowseStartups from "@/components/InvestorBrowseStartups";

const VettedStartups = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-20">
        <InvestorBrowseStartups isDashboard={false} />
      </section>
    </div>
  );
};

export default VettedStartups;
