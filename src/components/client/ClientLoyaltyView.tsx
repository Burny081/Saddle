import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabaseClient';
import { 
  Gift, 
  TrendingUp, 
  Award,
  Star,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface LoyaltyData {
  available_points: number;
  total_points_earned: number;
  current_tier: string;
  tier_start_date: string;
}

interface Transaction {
  id: string;
  points: number;
  description: string;
  transaction_type: string;
  created_at: string;
}

const TIER_CONFIG = {
  bronze: { name: 'Bronze', color: 'bg-amber-600', minPoints: 0, nextTier: 1000 },
  silver: { name: 'Silver', color: 'bg-gray-400', minPoints: 1000, nextTier: 2500 },
  gold: { name: 'Gold', color: 'bg-yellow-500', minPoints: 2500, nextTier: null },
};

export default function ClientLoyaltyView() {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyData();
  }, [user]);

  const fetchLoyaltyData = async () => {
    if (!user) return;
    
    try {
      // Fetch loyalty data
      const { data: loyalty } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('customer_id', user.id)
        .single();

      if (loyalty) {
        setLoyaltyData(loyalty);
      }

      // Fetch transactions
      const { data: txns } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (txns) {
        setTransactions(txns);
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tier = loyaltyData ? TIER_CONFIG[loyaltyData.current_tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.bronze : TIER_CONFIG.bronze;
  const totalPoints = loyaltyData?.total_points_earned || 0;
  const availablePoints = loyaltyData?.available_points || 0;
  const progressPercent = tier.nextTier ? Math.min((totalPoints / tier.nextTier) * 100, 100) : 100;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Programme Fidélité</h1>
        <p className="text-gray-600 dark:text-gray-400">Gagnez des points à chaque achat et profitez d'avantages exclusifs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Points Card */}
        <Card className="lg:col-span-2 dark:bg-slate-800 border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm">Vos Points Disponibles</p>
                <h2 className="text-5xl font-bold mt-1">{availablePoints}</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Gift className="h-12 w-12" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-purple-100 text-xs">Total Gagné</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-purple-100 text-xs">Niveau Actuel</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{tier.name}</p>
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Progression vers le prochain niveau */}
          {tier.nextTier && (
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progression vers {TIER_CONFIG[Object.keys(TIER_CONFIG).find(key => TIER_CONFIG[key as keyof typeof TIER_CONFIG].minPoints === tier.nextTier) as keyof typeof TIER_CONFIG]?.name}
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {totalPoints} / {tier.nextTier}
                </p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                  role="progressbar"
                  aria-label={`Progression vers ${tier.nextTier ? TIER_CONFIG[Object.keys(TIER_CONFIG).find(key => TIER_CONFIG[key as keyof typeof TIER_CONFIG].minPoints === tier.nextTier) as keyof typeof TIER_CONFIG]?.name : 'niveau maximum'}`}
                  aria-valuenow={Math.round(progressPercent)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Plus que {tier.nextTier - totalPoints} points pour débloquer le niveau supérieur !
              </p>
            </CardContent>
          )}
        </Card>

        {/* Avantages du niveau */}
        <Card className="dark:bg-slate-800 border-0 shadow-xl">
          <CardHeader className="border-b dark:border-slate-700">
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Avantages {tier.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  1 point = 10 FCFA de réduction
                </span>
              </li>
              {tier.name === 'Silver' && (
                <>
                  <li className="flex items-start gap-2">
                    <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Réductions exclusives jusqu'à 5%
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Accès prioritaire aux nouvelles collections
                    </span>
                  </li>
                </>
              )}
              {tier.name === 'Gold' && (
                <>
                  <li className="flex items-start gap-2">
                    <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Réductions exclusives jusqu'à 10%
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Livraison gratuite sur toutes les commandes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Cadeaux d'anniversaire exclusifs
                    </span>
                  </li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Historique des transactions */}
      <Card className="dark:bg-slate-800 border-0 shadow-xl">
        <CardHeader className="border-b dark:border-slate-700">
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            Historique des Points
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucune transaction pour le moment</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Effectuez votre premier achat pour commencer à gagner des points !
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${transaction.points > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {transaction.points > 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Gift className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        transaction.points > 0
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }
                    >
                      {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
