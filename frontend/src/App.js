import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Dashboard from './pages/Dashboard';
import RecordPodcast from './pages/RecordPodcast';
import Episodes from './pages/Episodes';
import Podcasts from './pages/Podcasts';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import Onboarding from './pages/Onboarding';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  shape: {
    borderRadius: 12,
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
});

const PrivateRoute = ({ children }) => {
  const { user, loading, isGuestMode } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Allow access if user exists OR guest mode is enabled
  if (user || isGuestMode) {
    return children;
  }
  
  return <Navigate to="/" />;
};

const OnboardingRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to onboarding if profile not completed
  if (user && !user.profileCompleted) {
    return children;
  }
  
  // If profile completed, redirect to dashboard
  if (user && user.profileCompleted) {
    return <Navigate to="/" />;
  }
  
  // If not logged in, redirect to home
  return <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/error" element={<AuthError />} />
              <Route 
                path="/onboarding" 
                element={
                  <OnboardingRoute>
                    <Onboarding />
                  </OnboardingRoute>
                } 
              />
              <Route 
                path="/record" 
                element={
                  <PrivateRoute>
                    <RecordPodcast />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/episodes" 
                element={
                  <PrivateRoute>
                    <Episodes />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/podcasts" 
                element={
                  <PrivateRoute>
                    <Podcasts />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

