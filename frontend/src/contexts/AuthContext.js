import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, getToken, setToken, logout as authLogout } from '../services/auth';

const AuthContext = createContext();

// Guest mode flag - set to true to bypass LinkedIn auth
const GUEST_MODE = true; // Set to false to re-enable LinkedIn auth

// Mock user for guest mode
const MOCK_GUEST_USER = {
  id: 'guest-user',
  email: 'guest@mangomagic.com',
  name: 'Guest User',
  linkedinId: 'guest',
  persona: 'CMO',
  vertical: 'SaaS',
  profileCompleted: true,
  profilePictureUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

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
  const [isGuestMode] = useState(GUEST_MODE);

  useEffect(() => {
    const initAuth = async () => {
      // If guest mode is enabled, use mock user
      if (GUEST_MODE) {
        console.log('🎭 Guest mode enabled - bypassing LinkedIn auth');
        setUser(MOCK_GUEST_USER);
        setLoading(false);
        return;
      }

      // Normal auth flow
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
    // If guest mode is enabled, just set the mock user
    if (GUEST_MODE) {
      console.log('🎭 Guest mode: Using mock user');
      setUser(MOCK_GUEST_USER);
      return;
    }

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
    if (GUEST_MODE) {
      // In guest mode, just clear the user
      setUser(null);
      return;
    }
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
    <AuthContext.Provider value={{ user, loading, login, logout, handleAuthCallback, updateUser, isGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
};

