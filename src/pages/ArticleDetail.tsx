import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Tag,
  Share2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { articleService } from "@/lib/article-service";
import {
  Article,
  ARTICLE_CATEGORY_LABELS,
  ArticleCategory,
} from "@/lib/article-types";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { homeTranslations } from "@/utils/language/home";

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  // Helper function to get category translations
  const getCategoryTranslation = (category: ArticleCategory) => {
    const categoryMap = {
      news: homeTranslations.categoryNews[language],
      industry_insights: homeTranslations.categoryIndustryInsights[language],
      startup_tips: homeTranslations.categoryStartupTips[language],
      investment_guide: homeTranslations.categoryInvestmentGuide[language],
      company_updates: homeTranslations.categoryCompanyUpdates[language],
      market_analysis: homeTranslations.categoryMarketAnalysis[language],
      founder_stories: homeTranslations.categoryFounderStories[language],
      investor_spotlight: homeTranslations.categoryInvestorSpotlight[language],
    };
    return categoryMap[category] || category;
  };

  useEffect(() => {
    if (!slug) {
      navigate("/articles");
      return;
    }

    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    if (!slug) return;

    setLoading(true);
    try {
      const response = await articleService.getPublishedArticleBySlug(slug);

      if (response.error) {
        toast({
          title: homeTranslations.articlesErrorTitle[language],
          description: response.error,
          variant: "destructive",
        });
        navigate("/articles");
      } else if (response.data) {
        setArticle(response.data);
        // Load related articles from the same category
        loadRelatedArticles(response.data.category, response.data.id);
      }
    } catch (error) {
      toast({
        title: homeTranslations.articlesErrorTitle[language],
        description: homeTranslations.articleDetailLoadError[language],
        variant: "destructive",
      });
      navigate("/articles");
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedArticles = async (
    category: ArticleCategory,
    currentArticleId: string
  ) => {
    try {
      const response = await articleService.getArticlesByCategory(category, 4);
      if (response.data) {
        // Filter out the current article
        const filtered = response.data.filter((a) => a.id !== currentArticleId);
        setRelatedArticles(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to load related articles:", error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return homeTranslations.articlesDraftStatus[language];
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: homeTranslations.articleDetailLinkCopied[language],
          description:
            homeTranslations.articleDetailLinkCopiedDescription[language],
        });
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: homeTranslations.articleDetailLinkCopied[language],
        description:
          homeTranslations.articleDetailLinkCopiedDescription[language],
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {homeTranslations.articleDetailLoadingText[language]}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-10">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">
                {homeTranslations.articleDetailNotFound[language]}
              </h1>
              <Button onClick={() => navigate("/articles")}>
                {homeTranslations.articleDetailBackToArticles[language]}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <article className="pt-28 pb-10">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/articles")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {homeTranslations.articleDetailBackToArticles[language]}
            </Button>
          </motion.div>

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            {/* Category and Featured Badge */}
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary">
                {getCategoryTranslation(article.category as ArticleCategory)}
              </Badge>
              {article.is_featured && (
                <Badge className="bg-primary">
                  {homeTranslations.articlesFeaturedBadge[language]}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {article.author_name}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(article.published_at)}
              </span>
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {article.views_count}{" "}
                {homeTranslations.articleDetailViews[language]}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {estimateReadingTime(article.content)}{" "}
                {homeTranslations.articleDetailMinRead[language]}
              </span>
            </div>

            {/* Share button */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                {homeTranslations.articleDetailShare[language]}
              </Button>
            </div>
          </motion.div>

          {/* Featured Image */}
          {article.featured_image_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <div className="relative h-64 md:h-96 overflow-hidden rounded-lg">
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div
              className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed
                [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h1]:mt-8
                [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-4 [&>h2]:mt-6
                [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-3 [&>h3]:mt-5
                [&>p]:mb-4 [&>p]:leading-7
                [&>ul]:mb-4 [&>ul]:ml-6 [&>ul]:list-disc
                [&>ol]:mb-4 [&>ol]:ml-6 [&>ol]:list-decimal
                [&>li]:mb-2
                [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:mb-4
                [&>code]:bg-muted [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm
                [&>pre]:bg-muted [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:mb-4
                [&>img]:rounded-lg [&>img]:mb-4 [&>img]:shadow-sm
                [&>a]:text-primary [&>a]:underline [&>a]:hover:text-primary/80"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </motion.div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold mb-3">
                {homeTranslations.articleDetailTags[language]}
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12"
            >
              <h3 className="text-2xl font-bold mb-6">
                {homeTranslations.articleDetailRelatedArticles[language]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Card
                    key={relatedArticle.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/articles/${relatedArticle.slug}`)}
                  >
                    {relatedArticle.featured_image_url && (
                      <div className="relative h-40 overflow-hidden rounded-t-lg">
                        <img
                          src={relatedArticle.featured_image_url}
                          alt={relatedArticle.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2">
                        {getCategoryTranslation(
                          relatedArticle.category as ArticleCategory
                        )}
                      </Badge>
                      <h4 className="font-semibold line-clamp-2 mb-2">
                        {relatedArticle.title}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedArticle.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default ArticleDetail;
