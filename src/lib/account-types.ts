
export type MainAccountType = 'startup' | 'investor';
export type InvestorType = 'individual' | 'vc';
export type AccountType = 'startup' | 'individual' | 'vc';

export const getFullAccountType = (
  mainType: MainAccountType, 
  investorType: InvestorType = 'individual'
): AccountType => {
  if (mainType === 'startup') return 'startup';
  return investorType;
};

export const isInvestorAccount = (accountType?: AccountType | null): boolean => {
  return accountType === 'individual' || accountType === 'vc';
};

export const isStartupAccount = (accountType?: AccountType | null): boolean => {
  return accountType === 'startup';
};
