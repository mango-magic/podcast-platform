import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Fade,
  Zoom,
  LinearProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  getPersonas, 
  getVerticals, 
  getWelcomeMessage,
  getPodcastRecommendations 
} from '../utils/podcastRecommendations';
import { OnboardingSkeleton } from '../components/Skeletons';
import { useToast } from '../contexts/ToastContext';

function Onboarding() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [persona, setPersona] = useState(user?.persona || '');
  const [vertical, setVertical] = useState(user?.vertical || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [aiProcessing, setAiProcessing] = useState(true);

  const personas = getPersonas();
  const verticals = getVerticals();

  useEffect(() => {
    // Auto-populate from user data if available
    if (user) {
      if (user.persona) setPersona(user.persona);
      if (user.vertical) setVertical(user.vertical);
      
      // Stop AI processing if we have data
      if (user.persona || user.vertical) {
        setAiProcessing(false);
      }
      
      // Load recommendations if both are set
      if (user.persona && user.vertical) {
        const recs = getPodcastRecommendations(user.persona, user.vertical);
        setRecommendations(recs);
      }
    }
    
    // Timeout for AI processing (max 3 seconds)
    const timer = setTimeout(() => {
      setAiProcessing(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [user]);

  const handleSave = async (showSuccess = true) => {
    if (!persona || !vertical) return;

    try {
      setSaving(true);
      const response = await api.put('/auth/profile', { persona, vertical });
      updateUser(response.data);
      
      // Load recommendations
      const recs = getPodcastRecommendations(persona, vertical);
      setRecommendations(recs);
      
      if (showSuccess) {
        showToast('Profile saved successfully! 🎉', 'success');
        // Auto-redirect after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      showToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Auto-save if AI detected both but they're not saved yet
  useEffect(() => {
    if (persona && vertical && user && (!user.persona || !user.vertical) && !loading && !saving) {
      // Small delay to let user see the suggestions
      const timer = setTimeout(() => {
        handleSave(false); // Silent save
      }, 2000);
      return () => clearTimeout(timer);
    } else if (persona && vertical && user?.persona && user?.vertical) {
      // Already set, show recommendations
      const recs = getPodcastRecommendations(persona, vertical);
      setRecommendations(recs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona, vertical, user, loading, saving]);

  const handleOptimize = async () => {
    await handleSave(true);
    setOptimizeOpen(false);
  };

  // If both are already set and profile is completed, redirect
  if (user?.profileCompleted && user?.persona && user?.vertical) {
    navigate('/');
    return null;
  }

  // If we have AI-generated suggestions, show them immediately
  const hasAISuggestions = persona && vertical;
  const welcomeMessage = hasAISuggestions 
    ? getWelcomeMessage(persona, vertical)
    : 'We\'re setting up your personalized experience...';

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: { xs: 2, sm: 4 }, mb: 4, position: 'relative' }}>
        {/* Optimization Button - More visible */}
        {hasAISuggestions && (
          <Fade in={hasAISuggestions}>
            <IconButton
              sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s'
              }}
              onClick={() => setOptimizeOpen(true)}
              aria-label="Optimize AI suggestions"
            >
              <Typography variant="h5" sx={{ fontSize: '1.5rem' }}>💫</Typography>
            </IconButton>
          </Fade>
        )}

        <Typography 
          variant="h4" 
          gutterBottom 
          align="center"
          sx={{ 
            fontWeight: 600,
            mb: 3,
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome to MangoMagic! 🎙️
        </Typography>
        
        {hasAISuggestions ? (
          <Fade in={hasAISuggestions} timeout={500}>
            <Box>
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem'
                  }
                }}
              >
                ✨ AI detected your profile! Here's what we found:
              </Alert>
              
              <Card 
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  boxShadow: 4,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`Role: ${persona}`} 
                      color="primary" 
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip 
                      label={`Industry: ${vertical}`} 
                      color="secondary" 
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}
                  >
                    {welcomeMessage}
                  </Typography>

                  {saving && (
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress sx={{ borderRadius: 1 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Saving your preferences...
                      </Typography>
                    </Box>
                  )}

                  {recommendations.length > 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                        Recommended Podcast Ideas for You
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {recommendations.slice(0, 3).map((rec, index) => (
                          <Zoom in={true} timeout={300 + (index * 100)} key={index}>
                            <Card 
                              variant="outlined"
                              sx={{
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  boxShadow: 2,
                                  transform: 'translateX(4px)'
                                }
                              }}
                            >
                              <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                  {rec.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                  {rec.hook}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Zoom>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {!saving && (
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={async () => {
                        // Ensure profile is saved before navigating
                        if (persona && vertical && (!user?.persona || !user?.vertical)) {
                          await handleSave(false);
                        }
                        navigate('/');
                      }}
                      sx={{ 
                        mt: 3,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)',
                          transform: 'translateY(-2px)',
                          boxShadow: 4
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      Looks Good! Let's Go 🚀
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Fade>
        ) : (
          <OnboardingSkeleton />
        )}

        {/* Show manual option if AI processing takes too long */}
        {!hasAISuggestions && !aiProcessing && (
          <Fade in={!hasAISuggestions && !aiProcessing} timeout={500}>
            <Card sx={{ mt: 2, borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Having trouble detecting your profile?
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setOptimizeOpen(true)}
                  startIcon={<span>💫</span>}
                  sx={{ mt: 2 }}
                >
                  Set Manually
                </Button>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Optimization Dialog */}
        <Dialog 
          open={optimizeOpen} 
          onClose={() => setOptimizeOpen(false)} 
          maxWidth="sm" 
          fullWidth
          TransitionComponent={Fade}
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            💫 Optimize Your Profile
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Fine-tune the AI's suggestions to better match your role and industry.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="persona-label">Your Role</InputLabel>
              <Select
                labelId="persona-label"
                id="persona"
                value={persona}
                label="Your Role"
                onChange={(e) => setPersona(e.target.value)}
              >
                {personas.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="vertical-label">Your Industry</InputLabel>
              <Select
                labelId="vertical-label"
                id="vertical"
                value={vertical}
                label="Your Industry"
                onChange={(e) => setVertical(e.target.value)}
              >
                {verticals.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {persona && vertical && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                {getWelcomeMessage(persona, vertical)}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOptimizeOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleOptimize} 
              variant="contained"
              disabled={!persona || !vertical || saving}
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default Onboarding;
