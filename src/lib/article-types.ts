// Article types for the blog system

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  category: ArticleCategory;
  tags: string[];
  status: ArticleStatus;
  author_id: string;
  author_name: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  views_count: number;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
}

export type ArticleStatus = "draft" | "published" | "archived";

export type ArticleCategory =
  | "news"
  | "industry_insights"
  | "startup_tips"
  | "investment_guide"
  | "company_updates"
  | "market_analysis"
  | "founder_stories"
  | "investor_spotlight";

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  category: ArticleCategory;
  tags: string[];
  status: ArticleStatus;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
}

export interface UpdateArticleData extends Partial<CreateArticleData> {
  id: string;
}

export interface ArticleFilter {
  category?: ArticleCategory;
  status?: ArticleStatus;
  author_id?: string;
  is_featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ArticleServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedArticles {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Category display names
export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  news: "News",
  industry_insights: "Industry Insights",
  startup_tips: "Startup Tips",
  investment_guide: "Investment Guide",
  company_updates: "Company Updates",
  market_analysis: "Market Analysis",
  founder_stories: "Founder Stories",
  investor_spotlight: "Investor Spotlight",
};

// Status display names
export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};
