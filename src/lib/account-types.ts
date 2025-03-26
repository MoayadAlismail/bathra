
// Define the main account types
export type MainAccountType = 'startup' | 'investor';

// Define the investor subtypes
export type InvestorType = 'individual' | 'vc';

// Define the final account type (used throughout the app)
export type AccountType = 'startup' | 'individual' | 'vc';

// Get the full account type based on main selection and investor subtype
export const getFullAccountType = (
  mainAccountType: MainAccountType, 
  investorType: InvestorType
): AccountType => {
  if (mainAccountType === 'startup') return 'startup';
  return investorType;
};
