import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, getToken, setToken, logout as authLogout } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Auth error:', error);
          authLogout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    window.location.href = `${apiUrl}/auth/linkedin`;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const handleAuthCallback = (token) => {
    setToken(token);
    getCurrentUser().then(setUser).catch(console.error);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, handleAuthCallback }}>
      {children}
    </AuthContext.Provider>
  );
};

