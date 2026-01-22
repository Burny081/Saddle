/**
 * Application Configuration Constants
 * Centralized configuration for the Saddle Point Service application
 */

// Company Information
export const COMPANY = {
  name: 'Saddle Point Service',
  shortName: 'SPS',
  slogan: 'Excellence en Solutions Électriques',
  address: 'Douala, Cameroun',
  phone: '+237 600 00 00 00',
  email: 'contact@saddlepoint.cm',
  website: 'https://saddlepoint.cm',
  // Legal & Banking Information
  rccm: 'RC/DLA/2024/B/0000',
  niu: 'M012400000000A',
  bank: 'Afriland First Bank',
  iban: 'CM21 10005 00001 00000000000 00',
} as const;

// API Configuration
export const API = {
  geoLocationUrl: 'https://ipapi.co/json/',
  timeout: 30000,
} as const;

// Application Settings
export const APP_SETTINGS = {
  chatPollingInterval: 3000,
  orderSuccessResetDelay: 3000,
  animationDuration: 0.3,
  defaultCurrency: 'XAF',
  defaultLocale: 'fr-CM',
  currencySymbol: 'FCFA',
  taxRate: 0.1925, // 19.25% TVA
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  users: 'sps_users_db',
  currentUser: 'sps_user',
  articles: 'sps_articles',
  services: 'sps_services',
  clients: 'sps_clients',
  sales: 'sps_sales',
  chatMessages: 'chat_messages',
  favorites: (userId: string) => `favorites_${userId}`,
} as const;

// UI Constants
export const UI = {
  sidebarWidth: 280,
  chatWidgetWidth: {
    mobile: 350,
    desktop: 400,
  },
  chatWidgetHeight: 500,
} as const;

// Password Configuration (for development/demo purposes)
export const AUTH_CONFIG = {
  minPasswordLength: 8,
  defaultDemoPassword: 'admin123', // Only for demo purposes
} as const;

// Validation Patterns
export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
} as const;

// Role Hierarchy (for permission checking)
export const ROLE_HIERARCHY = {
  superadmin: 6,
  admin: 5,
  manager: 4,
  comptable: 3,
  secretaire: 2,
  client: 1,
} as const;

// Generate a secure random ID
export function generateId(): string {
  return crypto.randomUUID();
}

// Generate a short ID (for display purposes)
export function generateShortId(): string {
  return crypto.randomUUID().split('-')[0];
}

// Get currency settings from localStorage
export function getCurrencySettings(): { currency: string; symbol: string; locale: string } {
  try {
    const savedSettings = localStorage.getItem('sps_app_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      const currencyMap: Record<string, string> = {
        'XAF': 'FCFA',
        'EUR': '€',
        'USD': '$'
      };
      return {
        currency: settings.currency || APP_SETTINGS.defaultCurrency,
        symbol: currencyMap[settings.currency] || 'FCFA',
        locale: settings.locale || APP_SETTINGS.defaultLocale
      };
    }
  } catch {
    // Fall back to defaults
  }
  return {
    currency: APP_SETTINGS.defaultCurrency,
    symbol: APP_SETTINGS.currencySymbol,
    locale: APP_SETTINGS.defaultLocale
  };
}

// Format currency - uses configured currency from settings
export function formatCurrency(amount: number, locale?: string, _currency?: string): string {
  const settings = getCurrencySettings();
  const usedLocale = locale || settings.locale;

  // Format number with locale
  const formattedNumber = new Intl.NumberFormat(usedLocale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);

  // Return with configured currency symbol
  if (settings.currency === 'EUR') {
    return `${formattedNumber} €`;
  } else if (settings.currency === 'USD') {
    return `$${formattedNumber}`;
  }
  return `${formattedNumber} FCFA`;
}

// Format currency with decimals
export function formatCurrencyWithDecimals(amount: number, locale?: string): string {
  const settings = getCurrencySettings();
  const usedLocale = locale || settings.locale;

  const formattedNumber = new Intl.NumberFormat(usedLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  if (settings.currency === 'EUR') {
    return `${formattedNumber} €`;
  } else if (settings.currency === 'USD') {
    return `$${formattedNumber}`;
  }
  return `${formattedNumber} FCFA`;
}

// Safe JSON parse with fallback
export function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// Safe localStorage getter
export function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return safeJsonParse(item, fallback);
  } catch {
    return fallback;
  }
}

// Safe localStorage setter
export function setToStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
