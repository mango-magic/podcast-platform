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
  Alert,
  Chip,
  Divider,
  Fade,
  Zoom,
  Skeleton
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  getPodcastRecommendations, 
  getWelcomeMessage, 
  getDemographicTheme 
} from '../utils/podcastRecommendations';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { StatsSkeleton, RecommendationsSkeleton } from '../components/Skeletons';
import { useToast } from '../contexts/ToastContext';

function Dashboard() {
  const { user, loading: authLoading, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ podcasts: 0, episodes: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // Get personalized theme based on persona
  const theme = user?.persona 
    ? createTheme({
        palette: {
          primary: {
            main: getDemographicTheme(user.persona, user.vertical).primary,
          },
          secondary: {
            main: getDemographicTheme(user.persona, user.vertical).secondary,
          },
        },
      })
    : createTheme({
        palette: {
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
      });

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

  const welcomeMessage = user.persona && user.vertical 
    ? getWelcomeMessage(user.persona, user.vertical)
    : 'Welcome to MangoMagic! Complete your profile to get personalized recommendations.';

  return (
    <ThemeProvider theme={theme}>
      <Container component="main">
        <Box sx={{ mt: 4 }}>
          <Box sx={{ mb: 3, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  component="h1"
                  sx={{ fontWeight: 600 }}
                >
                  Welcome, {user.name}!
                </Typography>
                
                {user.persona && user.vertical && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', mt: 1 }}>
                    <Chip 
                      label={user.persona} 
                      color="primary" 
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip 
                      label={user.vertical} 
                      color="secondary" 
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                )}
              </Box>
              
              {user.persona && user.vertical && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleNavigate('/onboarding')}
                  sx={{ 
                    minWidth: 'auto', 
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      transform: 'scale(1.1)',
                      boxShadow: 3
                    }
                  }}
                  aria-label="Optimize AI suggestions"
                >
                  <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>💫</Typography>
                </Button>
              )}
            </Box>
            
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontSize: '1.05rem', lineHeight: 1.6 }}
            >
              {welcomeMessage}
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {statsLoading ? (
            <StatsSkeleton />
          ) : (
            <Fade in={!statsLoading} timeout={500}>
              <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Podcasts
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 600 }}>
                        {stats.podcasts}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Episodes
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 600 }}>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Recommended Podcast Ideas for You
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Based on your role as {user.persona} in {user.vertical}
                    </Typography>
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  {recommendations.map((rec, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Zoom in={true} timeout={400 + (index * 100)}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-8px) scale(1.02)',
                              boxShadow: 8
                            }
                          }}
                          onClick={() => {
                            showToast(`"${rec.name}" - Great choice! 🎯`, 'info');
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                            <Typography 
                              variant="h6" 
                              gutterBottom
                              sx={{ 
                                fontWeight: 600,
                                mb: 1.5,
                                color: 'primary.main'
                              }}
                            >
                              {rec.name}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ lineHeight: 1.7 }}
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
                  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(66, 165, 245, 0.05) 100%)',
                  border: '2px dashed',
                  borderColor: 'primary.light',
                  borderRadius: 3
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Ready to start your podcast journey? 🎙️
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                    Create your first podcast and start recording episodes to share your expertise with your audience.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleNavigate('/podcasts')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  >
                    Create Your First Podcast
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          )}

          {(recommendations.length > 0 || (!statsLoading && stats.podcasts === 0 && stats.episodes === 0)) && (
            <Divider sx={{ my: 4 }} />
          )}

          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => handleNavigate('/record')}
              size="large"
              aria-label="Record a new episode"
              sx={{
                px: 3,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              Record New Episode
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => handleNavigate('/podcasts')}
              size="large"
              aria-label="View my podcasts"
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              My Podcasts
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => handleNavigate('/episodes')}
              size="large"
              aria-label="View episodes"
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
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
                startIcon={<span>💫</span>}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                  }
                }}
              >
                Optimize Profile
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default Dashboard;
