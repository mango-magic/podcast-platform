import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
          <Typography variant="h3" gutterBottom>
            Welcome to Podcast Platform
          </Typography>
          <Typography variant="body1" gutterBottom>
            Sign in with LinkedIn to get started
          </Typography>
          <Button variant="contained" color="primary" onClick={login} sx={{ mt: 2 }}>
            Sign in with LinkedIn
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name}!
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/record')}
            size="large"
          >
            Record New Episode
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/podcasts')}
            size="large"
          >
            My Podcasts
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/episodes')}
            size="large"
          >
            Episodes
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Dashboard;

