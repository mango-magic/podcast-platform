import React, { useState, useRef, useEffect } from 'react';
import { Container, Button, Box, Typography, Alert } from '@mui/material';
import RecordRTC from 'recordrtc';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function RecordPodcast() {
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      // Cleanup: stop recording if component unmounts
      if (recorder) {
        recorder.stopRecording();
      }
    };
  }, [recorder]);

  const startRecording = async () => {
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
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post('/api/upload/episode', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        });
        
        setSuccess(`Recording uploaded successfully! URL: ${response.data.url}`);
        
        // Stop all tracks
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        
        setRecorder(null);
        setUploading(false);
        
        // Redirect to episodes after 2 seconds
        setTimeout(() => {
          navigate('/episodes');
        }, 2000);
      } catch (error) {
        console.error('Upload error:', error);
        setError(error.response?.data?.error || 'Failed to upload recording');
        setUploading(false);
      }
    });
  };

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Record Podcast Episode
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box sx={{ mt: 3 }}>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            style={{ 
              width: '100%', 
              maxWidth: '640px', 
              borderRadius: '8px',
              backgroundColor: '#000'
            }} 
          />
        </Box>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          {!recording ? (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={startRecording}
              size="large"
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
            >
              {uploading ? 'Uploading...' : 'Stop Recording'}
            </Button>
          )}
          
          <Button 
            variant="outlined" 
            onClick={() => navigate('/episodes')}
            disabled={recording}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default RecordPodcast;

