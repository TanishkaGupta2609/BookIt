/**
 * AuthContext.jsx
 * Provides authentication state and actions to the entire app.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, saveAuth, clearAuth } from '../utils/localStorageHelper';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on app load
  useEffect(() => {
    const auth = getAuth();
    if (auth?.token && auth?.user) {
      setUser(auth.user);
      setToken(auth.token);
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    saveAuth({ user: userData, token: authToken });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isOwner: user?.role === 'owner' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
