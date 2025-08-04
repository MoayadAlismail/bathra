import AdminNavbar from "@/components/AdminNavbar";
import StartupScoringSystem from "@/components/admin/StartupScoringSystem";
import Footer from "@/components/Footer";

const StartupScoring = () => {
  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      {/* Main Content */}
      <div className="pt-28 pb-10">
        <div className="container mx-auto px-4">
          <StartupScoringSystem />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StartupScoring;
