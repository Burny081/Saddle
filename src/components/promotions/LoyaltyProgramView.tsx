import { useState, useEffect } from 'react';
import { Award, TrendingUp, Gift, Star, Users, Crown, Medal, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import type { CustomerLoyalty } from '@/types/promotions';
import { getTierBenefits } from '@/types/promotions';

export default function LoyaltyProgramView() {
  const [customers, setCustomers] = useState<CustomerLoyalty[]>([]);

  // Sample data
  useEffect(() => {
    const sampleCustomers: CustomerLoyalty[] = [
      {
        customerId: '1',
        customerName: 'Jean Dupont',
        totalPoints: 15000,
        availablePoints: 12000,
        pointsEarned: 15000,
        pointsRedeemed: 3000,
        totalSpent: 750000,
        tier: 'silver',
        tierProgress: 75,
        joinedAt: new Date('2023-01-15'),
        lastActivityAt: new Date('2024-01-20')
      },
      {
        customerId: '2',
        customerName: 'Marie Martin',
        totalPoints: 45000,
        availablePoints: 40000,
        pointsEarned: 50000,
        pointsRedeemed: 10000,
        totalSpent: 2500000,
        tier: 'gold',
        tierProgress: 50,
        joinedAt: new Date('2022-06-10'),
        lastActivityAt: new Date('2024-01-21')
      },
      {
        customerId: '3',
        customerName: 'Pierre Dubois',
        totalPoints: 75000,
        availablePoints: 75000,
        pointsEarned: 75000,
        pointsRedeemed: 0,
        totalSpent: 5200000,
        tier: 'platinum',
        tierProgress: 100,
        joinedAt: new Date('2021-03-20'),
        lastActivityAt: new Date('2024-01-22')
      },
      {
        customerId: '4',
        customerName: 'Sophie Bernard',
        totalPoints: 3000,
        availablePoints: 3000,
        pointsEarned: 3000,
        pointsRedeemed: 0,
        totalSpent: 150000,
        tier: 'bronze',
        tierProgress: 30,
        joinedAt: new Date('2023-11-01'),
        lastActivityAt: new Date('2024-01-18')
      }
    ];
    setCustomers(sampleCustomers);
  }, []);

  const getTierIcon = (tier: CustomerLoyalty['tier']) => {
    switch (tier) {
      case 'platinum':
        return <Crown className="h-5 w-5 text-purple-600" />;
      case 'gold':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'silver':
        return <Medal className="h-5 w-5 text-gray-400" />;
      default:
        return <Award className="h-5 w-5 text-orange-600" />;
    }
  };

  const getTierColor = (tier: CustomerLoyalty['tier']) => {
    switch (tier) {
      case 'platinum':
        return 'bg-purple-100 text-purple-700';
      case 'gold':
        return 'bg-yellow-100 text-yellow-700';
      case 'silver':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-orange-100 text-orange-700';
    }
  };

  const totalMembers = customers.length;
  const totalPoints = customers.reduce((sum, c) => sum + c.totalPoints, 0);
  const activeMembers = customers.filter(c => {
    const daysSinceActivity = (Date.now() - c.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceActivity <= 30;
  }).length;

  const tierDistribution = {
    platinum: customers.filter(c => c.tier === 'platinum').length,
    gold: customers.filter(c => c.tier === 'gold').length,
    silver: customers.filter(c => c.tier === 'silver').length,
    bronze: customers.filter(c => c.tier === 'bronze').length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gift className="h-8 w-8 text-blue-600" />
            Programme de Fidélité
          </h1>
          <p className="text-gray-600 mt-2">Récompensez vos clients fidèles</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Membres</p>
                <p className="text-3xl font-bold text-blue-600">{totalMembers}</p>
              </div>
              <Users className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Membres actifs</p>
                <p className="text-3xl font-bold text-green-600">{activeMembers}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Points en circulation</p>
                <p className="text-3xl font-bold text-purple-600">{totalPoints.toLocaleString()}</p>
              </div>
              <Star className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Membres Platinum</p>
                <p className="text-3xl font-bold text-yellow-600">{tierDistribution.platinum}</p>
              </div>
              <Crown className="h-10 w-10 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Info */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration du Programme</CardTitle>
          <CardDescription>Paramètres actuels du programme de fidélité</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Points par 100 FCFA dépensés</p>
              <p className="text-2xl font-bold text-blue-600">1 point</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Valeur d'un point</p>
              <p className="text-2xl font-bold text-green-600">10 FCFA</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Points minimum pour échanger</p>
              <p className="text-2xl font-bold text-purple-600">1000 points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier System */}
      <Card>
        <CardHeader>
          <CardTitle>Système de Niveaux</CardTitle>
          <CardDescription>Avantages par niveau de fidélité</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bronze */}
            <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-6 w-6 text-orange-600" />
                <h3 className="font-bold text-orange-900">Bronze</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">0 - 500K FCFA</p>
              <p className="text-xs text-gray-600 mb-3">{tierDistribution.bronze} membres</p>
              <ul className="space-y-1 text-xs">
                {getTierBenefits('bronze').map((benefit, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-orange-600">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Silver */}
            <div className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <Medal className="h-6 w-6 text-gray-500" />
                <h3 className="font-bold text-gray-900">Silver</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">500K - 2M FCFA</p>
              <p className="text-xs text-gray-600 mb-3">{tierDistribution.silver} membres</p>
              <ul className="space-y-1 text-xs">
                {getTierBenefits('silver').map((benefit, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-gray-500">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gold */}
            <div className="p-4 border-2 border-yellow-300 rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <h3 className="font-bold text-yellow-900">Gold</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">2M - 5M FCFA</p>
              <p className="text-xs text-gray-600 mb-3">{tierDistribution.gold} membres</p>
              <ul className="space-y-1 text-xs">
                {getTierBenefits('gold').map((benefit, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-yellow-600">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platinum */}
            <div className="p-4 border-2 border-purple-300 rounded-lg bg-purple-50">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-6 w-6 text-purple-600" />
                <h3 className="font-bold text-purple-900">Platinum</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">5M+ FCFA</p>
              <p className="text-xs text-gray-600 mb-3">{tierDistribution.platinum} membres</p>
              <ul className="space-y-1 text-xs">
                {getTierBenefits('platinum').map((benefit, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-purple-600">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Membres du Programme</CardTitle>
          <CardDescription>Liste des clients inscrits au programme de fidélité</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {customers.map(customer => (
              <div
                key={customer.customerId}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{customer.customerName}</h3>
                      <Badge className={getTierColor(customer.tier)}>
                        <span className="flex items-center gap-1">
                          {getTierIcon(customer.tier)}
                          {customer.tier.toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {customer.availablePoints.toLocaleString()} points disponibles
                      </span>
                      <span>
                        Total dépensé: {customer.totalSpent.toLocaleString()} FCFA
                      </span>
                      <span>
                        Membre depuis: {customer.joinedAt.toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {/* Progress to next tier */}
                    {customer.tier !== 'platinum' && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Progression vers le niveau suivant</span>
                          <span>{customer.tierProgress}%</span>
                        </div>
                        <Progress value={customer.tierProgress} className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Right */}
                  <div className="text-right space-y-1">
                    <p className="text-2xl font-bold text-blue-600">
                      {customer.totalPoints.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">points totaux</p>
                    <p className="text-xs text-green-600">
                      +{customer.pointsEarned.toLocaleString()} gagnés
                    </p>
                    <p className="text-xs text-red-600">
                      -{customer.pointsRedeemed.toLocaleString()} utilisés
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
