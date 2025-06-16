import { UserProfile } from "./auth-types";

export interface VerificationCheck {
  isVerified: boolean;
  isApproved: boolean;
  canAccessFeature: boolean;
  message?: string;
}

export const checkUserVerification = (
  profile: UserProfile | null
): VerificationCheck => {
  if (!profile) {
    return {
      isVerified: false,
      isApproved: false,
      canAccessFeature: false,
      message: "Please log in to access this feature",
    };
  }

  const isVerified = profile.verified || false;
  const isApproved = profile.adminApproved || profile.status === "approved";

  if (!isVerified && !isApproved) {
    return {
      isVerified: false,
      isApproved: false,
      canAccessFeature: false,
      message:
        "Your account is pending admin approval. Please wait for verification to access this feature.",
    };
  }

  if (profile.status === "rejected") {
    return {
      isVerified: false,
      isApproved: false,
      canAccessFeature: false,
      message:
        "Your account has been rejected. Please contact support for more information.",
    };
  }

  if (profile.status === "flagged") {
    return {
      isVerified: false,
      isApproved: false,
      canAccessFeature: false,
      message:
        "Your account has been flagged for review. Please contact support.",
    };
  }

  return {
    isVerified: true,
    isApproved: true,
    canAccessFeature: true,
  };
};

export const requireVerification = (
  profile: UserProfile | null,
  feature: string = "this feature"
): { canAccess: boolean; message?: string } => {
  const verification = checkUserVerification(profile);

  if (!verification.canAccessFeature) {
    return {
      canAccess: false,
      message:
        verification.message || `You need to be verified to access ${feature}`,
    };
  }

  return { canAccess: true };
};

// Specific feature checks
export const canViewStartups = (profile: UserProfile | null): boolean => {
  if (!profile || profile.accountType !== "investor") return false;
  return checkUserVerification(profile).canAccessFeature;
};

export const canViewInvestors = (profile: UserProfile | null): boolean => {
  if (!profile || profile.accountType !== "startup") return false;
  return checkUserVerification(profile).canAccessFeature;
};

export const canCreateProfile = (profile: UserProfile | null): boolean => {
  if (!profile) return false;
  // Users can create profiles even if not verified yet
  return profile.status !== "rejected";
};

export const canConnectWithUsers = (profile: UserProfile | null): boolean => {
  if (!profile) return false;
  return checkUserVerification(profile).canAccessFeature;
};

export const getVerificationStatusMessage = (
  profile: UserProfile | null
): string => {
  if (!profile) return "Please log in";

  const verification = checkUserVerification(profile);

  if (verification.canAccessFeature) {
    return "Account verified";
  }

  return verification.message || "Account not verified";
};
