import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  CircularProgress, 
  Card, 
  CardContent, 
  Grid,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ podcasts: 0, episodes: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    
    try {
      setStatsLoading(true);
      setError(null);
      const [podcastsRes, episodesRes] = await Promise.all([
        api.get('/api/podcasts').catch(() => ({ data: [] })),
        api.get('/api/episodes').catch(() => ({ data: [] }))
      ]);
      setStats({
        podcasts: podcastsRes.data?.length || 0,
        episodes: episodesRes.data?.length || 0
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);

  const handleNavigate = useCallback((path) => {
    try {
      navigate(path);
    } catch (err) {
      console.error('Navigation error:', err);
      setError('Failed to navigate. Please try again.');
    }
  }, [navigate]);

  if (authLoading) {
    return (
      <Container>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
          aria-label="Loading dashboard"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="100vh"
          component="main"
        >
          <Typography variant="h3" gutterBottom component="h1">
            Welcome to MangoMagic 💫
          </Typography>
          <Typography variant="body1" gutterBottom align="center" sx={{ maxWidth: 500 }}>
            Sign in with LinkedIn to get personalised recommendations and content
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={login} 
            sx={{ mt: 2 }}
            aria-label="Sign in with LinkedIn"
          >
            Sign in with LinkedIn
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Welcome, {user.name}!
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {statsLoading ? (
          <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Podcasts
                  </Typography>
                  <Typography variant="h3" component="div">
                    {stats.podcasts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Episodes
                  </Typography>
                  <Typography variant="h3" component="div">
                    {stats.episodes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleNavigate('/record')}
            size="large"
            aria-label="Record a new episode"
          >
            Record New Episode
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => handleNavigate('/podcasts')}
            size="large"
            aria-label="View my podcasts"
          >
            My Podcasts
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => handleNavigate('/episodes')}
            size="large"
            aria-label="View episodes"
          >
            Episodes
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Dashboard;

