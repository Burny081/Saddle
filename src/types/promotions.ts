// Types pour le système de promotions et fidélité

export type DiscountType = 'percentage' | 'fixed' | 'bogo' | 'free_shipping';

export type PromoStatus = 'active' | 'inactive' | 'expired' | 'scheduled';

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number; // Percentage (0-100) or fixed amount
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number; // Total usage limit
  usageCount: number; // Current usage count
  usagePerCustomer?: number; // Max uses per customer
  startDate: Date;
  endDate: Date;
  status: PromoStatus;
  applicableCategories?: string[]; // Empty = all categories
  applicableProducts?: string[]; // Empty = all products
  excludedProducts?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  pointsPerFCFA: number; // Points earned per FCFA spent
  pointsValue: number; // Value of 1 point in FCFA
  minPointsToRedeem: number;
  isActive: boolean;
  bonusMultiplier?: number; // Special bonus periods (e.g., 2x points)
  bonusStartDate?: Date;
  bonusEndDate?: Date;
}

export interface CustomerLoyalty {
  customerId: string;
  customerName: string;
  totalPoints: number;
  availablePoints: number; // Total - redeemed
  pointsEarned: number;
  pointsRedeemed: number;
  totalSpent: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tierProgress: number; // Percentage to next tier
  joinedAt: Date;
  lastActivityAt: Date;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'earn' | 'redeem' | 'expire' | 'bonus';
  points: number;
  description: string;
  relatedSaleId?: string;
  createdAt: Date;
}

export interface PromoValidationResult {
  isValid: boolean;
  error?: string;
  discountAmount?: number;
  finalTotal?: number;
  message?: string;
}

// Helper functions
export function calculateDiscount(
  promo: PromoCode,
  subtotal: number,
  items: Array<{ id: string; price: number; quantity: number; category?: string }>
): number {
  // Check minimum purchase
  if (promo.minPurchaseAmount && subtotal < promo.minPurchaseAmount) {
    return 0;
  }

  let discount = 0;

  switch (promo.discountType) {
    case 'percentage':
      discount = (subtotal * promo.discountValue) / 100;
      break;
    
    case 'fixed':
      discount = promo.discountValue;
      break;
    
    case 'bogo':
      // Buy One Get One: find eligible items
      const eligibleItems = items.filter(item => {
        if (promo.applicableProducts?.length) {
          return promo.applicableProducts.includes(item.id);
        }
        if (promo.applicableCategories?.length && item.category) {
          return promo.applicableCategories.includes(item.category);
        }
        return true;
      });
      
      // Sort by price descending
      eligibleItems.sort((a, b) => b.price - a.price);
      
      // Apply BOGO discount (50% off the cheaper items)
      let bogoDiscount = 0;
      for (let i = 0; i < eligibleItems.length; i += 2) {
        if (i + 1 < eligibleItems.length) {
          const cheaperPrice = Math.min(eligibleItems[i].price, eligibleItems[i + 1].price);
          bogoDiscount += cheaperPrice * Math.min(eligibleItems[i + 1].quantity, eligibleItems[i].quantity);
        }
      }
      discount = bogoDiscount;
      break;
    
    case 'free_shipping':
      // Handled separately in checkout
      discount = 0;
      break;
  }

  // Apply max discount cap if set
  if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
    discount = promo.maxDiscountAmount;
  }

  return Math.min(discount, subtotal); // Never discount more than subtotal
}

export function validatePromoCode(
  promo: PromoCode | null,
  subtotal: number,
  _customerId: string,
  customerUsageCount: number = 0
): PromoValidationResult {
  if (!promo) {
    return {
      isValid: false,
      error: 'Code promo invalide'
    };
  }

  const now = new Date();

  // Check status
  if (promo.status !== 'active') {
    return {
      isValid: false,
      error: 'Ce code promo n\'est pas actif'
    };
  }

  // Check dates
  if (now < promo.startDate) {
    return {
      isValid: false,
      error: 'Ce code promo n\'est pas encore valide'
    };
  }

  if (now > promo.endDate) {
    return {
      isValid: false,
      error: 'Ce code promo a expiré'
    };
  }

  // Check usage limit
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    return {
      isValid: false,
      error: 'Ce code promo a atteint sa limite d\'utilisation'
    };
  }

  // Check per-customer usage limit
  if (promo.usagePerCustomer && customerUsageCount >= promo.usagePerCustomer) {
    return {
      isValid: false,
      error: 'Vous avez déjà utilisé ce code promo le nombre maximum de fois'
    };
  }

  // Check minimum purchase
  if (promo.minPurchaseAmount && subtotal < promo.minPurchaseAmount) {
    return {
      isValid: false,
      error: `Montant minimum de ${promo.minPurchaseAmount} FCFA requis`
    };
  }

  return {
    isValid: true,
    message: 'Code promo valide'
  };
}

export function calculateLoyaltyPoints(amount: number, program: LoyaltyProgram): number {
  let points = amount * program.pointsPerFCFA;
  
  // Apply bonus multiplier if active
  if (program.bonusMultiplier && program.bonusStartDate && program.bonusEndDate) {
    const now = new Date();
    if (now >= program.bonusStartDate && now <= program.bonusEndDate) {
      points *= program.bonusMultiplier;
    }
  }
  
  return Math.floor(points);
}

export function getTierName(totalSpent: number): CustomerLoyalty['tier'] {
  if (totalSpent >= 5000000) return 'platinum'; // 5M FCFA
  if (totalSpent >= 2000000) return 'gold';     // 2M FCFA
  if (totalSpent >= 500000) return 'silver';    // 500K FCFA
  return 'bronze';
}

export function getTierProgress(totalSpent: number): number {
  const tier = getTierName(totalSpent);
  
  switch (tier) {
    case 'bronze':
      return (totalSpent / 500000) * 100;
    case 'silver':
      return ((totalSpent - 500000) / 1500000) * 100;
    case 'gold':
      return ((totalSpent - 2000000) / 3000000) * 100;
    case 'platinum':
      return 100;
  }
}

export function getTierBenefits(tier: CustomerLoyalty['tier']): string[] {
  const benefits = {
    bronze: [
      'Points de fidélité sur chaque achat',
      'Accès aux ventes privées'
    ],
    silver: [
      'Tous les avantages Bronze',
      '5% de réduction supplémentaire',
      'Livraison gratuite dès 50,000 FCFA'
    ],
    gold: [
      'Tous les avantages Silver',
      '10% de réduction supplémentaire',
      'Livraison gratuite sans minimum',
      'Support prioritaire'
    ],
    platinum: [
      'Tous les avantages Gold',
      '15% de réduction supplémentaire',
      'Produits exclusifs',
      'Conseiller dédié'
    ]
  };
  
  return benefits[tier];
}
