import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import HttpClient from '../utils/http';

interface LoginResponse {
  access_token: string;
  user: User;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('adminUser');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 AuthContext login called with:', { email, password });
    try {
      const response = await HttpClient.post('/api/auth/login', {
        email,
        password
      }) as LoginResponse;
      
      console.log('✅ Login response:', response);
      
      if (response.access_token && response.user) {
        const authToken = response.access_token;
        const userData = response.user;
        
        // Guardar en localStorage
        localStorage.setItem('adminToken', authToken);
        localStorage.setItem('adminUser', JSON.stringify(userData));
        
        // Actualizar estado
        setToken(authToken);
        setUser(userData);
        
        console.log('✅ Login successful, user authenticated');
        return true;
      }
      
      console.log('❌ Invalid response format');
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // Redirigir al login después del logout
    window.location.href = '/admin';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};