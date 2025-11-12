import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Movie as MovieIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';

function Clips() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const episodeId = searchParams.get('episodeId');
  const { showToast } = useToast();
  const [clips, setClips] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClip, setEditingClip] = useState(null);
  const [formData, setFormData] = useState({
    episodeId: episodeId || '',
    title: '',
    startTime: 0,
    duration: 30,
    platform: 'general'
  });

  useEffect(() => {
    fetchClips();
    if (!episodeId) {
      fetchEpisodes();
    }
  }, [episodeId]);

  const fetchClips = async () => {
    try {
      const url = episodeId ? `/api/clips?episodeId=${episodeId}` : '/api/clips';
      const response = await api.get(url);
      setClips(response.data);
    } catch (error) {
      console.error('Error fetching clips:', error);
      showToast('Failed to load clips', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodes = async () => {
    try {
      const response = await api.get('/api/episodes');
      setEpisodes(response.data);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    }
  };

  const handleOpenDialog = (clip = null) => {
    if (clip) {
      setEditingClip(clip);
      setFormData({
        episodeId: clip.episodeId || episodeId || '',
        title: clip.title || '',
        startTime: clip.startTime || 0,
        duration: clip.duration || 30,
        platform: clip.platform || 'general'
      });
    } else {
      setEditingClip(null);
      setFormData({
        episodeId: episodeId || '',
        title: '',
        startTime: 0,
        duration: 30,
        platform: 'general'
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingClip(null);
  };

  const handleSave = async () => {
    try {
      if (editingClip) {
        await api.put(`/api/clips/${editingClip.id}`, formData);
        showToast('Clip updated successfully!', 'success');
      } else {
        // Auto-generate clip using FFmpeg
        const response = await api.post('/api/clips', {
          ...formData,
          autoGenerate: true // Enable automatic clip generation
        });
        showToast('Clip created and processed successfully!', 'success');
      }
      handleCloseDialog();
      fetchClips();
    } catch (error) {
      console.error('Error saving clip:', error);
      const errorMsg = error.response?.data?.error || 'Failed to save clip';
      showToast(errorMsg, 'error');
    }
  };

  const handleDelete = async (clipId) => {
    if (!window.confirm('Are you sure you want to delete this clip?')) return;
    
    try {
      await api.delete(`/api/clips/${clipId}`);
      showToast('Clip deleted successfully', 'success');
      fetchClips();
    } catch (error) {
      console.error('Error deleting clip:', error);
      showToast('Failed to delete clip', 'error');
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
            Clips
            {episodeId && clips.length > 0 && (
              <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 2 }}>
                ({clips.length} clips)
              </Typography>
            )}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={!episodeId && episodes.length === 0}
          >
            Create Clip
          </Button>
        </Box>

        {!episodeId && episodes.length === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Create an episode first before creating clips.
          </Alert>
        )}

        {clips.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <MovieIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No clips yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create clips from your episodes to share on social media
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                disabled={!episodeId && episodes.length === 0}
              >
                Create Your First Clip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {clips.map((clip) => (
              <Grid item xs={12} sm={6} md={4} key={clip.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {clip.title}
                    </Typography>
                    {clip.episode && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        From: {clip.episode.title}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip label={clip.platform} size="small" />
                      <Chip
                        label={clip.status}
                        size="small"
                        color={clip.status === 'published' ? 'success' : 'default'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Start: {Math.floor(clip.startTime / 60)}:{(clip.startTime % 60).toString().padStart(2, '0')} | 
                      Duration: {clip.duration}s
                    </Typography>
                    {(clip.videoUrl || clip.audioUrl) && (
                      <Box sx={{ mb: 2 }}>
                        {clip.videoUrl ? (
                          <video
                            src={clip.videoUrl}
                            controls
                            style={{ width: '100%', borderRadius: '4px' }}
                          />
                        ) : (
                          <audio src={clip.audioUrl} controls style={{ width: '100%' }} />
                        )}
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {clip.videoUrl && (
                        <IconButton
                          size="small"
                          href={clip.videoUrl}
                          target="_blank"
                        >
                          <PlayIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(clip)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(clip.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingClip ? 'Edit Clip' : 'Create Clip'}
        </DialogTitle>
        <DialogContent>
          {!episodeId && (
            <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
              <InputLabel>Episode</InputLabel>
              <Select
                value={formData.episodeId}
                label="Episode"
                onChange={(e) => setFormData({ ...formData, episodeId: e.target.value })}
                required
              >
                {episodes.map((ep) => (
                  <MenuItem key={ep.id} value={ep.id}>
                    {ep.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
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
            label="Start Time (seconds)"
            type="number"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: parseInt(e.target.value) || 0 })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Duration (seconds)"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
            required
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Platform</InputLabel>
            <Select
              value={formData.platform}
              label="Platform"
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="linkedin">LinkedIn</MenuItem>
              <MenuItem value="twitter">Twitter/X</MenuItem>
              <MenuItem value="youtube">YouTube Shorts</MenuItem>
              <MenuItem value="tiktok">TikTok</MenuItem>
              <MenuItem value="instagram">Instagram Reels</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.title || !formData.episodeId}
          >
            {editingClip ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default Clips;

