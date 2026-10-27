import { expect, test } from 'vitest';
import { getDashboardRoleView } from './dashboardRoleView';

test('routes admins to the command center', () => {
  expect(getDashboardRoleView('admin')).toBe('admin-command-center');
  expect(getDashboardRoleView('superadmin')).toBe('admin-command-center');
});

test('keeps clients and operational staff on their own dashboards', () => {
  expect(getDashboardRoleView('client')).toBe('client-dashboard');
  expect(getDashboardRoleView('manager')).toBe('operational-dashboard');
});
