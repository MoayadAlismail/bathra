import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Star,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { articleService } from "@/lib/article-service";
import {
  Article,
  CreateArticleData,
  UpdateArticleData,
  ArticleCategory,
  ArticleStatus,
  ARTICLE_CATEGORY_LABELS,
  ARTICLE_STATUS_LABELS,
  PaginatedArticles,
} from "@/lib/article-types";

const ITEMS_PER_PAGE = 10;

// Article Form Component (moved outside to prevent recreating on each render)
const ArticleForm = ({
  formData,
  setFormData,
  tagsInput,
  setTagsInput,
}: {
  formData: CreateArticleData;
  setFormData: (data: CreateArticleData) => void;
  tagsInput: string;
  setTagsInput: (tags: string) => void;
}) => (
  <div className="space-y-4 sm:space-y-6">
    {/* Basic Info */}
    <div className="space-y-3 sm:space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter article title..."
          className="text-base" // Prevent zoom on mobile
        />
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) =>
            setFormData({ ...formData, excerpt: e.target.value })
          }
          placeholder="Brief description of the article..."
          rows={3}
          className="text-base resize-none" // Prevent zoom and resize on mobile
        />
      </div>

      <div>
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          placeholder="Write your article content..."
          rows={8}
          className="text-base resize-none min-h-[200px]" // Better mobile UX
        />
      </div>
    </div>

    {/* Media */}
    <div>
      <Label htmlFor="featured_image">Featured Image URL</Label>
      <Input
        id="featured_image"
        value={formData.featured_image_url}
        onChange={(e) =>
          setFormData({ ...formData, featured_image_url: e.target.value })
        }
        placeholder="https://example.com/image.jpg"
        className="text-base"
      />
    </div>

    {/* Categorization - Stack on mobile */}
    <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value as ArticleCategory })
          }
        >
          <SelectTrigger className="text-base">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ARTICLE_CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) =>
            setFormData({ ...formData, status: value as ArticleStatus })
          }
        >
          <SelectTrigger className="text-base">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ARTICLE_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div>
      <Label htmlFor="tags">Tags (comma-separated)</Label>
      <Input
        id="tags"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        placeholder="startup, funding, technology..."
        className="text-base"
      />
    </div>

    {/* Featured Toggle */}
    <div className="flex items-center space-x-2 py-2">
      <Switch
        id="featured"
        checked={formData.is_featured}
        onCheckedChange={(checked) =>
          setFormData({ ...formData, is_featured: checked })
        }
      />
      <Label htmlFor="featured">Featured Article</Label>
    </div>

    {/* SEO - Collapsible on mobile */}
    <div className="space-y-3 sm:space-y-4">
      <h4 className="font-semibold text-sm sm:text-base">SEO Settings</h4>
      <div>
        <Label htmlFor="seo_title">SEO Title</Label>
        <Input
          id="seo_title"
          value={formData.seo_title}
          onChange={(e) =>
            setFormData({ ...formData, seo_title: e.target.value })
          }
          placeholder="SEO optimized title..."
          className="text-base"
        />
      </div>
      <div>
        <Label htmlFor="seo_description">SEO Description</Label>
        <Textarea
          id="seo_description"
          value={formData.seo_description}
          onChange={(e) =>
            setFormData({ ...formData, seo_description: e.target.value })
          }
          placeholder="SEO description for search engines..."
          rows={3}
          className="text-base resize-none"
        />
      </div>
    </div>
  </div>
);

const BlogManagement = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<CreateArticleData>({
    title: "",
    content: "",
    excerpt: "",
    featured_image_url: "",
    category: "news",
    tags: [],
    status: "draft",
    is_featured: false,
    seo_title: "",
    seo_description: "",
  });

  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    loadArticles();
  }, [searchTerm, statusFilter, categoryFilter, currentPage]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;

      const filters = {
        limit: ITEMS_PER_PAGE,
        offset,
        search: searchTerm || undefined,
        status:
          statusFilter !== "all" ? (statusFilter as ArticleStatus) : undefined,
        category:
          categoryFilter !== "all"
            ? (categoryFilter as ArticleCategory)
            : undefined,
      };

      const result = await articleService.getAllArticles(filters);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (result.data) {
        setArticles(result.data.articles);
        setTotalPages(result.data.totalPages);
        setTotal(result.data.total);
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

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      featured_image_url: "",
      category: "news",
      tags: [],
      status: "draft",
      is_featured: false,
      seo_title: "",
      seo_description: "",
    });
    setTagsInput("");
  };

  const handleCreateArticle = async () => {
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const tagsArray = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const articleData: CreateArticleData = {
        ...formData,
        tags: tagsArray,
        excerpt: formData.excerpt || formData.content.substring(0, 200) + "...",
      };

      const result = await articleService.createArticle(
        articleData,
        user.id,
        profile.name || user.email || "Admin"
      );

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Article created successfully",
      });

      setIsCreateModalOpen(false);
      resetForm();
      loadArticles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create article",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditArticle = async () => {
    if (!editingArticle) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const tagsArray = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const updateData: UpdateArticleData = {
        id: editingArticle.id,
        ...formData,
        tags: tagsArray,
        excerpt: formData.excerpt || formData.content.substring(0, 200) + "...",
      };

      const result = await articleService.updateArticle(updateData);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Article updated successfully",
      });

      setIsEditModalOpen(false);
      setEditingArticle(null);
      resetForm();
      loadArticles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update article",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const result = await articleService.deleteArticle(id);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Article deleted successfully",
      });

      loadArticles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      featured_image_url: article.featured_image_url || "",
      category: article.category,
      tags: article.tags,
      status: article.status,
      is_featured: article.is_featured,
      seo_title: article.seo_title || "",
      seo_description: article.seo_description || "",
    });
    setTagsInput(article.tags.join(", "));
    setIsEditModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Blog Management
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create and manage blog articles for your platform
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Create New Article</DialogTitle>
              <DialogDescription>
                Write and publish a new blog article for your platform.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <ArticleForm
                formData={formData}
                setFormData={setFormData}
                tagsInput={tagsInput}
                setTagsInput={setTagsInput}
              />
            </div>
            <DialogFooter className="flex-shrink-0 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateArticle}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? "Creating..." : "Create Article"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(ARTICLE_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Filter by category" />
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
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Loading articles...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Articles List or Empty State */}
      {!loading && (
        <>
          {articles.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  No articles found
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  categoryFilter !== "all"
                    ? "Try adjusting your search criteria or filters."
                    : "Create your first blog article to get started"}
                </p>
                <Dialog
                  open={isCreateModalOpen}
                  onOpenChange={setIsCreateModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Article
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                      <DialogTitle>Create New Article</DialogTitle>
                      <DialogDescription>
                        Write and publish a new blog article for your platform.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-1">
                      <ArticleForm
                        formData={formData}
                        setFormData={setFormData}
                        tagsInput={tagsInput}
                        setTagsInput={setTagsInput}
                      />
                    </div>
                    <DialogFooter className="flex-shrink-0 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreateModalOpen(false);
                          resetForm();
                        }}
                        disabled={submitting}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateArticle}
                        disabled={submitting}
                        className="w-full sm:w-auto"
                      >
                        {submitting ? "Creating..." : "Create Article"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Results Count */}
              <div className="text-xs sm:text-sm text-muted-foreground">
                Showing {articles.length} of {total} articles
              </div>

              {/* Articles Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">
                            Title
                          </th>
                          <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">
                            Category
                          </th>
                          <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">
                            Status
                          </th>
                          <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">
                            Views
                          </th>
                          <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">
                            Created
                          </th>
                          <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {articles.map((article) => (
                          <tr
                            key={article.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="p-2 sm:p-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                {article.is_featured && (
                                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-xs sm:text-sm truncate">
                                    {article.title}
                                  </div>
                                  {article.excerpt && (
                                    <div className="text-xs text-muted-foreground line-clamp-1 mt-1 hidden sm:block">
                                      {article.excerpt}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-2 sm:p-4">
                              <Badge variant="secondary" className="text-xs">
                                {
                                  ARTICLE_CATEGORY_LABELS[
                                    article.category as ArticleCategory
                                  ]
                                }
                              </Badge>
                            </td>
                            <td className="p-2 sm:p-4">
                              <Badge
                                variant={
                                  article.status === "published"
                                    ? "default"
                                    : article.status === "draft"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {ARTICLE_STATUS_LABELS[article.status]}
                              </Badge>
                            </td>
                            <td className="p-2 sm:p-4">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span className="text-xs sm:text-sm">
                                  {article.views_count}
                                </span>
                              </div>
                            </td>
                            <td className="p-2 sm:p-4">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                  {formatDate(article.created_at)}
                                </span>
                              </div>
                            </td>
                            <td className="p-2 sm:p-4">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditModal(article)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="w-[95vw] max-w-lg">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Article
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "
                                        {article.title}"? This action cannot be
                                        undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="w-full sm:w-auto">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteArticle(article.id)
                                        }
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* FIXED: Single Edit Modal outside the map */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[95vw] max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>
              Update your blog article details.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            <ArticleForm
              formData={formData}
              setFormData={setFormData}
              tagsInput={tagsInput}
              setTagsInput={setTagsInput}
            />
          </div>
          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingArticle(null);
                resetForm();
              }}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditArticle}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? "Updating..." : "Update Article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;
