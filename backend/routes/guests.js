const express = require('express');
const { Guest } = require('../models');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all guests
router.get('/', async (req, res) => {
  try {
    const guests = await Guest.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
});

// Get single guest
router.get('/:id', async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    
    res.json(guest);
  } catch (error) {
    console.error('Error fetching guest:', error);
    res.status(500).json({ error: 'Failed to fetch guest' });
  }
});

// Create new guest
router.post('/', async (req, res) => {
  try {
    const { linkedinId, name, email, title, company, profilePictureUrl } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Guest name is required' });
    }
    
    // Check if guest already exists
    let guest;
    if (linkedinId) {
      guest = await Guest.findOne({ where: { linkedinId } });
    }
    
    if (guest) {
      // Update existing guest
      await guest.update({
        name: name || guest.name,
        email: email || guest.email,
        title: title || guest.title,
        company: company || guest.company,
        profilePictureUrl: profilePictureUrl || guest.profilePictureUrl
      });
    } else {
      // Create new guest
      guest = await Guest.create({
        linkedinId,
        name,
        email,
        title,
        company,
        profilePictureUrl
      });
    }
    
    res.status(201).json(guest);
  } catch (error) {
    console.error('Error creating guest:', error);
    res.status(500).json({ error: 'Failed to create guest' });
  }
});

// Update guest
router.put('/:id', async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    
    const { name, email, title, company, profilePictureUrl } = req.body;
    
    await guest.update({
      name: name || guest.name,
      email: email || guest.email,
      title: title || guest.title,
      company: company || guest.company,
      profilePictureUrl: profilePictureUrl || guest.profilePictureUrl
    });
    
    res.json(guest);
  } catch (error) {
    console.error('Error updating guest:', error);
    res.status(500).json({ error: 'Failed to update guest' });
  }
});

// Delete guest
router.delete('/:id', async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    
    await guest.destroy();
    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Error deleting guest:', error);
    res.status(500).json({ error: 'Failed to delete guest' });
  }
});

module.exports = router;

