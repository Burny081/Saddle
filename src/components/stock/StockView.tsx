import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, TrendingUp, TrendingDown, AlertTriangle, Plus, Minus, ArrowLeft, ArrowRightLeft, Store, ShoppingCart, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAlerts } from '@/contexts/AlertContext';
import { formatCurrency, getFromStorage } from '@/config/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import * as StockAPI from '@/utils/apiStock';
import { ScrollArea } from '@/app/components/ui/scroll-area';

// Store interface (simplified)
interface StoreInfo {
  id: string;
  name: string;
  shortName: string;
  city: string;
  isActive: boolean;
}

const STORAGE_KEY_STORES = 'sps_stores';

interface StockViewProps {
  onBack?: () => void;
}

export function StockView({ onBack }: StockViewProps) {
  const { articles, updateArticle } = useData();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addAlert } = useAlerts();
  
  const [stockDialog, setStockDialog] = useState<{ type: 'entry' | 'exit'; articleId: string; articleName: string } | null>(null);
  const [quantity, setQuantity] = useState('');
  
  // Transfer stock dialog
  const [transferDialog, setTransferDialog] = useState<{ articleId: string; articleName: string; currentStock: number } | null>(null);
  const [transferQuantity, setTransferQuantity] = useState('');
  const [fromStoreId, setFromStoreId] = useState('');
  const [toStoreId, setToStoreId] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState('');
  
  // Auto-reorder state
  const [reorderDialog, setReorderDialog] = useState(false);
  const [reorderSuggestions, setReorderSuggestions] = useState<StockAPI.ReorderSuggestion[]>([]);
  const [isCheckingReorder, setIsCheckingReorder] = useState(false);
  const [isProcessingReorder, setIsProcessingReorder] = useState(false);
  
  // Load stores from localStorage
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [currentStoreId, setCurrentStoreId] = useState<string>('');
  
  useEffect(() => {
    const savedStores = getFromStorage<StoreInfo[]>(STORAGE_KEY_STORES, []);
    setStores(savedStores.filter(s => s.isActive));
    if (savedStores.length > 0) {
      setCurrentStoreId(savedStores[0].id);
    }
  }, []);
  
  // Check if user can transfer stock
  const canTransferStock = user && ['superadmin', 'admin', 'manager'].includes(user.role);
  
  const totalStock = articles.reduce((sum, a) => sum + a.stock, 0);
  const lowStock = articles.filter((a) => a.stock < a.minStock).length;
  const stockValue = articles.reduce((sum, a) => sum + a.price * a.stock, 0);

  const handleStockOperation = (type: 'entry' | 'exit', articleId: string, articleName: string) => {
    setStockDialog({ type, articleId, articleName });
    setQuantity('');
  };

  const handleConfirmStock = async () => {
    if (!stockDialog || !quantity || !user) return;
    const article = articles.find(a => a.id === stockDialog.articleId);
    if (!article) return;
    
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) return;
    
    try {
      const newStock = stockDialog.type === 'entry' 
        ? article.stock + qty 
        : Math.max(0, article.stock - qty);
      
      // Record the movement in DB
      await StockAPI.createStockMovement({
        store_id: currentStoreId || stores[0]?.id,
        article_id: stockDialog.articleId,
        movement_type: stockDialog.type === 'entry' ? 'in' : 'out',
        quantity: qty,
        notes: stockDialog.type === 'entry' ? 'Entrée manuelle' : 'Sortie manuelle',
        performed_by: user.id,
        reference_type: 'manual',
      });
      
      // Update local state
      updateArticle(stockDialog.articleId, { stock: newStock });
      
      // Create alert for stock movement
      addAlert({
        type: 'info',
        title: 'Mouvement de stock',
        message: `${stockDialog.type === 'entry' ? 'Entrée' : 'Sortie'} de stock: ${qty} ${article.unit} de "${article.name}" par ${user?.name || 'Inconnu'}`,
      });
    } catch (error) {
      console.error('Error recording stock movement:', error);
      // Fallback: still update local state
      const newStock = stockDialog.type === 'entry' 
        ? article.stock + qty 
        : Math.max(0, article.stock - qty);
      updateArticle(stockDialog.articleId, { stock: newStock });
    } finally {
      setStockDialog(null);
      setQuantity('');
    }
  };
  
  // Handle stock transfer between stores
  const handleOpenTransfer = (articleId?: string, articleName?: string, currentStock?: number) => {
    if (articleId && articleName && currentStock !== undefined) {
      setTransferDialog({ articleId, articleName, currentStock });
      setSelectedArticleId(articleId);
    } else {
      // Open with article selector
      setTransferDialog({ articleId: '', articleName: '', currentStock: 0 });
      setSelectedArticleId('');
    }
    setTransferQuantity('');
    setFromStoreId('');
    setToStoreId('');
  };

  // Handle article change in transfer dialog
  const handleArticleChange = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (article) {
      setSelectedArticleId(articleId);
      setTransferDialog({ articleId: article.id, articleName: article.name, currentStock: article.stock });
    }
  };
  
  const handleConfirmTransfer = async () => {
    if (!transferDialog || !selectedArticleId || !transferQuantity || !fromStoreId || !toStoreId || !user) return;
    if (fromStoreId === toStoreId) return;
    
    const qty = parseInt(transferQuantity);
    if (isNaN(qty) || qty <= 0) return;
    
    const fromStore = stores.find(s => s.id === fromStoreId);
    const toStore = stores.find(s => s.id === toStoreId);
    
    if (!fromStore || !toStore) return;
    
    try {
      // Use the API to transfer stock between stores
      await StockAPI.transferStock(
        fromStoreId,
        toStoreId,
        selectedArticleId,
        qty,
        user.id,
        `Transfert de ${fromStore.shortName || fromStore.name} vers ${toStore.shortName || toStore.name}`
      );
      
      // Create alert to track the transfer
      addAlert({
        type: 'info',
        title: 'Transfert de stock',
        message: `Transfert de stock: ${qty} unités de "${transferDialog.articleName}" de ${fromStore.shortName || fromStore.name} vers ${toStore.shortName || toStore.name} par ${user?.name || 'Inconnu'}`,
      });
    } catch (error) {
      console.error('Error transferring stock:', error);
      // Still create alert for tracking
      addAlert({
        type: 'warning',
        title: 'Transfert de stock (local)',
        message: `Transfert de stock (local): ${qty} unités de "${transferDialog.articleName}" de ${fromStore.shortName || fromStore.name} vers ${toStore.shortName || toStore.name} par ${user?.name || 'Inconnu'}`,
      });
    } finally {
      setTransferDialog(null);
      setTransferQuantity('');
      setFromStoreId('');
      setToStoreId('');
      setSelectedArticleId('');
    }
  };

  // Auto-reorder functions
  const handleCheckReorder = async () => {
    setIsCheckingReorder(true);
    try {
      // For local mock data, generate suggestions based on articles with low stock
      const lowStockArticles = articles.filter(a => a.stock < a.minStock);
      
      const suggestions: StockAPI.ReorderSuggestion[] = lowStockArticles.map(article => ({
        article_id: article.id,
        article_name: article.name,
        current_stock: article.stock,
        min_stock: article.minStock,
        suggested_quantity: Math.ceil(article.minStock * 1.5) - article.stock,
        store_id: currentStoreId || 'default',
        store_name: stores.find(s => s.id === currentStoreId)?.name || 'Magasin principal',
      }));
      
      setReorderSuggestions(suggestions);
      setReorderDialog(true);
    } catch (error) {
      console.error('Error checking reorder:', error);
      addAlert({
        type: 'error',
        title: t('stock.reorderError'),
        message: t('stock.reorderErrorMessage'),
      });
    } finally {
      setIsCheckingReorder(false);
    }
  };

  const handleProcessReorder = async () => {
    if (!user || reorderSuggestions.length === 0) return;
    
    setIsProcessingReorder(true);
    try {
      // Group by supplier (for now, create one order for all items without supplier)
      const orderItems = reorderSuggestions.map(s => ({
        article_id: s.article_id,
        article_name: s.article_name,
        quantity: s.suggested_quantity,
        unit_price: articles.find(a => a.id === s.article_id)?.purchasePrice || 0,
      }));
      
      const totalAmount = orderItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      
      addAlert({
        type: 'success',
        title: t('stock.reorderCreated'),
        message: `${t('stock.reorderCreatedMessage')}: ${reorderSuggestions.length} ${t('articles.title').toLowerCase()}, ${formatCurrency(totalAmount)}`,
      });
      
      setReorderDialog(false);
      setReorderSuggestions([]);
    } catch (error) {
      console.error('Error processing reorder:', error);
      addAlert({
        type: 'error',
        title: t('stock.reorderError'),
        message: t('stock.reorderProcessError'),
      });
    } finally {
      setIsProcessingReorder(false);
    }
  };

  return (
    <div className="space-y-6">
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
          <h1 className="text-3xl font-bold">{t('stock.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('stock.subtitle')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('stock.totalUnits')}</p>
                <p className="mt-1 text-3xl font-bold">{totalStock.toLocaleString()}</p>
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
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('stock.stockValue')}</p>
                <p className="mt-1 text-3xl font-bold">{formatCurrency(stockValue)}</p>
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
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('stock.stockAlerts')}</p>
                <p className="mt-1 text-3xl font-bold">{lowStock}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-3 text-white">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock movements */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <span>{t('stock.movements')}</span>
            <div className="flex gap-2 flex-wrap">
              {/* Auto-reorder button */}
              {canTransferStock && lowStock > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  onClick={handleCheckReorder}
                  disabled={isCheckingReorder}
                >
                  {isCheckingReorder ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-4 w-4" />
                  )}
                  {t('stock.autoReorder')} ({lowStock})
                </Button>
              )}
              {canTransferStock && stores.length >= 2 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  onClick={() => handleOpenTransfer()}
                  disabled={articles.length === 0}
                >
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  {t('stock.transfer')}
                </Button>
              )}
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleStockOperation('entry', articles[0]?.id || '', t('stock.entry'))}
                disabled={articles.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('stock.entry')}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleStockOperation('exit', articles[0]?.id || '', t('stock.exit'))}
                disabled={articles.length === 0}
              >
                <Minus className="mr-2 h-4 w-4" />
                {t('stock.exit')}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="pb-3 text-left text-sm font-semibold">{t('articles.title')}</th>
                  <th className="pb-3 text-left text-sm font-semibold">{t('label.category')}</th>
                  <th className="pb-3 text-right text-sm font-semibold">{t('stock.currentStock')}</th>
                  <th className="pb-3 text-right text-sm font-semibold">{t('stock.minThreshold')}</th>
                  <th className="pb-3 text-right text-sm font-semibold">{t('label.value')}</th>
                  <th className="pb-3 text-center text-sm font-semibold">{t('label.status')}</th>
                  <th className="pb-3 text-right text-sm font-semibold">{t('label.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article, index) => (
                  <motion.tr
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-slate-100 dark:border-slate-900"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={article.image}
                          alt={article.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold">{article.name}</p>
                          <p className="text-xs text-slate-500">{article.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant="outline">{article.category}</Badge>
                    </td>
                    <td className="py-4 text-right font-bold">
                      {article.stock.toLocaleString()}
                    </td>
                    <td className="py-4 text-right text-slate-500">
                      {article.minStock.toLocaleString()}
                    </td>
                    <td className="py-4 text-right font-semibold">
                      {formatCurrency(article.stock * article.price)}
                    </td>
                    <td className="py-4 text-center">
                      {article.stock < article.minStock ? (
                        <Badge className="bg-red-600">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {t('stock.critical')}
                        </Badge>
                      ) : article.stock < article.minStock * 1.5 ? (
                        <Badge className="bg-yellow-600">
                          <TrendingDown className="mr-1 h-3 w-3" />
                          {t('stock.low')}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-600">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          {t('stock.normal')}
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStockOperation('entry', article.id, article.name)}
                          title={t('stock.entry')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStockOperation('exit', article.id, article.name)}
                          title={t('stock.exit')}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        {canTransferStock && stores.length >= 2 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-purple-600 border-purple-300 hover:bg-purple-50"
                            onClick={() => handleOpenTransfer(article.id, article.name, article.stock)}
                            title={t('stock.transfer')}
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Entry/Exit Dialog */}
      <Dialog open={!!stockDialog} onOpenChange={() => setStockDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockDialog?.type === 'entry' ? t('stock.entry') : t('stock.exit')} - {stockDialog?.articleName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('field.quantity')}</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t('field.quantity')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialog(null)}>
              {t('action.cancel')}
            </Button>
            <Button 
              onClick={handleConfirmStock}
              disabled={!quantity || parseInt(quantity) <= 0}
              className={stockDialog?.type === 'entry' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {t('action.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Transfer Dialog */}
      <Dialog open={!!transferDialog} onOpenChange={() => setTransferDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-purple-600" />
              {t('stock.transfer')}
            </DialogTitle>
            <DialogDescription>
              {t('stock.transferDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Article Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t('articles.title')}
              </Label>
              <Select value={selectedArticleId} onValueChange={handleArticleChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('stock.selectArticle')} />
                </SelectTrigger>
                <SelectContent>
                  {articles.map(article => (
                    <SelectItem key={article.id} value={article.id}>
                      <div className="flex items-center gap-2">
                        <span>{article.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {article.stock} {article.unit}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  {t('stock.fromStore')}
                </Label>
                <Select value={fromStoreId} onValueChange={setFromStoreId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('stock.selectStore')} />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map(store => (
                      <SelectItem key={store.id} value={store.id} disabled={store.id === toStoreId}>
                        {store.shortName || store.name} ({store.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  {t('stock.toStore')}
                </Label>
                <Select value={toStoreId} onValueChange={setToStoreId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('stock.selectStore')} />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map(store => (
                      <SelectItem key={store.id} value={store.id} disabled={store.id === fromStoreId}>
                        {store.shortName || store.name} ({store.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('field.quantity')}</Label>
              <Input
                type="number"
                min="1"
                value={transferQuantity}
                onChange={(e) => setTransferQuantity(e.target.value)}
                placeholder={t('field.quantity')}
              />
              {transferDialog && (
                <p className="text-xs text-muted-foreground">
                  {t('stock.currentStock')}: {transferDialog.currentStock} {t('stock.units')}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialog(null)}>
              {t('action.cancel')}
            </Button>
            <Button 
              onClick={handleConfirmTransfer}
              disabled={!selectedArticleId || !transferQuantity || parseInt(transferQuantity) <= 0 || !fromStoreId || !toStoreId || fromStoreId === toStoreId}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              {t('stock.confirmTransfer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-Reorder Dialog */}
      <Dialog open={reorderDialog} onOpenChange={setReorderDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
              {t('stock.autoReorderTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('stock.autoReorderDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {reorderSuggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('stock.noReorderNeeded')}</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {reorderSuggestions.map((suggestion) => {
                    const article = articles.find(a => a.id === suggestion.article_id);
                    return (
                      <div 
                        key={suggestion.article_id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{suggestion.article_name}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <TrendingDown className="h-3 w-3 text-red-500" />
                              {t('stock.current')}: {suggestion.current_stock}
                            </span>
                            <span>
                              {t('stock.min')}: {suggestion.min_stock}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            +{suggestion.suggested_quantity} {t('stock.units')}
                          </Badge>
                          {article && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatCurrency(suggestion.suggested_quantity * article.purchasePrice)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
            {reorderSuggestions.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('stock.totalItems')}:</span>
                  <span className="font-bold">{reorderSuggestions.length} {t('articles.title').toLowerCase()}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm font-medium">{t('stock.estimatedCost')}:</span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(
                      reorderSuggestions.reduce((sum, s) => {
                        const article = articles.find(a => a.id === s.article_id);
                        return sum + s.suggested_quantity * (article?.purchasePrice || 0);
                      }, 0)
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReorderDialog(false)}>
              {t('action.cancel')}
            </Button>
            <Button 
              onClick={handleProcessReorder}
              disabled={reorderSuggestions.length === 0 || isProcessingReorder}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isProcessingReorder ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-4 w-4" />
              )}
              {t('stock.createSupplierOrder')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
