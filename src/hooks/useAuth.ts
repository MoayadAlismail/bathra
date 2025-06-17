import { useAuth as useAuthContext } from "@/context/AuthContext";
import { Permission, AccountType, UserRole } from "@/lib/account-types";
import { useEffect, useState } from "react";

// Re-export the main useAuth hook
export const useAuth = useAuthContext;

// Hook for checking permissions
export const usePermission = (permission: Permission) => {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
};

// Hook for checking multiple permissions (requires ALL)
export const usePermissions = (permissions: Permission[]) => {
  const { hasPermission } = useAuth();
  return permissions.every((permission) => hasPermission(permission));
};

// Hook for checking if user has ANY of the provided permissions
export const useAnyPermission = (permissions: Permission[]) => {
  const { hasPermission } = useAuth();
  return permissions.some((permission) => hasPermission(permission));
};

// Hook for checking roles
export const useRole = (role: AccountType) => {
  const { isRole } = useAuth();
  return isRole(role);
};

// Hook for checking multiple roles (user has ANY of these roles)
export const useAnyRole = (roles: AccountType[]) => {
  const { isRole } = useAuth();
  return roles.some((role) => isRole(role));
};

// Hook for investor check
export const useIsInvestor = () => {
  const { isRole } = useAuth();
  return isRole("investor");
};

// Hook for startup check
export const useIsStartup = () => {
  const { isRole } = useAuth();
  return isRole("startup");
};

// Hook for authentication status with loading state
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user, profile } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    isReady: !isLoading,
    user,
    profile,
  };
};

// Hook for required authentication (throws if not authenticated)
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading, user, profile } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      throw new Error("Authentication required");
    }
  }, [isLoading, isAuthenticated]);

  return { user, profile, isLoading };
};

// Hook for conditional authentication (returns auth state)
export const useOptionalAuth = () => {
  const { isAuthenticated, isLoading, user, profile } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    user: isAuthenticated ? user : null,
    profile: isAuthenticated ? profile : null,
  };
};

// Hook for waiting for auth initialization
export const useAuthReady = () => {
  const { isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsReady(true);
    }
  }, [isLoading]);

  return isReady;
};

// Hook for user profile data with type safety
export const useUserProfile = () => {
  const { profile, isAuthenticated } = useAuth();

  if (!isAuthenticated || !profile) {
    return null;
  }

  return profile;
};

// Hook for getting user permissions array
export const useUserPermissions = () => {
  const { permissions } = useAuth();
  return permissions;
};
