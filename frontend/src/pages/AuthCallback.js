import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Box, CircularProgress, Typography } from '@mui/material';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { handleAuthCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleAuthCallback(token);
      navigate('/');
    } else {
      navigate('/');
    }
  }, [searchParams, handleAuthCallback, navigate]);

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Completing sign in...
        </Typography>
      </Box>
    </Container>
  );
}

export default AuthCallback;

