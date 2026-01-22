import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/utils/supabaseClient';

export type UserRole = 'superadmin' | 'admin' | 'commercial' | 'secretaire' | 'manager' | 'comptable' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  store_id?: string;
}

export interface StoredUser extends User {
  password?: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: User, password: string) => void;
  updateUser: (id: string, updates: Partial<User>, newPassword?: string) => void;
  deleteUser: (id: string) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user profile from database with timeout
  const getUserProfile = async (userId: string, userEmail?: string): Promise<User | null> => {
    console.log('Fetching profile for:', userId, userEmail);

    type QueryResult = { data: User | null; error: { message: string } | null };

    // Helper to add timeout to a query
    const queryWithTimeout = async (
      query: PromiseLike<{ data: unknown; error: unknown }>,
      ms: number
    ): Promise<QueryResult> => {
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve({ data: null, error: { message: 'Timeout' } });
        }, ms);

        Promise.resolve(query).then((result) => {
          clearTimeout(timer);
          resolve(result as QueryResult);
        }).catch(() => {
          clearTimeout(timer);
          resolve({ data: null, error: { message: 'Query failed' } });
        });
      });
    };

    // Try by ID first
    const idResult = await queryWithTimeout(
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      5000
    );

    if (idResult.data) {
      console.log('Profile found by ID:', idResult.data);
      return idResult.data;
    }
    if (idResult.error) {
      console.log('ID query failed:', idResult.error.message);
    }

    // Fallback: try by email
    if (userEmail) {
      console.log('Trying by email:', userEmail);
      const emailResult = await queryWithTimeout(
        supabase.from('profiles').select('*').eq('email', userEmail).maybeSingle(),
        5000
      );

      if (emailResult.data) {
        console.log('Profile found by email:', emailResult.data);
        return emailResult.data;
      }
      if (emailResult.error) {
        console.log('Email query failed:', emailResult.error.message);
      }
    }

    console.log('No profile found');
    return null;
  };

  // Load all users (for admin management)
  const loadUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      setUsers(profiles as User[]);
    } catch (error) {
      console.error('Error in loadUsers:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Clear any existing session on app start (disable auto-login)
    supabase.auth.signOut().then(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.email);

      if (session?.user && event === 'SIGNED_IN') {
        try {
          console.log('Fetching profile for:', session.user.id, session.user.email);
          const profile = await getUserProfile(session.user.id, session.user.email);
          console.log('Profile result:', profile);

          if (profile && profile.is_active) {
            setUser(profile);
            await loadUsers();

            // Update last login time on sign in
            supabase
              .from('profiles')
              .update({ last_login: new Date().toISOString() })
              .eq('id', session.user.id)
              .then(() => {});
          } else {
            console.log('Profile not found or inactive, signing out');
            setUser(null);
            setUsers([]);
          }
        } catch (err) {
          console.error('Error in auth state change:', err);
          setUser(null);
          setUsers([]);
        }
      } else {
        setUser(null);
        setUsers([]);
      }

      console.log('Setting loading to false');
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setLoading(false);
        return false;
      }

      if (!data.user) {
        console.error('No user returned from login');
        setLoading(false);
        return false;
      }

      // Fetch profile directly here instead of relying on auth state change
      const profile = await getUserProfile(data.user.id, data.user.email);

      if (profile && profile.is_active) {
        setUser(profile);
        await loadUsers();

        // Update last login time
        supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
          .then(() => {});

        setLoading(false);
        return true;
      } else {
        console.error('Profile not found or inactive');
        await supabase.auth.signOut();
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUsers([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // For backward compatibility - these functions are expected by existing components
  const addUser = useCallback((_user: User, _password: string) => {
    console.log('addUser called - should use Supabase Auth Dashboard instead');
  }, []);

  const updateUser = useCallback((_id: string, _updates: Partial<User>, _newPassword?: string) => {
    console.log('updateUser called - should implement Supabase update');
  }, []);

  const deleteUser = useCallback((_id: string) => {
    console.log('deleteUser called - should implement Supabase delete');
  }, []);

  const value: AuthContextType = {
    user,
    users,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
