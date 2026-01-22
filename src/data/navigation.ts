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
  { id: 'articles', icon: Package, label: 'nav.articles', roles: ['superadmin', 'admin', 'commercial', 'secretaire', 'manager', 'client'] },
  { id: 'services', icon: Briefcase, label: 'nav.services', roles: ['superadmin', 'admin', 'commercial', 'secretaire', 'client'] },
  { id: 'sales', icon: ShoppingCart, label: 'nav.sales', roles: ['superadmin', 'admin', 'commercial', 'secretaire', 'comptable'] },
  { id: 'commercial', icon: TrendingUp, label: 'Espace Commercial', roles: ['superadmin', 'admin', 'commercial'] },
  { id: 'stock', icon: Box, label: 'nav.stock', roles: ['superadmin', 'admin', 'manager'] },
  { id: 'suppliers', icon: Building2, label: 'nav.suppliers', roles: ['superadmin', 'admin', 'manager'] },
  { id: 'shop', icon: ShoppingCart, label: 'Boutique', roles: ['client'] },
  { id: 'clients', icon: Users, label: 'nav.clients', roles: ['superadmin', 'admin', 'commercial', 'secretaire'] },
  { id: 'visitors', icon: Globe, label: 'Analytique Visiteurs', roles: ['superadmin', 'admin'] },
  { id: 'users', icon: UserCheckIcon, label: 'Utilisateurs', roles: ['superadmin', 'admin'] },
  { id: 'stores', icon: Store, label: 'Boutiques', roles: ['superadmin', 'admin'] },
  { id: 'accounting', icon: Calculator, label: 'Comptabilité', roles: ['superadmin', 'admin', 'comptable'] },
  { id: 'reports', icon: BarChart3, label: 'nav.reports', roles: ['superadmin', 'admin', 'commercial', 'comptable'] },
  { id: 'settings', icon: Settings, label: 'nav.settings', roles: ['superadmin', 'admin'] },
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
