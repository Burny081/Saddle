import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History, TrendingUp, TrendingDown, ArrowRightLeft, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import * as StockAPI from '@/utils/apiStock';

interface StockHistoryPanelProps {
  articleId?: string;
}

export function StockHistoryPanel({ articleId }: StockHistoryPanelProps) {
  const [movements, setMovements] = useState<StockAPI.StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out' | 'transfer'>('all');
  const [filterDays, setFilterDays] = useState('7');

  useEffect(() => {
    loadMovements();
  }, [articleId, filterType, filterDays]);

  const loadMovements = async () => {
    setIsLoading(true);
    try {
      const days = parseInt(filterDays);
      const allMovements = await StockAPI.getStockMovements(articleId);
      
      // Filter by date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      let filtered = allMovements.filter(m => m.created_at && new Date(m.created_at) >= cutoffDate);
      
      // Filter by type
      if (filterType !== 'all') {
        filtered = filtered.filter(m => m.movement_type === filterType);
      }
      
      setMovements(filtered);
    } catch (error) {
      console.error('Error loading stock movements:', error);
      setMovements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
      default:
        return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    const badges = {
      in: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Entrée</Badge>,
      out: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Sortie</Badge>,
      transfer: <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Transfert</Badge>,
    };
    return badges[type as keyof typeof badges] || <Badge>Autre</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Aujourd'hui ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Hier ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays <= 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des mouvements
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filterDays} onValueChange={setFilterDays}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 derniers jours</SelectItem>
                <SelectItem value="30">30 derniers jours</SelectItem>
                <SelectItem value="90">90 derniers jours</SelectItem>
                <SelectItem value="365">1 an</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="in">Entrées</SelectItem>
                <SelectItem value="out">Sorties</SelectItem>
                <SelectItem value="transfer">Transferts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun mouvement trouvé</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {movements.map((movement) => (
                <motion.div
                  key={movement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getMovementIcon(movement.movement_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getMovementBadge(movement.movement_type)}
                      <span className="text-sm font-medium">
                        {movement.quantity} unités
                      </span>
                    </div>
                    {movement.notes && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {movement.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(movement.created_at || new Date().toISOString())}
                      </span>
                      {movement.performed_by_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {movement.performed_by_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {movement.movement_type === 'in' && (
                        <span className="text-green-600">+{movement.quantity}</span>
                      )}
                      {movement.movement_type === 'out' && (
                        <span className="text-red-600">-{movement.quantity}</span>
                      )}
                      {movement.movement_type === 'transfer' && (
                        <span className="text-blue-600">→ {movement.quantity}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
