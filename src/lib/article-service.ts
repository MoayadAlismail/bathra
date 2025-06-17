import { supabase } from "./supabase";
import {
  Article,
  CreateArticleData,
  UpdateArticleData,
  ArticleFilter,
  ArticleServiceResponse,
  PaginatedArticles,
  ArticleStatus,
} from "./article-types";

// Generate a URL-friendly slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

class ArticleService {
  // Get all published articles for public viewing
  async getPublishedArticles(
    filters?: Omit<ArticleFilter, "status">
  ): Promise<ArticleServiceResponse<PaginatedArticles>> {
    try {
      const page = Math.max(
        1,
        Math.floor((filters?.offset || 0) / (filters?.limit || 10)) + 1
      );
      const limit = Math.min(50, Math.max(1, filters?.limit || 10));
      const offset = (page - 1) * limit;

      let query = supabase
        .from("articles")
        .select("*", { count: "exact" })
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }

      if (filters?.is_featured !== undefined) {
        query = query.eq("is_featured", filters.is_featured);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`
        );
      }

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: {
          articles: data || [],
          total: count || 0,
          page,
          limit,
          totalPages,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get all articles for admin management
  async getAllArticles(
    filters?: ArticleFilter
  ): Promise<ArticleServiceResponse<PaginatedArticles>> {
    try {
      const page = Math.max(
        1,
        Math.floor((filters?.offset || 0) / (filters?.limit || 10)) + 1
      );
      const limit = Math.min(50, Math.max(1, filters?.limit || 10));
      const offset = (page - 1) * limit;

      let query = supabase
        .from("articles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }

      if (filters?.author_id) {
        query = query.eq("author_id", filters.author_id);
      }

      if (filters?.is_featured !== undefined) {
        query = query.eq("is_featured", filters.is_featured);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`
        );
      }

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: {
          articles: data || [],
          total: count || 0,
          page,
          limit,
          totalPages,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get a single article by ID
  async getArticleById(id: string): Promise<ArticleServiceResponse<Article>> {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get a single published article by slug
  async getPublishedArticleBySlug(
    slug: string
  ): Promise<ArticleServiceResponse<Article>> {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      // Increment view count
      await this.incrementViewCount(data.id);

      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Create a new article
  async createArticle(
    articleData: CreateArticleData,
    authorId: string,
    authorName: string
  ): Promise<ArticleServiceResponse<Article>> {
    try {
      const slug = generateSlug(articleData.title);
      const now = new Date().toISOString();

      const newArticle = {
        ...articleData,
        slug,
        author_id: authorId,
        author_name: authorName,
        created_at: now,
        updated_at: now,
        published_at: articleData.status === "published" ? now : null,
        views_count: 0,
        tags: articleData.tags || [],
      };

      const { data, error } = await supabase
        .from("articles")
        .insert(newArticle)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Update an existing article
  async updateArticle(
    articleData: UpdateArticleData
  ): Promise<ArticleServiceResponse<Article>> {
    try {
      const updateData: Partial<Article> = {
        ...articleData,
        updated_at: new Date().toISOString(),
      };

      // Update slug if title changed
      if (articleData.title) {
        updateData.slug = generateSlug(articleData.title);
      }

      // Update published_at if status changes to published
      if (articleData.status === "published") {
        const { data: existingArticle } = await supabase
          .from("articles")
          .select("published_at")
          .eq("id", articleData.id)
          .single();

        if (!existingArticle?.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from("articles")
        .update(updateData)
        .eq("id", articleData.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Delete an article
  async deleteArticle(id: string): Promise<ArticleServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Increment view count
  async incrementViewCount(id: string): Promise<void> {
    try {
      await supabase.rpc("increment_article_views", { article_id: id });
    } catch (error) {
      console.error("Failed to increment view count:", error);
    }
  }

  // Get featured articles
  async getFeaturedArticles(
    limit = 5
  ): Promise<ArticleServiceResponse<Article[]>> {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get recent articles
  async getRecentArticles(
    limit = 5
  ): Promise<ArticleServiceResponse<Article[]>> {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get articles by category
  async getArticlesByCategory(
    category: string,
    limit = 10
  ): Promise<ArticleServiceResponse<Article[]>> {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .eq("category", category)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }
}

export const articleService = new ArticleService();
export default articleService;
