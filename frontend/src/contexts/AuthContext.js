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

  const login = async () => {
    // Check if user already has a valid token before redirecting
    const existingToken = getToken();
    if (existingToken) {
      try {
        // Token exists - validate it first
        const userData = await getCurrentUser();
        // Token is valid, user is already logged in
        setUser(userData);
        console.log('✅ User already authenticated, no need to login again');
        return;
      } catch (error) {
        // Token invalid or expired, proceed with OAuth
        console.log('Token invalid, proceeding with LinkedIn OAuth');
      }
    }
    
    // No valid token - redirect to LinkedIn OAuth
    // Note: LinkedIn will automatically use existing LinkedIn session if user is logged in
    // If they've authorized before, LinkedIn will auto-approve without showing login screen
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

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, handleAuthCallback, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

