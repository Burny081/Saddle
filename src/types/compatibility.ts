// =============================================================================
// TYPE COMPATIBILITY LAYER
// Maps database types to legacy component types for backward compatibility
// =============================================================================

import type {
  Article as DBArticle,
  Service as DBService,
  Client as DBClient,
  Sale as DBSale,
  Category as DBCategory,
  Visitor as DBVisitor,
  Alert as DBAlert,
} from './database';

// Re-export database types with DB prefix for explicit usage
export type {
  DBArticle,
  DBService,
  DBClient,
  DBSale,
  DBCategory,
  DBVisitor,
  DBAlert,
};

// ===== COMPONENT-COMPATIBLE TYPES (camelCase) =====
// These are the types that components should use

/**
 * Article type for components
 * Uses camelCase field names for backward compatibility
 */
export interface Article {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  purchasePrice: number;
  stock: number;
  minStock: number;
  image?: string;
  status: 'active' | 'inactive';
  unit?: string;
  storeId?: string;
}

/**
 * Service type for components
 */
export interface Service {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  duration?: string;
  image?: string;
  status: 'active' | 'inactive';
  storeId?: string;
}

/**
 * Client type for components
 */
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalSpent: number;
  storeId?: string;
}

/**
 * Sale type for components
 */
export interface Sale {
  id: string;
  clientName: string;
  items: {
    type: 'article' | 'service';
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  paid: boolean;
  status: 'pending' | 'completed' | 'delivered' | 'partial';
  date: string;
  invoiceNumber?: string;
  createdBy?: string;
  createdByName?: string;
  storeId?: string;
}

/**
 * Visitor type for components
 */
export interface Visitor {
  id: string;
  ip: string;
  date: string;
  time: string;
  location: string;
  userAgent: string;
  page: string;
  device: string;
}

/**
 * Alert type for components
 */
export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

/**
 * Category type for components
 */
export interface Category {
  id: string;
  name: { en: string; fr: string };
  icon: string;
  image: string;
  subCategories: { id: string; name: { en: string; fr: string } }[];
}

// ===== LEGACY TYPE ALIASES (for backwards compatibility) =====
export type LegacyArticle = Article;
export type LegacyService = Service;
export type LegacyClient = Client;
export type LegacySale = Sale;
export type LegacyVisitor = Visitor;
export type LegacyAlert = Alert;
export type LegacyCategory = Category;

export function dbArticleToLegacy(article: DBArticle): LegacyArticle {
  return {
    id: article.id,
    name: article.name,
    category: article.category_id || '',
    description: article.description,
    price: article.selling_price,
    purchasePrice: article.purchase_price,
    stock: article.current_stock || 0,
    minStock: article.min_stock || 0,
    image: article.image_url,
    status: article.is_active ? 'active' : 'inactive',
    unit: article.unit,
    storeId: article.store_id,
  };
}

export function legacyArticleToDb(article: LegacyArticle, storeId?: string): Partial<DBArticle> {
  return {
    id: article.id,
    store_id: article.storeId || storeId || '',
    code: '',
    name: article.name,
    category_id: article.category,
    description: article.description,
    purchase_price: article.purchasePrice,
    selling_price: article.price,
    current_stock: article.stock,
    min_stock: article.minStock,
    image_url: article.image,
    is_active: article.status === 'active',
    unit: article.unit,
    tax_rate: 0,
  };
}

export function dbServiceToLegacy(service: DBService): LegacyService {
  return {
    id: service.id,
    name: service.name,
    category: service.category_id || '',
    description: service.description,
    price: service.price,
    duration: service.duration_minutes ? `${service.duration_minutes} min` : undefined,
    image: service.image_url,
    status: service.is_active ? 'active' : 'inactive',
    storeId: service.store_id,
  };
}

export function legacyServiceToDb(service: LegacyService, storeId?: string): Partial<DBService> {
  const durationMinutes = service.duration ? parseInt(service.duration) || undefined : undefined;
  return {
    id: service.id,
    store_id: service.storeId || storeId || '',
    code: '',
    name: service.name,
    category_id: service.category,
    description: service.description,
    price: service.price,
    duration_minutes: durationMinutes,
    image_url: service.image,
    is_active: service.status === 'active',
    tax_rate: 0,
  };
}

export function dbClientToLegacy(client: DBClient): LegacyClient {
  return {
    id: client.id,
    name: `${client.first_name} ${client.last_name}`.trim(),
    email: client.email,
    phone: client.phone,
    address: client.address,
    totalSpent: client.total_purchases,
    storeId: client.store_id,
  };
}

export function legacyClientToDb(client: LegacyClient, storeId?: string): Partial<DBClient> {
  const nameParts = client.name.split(' ');
  return {
    id: client.id,
    store_id: client.storeId || storeId || '',
    first_name: nameParts[0] || '',
    last_name: nameParts.slice(1).join(' ') || '',
    email: client.email,
    phone: client.phone,
    address: client.address,
    total_purchases: client.totalSpent,
    loyalty_points: 0,
    is_active: true,
  };
}

export function dbSaleToLegacy(sale: DBSale): LegacySale {
  return {
    id: sale.id,
    clientName: sale.client?.first_name ? `${sale.client.first_name} ${sale.client.last_name}` : '',
    items: (sale.items || []).map(item => ({
      type: item.article_id ? 'article' : 'service',
      id: item.article_id || item.service_id || '',
      name: item.article?.name || item.service?.name || '',
      quantity: item.quantity,
      price: item.unit_price,
    })),
    total: sale.total,
    paid: sale.payment_status === 'paid',
    status: sale.status === 'completed' ? 'completed' : sale.status === 'cancelled' ? 'pending' : 'pending',
    date: sale.created_at,
    invoiceNumber: sale.sale_number,
    createdBy: sale.created_by,
    storeId: sale.store_id,
  };
}

export function dbVisitorToLegacy(visitor: DBVisitor): LegacyVisitor {
  const date = new Date(visitor.first_visit_at);
  return {
    id: visitor.id,
    ip: visitor.ip_address || 'Unknown',
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString(),
    location: visitor.city && visitor.country ? `${visitor.city}, ${visitor.country}` : 'Unknown',
    userAgent: visitor.user_agent || '',
    page: '/',
    device: visitor.device_type.charAt(0).toUpperCase() + visitor.device_type.slice(1),
  };
}

export function dbAlertToLegacy(alert: DBAlert): LegacyAlert {
  return {
    id: alert.id,
    type: alert.type === 'stock_low' || alert.type === 'stock_out' ? 'warning' : 
          alert.type === 'error' ? 'error' : 
          alert.type === 'sale' ? 'success' : 'info',
    title: alert.title,
    message: alert.message,
    date: alert.created_at,
    read: alert.is_read,
  };
}
