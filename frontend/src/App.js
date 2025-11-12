import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import RecordPodcast from './pages/RecordPodcast';
import Episodes from './pages/Episodes';
import EpisodeDetail from './pages/EpisodeDetail';
import Podcasts from './pages/Podcasts';
import PodcastDetail from './pages/PodcastDetail';
import Guests from './pages/Guests';
import Clips from './pages/Clips';
import Distributions from './pages/Distributions';
import Settings from './pages/Settings';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import Onboarding from './pages/Onboarding';
import PodcastInspirationMap from './pages/PodcastInspirationMap';
import { futuristicTheme } from './theme/futuristicTheme';

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
    <ThemeProvider theme={futuristicTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
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
                path="/" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
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
                path="/episodes/:id" 
                element={
                  <PrivateRoute>
                    <EpisodeDetail />
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
              <Route 
                path="/podcasts/:id" 
                element={
                  <PrivateRoute>
                    <PodcastDetail />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/guests" 
                element={
                  <PrivateRoute>
                    <Guests />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/clips" 
                element={
                  <PrivateRoute>
                    <Clips />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/distributions" 
                element={
                  <PrivateRoute>
                    <Distributions />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/inspiration" 
                element={
                  <PrivateRoute>
                    <PodcastInspirationMap />
                  </PrivateRoute>
                } 
              />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;

