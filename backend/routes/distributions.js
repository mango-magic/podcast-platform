const express = require('express');
const { Distribution, Episode, Podcast } = require('../models');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all distributions
router.get('/', async (req, res) => {
  try {
    const distributions = await Distribution.findAll({
      include: [
        { 
          model: Episode, 
          as: 'episode',
          include: [
            { 
              model: Podcast, 
              as: 'podcast',
              where: { userId: req.user.id },
              required: true
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(distributions);
  } catch (error) {
    console.error('Error fetching distributions:', error);
    res.status(500).json({ error: 'Failed to fetch distributions' });
  }
});

// Create distribution
router.post('/', async (req, res) => {
  try {
    const { episodeId, platform } = req.body;
    
    if (!episodeId || !platform) {
      return res.status(400).json({ error: 'Episode ID and platform are required' });
    }
    
    // Verify episode belongs to user
    const episode = await Episode.findByPk(episodeId, {
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
    
    const distribution = await Distribution.create({
      episodeId,
      platform,
      status: 'pending'
    });
    
    res.status(201).json(distribution);
  } catch (error) {
    console.error('Error creating distribution:', error);
    res.status(500).json({ error: 'Failed to create distribution' });
  }
});

// Update distribution status
router.put('/:id', async (req, res) => {
  try {
    const distribution = await Distribution.findByPk(req.params.id, {
      include: [
        { 
          model: Episode, 
          as: 'episode',
          include: [
            { 
              model: Podcast, 
              as: 'podcast',
              where: { userId: req.user.id },
              required: true
            }
          ]
        }
      ]
    });
    
    if (!distribution) {
      return res.status(404).json({ error: 'Distribution not found' });
    }
    
    const { status, platformPostId, publishedAt, errorMessage } = req.body;
    
    await distribution.update({
      status: status || distribution.status,
      platformPostId: platformPostId || distribution.platformPostId,
      publishedAt: publishedAt || distribution.publishedAt,
      errorMessage: errorMessage || distribution.errorMessage
    });
    
    res.json(distribution);
  } catch (error) {
    console.error('Error updating distribution:', error);
    res.status(500).json({ error: 'Failed to update distribution' });
  }
});

module.exports = router;

