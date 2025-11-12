import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Grid,
  IconButton
} from '@mui/material';
import {
  Mic as MicIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

function Episodes() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    try {
      const response = await api.get('/api/episodes');
      setEpisodes(response.data);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    } finally {
      setLoading(false);
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
            Episodes
          </Typography>
          <Button
            variant="contained"
            startIcon={<MicIcon />}
            onClick={() => navigate('/record')}
          >
            Record New Episode
          </Button>
        </Box>

        {episodes.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <MicIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No episodes yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Record your first episode to get started!
              </Typography>
              <Button
                variant="contained"
                startIcon={<MicIcon />}
                onClick={() => navigate('/record')}
              >
                Record Your First Episode
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {episodes.map((episode) => (
              <Grid item xs={12} md={6} key={episode.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => navigate(`/episodes/${episode.id}`)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {episode.title || 'Untitled Episode'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {episode.description || 'No description'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={episode.status}
                        size="small"
                        color={
                          episode.status === 'published' ? 'success' :
                          episode.status === 'processing' ? 'warning' : 'default'
                        }
                      />
                      {episode.podcast && (
                        <Chip label={episode.podcast.name} size="small" variant="outlined" />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(episode.createdAt).toLocaleDateString()}
                    </Typography>
                    {episode.videoUrl && (
                      <Box sx={{ mt: 2 }}>
                        <video
                          src={episode.videoUrl}
                          controls
                          style={{ width: '100%', borderRadius: '8px' }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Box>
                    )}
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

export default Episodes;

