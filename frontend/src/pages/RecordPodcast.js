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
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  ListItemText,
  Avatar,
  ListItemAvatar,
  ListItem,
  List
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import RecordRTC from 'recordrtc';
import api from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';

// Enhanced recording configuration
const getOptimalRecordingSettings = () => {
  const capabilities = {
    vp9: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus'),
    vp8: MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus'),
    h264: MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E')
  };

  if (capabilities.vp9) {
    return {
      type: 'video',
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 5000000, // 5 Mbps for better quality
      audioBitsPerSecond: 192000
    };
  } else if (capabilities.vp8) {
    return {
      type: 'video',
      mimeType: 'video/webm;codecs=vp8,opus',
      videoBitsPerSecond: 3000000,
      audioBitsPerSecond: 128000
    };
  } else {
    return {
      type: 'video',
      mimeType: 'video/webm',
      videoBitsPerSecond: 2500000,
      audioBitsPerSecond: 128000
    };
  }
};

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
    description: '',
    guestIds: []
  });
  const [guests, setGuests] = useState([]);
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  const videoRef = useRef(null);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    fetchPodcasts();
    fetchGuests();
    
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

  const fetchGuests = async () => {
    try {
      const response = await api.get('/api/guests');
      setGuests(response.data);
    } catch (error) {
      console.error('Error fetching guests:', error);
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
      
      // Enhanced media constraints for better quality
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 2
        },
        video: {
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30, min: 24 },
          facingMode: 'user',
          aspectRatio: 16/9
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Get optimal recording settings based on browser capabilities
      const recordingSettings = getOptimalRecordingSettings();
      
      const recorder = new RecordRTC(stream, {
        ...recordingSettings,
        timeSlice: 1000, // Record in 1-second chunks for better reliability
        getNativeBlob: false, // Use RecordRTC's blob handling
        checkForInactiveTracks: true,
        showMousePointer: false
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
        
        // Add guests to episode if any were selected
        if (formData.guestIds && formData.guestIds.length > 0) {
          await Promise.all(
            formData.guestIds.map(guestId =>
              api.post(`/api/episodes/${episodeResponse.data.id}/guests`, { guestId })
            )
          );
        }
        
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
                  sx={{ mb: 2 }}
                />

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Guests
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<PersonAddIcon />}
                      onClick={() => setShowGuestDialog(true)}
                      disabled={recording || uploading}
                    >
                      {formData.guestIds.length > 0 ? 'Change' : 'Add Guests'}
                    </Button>
                  </Box>
                  {formData.guestIds.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.guestIds.map(guestId => {
                        const guest = guests.find(g => g.id === guestId);
                        return guest ? (
                          <Chip
                            key={guestId}
                            label={guest.name}
                            avatar={<Avatar src={guest.profilePictureUrl}>{guest.name[0]}</Avatar>}
                            onDelete={() => {
                              setFormData(prev => ({
                                ...prev,
                                guestIds: prev.guestIds.filter(id => id !== guestId)
                              }));
                            }}
                            disabled={recording || uploading}
                          />
                        ) : null;
                      })}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No guests added. Click "Add Guests" to invite people to this recording.
                    </Typography>
                  )}
                </Box>

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

      {/* Guest Selection Dialog */}
      <Dialog open={showGuestDialog} onClose={() => setShowGuestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon />
            <Typography variant="h6">Select Guests</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {guests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                No guests yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add guests to your guest list first
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setShowGuestDialog(false);
                  navigate('/guests');
                }}
              >
                Go to Guests
              </Button>
            </Box>
          ) : (
            <FormControl fullWidth>
              <InputLabel>Select Guests</InputLabel>
              <Select
                multiple
                value={formData.guestIds}
                onChange={(e) => setFormData({ ...formData, guestIds: e.target.value })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((guestId) => {
                      const guest = guests.find(g => g.id === guestId);
                      return guest ? (
                        <Chip
                          key={guestId}
                          label={guest.name}
                          size="small"
                          avatar={<Avatar src={guest.profilePictureUrl}>{guest.name[0]}</Avatar>}
                        />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {guests.map((guest) => (
                  <MenuItem key={guest.id} value={guest.id}>
                    <Checkbox checked={formData.guestIds.indexOf(guest.id) > -1} />
                    <ListItemAvatar>
                      <Avatar src={guest.profilePictureUrl}>{guest.name[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={guest.name}
                      secondary={guest.title ? `${guest.title}${guest.company ? ` at ${guest.company}` : ''}` : guest.email}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGuestDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setShowGuestDialog(false);
              if (guests.length === 0) {
                navigate('/guests');
              }
            }}
            variant="contained"
          >
            {guests.length === 0 ? 'Add Guests' : 'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default RecordPodcast;
