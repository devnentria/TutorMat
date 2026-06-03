import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('evalutrig_token');
    if (token) {
      auth.me()
        .then(u => setUser(u))
        .catch(() => {
          localStorage.removeItem('evalutrig_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await auth.login(username, password);
    localStorage.setItem('evalutrig_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (username, password, name, grade, country, state, school) => {
    const data = await auth.register(username, password, name, grade, country, state, school);
    localStorage.setItem('evalutrig_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('evalutrig_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
