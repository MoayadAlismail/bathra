
import React, { createContext, useState, useContext, useEffect } from 'react';

type User = {
  id: string;
  email: string;
  name: string;
  investmentFocus: string;
  investmentRange: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (user: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, you would call an API here
      // For now, let's mock a successful login
      const savedUser = localStorage.getItem('users');
      const users = savedUser ? JSON.parse(savedUser) : [];
      
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      const { password: _, ...userWithoutPassword } = user;
      
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }) => {
    setIsLoading(true);
    try {
      // In a real app, you would call an API here
      // For now, let's use localStorage to simulate user registration
      const savedUsers = localStorage.getItem('users');
      const users = savedUsers ? JSON.parse(savedUsers) : [];
      
      // Check if user already exists
      const existingUser = users.find((u: any) => u.email === userData.email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Create new user with ID
      const newUser = {
        ...userData,
        id: crypto.randomUUID(),
      };
      
      // Save to "database"
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Log user in
      const { password: _, ...userWithoutPassword } = newUser;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
