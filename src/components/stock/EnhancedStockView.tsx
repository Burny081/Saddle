import { useState } from 'react';
import { motion } from 'motion/react';
import { Package, AlertTriangle, History, ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { StockView } from './StockView';
import { StockAlertsPanel } from './StockAlertsPanel';
import { StockHistoryPanel } from './StockHistoryPanel';
import { StockTrendsPanel } from './StockTrendsPanel';

interface EnhancedStockViewProps {
  onBack?: () => void;
}

export function EnhancedStockView({ onBack }: EnhancedStockViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              Gestion des Stocks
            </h1>
            <p className="text-muted-foreground mt-1">
              Suivi complet et analyse prédictive des stocks
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview" className="gap-2">
            <Package className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertes
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Tendances
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StockView onBack={onBack} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <StockAlertsPanel />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <StockTrendsPanel />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <StockHistoryPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
