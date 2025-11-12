import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  Grid,
  Chip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';

function Guests() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    company: '',
    linkedinId: '',
    profilePictureUrl: ''
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await api.get('/api/guests');
      setGuests(response.data);
    } catch (error) {
      console.error('Error fetching guests:', error);
      showToast('Failed to load guests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (guest = null) => {
    if (guest) {
      setEditingGuest(guest);
      setFormData({
        name: guest.name || '',
        email: guest.email || '',
        title: guest.title || '',
        company: guest.company || '',
        linkedinId: guest.linkedinId || '',
        profilePictureUrl: guest.profilePictureUrl || ''
      });
    } else {
      setEditingGuest(null);
      setFormData({
        name: '',
        email: '',
        title: '',
        company: '',
        linkedinId: '',
        profilePictureUrl: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGuest(null);
    setFormData({
      name: '',
      email: '',
      title: '',
      company: '',
      linkedinId: '',
      profilePictureUrl: ''
    });
  };

  const handleSave = async () => {
    try {
      if (editingGuest) {
        await api.put(`/api/guests/${editingGuest.id}`, formData);
        showToast('Guest updated successfully!', 'success');
      } else {
        await api.post('/api/guests', formData);
        showToast('Guest added successfully!', 'success');
      }
      handleCloseDialog();
      fetchGuests();
    } catch (error) {
      console.error('Error saving guest:', error);
      showToast('Failed to save guest', 'error');
    }
  };

  const handleDelete = async (guestId) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) return;
    
    try {
      await api.delete(`/api/guests/${guestId}`);
      showToast('Guest deleted successfully', 'success');
      fetchGuests();
    } catch (error) {
      console.error('Error deleting guest:', error);
      showToast('Failed to delete guest', 'error');
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
            Guests
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Guest
          </Button>
        </Box>

        {guests.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No guests yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add guests to invite them to your podcast episodes
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Your First Guest
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {guests.map((guest) => (
              <Grid item xs={12} sm={6} md={4} key={guest.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={guest.profilePictureUrl}
                        sx={{ width: 56, height: 56, mr: 2 }}
                      >
                        {guest.name?.charAt(0)?.toUpperCase() || <PersonIcon />}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">
                          {guest.name}
                        </Typography>
                        {guest.title && (
                          <Typography variant="body2" color="text.secondary">
                            {guest.title}
                            {guest.company && ` at ${guest.company}`}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {guest.email && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {guest.email}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(guest)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(guest.id)}
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
          {editingGuest ? 'Edit Guest' : 'Add Guest'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="LinkedIn ID"
            value={formData.linkedinId}
            onChange={(e) => setFormData({ ...formData, linkedinId: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Profile Picture URL"
            value={formData.profilePictureUrl}
            onChange={(e) => setFormData({ ...formData, profilePictureUrl: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name}
          >
            {editingGuest ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default Guests;

