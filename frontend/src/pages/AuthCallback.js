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
      // If there's an error message, redirect to error page
      navigate(`/auth/error?message=${encodeURIComponent(errorMessage)}`);
      return;
    }
    
    if (token) {
      const processAuth = async () => {
        try {
          handleAuthCallback(token);
          // Small delay to show loading state and ensure token is saved
          await new Promise(resolve => setTimeout(resolve, 1000));
          navigate('/');
        } catch (err) {
          console.error('Auth callback error:', err);
          setError('Failed to complete authentication. Please try again.');
          setLoading(false);
        }
      };
      
      processAuth();
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
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{ mt: 2 }}
              >
                Return to Home
              </Button>
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

