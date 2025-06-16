// Define the main account types (only investor and startup)
export type MainAccountType = "startup" | "investor" | "admin";

// Define the final account type (used throughout the app)
export type AccountType = "startup" | "investor" | "admin";

// Define user roles for authorization
export type UserRole = "investor" | "startup" | "admin";

// Map account types to roles (simplified - 1:1 mapping)
export const accountTypeToRole = (accountType: AccountType): UserRole => {
  switch (accountType) {
    case "investor":
      return "investor";
    case "startup":
      return "startup";
    case "admin":
      return "admin";
    default:
      throw new Error(`Unknown account type: ${accountType}`);
  }
};

// Get the account type (simplified since no subtypes)
export const getFullAccountType = (
  mainAccountType: MainAccountType
): AccountType => {
  return mainAccountType;
};

// Helper functions to check account types
export const isStartupAccount = (accountType?: AccountType): boolean => {
  return accountType === "startup";
};

export const isInvestorAccount = (accountType?: AccountType): boolean => {
  return accountType === "investor";
};

export const isAdminAccount = (accountType?: AccountType): boolean => {
  return accountType === "admin";
};

// Permission definitions (simplified for investor and startup only)
export type Permission =
  | "view_all_startups"
  | "view_all_investors"
  | "create_startup_profile"
  | "edit_startup_profile"
  | "create_investor_profile"
  | "edit_investor_profile"
  | "connect_with_investors"
  | "connect_with_startups"
  | "manage_users"
  | "approve_startups"
  | "approve_investors"
  | "view_admin_dashboard";

// Role-based permissions
export const rolePermissions: Record<UserRole, Permission[]> = {
  investor: [
    "view_all_startups",
    "create_investor_profile",
    "edit_investor_profile",
    "connect_with_startups",
  ],
  startup: [
    "view_all_investors",
    "create_startup_profile",
    "edit_startup_profile",
    "connect_with_investors",
  ],
  admin: [
    "view_all_startups",
    "view_all_investors",
    "manage_users",
    "approve_startups",
    "approve_investors",
    "view_admin_dashboard",
  ],
};

// Check if a user has a specific permission
export const hasPermission = (
  accountType: AccountType,
  permission: Permission
): boolean => {
  const role = accountTypeToRole(accountType);
  return rolePermissions[role].includes(permission);
};
