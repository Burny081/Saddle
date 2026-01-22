import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface UserGroup {
  id: string;
  name: string;
  description?: string;
  is_company_wide: boolean;
  created_at?: string;
  // Joined data
  store_ids?: string[];
  permissions?: string[];
}

export interface UserGroupStore {
  id: string;
  group_id: string;
  store_id: string;
}

export interface UserGroupPermission {
  id: string;
  group_id: string;
  permission: string;
}

export interface UserStoreAssignment {
  id: string;
  user_id: string;
  store_id: string;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_view_reports: boolean;
  can_manage_stock: boolean;
  can_manage_users: boolean;
  assigned_by?: string;
  assigned_at?: string;
  updated_at?: string;
  // Joined data
  user_name?: string;
  user_email?: string;
  store_name?: string;
}

export interface UserAccessProfile {
  id: string;
  user_id: string;
  is_global: boolean;
  access_type: 'single' | 'multiple' | 'global';
  default_can_create: boolean;
  default_can_edit: boolean;
  default_can_delete: boolean;
  default_can_view_reports: boolean;
  default_can_manage_stock: boolean;
  default_can_manage_users: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  name: string;                                   // Matches AuthContext.tsx and sps.sql
  email: string;
  role: 'superadmin' | 'admin' | 'commercial' | 'secretaire' | 'manager' | 'comptable' | 'client';  // Matches AuthContext.tsx and sps.sql
  store_id?: string;                              // Matches sps.sql
  avatar?: string;                                // Matches AuthContext.tsx (NOT avatar_url)
  phone?: string;
  address?: string;                               // Matches sps.sql
  is_active: boolean;
  last_login?: string;                            // Matches sps.sql
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// USER GROUPS
// ============================================================================

export async function getUserGroups(): Promise<UserGroup[]> {
  const { data, error } = await supabase
    .from('user_groups')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
  
  // Fetch related stores and permissions for each group
  const groups = await Promise.all((data || []).map(async (group: UserGroup) => {
    const [storesRes, permsRes] = await Promise.all([
      supabase.from('user_group_stores').select('store_id').eq('group_id', group.id),
      supabase.from('user_group_permissions').select('permission').eq('group_id', group.id)
    ]);
    
    return {
      ...group,
      store_ids: (storesRes.data || []).map((s: { store_id: string }) => s.store_id),
      permissions: (permsRes.data || []).map((p: { permission: string }) => p.permission)
    };
  }));
  
  return groups;
}

export async function createUserGroup(group: {
  id: string;
  name: string;
  description?: string;
  is_company_wide?: boolean;
  store_ids?: string[];
  permissions?: string[];
}): Promise<UserGroup | null> {
  const { id, name, description, is_company_wide, store_ids, permissions } = group;
  
  // Insert group
  const { data, error } = await supabase
    .from('user_groups')
    .insert({ id, name, description, is_company_wide: is_company_wide || false })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user group:', error);
    return null;
  }
  
  // Insert store associations
  if (store_ids && store_ids.length > 0) {
    await supabase.from('user_group_stores').insert(
      store_ids.map(store_id => ({ group_id: id, store_id }))
    );
  }
  
  // Insert permissions
  if (permissions && permissions.length > 0) {
    await supabase.from('user_group_permissions').insert(
      permissions.map(permission => ({ group_id: id, permission }))
    );
  }
  
  return { ...data, store_ids, permissions };
}

export async function updateUserGroup(
  groupId: string,
  updates: {
    name?: string;
    description?: string;
    is_company_wide?: boolean;
    store_ids?: string[];
    permissions?: string[];
  }
): Promise<UserGroup | null> {
  const { store_ids, permissions, ...groupUpdates } = updates;
  
  // Update group
  if (Object.keys(groupUpdates).length > 0) {
    const { error } = await supabase
      .from('user_groups')
      .update(groupUpdates)
      .eq('id', groupId);
    
    if (error) {
      console.error('Error updating user group:', error);
      return null;
    }
  }
  
  // Update store associations
  if (store_ids !== undefined) {
    await supabase.from('user_group_stores').delete().eq('group_id', groupId);
    if (store_ids.length > 0) {
      await supabase.from('user_group_stores').insert(
        store_ids.map(store_id => ({ group_id: groupId, store_id }))
      );
    }
  }
  
  // Update permissions
  if (permissions !== undefined) {
    await supabase.from('user_group_permissions').delete().eq('group_id', groupId);
    if (permissions.length > 0) {
      await supabase.from('user_group_permissions').insert(
        permissions.map(permission => ({ group_id: groupId, permission }))
      );
    }
  }
  
  // Fetch updated group
  const groups = await getUserGroups();
  return groups.find(g => g.id === groupId) || null;
}

export async function deleteUserGroup(groupId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_groups')
    .delete()
    .eq('id', groupId);
  
  if (error) {
    console.error('Error deleting user group:', error);
    return false;
  }
  return true;
}

// ============================================================================
// USER STORE ASSIGNMENTS
// ============================================================================

export async function getUserStoreAssignments(userId?: string, storeId?: string): Promise<UserStoreAssignment[]> {
  let query = supabase
    .from('user_store_assignments')
    .select(`
      *,
      profiles:user_id(full_name, email),
      stores:store_id(name)
    `)
    .order('assigned_at', { ascending: false });
  
  if (userId) query = query.eq('user_id', userId);
  if (storeId) query = query.eq('store_id', storeId);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching user store assignments:', error);
    return [];
  }
  
  return (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    user_name: (item.profiles as { full_name?: string })?.full_name,
    user_email: (item.profiles as { email?: string })?.email,
    store_name: (item.stores as { name?: string })?.name
  })) as UserStoreAssignment[];
}

export async function assignUserToStore(assignment: {
  user_id: string;
  store_id: string;
  can_create?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
  can_view_reports?: boolean;
  can_manage_stock?: boolean;
  can_manage_users?: boolean;
  assigned_by?: string;
}): Promise<UserStoreAssignment | null> {
  const { data, error } = await supabase
    .from('user_store_assignments')
    .upsert({
      ...assignment,
      can_create: assignment.can_create || false,
      can_edit: assignment.can_edit || false,
      can_delete: assignment.can_delete || false,
      can_view_reports: assignment.can_view_reports || false,
      can_manage_stock: assignment.can_manage_stock || false,
      can_manage_users: assignment.can_manage_users || false,
      assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,store_id' })
    .select()
    .single();
  
  if (error) {
    console.error('Error assigning user to store:', error);
    return null;
  }
  return data;
}

export async function updateUserStoreAssignment(
  assignmentId: string,
  updates: Partial<UserStoreAssignment>
): Promise<UserStoreAssignment | null> {
  const { data, error } = await supabase
    .from('user_store_assignments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user store assignment:', error);
    return null;
  }
  return data;
}

export async function removeUserFromStore(userId: string, storeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_store_assignments')
    .delete()
    .eq('user_id', userId)
    .eq('store_id', storeId);
  
  if (error) {
    console.error('Error removing user from store:', error);
    return false;
  }
  return true;
}

// ============================================================================
// USER ACCESS PROFILES
// ============================================================================

export async function getUserAccessProfile(userId: string): Promise<UserAccessProfile | null> {
  const { data, error } = await supabase
    .from('user_access_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // Not found is ok
    console.error('Error fetching user access profile:', error);
    return null;
  }
  return data;
}

export async function updateUserAccessProfile(
  userId: string,
  profile: Partial<UserAccessProfile>
): Promise<UserAccessProfile | null> {
  const { data, error } = await supabase
    .from('user_access_profiles')
    .upsert({
      ...profile,
      user_id: userId,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user access profile:', error);
    return null;
  }
  return data;
}

// ============================================================================
// PROFILES (Users)
// ============================================================================

export async function getProfiles(options?: {
  role?: string;
  storeId?: string;
  isActive?: boolean;
}): Promise<Profile[]> {
  let query = supabase
    .from('profiles')
    .select('*')
    .order('full_name');
  
  if (options?.role) query = query.eq('role', options.role);
  if (options?.storeId) query = query.eq('store_id', options.storeId);
  if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  return data || [];
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data;
}

export async function deactivateUser(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', userId);
  
  if (error) {
    console.error('Error deactivating user:', error);
    return false;
  }
  return true;
}

export async function activateUser(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', userId);
  
  if (error) {
    console.error('Error activating user:', error);
    return false;
  }
  return true;
}

// ============================================================================
// USER PERMISSIONS HELPER
// ============================================================================

export async function getUserPermissionsForStore(userId: string, storeId: string): Promise<{
  canAccess: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewReports: boolean;
  canManageStock: boolean;
  canManageUsers: boolean;
}> {
  // Check if user has global access
  const accessProfile = await getUserAccessProfile(userId);
  
  if (accessProfile?.is_global) {
    return {
      canAccess: true,
      canCreate: accessProfile.default_can_create,
      canEdit: accessProfile.default_can_edit,
      canDelete: accessProfile.default_can_delete,
      canViewReports: accessProfile.default_can_view_reports,
      canManageStock: accessProfile.default_can_manage_stock,
      canManageUsers: accessProfile.default_can_manage_users
    };
  }
  
  // Check store-specific assignment
  const assignments = await getUserStoreAssignments(userId, storeId);
  const assignment = assignments[0];
  
  if (!assignment) {
    return {
      canAccess: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canViewReports: false,
      canManageStock: false,
      canManageUsers: false
    };
  }
  
  return {
    canAccess: true,
    canCreate: assignment.can_create,
    canEdit: assignment.can_edit,
    canDelete: assignment.can_delete,
    canViewReports: assignment.can_view_reports,
    canManageStock: assignment.can_manage_stock,
    canManageUsers: assignment.can_manage_users
  };
}

// ============================================================================
// AVAILABLE PERMISSIONS LIST
// ============================================================================

export const AVAILABLE_PERMISSIONS = [
  'view_dashboard',
  'view_sales',
  'create_sales',
  'edit_sales',
  'delete_sales',
  'view_stock',
  'manage_stock',
  'transfer_stock',
  'view_clients',
  'manage_clients',
  'view_articles',
  'manage_articles',
  'view_services',
  'manage_services',
  'view_reports',
  'export_reports',
  'view_accounting',
  'manage_accounting',
  'view_settings',
  'manage_settings',
  'view_users',
  'manage_users',
  'view_stores',
  'manage_stores'
] as const;

export type Permission = typeof AVAILABLE_PERMISSIONS[number];
