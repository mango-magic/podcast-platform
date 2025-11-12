import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Grid,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';

function EpisodeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchEpisode();
  }, [id]);

  const fetchEpisode = async () => {
    try {
      const response = await api.get(`/api/episodes/${id}`);
      setEpisode(response.data);
      setFormData({
        title: response.data.title || '',
        description: response.data.description || '',
        status: response.data.status || 'draft'
      });
    } catch (error) {
      console.error('Error fetching episode:', error);
      showToast('Failed to load episode', 'error');
      navigate('/episodes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put(`/api/episodes/${id}`, formData);
      setEpisode(response.data);
      setEditing(false);
      showToast('Episode updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating episode:', error);
      showToast('Failed to update episode', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/episodes/${id}`);
      showToast('Episode deleted successfully', 'success');
      navigate('/episodes');
    } catch (error) {
      console.error('Error deleting episode:', error);
      showToast('Failed to delete episode', 'error');
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

  if (!episode) {
    return (
      <Layout>
        <Alert severity="error">Episode not found</Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <IconButton onClick={() => navigate('/episodes')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {editing ? 'Edit Episode' : episode.title}
          </Typography>
          {!editing && (
            <>
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
                      label="Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        label="Status"
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="processing">Processing</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                      </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving || !formData.title}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            title: episode.title || '',
                            description: episode.description || '',
                            status: episode.status || 'draft'
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Chip
                        label={episode.status}
                        color={
                          episode.status === 'published' ? 'success' :
                          episode.status === 'processing' ? 'warning' : 'default'
                        }
                      />
                      {episode.podcast && (
                        <Chip label={episode.podcast.name} variant="outlined" />
                      )}
                    </Box>
                    <Typography variant="h5" gutterBottom>
                      {episode.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                      {episode.description || 'No description'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(episode.createdAt).toLocaleString()}
                    </Typography>
                    {episode.publishedAt && (
                      <Typography variant="body2" color="text.secondary">
                        Published: {new Date(episode.publishedAt).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>

            {(episode.videoUrl || episode.audioUrl) && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Media
                  </Typography>
                  {episode.videoUrl && (
                    <Box sx={{ mb: 2 }}>
                      <video
                        src={episode.videoUrl}
                        controls
                        style={{ width: '100%', borderRadius: '8px' }}
                      />
                    </Box>
                  )}
                  {episode.audioUrl && (
                    <Box>
                      <audio
                        src={episode.audioUrl}
                        controls
                        style={{ width: '100%' }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {episode.videoUrl && (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayIcon />}
                      href={episode.videoUrl}
                      target="_blank"
                    >
                      Play Video
                    </Button>
                  )}
                  {episode.audioUrl && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PlayIcon />}
                      href={episode.audioUrl}
                      target="_blank"
                    >
                      Play Audio
                    </Button>
                  )}
                  {(episode.videoUrl || episode.audioUrl) && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      href={episode.videoUrl || episode.audioUrl}
                      download
                    >
                      Download
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate(`/clips?episodeId=${id}`)}
                  >
                    View Clips
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate(`/clips/create?episodeId=${id}`)}
                  >
                    Create Clip
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {episode.guests && episode.guests.length > 0 && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Guests
                  </Typography>
                  {episode.guests.map((guest) => (
                    <Box key={guest.id} sx={{ mb: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {guest.name}
                      </Typography>
                      {guest.title && (
                        <Typography variant="body2" color="text.secondary">
                          {guest.title}
                          {guest.company && ` at ${guest.company}`}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Episode?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{episode.title}"? This action cannot be undone.
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

export default EpisodeDetail;

