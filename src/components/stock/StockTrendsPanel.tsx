import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  Line
} from 'recharts';
import { useData } from '@/contexts/DataContext';

interface StockTrendsProps {
  selectedArticleId?: string;
}

export function StockTrendsPanel({ selectedArticleId }: StockTrendsProps) {
  const { articles, sales } = useData();
  const [articleId, setArticleId] = useState(selectedArticleId || '');
  const [timeRange, setTimeRange] = useState('30');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (articleId) {
      calculateTrends();
    }
  }, [articleId, timeRange, sales, articles]);

  useEffect(() => {
    if (selectedArticleId) {
      setArticleId(selectedArticleId);
    } else if (articles.length > 0 && !articleId) {
      setArticleId(articles[0].id);
    }
  }, [selectedArticleId, articles]);

  const calculateTrends = () => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    const days = parseInt(timeRange);
    const data: any[] = [];

    // Get current stock
    let currentStock = article.stock;

    // Calculate stock for each day going backwards
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      // Find sales for this day
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dayStart && saleDate <= dayEnd;
      });

      let daySold = 0;
      daySales.forEach(sale => {
        const item = sale.items.find(i => i.id === articleId && i.type === 'article');
        if (item) {
          daySold += item.quantity;
        }
      });

      // Calculate estimated stock for that day
      const estimatedStock = i === 0 ? currentStock : currentStock + daySold;
      
      data.push({
        date: dayStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        stock: estimatedStock,
        ventes: daySold,
        minStock: article.minStock
      });

      currentStock = estimatedStock;
    }

    setChartData(data);
  };

  const selectedArticle = articles.find(a => a.id === articleId);
  
  // Calculate trend
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (chartData.length >= 2) {
    const firstStock = chartData[0]?.stock || 0;
    const lastStock = chartData[chartData.length - 1]?.stock || 0;
    const diff = lastStock - firstStock;
    if (diff > 0) trend = 'up';
    else if (diff < 0) trend = 'down';
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Tendances de Stock
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={articleId} onValueChange={setArticleId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sélectionner un article" />
              </SelectTrigger>
              <SelectContent>
                {articles.map(article => (
                  <SelectItem key={article.id} value={article.id}>
                    {article.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedArticle && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock actuel</p>
                <p className="text-2xl font-bold">
                  {selectedArticle.stock} <span className="text-sm font-normal">{selectedArticle.unit}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {trend === 'up' && (
                  <>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">En hausse</span>
                  </>
                )}
                {trend === 'down' && (
                  <>
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-600">En baisse</span>
                  </>
                )}
                {trend === 'stable' && (
                  <span className="text-sm font-medium text-muted-foreground">Stable</span>
                )}
              </div>
            </div>
          </div>
        )}
        
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>Sélectionnez un article pour voir les tendances</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="stock"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorStock)"
                name="Stock"
              />
              <Line
                type="monotone"
                dataKey="minStock"
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                name="Stock minimum"
              />
              <Line
                type="monotone"
                dataKey="ventes"
                stroke="#10b981"
                strokeWidth={2}
                name="Ventes quotidiennes"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
