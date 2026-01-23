import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabaseClient';
import { useTheme } from 'next-themes';
import { 
  ShoppingBag, 
  FileText, 
  Clock, 
  TrendingUp, 
  Gift,
  Star,
  Package,
  CreditCard,
  MapPin,
  Heart,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface OrderStats {
  total: number;
  pending: number;
  completed: number;
  totalSpent: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  status: string;
  items_count: number;
}

interface LoyaltyInfo {
  points: number;
  tier: string;
  nextTierPoints: number;
}

interface ClientDashboardProps {
  onNavigate?: (view: string) => void;
}

export default function ClientDashboard({ onNavigate }: ClientDashboardProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    completed: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyInfo>({
    points: 0,
    tier: 'Bronze',
    nextTierPoints: 1000
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [user]);

  const fetchClientData = async () => {
    if (!user) return;

    try {
      // Récupérer les commandes
      const { data: orders } = await supabase
        .from('sales')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (orders) {
        const stats = {
          total: orders.length,
          pending: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
          completed: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
          totalSpent: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        };
        setOrderStats(stats);
        setRecentOrders(orders.map(o => ({
          id: o.id,
          order_number: o.sale_number || `CMD-${o.id.substring(0, 8)}`,
          created_at: o.created_at,
          total_amount: o.total_amount || 0,
          status: o.status || 'pending',
          items_count: o.items?.length || 0
        })));
      }

      // Récupérer les points de fidélité
      const { data: loyaltyData } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('client_id', user.id)
        .single();

      if (loyaltyData) {
        setLoyalty({
          points: loyaltyData.available_points || 0,
          tier: loyaltyData.current_tier || 'Bronze',
          nextTierPoints: loyaltyData.current_tier === 'Bronze' ? 1000 : 
                         loyaltyData.current_tier === 'Silver' ? 5000 : 10000
        });
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      processing: 'En cours',
      completed: 'Terminée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      rejected: 'Rejetée'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Gold':
        return 'from-yellow-500 to-orange-500';
      case 'Silver':
        return 'from-gray-400 to-gray-600';
      default:
        return 'from-orange-700 to-orange-900';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Gold':
        return '👑';
      case 'Silver':
        return '⭐';
      default:
        return '🥉';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen transition-colors duration-300">
      {/* Hero Section - Bienvenue */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800 p-8 text-white shadow-2xl transition-colors duration-300">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-white opacity-10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 dark:text-blue-200 text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Bienvenue sur votre espace client
              </p>
              <h1 className="text-4xl font-bold mt-2 mb-1">
                Bonjour, {user?.name?.split(' ')[0]} ! 👋
              </h1>
              <p className="text-blue-100 dark:text-blue-200 text-lg">
                Découvrez vos commandes et profitez de vos avantages fidélité
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              {/* Toggle Dark Mode */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
              >
                {theme === 'dark' ? (
                  <Sun className="h-6 w-6 text-white" />
                ) : (
                  <Moon className="h-6 w-6 text-white" />
                )}
              </Button>
              
              <div className={`bg-gradient-to-br ${getTierColor(loyalty.tier)} rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform`}>
                <div className="text-center">
                  <div className="text-5xl mb-2">{getTierIcon(loyalty.tier)}</div>
                  <p className="text-sm font-medium opacity-90">Statut</p>
                  <p className="text-2xl font-bold">{loyalty.tier}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Commandes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{orderStats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl p-4 shadow-lg">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              Toutes vos commandes
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">En Cours</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{orderStats.pending}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-2xl p-4 shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-orange-600 dark:text-orange-400">
              <Package className="h-3 w-3 mr-1" />
              En traitement
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Points Fidélité</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{loyalty.points.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-2xl p-4 shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-purple-600 dark:text-purple-400">
              <Star className="h-3 w-3 mr-1" />
              {loyalty.nextTierPoints - loyalty.points} pts pour niveau suivant
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Dépensé</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {orderStats.totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl p-4 shadow-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              FCFA
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commandes récentes */}
        <Card className="lg:col-span-2 border-0 shadow-lg dark:bg-slate-800">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Mes Commandes Récentes
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-blue-50 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-gray-300"
                onClick={() => onNavigate?.('orders')}
              >
                Voir tout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucune commande</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Commencez vos achats dès maintenant !</p>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={() => onNavigate?.('shop')}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Parcourir le catalogue
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 rounded-xl hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white dark:bg-slate-600 rounded-lg p-3 shadow-sm group-hover:shadow-md transition-shadow">
                        <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{order.order_number}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{order.total_amount.toLocaleString()} FCFA</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.items_count} article(s)</p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides & Programme fidélité */}
        <div className="space-y-6">
          {/* Programme fidélité */}
          <Card className="border-0 shadow-lg overflow-hidden dark:bg-slate-800">
            <div className={`bg-gradient-to-br ${getTierColor(loyalty.tier)} p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Programme Fidélité</h3>
                <Gift className="h-6 w-6" />
              </div>
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">{getTierIcon(loyalty.tier)}</div>
                <p className="text-2xl font-bold">{loyalty.tier}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Points disponibles</span>
                  <span className="font-bold">{loyalty.points.toLocaleString()}</span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    role="progressbar"
                    aria-label="Progression vers le niveau suivant"
                    aria-valuenow={Math.round(Math.min((loyalty.points / loyalty.nextTierPoints) * 100, 100))}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{ width: `${Math.min((loyalty.points / loyalty.nextTierPoints) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1 text-center">
                  {loyalty.nextTierPoints - loyalty.points} points pour le niveau suivant
                </p>
              </div>
            </div>
            <CardContent className="pt-4 dark:bg-slate-800">
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                onClick={() => onNavigate?.('loyalty')}
              >
                <Star className="h-4 w-4 mr-2" />
                Utiliser mes points
              </Button>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card className="border-0 shadow-lg dark:bg-slate-800">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800">
              <CardTitle className="text-base flex items-center gap-2 dark:text-white">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 dark:bg-slate-800">
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-gray-300 transition-all"
                onClick={() => onNavigate?.('shop')}
              >
                <ShoppingBag className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400" />
                Nouvelle commande
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-green-50 hover:border-green-300 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-gray-300 transition-all"
                onClick={() => onNavigate?.('quotes')}
              >
                <FileText className="h-4 w-4 mr-3 text-green-600 dark:text-green-400" />
                Mes devis
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-gray-300 transition-all"
                onClick={() => onNavigate?.('favorites')}
              >
                <Heart className="h-4 w-4 mr-3 text-purple-600 dark:text-purple-400" />
                Mes favoris
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-gray-300 transition-all"
                onClick={() => onNavigate?.('settings')}
              >
                <MapPin className="h-4 w-4 mr-3 text-orange-600 dark:text-orange-400" />
                Mes adresses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
