import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';
import { getPersonas, getVerticals } from '../utils/podcastRecommendations';

function Settings() {
  const { user, updateUser, isGuestMode } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    persona: '',
    vertical: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        persona: user.persona || '',
        vertical: user.vertical || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.put('/auth/profile', {
        persona: formData.persona,
        vertical: formData.vertical
      });
      updateUser(response.data);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const personas = getPersonas();
  const verticals = getVerticals();

  return (
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        {isGuestMode && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You're currently in guest mode. Some settings may not be available.
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={user?.profilePictureUrl}
                sx={{ width: 64, height: 64, mr: 2 }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h6">{user?.name || 'Guest User'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'guest@mangomagic.com'}
                </Typography>
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              disabled
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Profile information is managed through LinkedIn authentication.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Podcast Preferences
            </Typography>
            <Divider sx={{ my: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Your Role</InputLabel>
              <Select
                value={formData.persona}
                label="Your Role"
                onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
              >
                {personas.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Your Industry</InputLabel>
              <Select
                value={formData.vertical}
                label="Your Industry"
                onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
              >
                {verticals.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={loading || !formData.persona || !formData.vertical}
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default Settings;

