const express = require('express');
const { Podcast } = require('../models');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all podcasts for current user
router.get('/', async (req, res) => {
  try {
    const podcasts = await Podcast.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(podcasts);
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
});

// Get single podcast
router.get('/:id', async (req, res) => {
  try {
    const podcast = await Podcast.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    
    res.json(podcast);
  } catch (error) {
    console.error('Error fetching podcast:', error);
    res.status(500).json({ error: 'Failed to fetch podcast' });
  }
});

// Create new podcast
router.post('/', async (req, res) => {
  try {
    const { name, description, coverImageUrl, website } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Podcast name is required' });
    }
    
    const podcast = await Podcast.create({
      name,
      description,
      coverImageUrl,
      website,
      userId: req.user.id,
      rssFeedUrl: `${process.env.API_URL || 'http://localhost:3000'}/rss/${req.user.id}`
    });
    
    res.status(201).json(podcast);
  } catch (error) {
    console.error('Error creating podcast:', error);
    res.status(500).json({ error: 'Failed to create podcast' });
  }
});

// Update podcast
router.put('/:id', async (req, res) => {
  try {
    const podcast = await Podcast.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    
    const { name, description, coverImageUrl, website } = req.body;
    
    await podcast.update({
      name: name || podcast.name,
      description: description !== undefined ? description : podcast.description,
      coverImageUrl: coverImageUrl !== undefined ? coverImageUrl : podcast.coverImageUrl,
      website: website !== undefined ? website : podcast.website
    });
    
    res.json(podcast);
  } catch (error) {
    console.error('Error updating podcast:', error);
    res.status(500).json({ error: 'Failed to update podcast' });
  }
});

// Delete podcast
router.delete('/:id', async (req, res) => {
  try {
    const podcast = await Podcast.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    
    await podcast.destroy();
    res.json({ message: 'Podcast deleted successfully' });
  } catch (error) {
    console.error('Error deleting podcast:', error);
    res.status(500).json({ error: 'Failed to delete podcast' });
  }
});

module.exports = router;

