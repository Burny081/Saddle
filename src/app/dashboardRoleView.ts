import type { UserRole } from '@/contexts/AuthContext';

export type DashboardRoleView = 'admin-command-center' | 'client-dashboard' | 'operational-dashboard';

export function getDashboardRoleView(role: UserRole | undefined): DashboardRoleView {
  if (role === 'superadmin' || role === 'admin') return 'admin-command-center';
  if (role === 'client') return 'client-dashboard';
  return 'operational-dashboard';
}
