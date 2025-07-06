// Basic investor information visible to regular users
export interface InvestorBasicInfo {
  id: string;
  name: string;
  preferred_industries: string;
  preferred_company_stage: string;
  average_ticket_size: string;
  company?: string;
  role?: string;
  city?: string;
  country?: string;
  number_of_investments?: number;
  verified?: boolean;
}

// Extended investor information visible to admins
export interface AdminInvestorInfo extends InvestorBasicInfo {
  email?: string;
  phone?: string;
  birthday?: string;
  linkedin_profile?: string;
  other_social_media_profile?: string | { platform: string; url: string }[];
  heard_about_us?: string;
  secured_lead_investor?: boolean;
  participated_as_advisor?: boolean;
  strong_candidate_reason?: string;
  calendly_link?: string;
  status?: string;
  visibility_status?: string;
  admin_notes?: string;
  verified_at?: string;
  verified_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvestorFilters {
  industry?: string;
  stage?: string;
  searchTerm?: string;
  ticketSize?: string;
  status?: string;
  country?: string;
  limit?: number;
  offset?: number;
}

export interface InvestorCardProps {
  investor: InvestorBasicInfo;
  onInvestorClick: (investor: InvestorBasicInfo) => void;
  isSaved?: boolean;
}

export interface InvestorModalProps {
  investor: InvestorBasicInfo;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  onRequestInfo?: () => void;
}

// Paginated response type for investors
export interface PaginatedInvestors<T = InvestorBasicInfo> {
  investors: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
