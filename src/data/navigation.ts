import {
  LayoutDashboard,
  Package,
  Briefcase,
  ShoppingCart,
  Box,
  Users,
  BarChart3,
  Settings,
  UserCheck as UserCheckIcon,
  Globe,
  Building2,
  Calculator,
  Store,
  TrendingUp,
  ShoppingBag,
  LineChart,
  Image,
  Percent,
  Shield,
  Heart,
  FileText,
  Gift,
  type LucideIcon,
} from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';

export interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'nav.dashboard', roles: ['superadmin', 'admin', 'commercial', 'secretaire', 'manager', 'comptable', 'client'] },
  { id: 'analytics', icon: LineChart, label: 'Analytique', roles: ['superadmin', 'admin', 'manager'] },
  
  // Navigation Client
  { id: 'shop', icon: ShoppingCart, label: 'Boutique', roles: ['client'] },
  { id: 'orders', icon: ShoppingBag, label: 'Mes Commandes', roles: ['client'] },
  { id: 'favorites', icon: Heart, label: 'Mes Favoris', roles: ['client'] },
  { id: 'quotes', icon: FileText, label: 'Mes Devis', roles: ['client'] },
  { id: 'loyalty', icon: Gift, label: 'Fidélité', roles: ['client'] },
  
  // Navigation Staff
  { id: 'articles', icon: Package, label: 'nav.articles', roles: ['superadmin', 'admin', 'commercial', 'secretaire', 'manager'] },
  { id: 'services', icon: Briefcase, label: 'nav.services', roles: ['superadmin', 'admin', 'commercial', 'secretaire'] },
  { id: 'sales', icon: ShoppingCart, label: 'nav.sales', roles: ['superadmin', 'admin', 'commercial', 'secretaire', 'comptable'] },
  { id: 'commercial', icon: TrendingUp, label: 'Espace Commercial', roles: ['superadmin', 'admin', 'commercial'] },
  { id: 'promotions', icon: Percent, label: 'Promotions', roles: ['superadmin', 'admin', 'commercial'] },
  { id: 'security', icon: Shield, label: 'Sécurité', roles: ['superadmin', 'admin'] },
  { id: 'stock', icon: Box, label: 'nav.stock', roles: ['superadmin', 'admin', 'manager'] },
  { id: 'suppliers', icon: Building2, label: 'nav.suppliers', roles: ['superadmin', 'admin', 'manager'] },
  { id: 'clients', icon: Users, label: 'nav.clients', roles: ['superadmin', 'admin', 'commercial', 'secretaire'] },
  { id: 'visitors', icon: Globe, label: 'Analytique Visiteurs', roles: ['superadmin', 'admin'] },
  { id: 'users', icon: UserCheckIcon, label: 'Utilisateurs', roles: ['superadmin', 'admin'] },
  { id: 'images', icon: Image, label: 'Gestion Images', roles: ['superadmin', 'admin'] },
  { id: 'stores', icon: Store, label: 'Boutiques', roles: ['superadmin', 'admin'] },
  { id: 'accounting', icon: Calculator, label: 'Comptabilité', roles: ['superadmin', 'admin', 'comptable'] },
  { id: 'reports', icon: BarChart3, label: 'nav.reports', roles: ['superadmin', 'admin', 'commercial', 'comptable'] },
  { id: 'settings', icon: Settings, label: 'nav.settings', roles: ['superadmin', 'admin', 'client'] },
];

export const getRoleColor = (role: UserRole) => {
  const colors: Record<UserRole, string> = {
    superadmin: 'from-purple-500 to-purple-600',
    admin: 'from-red-500 to-red-600',
    commercial: 'from-orange-500 to-orange-600',
    secretaire: 'from-blue-500 to-blue-600',
    manager: 'from-green-500 to-green-600',
    comptable: 'from-yellow-500 to-yellow-600',
    client: 'from-cyan-500 to-cyan-600',
  };
  return colors[role] || 'from-slate-500 to-slate-600';
};
