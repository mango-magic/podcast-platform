const express = require('express');
const { Episode, Podcast, Guest } = require('../models');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all episodes (optionally filtered by podcast)
router.get('/', async (req, res) => {
  try {
    const where = {};
    
    // If podcastId is provided, filter by it
    if (req.query.podcastId) {
      // Verify podcast belongs to user
      const podcast = await Podcast.findOne({
        where: {
          id: req.query.podcastId,
          userId: req.user.id
        }
      });
      
      if (!podcast) {
        return res.status(404).json({ error: 'Podcast not found' });
      }
      
      where.podcastId = req.query.podcastId;
    } else {
      // Get all podcasts for user and filter episodes
      const userPodcasts = await Podcast.findAll({
        where: { userId: req.user.id },
        attributes: ['id']
      });
      where.podcastId = userPodcasts.map(p => p.id);
    }
    
    const episodes = await Episode.findAll({
      where,
      include: [
        { model: Podcast, as: 'podcast', attributes: ['id', 'name'] },
        { model: Guest, as: 'guests', through: { attributes: [] } }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(episodes);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    res.status(500).json({ error: 'Failed to fetch episodes' });
  }
});

// Get single episode
router.get('/:id', async (req, res) => {
  try {
    const episode = await Episode.findByPk(req.params.id, {
      include: [
        { 
          model: Podcast, 
          as: 'podcast',
          where: { userId: req.user.id },
          required: true
        },
        { model: Guest, as: 'guests', through: { attributes: [] } }
      ]
    });
    
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    
    res.json(episode);
  } catch (error) {
    console.error('Error fetching episode:', error);
    res.status(500).json({ error: 'Failed to fetch episode' });
  }
});

// Create new episode
router.post('/', async (req, res) => {
  try {
    const { podcastId, title, description, audioUrl, videoUrl } = req.body;
    
    if (!podcastId || !title) {
      return res.status(400).json({ error: 'Podcast ID and title are required' });
    }
    
    // Verify podcast belongs to user
    const podcast = await Podcast.findOne({
      where: {
        id: podcastId,
        userId: req.user.id
      }
    });
    
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    
    const episode = await Episode.create({
      podcastId,
      title,
      description,
      audioUrl,
      videoUrl,
      status: 'draft'
    });
    
    res.status(201).json(episode);
  } catch (error) {
    console.error('Error creating episode:', error);
    res.status(500).json({ error: 'Failed to create episode' });
  }
});

// Update episode
router.put('/:id', async (req, res) => {
  try {
    const episode = await Episode.findByPk(req.params.id, {
      include: [
        { 
          model: Podcast, 
          as: 'podcast',
          where: { userId: req.user.id },
          required: true
        }
      ]
    });
    
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    
    const { title, description, audioUrl, videoUrl, transcript, duration, status, publishedAt } = req.body;
    
    await episode.update({
      title: title || episode.title,
      description: description !== undefined ? description : episode.description,
      audioUrl: audioUrl !== undefined ? audioUrl : episode.audioUrl,
      videoUrl: videoUrl !== undefined ? videoUrl : episode.videoUrl,
      transcript: transcript !== undefined ? transcript : episode.transcript,
      duration: duration !== undefined ? duration : episode.duration,
      status: status || episode.status,
      publishedAt: publishedAt !== undefined ? publishedAt : episode.publishedAt
    });
    
    res.json(episode);
  } catch (error) {
    console.error('Error updating episode:', error);
    res.status(500).json({ error: 'Failed to update episode' });
  }
});

// Delete episode
router.delete('/:id', async (req, res) => {
  try {
    const episode = await Episode.findByPk(req.params.id, {
      include: [
        { 
          model: Podcast, 
          as: 'podcast',
          where: { userId: req.user.id },
          required: true
        }
      ]
    });
    
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    
    await episode.destroy();
    res.json({ message: 'Episode deleted successfully' });
  } catch (error) {
    console.error('Error deleting episode:', error);
    res.status(500).json({ error: 'Failed to delete episode' });
  }
});

// Add guest to episode
router.post('/:id/guests', async (req, res) => {
  try {
    const episode = await Episode.findByPk(req.params.id, {
      include: [
        { 
          model: Podcast, 
          as: 'podcast',
          where: { userId: req.user.id },
          required: true
        }
      ]
    });
    
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    
    const { guestId } = req.body;
    
    if (!guestId) {
      return res.status(400).json({ error: 'Guest ID is required' });
    }
    
    const guest = await Guest.findByPk(guestId);
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    
    await episode.addGuest(guest);
    res.json({ message: 'Guest added to episode' });
  } catch (error) {
    console.error('Error adding guest:', error);
    res.status(500).json({ error: 'Failed to add guest' });
  }
});

module.exports = router;

