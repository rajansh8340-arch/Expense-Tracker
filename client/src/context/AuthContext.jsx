import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ledgerly_token') || null);
  const [loading, setLoading] = useState(true);

  // Check existing session
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ledgerly_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setToken(storedToken);
        } catch (err) {
          console.warn('Session verification failed, clearing token');
          localStorage.removeItem('ledgerly_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('ledgerly_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password, currency = 'USD') => {
    const res = await api.post('/auth/register', { name, email, password, currency });
    localStorage.setItem('ledgerly_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const demoLogin = async () => {
    const res = await api.post('/auth/demo');
    localStorage.setItem('ledgerly_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('ledgerly_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (updates) => {
    const res = await api.patch('/auth/me', updates);
    setUser(res.data.user);
    return res.data.user;
  };

  const formatMoney = (amount) => {
    const cur = user?.currency || 'USD';
    const sym = CURRENCY_SYMBOLS[cur] || '$';
    const num = Number(amount) || 0;
    return `${sym}${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        updateUser,
        formatMoney,
        currencySymbol: CURRENCY_SYMBOLS[user?.currency || 'USD'] || '$',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
