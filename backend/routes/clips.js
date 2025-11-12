const express = require('express');
const { Clip, Episode, Podcast } = require('../models');
const authMiddleware = require('../middleware/auth');
const videoProcessor = require('../services/videoProcessor');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all clips (optionally filtered by episode)
router.get('/', async (req, res) => {
  try {
    const where = {};
    
    if (req.query.episodeId) {
      // Verify episode belongs to user
      const episode = await Episode.findByPk(req.query.episodeId, {
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
      
      where.episodeId = req.query.episodeId;
    }
    
    const clips = await Clip.findAll({
      where,
      include: [
        { model: Episode, as: 'episode', attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(clips);
  } catch (error) {
    console.error('Error fetching clips:', error);
    res.status(500).json({ error: 'Failed to fetch clips' });
  }
});

// Get single clip
router.get('/:id', async (req, res) => {
  try {
    const clip = await Clip.findByPk(req.params.id, {
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
    
    if (!clip) {
      return res.status(404).json({ error: 'Clip not found' });
    }
    
    res.json(clip);
  } catch (error) {
    console.error('Error fetching clip:', error);
    res.status(500).json({ error: 'Failed to fetch clip' });
  }
});

// Create new clip (with automatic video processing)
router.post('/', async (req, res) => {
  try {
    const { episodeId, title, startTime, duration, platform, autoGenerate } = req.body;
    
    if (!episodeId || !title || startTime === undefined || !duration) {
      return res.status(400).json({ error: 'Episode ID, title, start time, and duration are required' });
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
    
    if (!episode.videoUrl && !episode.audioUrl) {
      return res.status(400).json({ error: 'Episode must have video or audio URL' });
    }
    
    let videoUrl = null;
    let audioUrl = null;
    let thumbnailUrl = null;
    
    // Auto-generate clip using FFmpeg if requested and video exists
    if (autoGenerate !== false && episode.videoUrl) {
      try {
        const processedClip = await videoProcessor.generateClip(
          episode.videoUrl,
          startTime,
          duration,
          platform || 'general'
        );
        videoUrl = processedClip.videoUrl;
        audioUrl = processedClip.audioUrl;
        thumbnailUrl = processedClip.thumbnailUrl;
      } catch (error) {
        console.error('Error auto-generating clip:', error);
        // Fall back to manual creation if processing fails
        return res.status(500).json({ 
          error: 'Failed to generate clip. Please ensure FFmpeg is installed and video URL is accessible.',
          details: error.message 
        });
      }
    }
    
    const clipData = {
      episodeId,
      title,
      startTime,
      duration,
      platform: platform || 'general',
      status: 'draft'
    };
    
    // Only add URLs if they exist
    if (videoUrl) clipData.videoUrl = videoUrl;
    if (audioUrl) clipData.audioUrl = audioUrl;
    if (thumbnailUrl) clipData.thumbnailUrl = thumbnailUrl;
    
    const clip = await Clip.create(clipData);
    
    res.status(201).json(clip);
  } catch (error) {
    console.error('Error creating clip:', error);
    res.status(500).json({ error: 'Failed to create clip' });
  }
});

// Generate clip automatically from episode (new endpoint)
router.post('/generate', async (req, res) => {
  try {
    const { episodeId, startTime, duration, platform } = req.body;
    
    if (!episodeId || startTime === undefined || !duration) {
      return res.status(400).json({ error: 'Episode ID, start time, and duration are required' });
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
    
    if (!episode.videoUrl) {
      return res.status(400).json({ error: 'Episode must have video URL for clip generation' });
    }
    
    // Generate clip using FFmpeg
    const processedClip = await videoProcessor.generateClip(
      episode.videoUrl,
      startTime,
      duration,
      platform || 'general'
    );
    
    res.json({
      success: true,
      ...processedClip
    });
  } catch (error) {
    console.error('Error generating clip:', error);
    res.status(500).json({ 
      error: 'Failed to generate clip',
      details: error.message 
    });
  }
});

// Update clip
router.put('/:id', async (req, res) => {
  try {
    const clip = await Clip.findByPk(req.params.id, {
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
    
    if (!clip) {
      return res.status(404).json({ error: 'Clip not found' });
    }
    
    const { title, startTime, duration, videoUrl, audioUrl, thumbnailUrl, platform, status } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (duration !== undefined) updateData.duration = duration;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (platform !== undefined) updateData.platform = platform;
    if (status !== undefined) updateData.status = status;
    
    await clip.update(updateData);
    
    res.json(clip);
  } catch (error) {
    console.error('Error updating clip:', error);
    res.status(500).json({ error: 'Failed to update clip' });
  }
});

// Delete clip
router.delete('/:id', async (req, res) => {
  try {
    const clip = await Clip.findByPk(req.params.id, {
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
    
    if (!clip) {
      return res.status(404).json({ error: 'Clip not found' });
    }
    
    await clip.destroy();
    res.json({ message: 'Clip deleted successfully' });
  } catch (error) {
    console.error('Error deleting clip:', error);
    res.status(500).json({ error: 'Failed to delete clip' });
  }
});

module.exports = router;

