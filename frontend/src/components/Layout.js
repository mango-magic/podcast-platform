import React from 'react';
import { Container, Box } from '@mui/material';
import Navigation from './Navigation';
import { useAuth } from '../contexts/AuthContext';

function Layout({ children }) {
  const { user, isGuestMode } = useAuth();
  
  // Don't show navigation on auth pages or if not logged in
  const hideNav = !user && !isGuestMode;
  
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {!hideNav && <Navigation />}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}

export default Layout;

