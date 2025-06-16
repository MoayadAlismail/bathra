import {
  AccountType,
  Permission,
  UserRole,
  hasPermission as checkPermission,
} from "./account-types";
import { UserProfile } from "./auth-types";

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Profile utilities
export const getDisplayName = (profile: UserProfile | null): string => {
  if (!profile) return "Guest";
  return profile.name || profile.email || "User";
};

export const getAccountTypeDisplay = (accountType: AccountType): string => {
  switch (accountType) {
    case "investor":
      return "Investor";
    case "startup":
      return "Startup";
    default:
      return "Unknown";
  }
};

export const getUserRoleDisplay = (role: UserRole): string => {
  switch (role) {
    case "investor":
      return "Investor";
    case "startup":
      return "Startup";
    default:
      return "User";
  }
};

// Permission utilities
export const canViewAllStartups = (profile: UserProfile | null): boolean => {
  if (!profile) return false;
  return checkPermission(profile.accountType, "view_all_startups");
};

export const canViewAllInvestors = (profile: UserProfile | null): boolean => {
  if (!profile) return false;
  return checkPermission(profile.accountType, "view_all_investors");
};

export const canCreateStartupProfile = (
  profile: UserProfile | null
): boolean => {
  if (!profile) return false;
  return checkPermission(profile.accountType, "create_startup_profile");
};

export const canCreateInvestorProfile = (
  profile: UserProfile | null
): boolean => {
  if (!profile) return false;
  return checkPermission(profile.accountType, "create_investor_profile");
};

// Route path utilities
export const getDefaultRedirectPath = (accountType: AccountType): string => {
  switch (accountType) {
    case "investor":
      return "/investor/dashboard";
    case "startup":
      return "/startup/dashboard";
    default:
      return "/dashboard";
  }
};

export const getProfileSetupPath = (accountType: AccountType): string => {
  switch (accountType) {
    case "investor":
      return "/investor/profile/setup";
    case "startup":
      return "/startup/profile/setup";
    default:
      return "/profile/setup";
  }
};

// Storage utilities for demo mode
export const DEMO_STORAGE_KEYS = {
  USER: "demoUser",
  PROFILE: "demoProfile",
  PREFERENCES: "demoPreferences",
} as const;

export const clearDemoData = (): void => {
  Object.values(DEMO_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

export const isDemoMode = (): boolean => {
  return localStorage.getItem(DEMO_STORAGE_KEYS.USER) !== null;
};

// Error message utilities
export const getAuthErrorMessage = (error: any): string => {
  // Map common Supabase error codes to user-friendly messages
  const errorMap: Record<string, string> = {
    invalid_credentials: "Invalid email or password",
    email_not_confirmed: "Please verify your email address before signing in",
    signup_disabled: "New registrations are currently disabled",
    user_not_found: "No account found with this email address",
    weak_password: "Password is too weak. Please choose a stronger password",
    email_address_invalid: "Please enter a valid email address",
    password_too_short: "Password must be at least 8 characters long",
    email_already_in_use: "An account with this email already exists",
    session_not_found: "Your session has expired. Please sign in again",
    network_error: "Network error. Please check your connection and try again",
  };

  if (typeof error === "string") {
    return errorMap[error] || error;
  }

  if (error?.code) {
    return (
      errorMap[error.code] || error.message || "An unexpected error occurred"
    );
  }

  if (error?.message) {
    return error.message;
  }

  return "An unexpected error occurred";
};

// URL utilities
export const buildAuthRedirectUrl = (path: string, origin?: string): string => {
  const baseUrl = origin || window.location.origin;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

// Session utilities
export const isSessionExpired = (expiresAt?: number): boolean => {
  if (!expiresAt) return true;
  return Date.now() > expiresAt * 1000;
};

export const getTimeUntilExpiry = (expiresAt?: number): number => {
  if (!expiresAt) return 0;
  const now = Date.now();
  const expiry = expiresAt * 1000;
  return Math.max(0, expiry - now);
};

// Format utilities for display
export const formatLastLogin = (lastLoginAt?: string): string => {
  if (!lastLoginAt) return "Never";

  const date = new Date(lastLoginAt);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInHours < 168) {
    return `${Math.floor(diffInHours / 24)} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};
