export interface StartupBasicInfo {
  id: string;
  name: string;
  industry: string;
  stage: string;
  description: string;
  website?: string;
  founders: string;
  team_size?: string;
  founded_date: string;
  target_market?: string;
  problem_solved: string;
  usp?: string;
  traction?: string;
  key_metrics?: string;
  previous_funding?: string;
  funding_required?: string;
  valuation?: string;
  use_of_funds?: string;
  roadmap?: string;
  exit_strategy?: string;
  status: string;
  created_at: string;
  image?: string;
  business_model?: string;
  contact_email?: string;
  investment_terms?: string;
  financials?: string;
  market_analysis?: string;
  competition?: string;
  video_url?: string;
  document_path?: string;
}

export interface StartupCardProps {
  startup: StartupBasicInfo;
  onStartupClick: (startup: StartupBasicInfo) => void;
  isSaved?: boolean;
}

export interface StartupModalProps {
  startup: StartupBasicInfo;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isSaved: boolean;
  onRequestInfo: () => void;
}

export interface StartupFilters {
  industry?: string;
  stage?: string;
  searchTerm?: string;
  valuation?: string;
}
