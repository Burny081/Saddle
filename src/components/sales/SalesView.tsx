import { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, DollarSign, FileText, Download, Eye, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
// Data context used indirectly through store access
import { useLanguage } from '@/contexts/LanguageContext';
import { useStoreAccess } from '@/contexts/StoreAccessContext';
import { useStoreFilteredSales } from '@/hooks/useStoreAccess';
import { CreateSaleView } from './CreateSaleView';
import { generateInvoice } from '@/utils/pdfGenerator';
import { formatCurrency } from '@/config/constants';
import type { Sale } from '@/types/compatibility';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';

interface SalesViewProps {
  initialCreate?: boolean;
  onBack?: () => void;
}

export function SalesView({ initialCreate = false, onBack }: SalesViewProps) {
  const [isCreating, setIsCreating] = useState(initialCreate);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { t, language } = useLanguage();
  const { stores } = useStoreAccess();
  
  // Use store-filtered sales
  const sales = useStoreFilteredSales();

  if (isCreating) {
    return <CreateSaleView onBack={() => setIsCreating(false)} />;
  }

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalPaid = sales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total, 0);
  const pendingAmount = totalSales - totalPaid;

  // Helper to get store name - used in sale details
  const getStoreName = (storeId?: string): string | null => {
    if (!storeId) return null;
    const store = stores.find(s => s.id === storeId);
    return store?.shortName || store?.city || null;
  };
  // Silence unused warning - function is available for future use
  void getStoreName;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold">{t('sales.title')}</h1>
            <p className="mt-1 text-muted-foreground">
              {t('sales.subtitle')}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {t('sales.newSale')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('sales.totalSales')}</p>
                <p className="mt-1 text-3xl font-bold">{formatCurrency(totalSales)}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('reports.paidAmount')}</p>
                <p className="mt-1 text-3xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 text-white">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('sales.pending')}</p>
                <p className="mt-1 text-3xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-3 text-white">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales list */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>{t('sales.salesList')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sales.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t('empty.noData')}</p>
            ) : (
              sales.map((sale, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg border border-slate-200 p-6 dark:border-slate-800"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-xl font-bold">{sale.clientName}</h3>
                        <Badge
                          className={
                            sale.status === 'completed'
                              ? 'bg-green-600'
                              : 'bg-yellow-600'
                          }
                        >
                          {sale.status === 'completed' ? t('sales.paid') : t('sales.pending')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t('label.date')}: {new Date(sale.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')} • {t('articles.title')}: {sale.items.length}
                        {sale.createdByName && (
                          <> • {t('sales.createdBy')}: {sale.createdByName}</>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('label.total')}</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(sale.total)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedSale(sale)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('label.details')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateInvoice(sale)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sale Details Dialog */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('label.details')} - {selectedSale?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('clients.title')}</p>
                  <p className="font-semibold">{selectedSale.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('label.date')}</p>
                  <p className="font-semibold">{new Date(selectedSale.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('label.status')}</p>
                  <Badge className={selectedSale.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}>
                    {selectedSale.status === 'completed' ? t('sales.paid') : t('sales.pending')}
                  </Badge>
                </div>
                {selectedSale.createdByName && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('sales.createdBy')}</p>
                    <p className="font-semibold">{selectedSale.createdByName}</p>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <p className="font-semibold mb-2">{t('articles.title')}</p>
                <div className="space-y-2">
                  {selectedSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} x {formatCurrency(item.price)}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.quantity * item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4 flex justify-between items-center">
                <p className="text-lg font-bold">{t('field.total')}</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedSale.total)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
