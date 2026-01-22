import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, TrendingDown, Package, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/config/constants';
import type { Article } from '@/types/compatibility';

interface StockAlert {
  article: Article;
  level: 'critical' | 'warning' | 'low';
  daysUntilEmpty: number;
  suggestedOrder: number;
}

export function StockAlertsPanel() {
  const { articles, sales } = useData();
  const [alerts, setAlerts] = useState<StockAlert[]>([]);

  useEffect(() => {
    calculateAlerts();
  }, [articles, sales]);

  const calculateAlerts = () => {
    const stockAlerts: StockAlert[] = [];

    articles.forEach(article => {
      // Calculate stock level percentage
      const stockPercentage = article.minStock > 0 
        ? (article.stock / article.minStock) * 100 
        : 100;

      // Calculate average daily sales (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= thirtyDaysAgo;
      });

      let totalSold = 0;
      recentSales.forEach(sale => {
        const item = sale.items.find(i => i.id === article.id && i.type === 'article');
        if (item) {
          totalSold += item.quantity;
        }
      });

      const avgDailySales = totalSold / 30;
      const daysUntilEmpty = avgDailySales > 0 ? Math.floor(article.stock / avgDailySales) : 999;

      // Determine alert level
      let level: 'critical' | 'warning' | 'low' | null = null;
      
      if (article.stock === 0) {
        level = 'critical';
      } else if (article.stock < article.minStock * 0.5) {
        level = 'critical';
      } else if (article.stock < article.minStock) {
        level = 'warning';
      } else if (stockPercentage < 150) {
        level = 'low';
      }

      if (level) {
        // Calculate suggested order quantity
        const optimalStock = article.minStock * 3; // 3x minimum stock
        const suggestedOrder = Math.max(0, optimalStock - article.stock);

        stockAlerts.push({
          article,
          level,
          daysUntilEmpty,
          suggestedOrder: Math.ceil(suggestedOrder)
        });
      }
    });

    // Sort by severity and days until empty
    stockAlerts.sort((a, b) => {
      const levelPriority = { critical: 3, warning: 2, low: 1 };
      const priorityDiff = levelPriority[b.level] - levelPriority[a.level];
      if (priorityDiff !== 0) return priorityDiff;
      return a.daysUntilEmpty - b.daysUntilEmpty;
    });

    setAlerts(stockAlerts);
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-50 border-red-200 dark:bg-red-950/20';
      case 'warning':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-950/20';
      case 'low':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'low':
        return <TrendingDown className="h-5 w-5 text-yellow-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge className="bg-red-600 text-white">Critique</Badge>;
      case 'warning':
        return <Badge className="bg-orange-600 text-white">Attention</Badge>;
      case 'low':
        return <Badge className="bg-yellow-600 text-white">Faible</Badge>;
      default:
        return <Badge>Normal</Badge>;
    }
  };

  const criticalCount = alerts.filter(a => a.level === 'critical').length;
  const warningCount = alerts.filter(a => a.level === 'warning').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertes de Stock
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} critique{criticalCount > 1 ? 's' : ''}</Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-orange-600">{warningCount} attention</Badge>
            )}
            {alerts.length === 0 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Tout va bien
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
            <p className="text-muted-foreground">Aucune alerte de stock</p>
            <p className="text-sm text-muted-foreground mt-1">Tous les articles ont un stock suffisant</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {alerts.map((alert, index) => {
                const stockPercentage = alert.article.minStock > 0
                  ? Math.min(100, (alert.article.stock / alert.article.minStock) * 100)
                  : 100;

                return (
                  <motion.div
                    key={alert.article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border ${getAlertColor(alert.level)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getAlertBadge(alert.level)}
                          <h4 className="font-semibold text-sm">{alert.article.name}</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Stock actuel</p>
                            <p className="text-lg font-bold">
                              {alert.article.stock} <span className="text-sm font-normal">{alert.article.unit}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Stock minimum</p>
                            <p className="text-lg font-bold text-muted-foreground">
                              {alert.article.minStock} <span className="text-sm font-normal">{alert.article.unit}</span>
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Niveau de stock</span>
                            <span className="font-medium">{stockPercentage.toFixed(0)}%</span>
                          </div>
                          <Progress 
                            value={stockPercentage} 
                            className={`h-2 ${
                              alert.level === 'critical' ? '[&>div]:bg-red-600' :
                              alert.level === 'warning' ? '[&>div]:bg-orange-600' :
                              '[&>div]:bg-yellow-600'
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Prévision</p>
                            <p className="text-sm font-medium">
                              {alert.daysUntilEmpty < 999 
                                ? `Rupture dans ${alert.daysUntilEmpty} jour${alert.daysUntilEmpty > 1 ? 's' : ''}`
                                : 'Aucune vente récente'
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Commande suggérée</p>
                            <p className="text-sm font-medium text-blue-600">
                              {alert.suggestedOrder} {alert.article.unit}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ≈ {formatCurrency(alert.suggestedOrder * (alert.article.purchasePrice || alert.article.price * 0.6))}
                            </p>
                          </div>
                        </div>

                        <Button 
                          size="sm" 
                          className="w-full mt-3"
                          variant={alert.level === 'critical' ? 'default' : 'outline'}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Commander {alert.suggestedOrder} {alert.article.unit}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
