import Navbar from "@/components/Navbar";
import InvestorBrowseStartups from "@/components/InvestorBrowseStartups";

const VettedStartups = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20">
        <InvestorBrowseStartups isDashboard={false} />
      </section>
    </div>
  );
};

export default VettedStartups;
