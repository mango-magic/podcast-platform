import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Alert, 
  Button, 
  Fade,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';

function AuthError() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const errorMessage = searchParams.get('message') || 'Authentication failed. Please try again.';
  const errorCode = searchParams.get('code') || 'unknown';
  
  // Get user-friendly error title and suggestions based on error code
  const getErrorDetails = (code) => {
    switch (code) {
      case 'auth_error':
        return {
          title: 'Authentication Error',
          suggestion: 'There was an issue verifying your LinkedIn account. Please ensure your LinkedIn account has an email address and try again.',
          icon: '🔐'
        };
      case 'no_user':
        return {
          title: 'User Not Found',
          suggestion: 'We couldn\'t retrieve your user information. Please try logging in again.',
          icon: '👤'
        };
      case 'token_error':
        return {
          title: 'Session Error',
          suggestion: 'There was an issue creating your session. Please try logging in again.',
          icon: '🔑'
        };
      default:
        return {
          title: 'Sign In Error',
          suggestion: 'Something went wrong during sign in. Please try again.',
          icon: '⚠️'
        };
    }
  };
  
  const errorDetails = getErrorDetails(errorCode);
  
  const handleRetry = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    window.location.href = `${apiUrl}/auth/linkedin`;
  };
  
  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
        py={4}
      >
        <Fade in={true}>
          <Card 
            sx={{ 
              width: '100%',
              textAlign: 'center',
              boxShadow: 3,
              borderRadius: 3
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
                  {errorDetails.icon}
                </Typography>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  {errorDetails.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {errorDetails.suggestion}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  textAlign: 'left',
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
                icon={<ErrorOutlineIcon />}
              >
                <Typography variant="body2" component="div">
                  <strong>Details:</strong> {errorMessage}
                </Typography>
              </Alert>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleRetry}
                  startIcon={<RefreshIcon />}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Try Signing In Again
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/')}
                  startIcon={<HomeIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Return to Home
                </Button>
              </Box>
              
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  If this problem persists, please check:
                </Typography>
                <Box component="ul" sx={{ mt: 1, textAlign: 'left', pl: 3 }}>
                  <Typography component="li" variant="caption" color="text.secondary">
                    Your LinkedIn account has an email address
                  </Typography>
                  <Typography component="li" variant="caption" color="text.secondary">
                    You're using a supported browser
                  </Typography>
                  <Typography component="li" variant="caption" color="text.secondary">
                    Cookies are enabled in your browser
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Container>
  );
}

export default AuthError;
