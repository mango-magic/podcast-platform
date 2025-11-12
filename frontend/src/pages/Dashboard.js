import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Button, 
  Box, 
  CircularProgress, 
  Card, 
  CardContent, 
  Grid,
  Alert,
  Chip,
  Divider,
  Fade,
  Zoom,
  Container,
} from '@mui/material';
import { 
  AutoAwesome as SparkleIcon,
  Mic as MicIcon,
  LibraryBooks as LibraryIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  getPodcastRecommendations, 
  getWelcomeMessage, 
} from '../utils/podcastRecommendations';
import { StatsSkeleton, RecommendationsSkeleton } from '../components/Skeletons';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';

function Dashboard() {
  const { user, loading: authLoading, login, isGuestMode } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ podcasts: 0, episodes: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

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
      // Redirect to onboarding if profile not completed
      if (!user.profileCompleted && (!user.persona || !user.vertical)) {
        navigate('/onboarding');
        return;
      }
      
      fetchStats();
      
      // Load personalized recommendations
      if (user.persona && user.vertical) {
        const recs = getPodcastRecommendations(user.persona, user.vertical);
        setRecommendations(recs);
      }
    }
  }, [user, fetchStats, navigate]);

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
      <Layout>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="80vh"
          aria-label="Loading dashboard"
        >
          <CircularProgress sx={{ color: '#00d4ff' }} size={60} />
        </Box>
      </Layout>
    );
  }

  if (!user) {
    // In guest mode, automatically log in with mock user
    if (isGuestMode) {
      login();
      return (
        <Layout>
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="80vh"
            aria-label="Loading dashboard"
          >
            <CircularProgress sx={{ color: '#00d4ff' }} size={60} />
          </Box>
        </Layout>
      );
    }

    return (
      <Layout>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="80vh"
          component="main"
        >
          <Typography 
            variant="h2" 
            gutterBottom 
            component="h1"
            className="gradient-text"
            sx={{ mb: 3 }}
          >
            Welcome to MangoMagic 💫
          </Typography>
          <Typography 
            variant="h6" 
            gutterBottom 
            align="center" 
            sx={{ 
              maxWidth: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 4,
            }}
          >
            Sign in with LinkedIn to get personalized recommendations and content
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={login} 
            sx={{ 
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
            }}
            aria-label="Sign in with LinkedIn"
          >
            Sign in with LinkedIn
          </Button>
        </Box>
      </Layout>
    );
  }

  const welcomeMessage = user.persona && user.vertical 
    ? getWelcomeMessage(user.persona, user.vertical)
    : 'Welcome to MangoMagic! Complete your profile to get personalized recommendations.';

  return (
    <Layout>
      <Box sx={{ mt: 2 }}>
        {/* Hero Section */}
        <Box sx={{ mb: 6, position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
              <Typography 
                variant="h3" 
                gutterBottom 
                component="h1"
                className="gradient-text"
                sx={{ mb: 2 }}
              >
                Welcome back, {user.name}! ✨
              </Typography>
              
              {user.persona && user.vertical && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', mt: 2 }}>
                  <Chip 
                    label={user.persona} 
                    sx={{
                      background: 'rgba(0, 212, 255, 0.2)',
                      border: '1px solid rgba(0, 212, 255, 0.4)',
                      color: '#00d4ff',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  />
                  <Chip 
                    label={user.vertical} 
                    sx={{
                      background: 'rgba(255, 0, 255, 0.2)',
                      border: '1px solid rgba(255, 0, 255, 0.4)',
                      color: '#ff00ff',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  />
                </Box>
              )}
            </Box>
            
            {user.persona && user.vertical && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleNavigate('/onboarding')}
                startIcon={<SparkleIcon />}
                sx={{ 
                  minWidth: 'auto', 
                  px: 2,
                  borderRadius: 2,
                }}
                aria-label="Optimize AI suggestions"
              >
                Optimize
              </Button>
            )}
          </Box>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.8,
              maxWidth: 800,
            }}
          >
            {welcomeMessage}
          </Typography>
        </Box>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2, 
              mb: 2,
              background: 'rgba(255, 51, 102, 0.1)',
              border: '1px solid rgba(255, 51, 102, 0.3)',
              color: '#ff3366',
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        {statsLoading ? (
          <StatsSkeleton />
        ) : (
          <Fade in={!statsLoading} timeout={500}>
            <Grid container spacing={3} sx={{ mt: 2, mb: 6 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0, 212, 255, 0.3)',
                      borderColor: 'rgba(0, 212, 255, 0.5)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LibraryIcon sx={{ color: '#00d4ff', mr: 1, fontSize: 28 }} />
                      <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Podcasts
                      </Typography>
                    </Box>
                    <Typography variant="h2" component="div" sx={{ fontWeight: 800, color: '#00d4ff' }}>
                      {stats.podcasts}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1) 0%, rgba(255, 0, 255, 0.05) 100%)',
                    border: '1px solid rgba(255, 0, 255, 0.3)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(255, 0, 255, 0.3)',
                      borderColor: 'rgba(255, 0, 255, 0.5)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PlayIcon sx={{ color: '#ff00ff', mr: 1, fontSize: 28 }} />
                      <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Episodes
                      </Typography>
                    </Box>
                    <Typography variant="h2" component="div" sx={{ fontWeight: 800, color: '#ff00ff' }}>
                      {stats.episodes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Fade>
        )}

        {/* Personalized Podcast Recommendations */}
        {recommendations.length > 0 ? (
          <Fade in={recommendations.length > 0} timeout={600}>
            <Box sx={{ mt: 4, mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                    Recommended Podcast Ideas
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Based on your role as {user.persona} in {user.vertical}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => handleNavigate('/inspiration')}
                  startIcon={<SparkleIcon />}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  Explore All Ideas
                </Button>
              </Box>
              <Grid container spacing={3}>
                {recommendations.map((rec, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Zoom in={true} timeout={400 + (index * 100)}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          background: 'rgba(15, 20, 40, 0.6)',
                          border: '1px solid rgba(0, 212, 255, 0.2)',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: '0 12px 40px rgba(0, 212, 255, 0.3)',
                            borderColor: 'rgba(0, 212, 255, 0.5)',
                          }
                        }}
                        onClick={() => {
                          showToast(`"${rec.name}" - Great choice! 🎯`, 'info');
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{ 
                              fontWeight: 700,
                              mb: 2,
                              color: '#00d4ff',
                            }}
                          >
                            {rec.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.7)',
                              lineHeight: 1.8,
                            }}
                          >
                            {rec.hook}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>
        ) : user.persona && user.vertical ? (
          <RecommendationsSkeleton />
        ) : null}

        {/* Empty State for New Users */}
        {!statsLoading && stats.podcasts === 0 && stats.episodes === 0 && (
          <Fade in={!statsLoading}>
            <Card 
              sx={{ 
                mt: 4, 
                mb: 4,
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)',
                border: '2px dashed rgba(0, 212, 255, 0.4)',
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  Ready to start your podcast journey? 🎙️
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, maxWidth: 500, mx: 'auto', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Create your first podcast and start recording episodes to share your expertise with your audience.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleNavigate('/podcasts')}
                  startIcon={<MicIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                  }}
                >
                  Create Your First Podcast
                </Button>
              </CardContent>
            </Card>
          </Fade>
        )}

        {(recommendations.length > 0 || (!statsLoading && stats.podcasts === 0 && stats.episodes === 0)) && (
          <Divider sx={{ my: 4, borderColor: 'rgba(0, 212, 255, 0.2)' }} />
        )}

        {/* Quick Actions */}
        <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => handleNavigate('/record')}
            size="large"
            startIcon={<MicIcon />}
            aria-label="Record a new episode"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
            }}
          >
            Record New Episode
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => handleNavigate('/podcasts')}
            size="large"
            startIcon={<LibraryIcon />}
            aria-label="View my podcasts"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
            }}
          >
            My Podcasts
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => handleNavigate('/episodes')}
            size="large"
            startIcon={<PlayIcon />}
            aria-label="View episodes"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
            }}
          >
            Episodes
          </Button>
          {(!user.persona || !user.vertical) && (
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={() => handleNavigate('/onboarding')}
              size="large"
              startIcon={<SparkleIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              Optimize Profile
            </Button>
          )}
        </Box>
      </Box>
    </Layout>
  );
}

export default Dashboard;
