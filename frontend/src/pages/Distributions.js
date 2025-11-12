import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Share as ShareIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';

function Distributions() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [distributions, setDistributions] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    episodeId: '',
    platform: 'linkedin'
  });

  useEffect(() => {
    fetchDistributions();
    fetchEpisodes();
  }, []);

  const fetchDistributions = async () => {
    try {
      const response = await api.get('/api/distributions');
      setDistributions(response.data);
    } catch (error) {
      console.error('Error fetching distributions:', error);
      showToast('Failed to load distributions', 'error');
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

  const handleCreate = async () => {
    try {
      await api.post('/api/distributions', formData);
      showToast('Distribution created successfully!', 'success');
      setDialogOpen(false);
      setFormData({ episodeId: '', platform: 'linkedin' });
      fetchDistributions();
    } catch (error) {
      console.error('Error creating distribution:', error);
      showToast('Failed to create distribution', 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'pending':
        return <ScheduleIcon color="warning" />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
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
            Distributions
          </Typography>
          <Button
            variant="contained"
            startIcon={<ShareIcon />}
            onClick={() => setDialogOpen(true)}
            disabled={episodes.length === 0}
          >
            Distribute Episode
          </Button>
        </Box>

        {episodes.length === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Create an episode first before distributing.
          </Alert>
        )}

        {distributions.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <ShareIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No distributions yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Distribute your episodes to social media platforms
              </Typography>
              <Button
                variant="contained"
                startIcon={<ShareIcon />}
                onClick={() => setDialogOpen(true)}
                disabled={episodes.length === 0}
              >
                Create Your First Distribution
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {distributions.map((distribution) => (
              <Grid item xs={12} md={6} key={distribution.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {getStatusIcon(distribution.status)}
                      <Typography variant="h6" sx={{ flex: 1 }}>
                        {distribution.episode?.title || 'Unknown Episode'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={distribution.platform}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={distribution.status}
                        size="small"
                        color={getStatusColor(distribution.status)}
                      />
                    </Box>
                    {distribution.publishedAt && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Published: {new Date(distribution.publishedAt).toLocaleString()}
                      </Typography>
                    )}
                    {distribution.errorMessage && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {distribution.errorMessage}
                      </Alert>
                    )}
                    {distribution.platformPostId && (
                      <Typography variant="caption" color="text.secondary">
                        Post ID: {distribution.platformPostId}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Distribute Episode</DialogTitle>
        <DialogContent>
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
                  {ep.title || 'Untitled Episode'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Platform</InputLabel>
            <Select
              value={formData.platform}
              label="Platform"
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            >
              <MenuItem value="linkedin">LinkedIn</MenuItem>
              <MenuItem value="twitter">Twitter/X</MenuItem>
              <MenuItem value="youtube">YouTube</MenuItem>
              <MenuItem value="tiktok">TikTok</MenuItem>
              <MenuItem value="instagram">Instagram</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!formData.episodeId}
          >
            Distribute
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default Distributions;

