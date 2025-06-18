import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import StartupBrowseInvestors from "@/components/StartupBrowseInvestors";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { AccountType, isStartupAccount } from "@/lib/account-types";

const Investors = () => {
  const { user, profile } = useAuth();

  // Redirect if not logged in or not a startup account
  if (!user || !profile) {
    return <Navigate to="/login" />;
  }

  if (!isStartupAccount(profile.accountType as AccountType)) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28">
        <StartupBrowseInvestors />
      </div>
    </div>
  );
};

export default Investors;
