
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const InvestorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Investor Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
              
              <div className="p-6 bg-blue-50 rounded-xl mb-8">
                <h2 className="text-xl font-semibold mb-2">Welcome back, {user.name}</h2>
                <p className="text-gray-700">Your investment profile is active and visible to startups in your focus area.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Your Profile</h3>
                  <ul className="space-y-2">
                    <li><span className="text-gray-600">Investment Focus:</span> {user.investmentFocus}</li>
                    <li><span className="text-gray-600">Investment Range:</span> {user.investmentRange}</li>
                    <li><span className="text-gray-600">Email:</span> {user.email}</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Activity</h3>
                  <p className="text-gray-700">You have no recent activity.</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Recommended Startups</h3>
                <div className="p-8 text-center bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No startups to display yet. Check back soon!</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default InvestorDashboard;
