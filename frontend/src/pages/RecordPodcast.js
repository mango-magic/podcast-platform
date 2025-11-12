import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Box,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  LinearProgress,
  Grid
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import RecordRTC from 'recordrtc';
import api from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';

function RecordPodcast() {
  const [searchParams] = useSearchParams();
  const podcastIdParam = searchParams.get('podcastId');
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [podcasts, setPodcasts] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    podcastId: podcastIdParam || '',
    title: '',
    description: ''
  });
  const videoRef = useRef(null);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    fetchPodcasts();
    
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (recorder) {
        recorder.stopRecording();
      }
    };
  }, [recording]);

  const fetchPodcasts = async () => {
    try {
      const response = await api.get('/api/podcasts');
      setPodcasts(response.data);
      if (response.data.length > 0 && !podcastIdParam) {
        setFormData(prev => ({ ...prev, podcastId: response.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!formData.podcastId) {
      setError('Please select a podcast first');
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const recorder = new RecordRTC(stream, {
        type: 'video',
        mimeType: 'video/webm',
        videoBitsPerSecond: 2500000
      });
      
      recorder.startRecording();
      setRecorder(recorder);
      setRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please check your camera and microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (!recorder) return;
    
    setRecording(false);
    recorder.stopRecording(async () => {
      try {
        const blob = recorder.getBlob();
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
        
        setUploading(true);
        setError(null);
        setUploadProgress(0);
        
        // First upload the file
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        
        const uploadResponse = await api.post('/api/upload/episode', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        
        // Then create the episode
        const episodeData = {
          podcastId: formData.podcastId,
          title: formData.title || `Recording ${new Date().toLocaleString()}`,
          description: formData.description || '',
          videoUrl: uploadResponse.data.url,
          status: 'draft'
        };
        
        const episodeResponse = await api.post('/api/episodes', episodeData);
        
        showToast('Episode recorded and saved successfully!', 'success');
        
        // Stop all tracks
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        
        setRecorder(null);
        setUploading(false);
        
        // Redirect to episode detail page
        setTimeout(() => {
          navigate(`/episodes/${episodeResponse.data.id}`);
        }, 1500);
      } catch (error) {
        console.error('Upload error:', error);
        setError(error.response?.data?.error || 'Failed to upload recording');
        setUploading(false);
      }
    });
  };

  const handleCancel = () => {
    if (recording && recorder) {
      recorder.stopRecording();
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
    navigate('/episodes');
  };

  return (
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Record Podcast Episode
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    style={{ 
                      width: '100%', 
                      borderRadius: '8px',
                      backgroundColor: '#000',
                      minHeight: '400px'
                    }} 
                  />
                  {recording && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        backgroundColor: 'error.main',
                        color: 'white',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: 'white',
                          animation: 'pulse 1s infinite'
                        }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        REC {formatTime(recordingTime)}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {uploading && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Uploading... {uploadProgress}%
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  {!recording ? (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={startRecording}
                      size="large"
                      startIcon={<MicIcon />}
                      disabled={!formData.podcastId || uploading}
                    >
                      Start Recording
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      color="error" 
                      onClick={stopRecording}
                      size="large"
                      disabled={uploading}
                      startIcon={<StopIcon />}
                    >
                      Stop & Save
                    </Button>
                  )}
                  
                  <Button 
                    variant="outlined" 
                    onClick={handleCancel}
                    disabled={uploading}
                    startIcon={<CancelIcon />}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Episode Details
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Podcast</InputLabel>
                  <Select
                    value={formData.podcastId}
                    label="Podcast"
                    onChange={(e) => setFormData({ ...formData, podcastId: e.target.value })}
                    disabled={recording || uploading}
                    required
                  >
                    {podcasts.map((podcast) => (
                      <MenuItem key={podcast.id} value={podcast.id}>
                        {podcast.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Episode Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={recording || uploading}
                  placeholder="Enter episode title..."
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={4}
                  disabled={recording || uploading}
                  placeholder="Enter episode description..."
                />

                {podcasts.length === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No podcasts yet. <Button size="small" onClick={() => navigate('/podcasts')}>Create one first</Button>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}

export default RecordPodcast;
