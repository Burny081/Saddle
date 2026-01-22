import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { ArticleFormDialog } from './ArticleFormDialog';
import { CategoryManager, useCategories, getCategoryById } from './CategoryManager';
import type { Article } from '@/types/compatibility';
import { formatCurrency } from '@/config/constants';

interface ArticlesViewProps {
  initialCreate?: boolean;
  onBack?: () => void;
}

export function ArticlesView({ initialCreate = false, onBack }: ArticlesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(initialCreate);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>(undefined);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { user } = useAuth();
  const { t } = useLanguage();
  const { articles, addArticle, updateArticle, deleteArticle } = useData();
  const articleCategories = useCategories('article');

  const canEdit = user && ['superadmin', 'admin'].includes(user.role);

  // Legacy categories from articles (for backwards compatibility)
  const legacyCategories = Array.from(new Set(articles.map((a) => a.category)));
  // Merge with managed categories
  const formCategories = [...new Set([...legacyCategories, ...articleCategories.map(c => c.name)])];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Match by category - check both category name and managed category
    let matchesCategory = !selectedCategory;
    if (selectedCategory) {
      const managedCategory = getCategoryById(selectedCategory);
      if (managedCategory) {
        matchesCategory = article.category === managedCategory.name;
      } else {
        matchesCategory = article.category === selectedCategory;
      }
    }

    return matchesSearch && matchesCategory;
  });

  const totalValue = articles.reduce((sum, a) => sum + a.price * a.stock, 0);
  const lowStock = articles.filter((a) => a.stock < a.minStock).length;

  const handleOpenCreate = () => {
    setEditingArticle(undefined);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (article: Article) => {
    setEditingArticle(article);
    setIsDialogOpen(true);
  };

  const handleViewDetails = (article: Article) => {
    setSelectedArticle(article);
    setShowDetailsDialog(true);
  };

  const handleSubmit = (data: Omit<Article, 'id'>) => {
    if (editingArticle) {
      updateArticle(editingArticle.id, data);
    } else {
      addArticle(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-10 w-10"
              aria-label={t('action.backToDashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">{t('articles.title')}</h1>
            <p className="mt-1 text-muted-foreground">
              {t('articles.subtitle')}
            </p>
          </div>
        </div>
        {canEdit && (
          <Button
            onClick={handleOpenCreate}
            className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('articles.newArticle')}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('articles.totalArticles')}</p>
                <p className="mt-1 text-3xl font-bold">{articles.length}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('articles.stockValue')}</p>
                <p className="mt-1 text-3xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 text-white">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('articles.lowStock')}</p>
                <p className="mt-1 text-3xl font-bold">{lowStock}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-3 text-white">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={t('catalog.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <CategoryManager
              type="article"
              compact
              selectedCategoryId={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            {canEdit && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowCategoryManager(!showCategoryManager)}
                className="flex-shrink-0"
                title={t('categories.manage')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Manager Panel */}
      {showCategoryManager && canEdit && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <CategoryManager type="article" />
        </motion.div>
      )}

      {/* Articles grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group overflow-hidden border-none shadow-lg transition-all hover:shadow-2xl">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Stock badge */}
                <div className="absolute right-3 top-3">
                  <Badge
                    className={
                      article.stock < article.minStock
                        ? 'bg-red-600'
                        : article.stock < article.minStock * 1.5
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                    }
                  >
                    {article.stock} {article.unit}
                  </Badge>
                </div>

                {/* Category */}
                <div className="absolute bottom-3 left-3">
                  <Badge variant="outline" className="border-white bg-white/20 text-white backdrop-blur-sm">
                    {article.category}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-bold line-clamp-1">{article.name}</h3>
                <p className="mb-4 text-sm text-slate-600 line-clamp-2 dark:text-slate-400">
                  {article.description}
                </p>

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">{t('articles.sellingPrice')}</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(article.price)}
                    </p>
                  </div>
                  {canEdit && (
                    <div>
                      <p className="text-xs text-slate-500">{t('articles.purchasePrice')}</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(article.purchasePrice)}
                      </p>
                    </div>
                  )}
                </div>

                {canEdit && (
                  <div className="mb-4 rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{t('articles.margin')}</span>
                      <span className="font-bold text-green-600">
                        {((article.price - article.purchasePrice) / article.purchasePrice * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Warning for low stock */}
                {article.stock < article.minStock && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>{t('articles.stockBelowMinimum', { min: article.minStock })}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(article)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t('label.details')}
                  </Button>
                  {canEdit && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(article)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm(t('confirm.deleteArticle'))) {
                            deleteArticle(article.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card className="border-none p-12 text-center shadow-lg">
          <Package className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <h3 className="mb-2 text-xl font-semibold">{t('articles.noArticlesFound')}</h3>
          <p className="text-slate-600 dark:text-slate-400">
            {t('articles.noArticlesFoundHint')}
          </p>
        </Card>
      )}

      {/* Form Dialog */}
      <ArticleFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingArticle}
        categories={formCategories}
      />

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('articles.articleDetails')}</DialogTitle>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4 mb-4">
                    {selectedArticle.image && (
                      <img 
                        src={selectedArticle.image} 
                        alt={selectedArticle.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{selectedArticle.name}</h3>
                      <Badge className="mt-1">{selectedArticle.category}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{selectedArticle.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <p className="text-xs text-muted-foreground">{t('articles.salePrice')}</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(selectedArticle.price)}</p>
                    </div>
                    {canEdit && (
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <p className="text-xs text-muted-foreground">{t('articles.purchasePrice')}</p>
                        <p className="text-lg font-bold">{formatCurrency(selectedArticle.purchasePrice)}</p>
                      </div>
                    )}
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <p className="text-xs text-muted-foreground">{t('stock.currentStock')}</p>
                      <p className={`text-lg font-bold ${selectedArticle.stock < selectedArticle.minStock ? 'text-red-600' : ''}`}>
                        {selectedArticle.stock} {t('stock.units')}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <p className="text-xs text-muted-foreground">{t('articles.minStock')}</p>
                      <p className="text-lg font-bold">{selectedArticle.minStock} {t('stock.units')}</p>
                    </div>
                  </div>

                  {selectedArticle.stock < selectedArticle.minStock && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>{t('articles.stockBelowMinimum', { min: selectedArticle.minStock })}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
