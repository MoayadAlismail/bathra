import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { canBrowseContent } from "@/lib/auth-utils";

interface StatusGuardProps {
  children: React.ReactNode;
  requireApproval?: boolean;
}

const StatusGuard: React.FC<StatusGuardProps> = ({
  children,
  requireApproval = true,
}) => {
  const { profile, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If approval is required and user cannot browse content, redirect to pending verification
  if (requireApproval && !canBrowseContent(profile)) {
    return <Navigate to="/pending-verification" replace />;
  }

  return <>{children}</>;
};

export default StatusGuard;
