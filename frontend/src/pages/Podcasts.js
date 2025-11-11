import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Card, CardContent, CircularProgress, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Podcasts() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', website: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const response = await api.get('/api/podcasts');
      setPodcasts(response.data);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/podcasts', formData);
      setShowCreateForm(false);
      setFormData({ name: '', description: '', website: '' });
      fetchPodcasts();
    } catch (error) {
      console.error('Error creating podcast:', error);
      alert('Failed to create podcast');
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          My Podcasts
        </Typography>
        <Button variant="contained" onClick={() => setShowCreateForm(!showCreateForm)}>
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
          <CardContent>
            <Typography variant="body1" align="center">
              No podcasts yet. Create your first podcast to get started!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {podcasts.map((podcast) => (
            <Card key={podcast.id}>
              <CardContent>
                <Typography variant="h6">{podcast.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {podcast.description || 'No description'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(podcast.createdAt).toLocaleDateString()}
                </Typography>
                {podcast.rssFeedUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption">RSS Feed: {podcast.rssFeedUrl}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default Podcasts;

