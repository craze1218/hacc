import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = existingUsers.some((u: User) => u.email === email);
    
    if (userExists) {
      throw new Error('An account with this email already exists');
    }

    // Validate password
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    // Store user in "database" (localStorage)
    existingUsers.push({ ...newUser, password });
    localStorage.setItem('users', JSON.stringify(existingUsers));
    
    // Set current user
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const login = async (email: string, password: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = existingUsers.find(
      (u: User & { password: string }) => u.email === email && u.password === password
    );

    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

