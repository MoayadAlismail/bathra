import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Permission, AccountType } from "@/lib/account-types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;

  // Authentication requirements
  requireAuth?: boolean;

  // Role-based access
  allowedRoles?: AccountType[];

  // Permission-based access
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean; // If true, user must have ALL permissions. If false, ANY permission is sufficient

  // Redirect paths
  redirectTo?: string;
  unauthorizedRedirect?: string;

  // Loading component
  loading?: React.ReactNode;

  // Fallback component for unauthorized access
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedRoles,
  requiredPermissions,
  requireAllPermissions = true,
  redirectTo = "/auth/signin",
  unauthorizedRedirect = "/unauthorized",
  loading,
  fallback,
}) => {
  const { isAuthenticated, isLoading, profile, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return loading || <LoadingSpinner />;
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is not required and user is not authenticated, allow access
  if (!requireAuth && !isAuthenticated) {
    return <>{children}</>;
  }

  // Check role-based access
  if (allowedRoles && profile) {
    const hasAllowedRole = allowedRoles.includes(profile.accountType);
    if (!hasAllowedRole) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return <Navigate to={unauthorizedRedirect} replace />;
    }
  }

  // Check permission-based access
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAllPermissions
      ? requiredPermissions.every((permission) => hasPermission(permission))
      : requiredPermissions.some((permission) => hasPermission(permission));

    if (!hasRequiredPermissions) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return <Navigate to={unauthorizedRedirect} replace />;
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

// Specific route protection components for common use cases

export const InvestorRoute: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <ProtectedRoute allowedRoles={["investor"]} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const StartupRoute: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <ProtectedRoute allowedRoles={["startup"]} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const AdminRoute: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <ProtectedRoute allowedRoles={["admin"]} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;

// Component-level protection wrapper
interface ProtectedComponentProps {
  children: React.ReactNode;

  // Permission requirements
  permission?: Permission;
  permissions?: Permission[];
  requireAllPermissions?: boolean;

  // Role requirements
  role?: AccountType;
  roles?: AccountType[];

  // Fallback content
  fallback?: React.ReactNode;

  // Hide instead of showing fallback
  hide?: boolean;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  permission,
  permissions,
  requireAllPermissions = true,
  role,
  roles,
  fallback = null,
  hide = false,
}) => {
  const { isAuthenticated, profile, hasPermission } = useAuth();

  // If not authenticated, don't show anything
  if (!isAuthenticated || !profile) {
    return hide ? null : <>{fallback}</>;
  }

  // Check single role
  if (role && profile.accountType !== role) {
    return hide ? null : <>{fallback}</>;
  }

  // Check multiple roles
  if (roles && !roles.includes(profile.accountType)) {
    return hide ? null : <>{fallback}</>;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return hide ? null : <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasRequiredPermissions = requireAllPermissions
      ? permissions.every((p) => hasPermission(p))
      : permissions.some((p) => hasPermission(p));

    if (!hasRequiredPermissions) {
      return hide ? null : <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
