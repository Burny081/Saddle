// API functions for promotions and loyalty management
import { supabase } from './supabaseClient';
import type { PromoCode, LoyaltyProgram, CustomerLoyalty, LoyaltyTransaction } from '@/types/promotions';

// Promo Codes
export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      startDate: new Date(item.start_date),
      endDate: new Date(item.end_date),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      discountType: item.discount_type,
      discountValue: item.discount_value,
      minPurchaseAmount: item.min_purchase_amount,
      maxDiscountAmount: item.max_discount_amount,
      usageLimit: item.usage_limit,
      usageCount: item.usage_count,
      usagePerCustomer: item.usage_per_customer,
      applicableCategories: item.applicable_categories,
      applicableProducts: item.applicable_products,
      excludedProducts: item.excluded_products,
      createdBy: item.created_by
    }));
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return [];
  }
}

export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) return null;

    return {
      ...data,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      discountType: data.discount_type,
      discountValue: data.discount_value,
      minPurchaseAmount: data.min_purchase_amount,
      maxDiscountAmount: data.max_discount_amount,
      usageLimit: data.usage_limit,
      usageCount: data.usage_count,
      usagePerCustomer: data.usage_per_customer,
      applicableCategories: data.applicable_categories,
      applicableProducts: data.applicable_products,
      excludedProducts: data.excluded_products,
      createdBy: data.created_by
    };
  } catch (error) {
    console.error('Error fetching promo code:', error);
    return null;
  }
}

export async function createPromoCode(promo: Omit<PromoCode, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<PromoCode> {
  const { data, error } = await supabase
    .from('promo_codes')
    .insert({
      code: promo.code.toUpperCase(),
      description: promo.description,
      discount_type: promo.discountType,
      discount_value: promo.discountValue,
      min_purchase_amount: promo.minPurchaseAmount,
      max_discount_amount: promo.maxDiscountAmount,
      usage_limit: promo.usageLimit,
      usage_count: 0,
      usage_per_customer: promo.usagePerCustomer,
      start_date: promo.startDate.toISOString(),
      end_date: promo.endDate.toISOString(),
      status: promo.status,
      applicable_categories: promo.applicableCategories,
      applicable_products: promo.applicableProducts,
      excluded_products: promo.excludedProducts,
      created_by: promo.createdBy
    })
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    startDate: new Date(data.start_date),
    endDate: new Date(data.end_date),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    discountType: data.discount_type,
    discountValue: data.discount_value,
    minPurchaseAmount: data.min_purchase_amount,
    maxDiscountAmount: data.max_discount_amount,
    usageLimit: data.usage_limit,
    usageCount: data.usage_count,
    usagePerCustomer: data.usage_per_customer,
    applicableCategories: data.applicable_categories,
    applicableProducts: data.applicable_products,
    excludedProducts: data.excluded_products,
    createdBy: data.created_by
  };
}

export async function updatePromoCode(id: string, updates: Partial<PromoCode>): Promise<void> {
  const dbUpdates: any = {};
  
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.discountType !== undefined) dbUpdates.discount_type = updates.discountType;
  if (updates.discountValue !== undefined) dbUpdates.discount_value = updates.discountValue;
  if (updates.minPurchaseAmount !== undefined) dbUpdates.min_purchase_amount = updates.minPurchaseAmount;
  if (updates.maxDiscountAmount !== undefined) dbUpdates.max_discount_amount = updates.maxDiscountAmount;
  if (updates.usageLimit !== undefined) dbUpdates.usage_limit = updates.usageLimit;
  if (updates.usagePerCustomer !== undefined) dbUpdates.usage_per_customer = updates.usagePerCustomer;
  if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate.toISOString();
  if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate.toISOString();
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.applicableCategories !== undefined) dbUpdates.applicable_categories = updates.applicableCategories;
  if (updates.applicableProducts !== undefined) dbUpdates.applicable_products = updates.applicableProducts;
  if (updates.excludedProducts !== undefined) dbUpdates.excluded_products = updates.excludedProducts;
  
  dbUpdates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('promo_codes')
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw error;
}

export async function deletePromoCode(id: string): Promise<void> {
  const { error } = await supabase
    .from('promo_codes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function incrementPromoUsage(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_promo_usage', { promo_id: id });
  if (error) throw error;
}

// Loyalty Program
export async function getLoyaltyProgram(): Promise<LoyaltyProgram | null> {
  try {
    const { data, error } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      pointsPerFCFA: data.points_per_fcfa,
      pointsValue: data.points_value,
      minPointsToRedeem: data.min_points_to_redeem,
      isActive: data.is_active,
      bonusMultiplier: data.bonus_multiplier,
      bonusStartDate: data.bonus_start_date ? new Date(data.bonus_start_date) : undefined,
      bonusEndDate: data.bonus_end_date ? new Date(data.bonus_end_date) : undefined
    };
  } catch (error) {
    console.error('Error fetching loyalty program:', error);
    return null;
  }
}

// Customer Loyalty
export async function getCustomerLoyalty(customerId: string): Promise<CustomerLoyalty | null> {
  try {
    const { data, error } = await supabase
      .from('customer_loyalty')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (error || !data) return null;

    return {
      customerId: data.customer_id,
      customerName: data.customer_name,
      totalPoints: data.total_points,
      availablePoints: data.available_points,
      pointsEarned: data.points_earned,
      pointsRedeemed: data.points_redeemed,
      totalSpent: data.total_spent,
      tier: data.tier,
      tierProgress: data.tier_progress,
      joinedAt: new Date(data.joined_at),
      lastActivityAt: new Date(data.last_activity_at)
    };
  } catch (error) {
    console.error('Error fetching customer loyalty:', error);
    return null;
  }
}

export async function addLoyaltyPoints(
  customerId: string,
  customerName: string,
  points: number,
  description: string,
  relatedSaleId?: string
): Promise<void> {
  const { error } = await supabase.rpc('add_loyalty_points', {
    p_customer_id: customerId,
    p_customer_name: customerName,
    p_points: points,
    p_description: description,
    p_related_sale_id: relatedSaleId
  });

  if (error) throw error;
}

export async function redeemLoyaltyPoints(
  customerId: string,
  points: number,
  description: string
): Promise<void> {
  const { error } = await supabase.rpc('redeem_loyalty_points', {
    p_customer_id: customerId,
    p_points: points,
    p_description: description
  });

  if (error) throw error;
}

export async function getLoyaltyTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      customerId: item.customer_id,
      type: item.type,
      points: item.points,
      description: item.description,
      relatedSaleId: item.related_sale_id,
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error('Error fetching loyalty transactions:', error);
    return [];
  }
}
