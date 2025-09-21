import React, { createContext, useState, useEffect } from 'react';
import { User, Account } from '../types';

interface AuthContextType {
  user: User | null;
  account: Account | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock accounts data
const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Apex Digital Agency',
    type: 'agency',
    ownerId: 'user-1',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'acc-2',
    name: 'Strategic AI Consultants',
    type: 'consultant',
    ownerId: 'user-2',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'acc-3',
    name: 'InnovateTech Solutions',
    type: 'business',
    ownerId: 'user-3',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Mock users data
const mockUsers = {
  'agency-owner@demo.com': {
    id: 'user-1',
    email: 'agency-owner@demo.com',
    name: 'Sarah Mitchell',
    role: 'owner' as const,
    accountType: 'agency' as const,
    accountId: 'acc-1',
    createdAt: '2024-01-01T00:00:00Z',
  },
  'consultant-owner@demo.com': {
    id: 'user-2',
    email: 'consultant-owner@demo.com',
    name: 'Marcus Rodriguez',
    role: 'owner' as const,
    accountType: 'consultant' as const,
    accountId: 'acc-2',
    createdAt: '2024-01-01T00:00:00Z',
  },
  'business-owner@demo.com': {
    id: 'user-3',
    email: 'business-owner@demo.com',
    name: 'Jennifer Chen',
    role: 'owner' as const,
    accountType: 'business' as const,
    accountId: 'acc-3',
    createdAt: '2024-01-01T00:00:00Z',
  },
  'manager@demo.com': {
    id: 'user-4',
    email: 'manager@demo.com',
    name: 'Marcus Thompson',
    role: 'manager' as const,
    accountType: 'agency' as const,
    accountId: 'acc-1',
    enabledPages: ['dashboard', 'company', 'analytics', 'workspaces', 'systemsHub'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  'employee@demo.com': {
    id: 'user-5',
    email: 'employee@demo.com',
    name: 'Lisa Park',
    role: 'employee' as const,
    accountType: 'agency' as const,
    accountId: 'acc-1',
    managerId: 'user-4',
    createdAt: '2024-01-01T00:00:00Z',
  },
  'contractor@demo.com': {
    id: 'user-6',
    email: 'contractor@demo.com',
    name: 'Alex Rivera',
    role: 'contractor' as const,
    accountType: 'consultant' as const,
    accountId: 'acc-2',
    createdAt: '2024-01-01T00:00:00Z',
  },
  'client@demo.com': {
    id: 'user-7',
    email: 'client@demo.com',
    name: 'Robert Johnson',
    role: 'client' as const,
    accountType: 'agency' as const,
    accountId: 'acc-1',
    createdAt: '2024-01-01T00:00:00Z',
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    const storedAccount = localStorage.getItem('account');
    if (storedUser && storedAccount) {
      setUser(JSON.parse(storedUser));
      setAccount(JSON.parse(storedAccount));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Find user in mock data
      const mockUser = mockUsers[email as keyof typeof mockUsers];
      if (!mockUser) {
        throw new Error('User not found');
      }

      if (password !== 'demo123') {
        throw new Error('Invalid password');
      }

      // Find associated account
      const mockAccount = mockAccounts.find(acc => acc.id === mockUser.accountId);
      if (!mockAccount) {
        throw new Error('Account not found');
      }
      
      setUser(mockUser);
      setAccount(mockAccount);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('account', JSON.stringify(mockAccount));
    } catch (error) {
      console.error('Login failed', error);
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccount(null);
    localStorage.removeItem('user');
    localStorage.removeItem('account');
  };

  return (
    <AuthContext.Provider value={{ user, account, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};