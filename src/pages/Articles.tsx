import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, User, Eye, Filter, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Pagination } from "@/components/ui/pagination";
import { articleService } from "@/lib/article-service";
import {
  Article,
  ArticleCategory,
  ARTICLE_CATEGORY_LABELS,
  PaginatedArticles,
} from "@/lib/article-types";

const ITEMS_PER_PAGE = 12;

const Articles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  const loadArticles = async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm || undefined,
        category: (selectedCategory as ArticleCategory) || undefined,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      };

      const response = await articleService.getPublishedArticles(filters);

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else if (response.data) {
        setArticles(response.data.articles);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [currentPage, searchTerm, selectedCategory]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? "" : value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Draft";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header Section */}
      <div className="pt-28 pb-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Latest News & Insights
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest trends, insights, and news from the
              startup and investment world.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory || "all"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(ARTICLE_CATEGORY_LABELS).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Results count */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-8"
            >
              <p className="text-muted-foreground">
                {total === 0
                  ? "No articles found"
                  : `${total} article${total !== 1 ? "s" : ""} found`}
              </p>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading articles...</p>
            </motion.div>
          )}

          {/* Articles Grid */}
          {!loading && articles.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="h-full hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
                    onClick={() => navigate(`/articles/${article.slug}`)}
                  >
                    {article.featured_image_url && (
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={article.featured_image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {article.is_featured && (
                          <Badge className="absolute top-2 left-2 bg-primary">
                            Featured
                          </Badge>
                        )}
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">
                          {
                            ARTICLE_CATEGORY_LABELS[
                              article.category as ArticleCategory
                            ]
                          }
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>
                      {article.excerpt && (
                        <CardDescription className="line-clamp-3">
                          {article.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {article.author_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(article.published_at)}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views_count}
                        </span>
                      </div>
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {article.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{article.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && articles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>No Articles Found</CardTitle>
                  <CardDescription>
                    {searchTerm || selectedCategory
                      ? "Try adjusting your search criteria or filters."
                      : "No articles have been published yet. Check back soon!"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                loading={loading}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Articles;
