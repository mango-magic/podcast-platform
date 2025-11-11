import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Box, CircularProgress, Typography, Alert, Button, Fade } from '@mui/material';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { handleAuthCallback } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    const errorMessage = searchParams.get('message');
    
    if (errorMessage) {
      setError(errorMessage);
      setLoading(false);
      return;
    }
    
    if (token) {
      try {
        handleAuthCallback(token);
        // Small delay to show loading state
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Failed to complete authentication. Please try again.');
        setLoading(false);
      }
    } else {
      setError('No authentication token received. Please try logging in again.');
      setLoading(false);
    }
  }, [searchParams, handleAuthCallback, navigate]);

  if (error) {
    return (
      <Container>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="100vh"
        >
          <Fade in={true}>
            <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                >
                  Return to Home
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
                    window.location.href = `${apiUrl}/auth/linkedin`;
                  }}
                >
                  Try Again
                </Button>
              </Box>
            </Box>
          </Fade>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
      >
        <Fade in={true}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Completing sign in...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Setting up your personalized experience ✨
            </Typography>
          </Box>
        </Fade>
      </Box>
    </Container>
  );
}

export default AuthCallback;

