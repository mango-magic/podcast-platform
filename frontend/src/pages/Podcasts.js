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
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  LibraryBooks as LibraryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
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
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            My Podcasts
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create Podcast'}
          </Button>
        </Box>

        {showCreateForm && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <form onSubmit={handleCreate}>
                <TextField
                  fullWidth
                  label="Podcast Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Website URL"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained">
                  Create Podcast
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {podcasts.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <LibraryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No podcasts yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first podcast to get started!
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
            {podcasts.map((podcast) => (
              <Grid item xs={12} md={6} key={podcast.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => navigate(`/podcasts/${podcast.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {podcast.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {podcast.description || 'No description'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {new Date(podcast.createdAt).toLocaleDateString()}
                        </Typography>
                        {podcast.rssFeedUrl && (
                          <Chip
                            label="RSS Feed Available"
                            size="small"
                            sx={{ mt: 1 }}
                            color="success"
                          />
                        )}
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/podcasts/${podcast.id}`);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDelete(podcast.id, e)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Layout>
  );
}

export default Podcasts;

