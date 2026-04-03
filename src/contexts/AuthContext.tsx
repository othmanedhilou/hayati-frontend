'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import Cookies from 'js-cookie';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  city?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; city?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      api.get('/user')
        .then((res) => setUser(res.data.user || res.data))
        .catch(() => Cookies.remove('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/login', { email, password });
    Cookies.set('token', res.data.token, { expires: 7 });
    setUser(res.data.user);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; city?: string }) => {
    const res = await api.post('/register', { ...data, password_confirmation: data.password });
    Cookies.set('token', res.data.token, { expires: 7 });
    setUser(res.data.user);
  };

  const logout = async () => {
    try { await api.post('/logout'); } catch {}
    Cookies.remove('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
