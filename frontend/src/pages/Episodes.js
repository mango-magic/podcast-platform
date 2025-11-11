import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Card, CardContent, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
          Episodes
        </Typography>
        <Button variant="contained" onClick={() => navigate('/record')}>
          Record New Episode
        </Button>
      </Box>

      {episodes.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" align="center">
              No episodes yet. Record your first episode to get started!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {episodes.map((episode) => (
            <Card key={episode.id}>
              <CardContent>
                <Typography variant="h6">{episode.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {episode.description || 'No description'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Status: {episode.status} | Created: {new Date(episode.createdAt).toLocaleDateString()}
                </Typography>
                {episode.videoUrl && (
                  <Box sx={{ mt: 2 }}>
                    <video 
                      src={episode.videoUrl} 
                      controls 
                      style={{ width: '100%', maxWidth: '600px' }}
                    />
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

export default Episodes;

