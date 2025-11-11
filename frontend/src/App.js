import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import RecordPodcast from './pages/RecordPodcast';
import Episodes from './pages/Episodes';
import Podcasts from './pages/Podcasts';
import AuthCallback from './pages/AuthCallback';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
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
    </ThemeProvider>
  );
}

export default App;

