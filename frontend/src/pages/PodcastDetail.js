import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Grid,
  Chip,
  Divider,
  Link
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  RssFeed as RssIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';

function PodcastDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [podcast, setPodcast] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: ''
  });

  useEffect(() => {
    fetchPodcast();
    fetchEpisodes();
  }, [id]);

  const fetchPodcast = async () => {
    try {
      const response = await api.get(`/api/podcasts/${id}`);
      setPodcast(response.data);
      setFormData({
        name: response.data.name || '',
        description: response.data.description || '',
        website: response.data.website || ''
      });
    } catch (error) {
      console.error('Error fetching podcast:', error);
      showToast('Failed to load podcast', 'error');
      navigate('/podcasts');
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodes = async () => {
    try {
      const response = await api.get(`/api/episodes?podcastId=${id}`);
      setEpisodes(response.data);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put(`/api/podcasts/${id}`, formData);
      setPodcast(response.data);
      setEditing(false);
      showToast('Podcast updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating podcast:', error);
      showToast('Failed to update podcast', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/podcasts/${id}`);
      showToast('Podcast deleted successfully', 'success');
      navigate('/podcasts');
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

  if (!podcast) {
    return (
      <Layout>
        <Alert severity="error">Podcast not found</Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <IconButton onClick={() => navigate('/podcasts')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {editing ? 'Edit Podcast' : podcast.name}
          </Typography>
          {!editing && (
            <>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => navigate(`/record?podcastId=${id}`)}
              >
                Record Episode
              </Button>
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                variant="outlined"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                {editing ? (
                  <Box>
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
                      rows={6}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Website URL"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving || !formData.name}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            name: podcast.name || '',
                            description: podcast.description || '',
                            website: podcast.website || ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {podcast.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                      {podcast.description || 'No description'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(podcast.createdAt).toLocaleString()}
                    </Typography>
                    {podcast.website && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Website: <Link href={podcast.website} target="_blank">{podcast.website}</Link>
                      </Typography>
                    )}
                    {podcast.rssFeedUrl && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RssIcon />
                        <Typography variant="body2">
                          RSS Feed: <Link href={podcast.rssFeedUrl} target="_blank">{podcast.rssFeedUrl}</Link>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Episodes ({episodes.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/record?podcastId=${id}`)}
                  >
                    Record New
                  </Button>
                </Box>
                {episodes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No episodes yet. Record your first episode to get started!
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {episodes.map((episode) => (
                      <Card
                        key={episode.id}
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                        onClick={() => navigate(`/episodes/${episode.id}`)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" gutterBottom>
                                {episode.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {episode.description || 'No description'}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip
                                  label={episode.status}
                                  size="small"
                                  color={
                                    episode.status === 'published' ? 'success' :
                                    episode.status === 'processing' ? 'warning' : 'default'
                                  }
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(episode.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Podcast?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{podcast.name}"? This will also delete all associated episodes. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default PodcastDetail;

