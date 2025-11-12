import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Grid,
  Chip,
  IconButton,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Add as AddIcon,
  LibraryBooks as LibraryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';

function Podcasts() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', website: '' });
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const response = await api.get('/api/podcasts');
      setPodcasts(response.data);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      showToast('Failed to load podcasts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/podcasts', formData);
      setShowCreateForm(false);
      setFormData({ name: '', description: '', website: '' });
      showToast('Podcast created successfully!', 'success');
      navigate(`/podcasts/${response.data.id}`);
    } catch (error) {
      console.error('Error creating podcast:', error);
      showToast('Failed to create podcast', 'error');
    }
  };

  const handleDelete = async (podcastId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this podcast? This will also delete all episodes.')) return;
    
    try {
      await api.delete(`/api/podcasts/${podcastId}`);
      showToast('Podcast deleted successfully', 'success');
      fetchPodcasts();
    } catch (error) {
      console.error('Error deleting podcast:', error);
      showToast('Failed to delete podcast', 'error');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress sx={{ color: '#00d4ff' }} size={60} />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" className="gradient-text" sx={{ fontWeight: 800 }}>
            My Podcasts
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(!showCreateForm)}
            sx={{
              px: 3,
              py: 1.5,
            }}
          >
            {showCreateForm ? 'Cancel' : 'Create Podcast'}
          </Button>
        </Box>

        {showCreateForm && (
          <Fade in={showCreateForm}>
            <Card 
              sx={{ 
                mb: 4,
                background: 'rgba(15, 20, 40, 0.8)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, color: '#00d4ff' }}>
                  Create New Podcast
                </Typography>
                <form onSubmit={handleCreate}>
                  <TextField
                    fullWidth
                    label="Podcast Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    sx={{ mb: 3 }}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    multiline
                    rows={4}
                    sx={{ mb: 3 }}
                  />
                  <TextField
                    fullWidth
                    label="Website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    sx={{ mb: 3 }}
                  />
                  <Button type="submit" variant="contained" sx={{ mr: 2 }}>
                    Create
                  </Button>
                  <Button variant="outlined" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Fade>
        )}

        {podcasts.length === 0 ? (
          <Card 
            sx={{ 
              textAlign: 'center',
              py: 8,
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)',
              border: '2px dashed rgba(0, 212, 255, 0.4)',
            }}
          >
            <CardContent>
              <LibraryIcon sx={{ fontSize: 64, color: 'rgba(0, 212, 255, 0.5)', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                No podcasts yet
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                Create your first podcast to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateForm(true)}
              >
                Create Your First Podcast
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {podcasts.map((podcast, index) => (
              <Grid item xs={12} sm={6} md={4} key={podcast.id}>
                <Zoom in={true} timeout={300 + (index * 100)}>
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
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(0, 212, 255, 0.3)',
                        borderColor: 'rgba(0, 212, 255, 0.5)',
                      },
                    }}
                    onClick={() => navigate(`/podcasts/${podcast.id}`)}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#00d4ff' }}>
                            {podcast.name}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(podcast.id, e);
                          }}
                          sx={{
                            color: '#ff3366',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 51, 102, 0.1)',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      {podcast.description && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            mb: 2,
                            lineHeight: 1.7,
                          }}
                        >
                          {podcast.description}
                        </Typography>
                      )}
                      
                      {podcast.website && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                          <LaunchIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)', mr: 1 }} />
                          <Typography 
                            variant="caption" 
                            sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                          >
                            {podcast.website}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Layout>
  );
}

export default Podcasts;
