import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  STORAGE_KEYS,
  AUTH_CONFIG,
  generateId,
  getFromStorage,
  setToStorage
} from '@/config/constants';

export type UserRole = 'superadmin' | 'admin' | 'commercial' | 'secretaire' | 'manager' | 'comptable' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
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
}

// Initial seed data - passwords should be hashed in production
const getDefaultUsers = (): StoredUser[] => [
  { id: generateId(), name: 'Jean Dupont', email: 'superadmin@sps.com', role: 'superadmin', password: AUTH_CONFIG.defaultDemoPassword },
  { id: generateId(), name: 'Admin SPS', email: 'admin@sps.com', role: 'admin', password: AUTH_CONFIG.defaultDemoPassword },
  { id: generateId(), name: 'Commercial SPS', email: 'commercial@sps.com', role: 'commercial', password: AUTH_CONFIG.defaultDemoPassword },
  { id: generateId(), name: 'Secrétaire SPS', email: 'secretaire@sps.com', role: 'secretaire', password: AUTH_CONFIG.defaultDemoPassword },
  { id: generateId(), name: 'Manager SPS', email: 'manager@sps.com', role: 'manager', password: AUTH_CONFIG.defaultDemoPassword },
  { id: generateId(), name: 'Comptable SPS', email: 'comptable@sps.com', role: 'comptable', password: AUTH_CONFIG.defaultDemoPassword },
  { id: generateId(), name: 'Client SPS', email: 'client@sps.com', role: 'client', password: AUTH_CONFIG.defaultDemoPassword },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<StoredUser[]>([]);

  // Initialize DB
  useEffect(() => {
    const storedUsers = getFromStorage<StoredUser[] | null>(STORAGE_KEYS.users, null);
    if (storedUsers && storedUsers.length > 0) {
      setUsers(storedUsers);
    } else {
      const defaultUsers = getDefaultUsers();
      setUsers(defaultUsers);
      setToStorage(STORAGE_KEYS.users, defaultUsers);
    }

    const savedSession = getFromStorage<User | null>(STORAGE_KEYS.currentUser, null);
    if (savedSession) {
      setUser(savedSession);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // Check password (in a real app, this would be hashed and verified server-side)
    if (foundUser && foundUser.password === password) {
      const { password: _, ...userWithoutPass } = foundUser;
      setUser(userWithoutPass);
      setToStorage(STORAGE_KEYS.currentUser, userWithoutPass);
      return true;
    }

    return false;
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }, []);

  const addUser = useCallback((newUser: User, password: string) => {
    const userWithPass: StoredUser = { ...newUser, id: generateId(), password };
    const updatedUsers = [...users, userWithPass];
    setUsers(updatedUsers);
    setToStorage(STORAGE_KEYS.users, updatedUsers);
  }, [users]);

  const updateUser = useCallback((id: string, updates: Partial<User>, newPassword?: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === id) {
        const updated = { ...u, ...updates };
        if (newPassword) {
          updated.password = newPassword;
        }
        return updated;
      }
      return u;
    });
    setUsers(updatedUsers);
    setToStorage(STORAGE_KEYS.users, updatedUsers);
  }, [users]);

  const deleteUser = useCallback((id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    setToStorage(STORAGE_KEYS.users, updatedUsers);
  }, [users]);

  return (
    <AuthContext.Provider value={{
      user,
      users: users.map(({ password, ...u }) => u), // Expose users without passwords
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
