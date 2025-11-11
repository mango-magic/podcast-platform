const express = require('express');
const RSS = require('rss');
const { Podcast, Episode } = require('../models');
const router = express.Router();

// Generate RSS feed for a podcast
router.get('/:podcastId', async (req, res) => {
  try {
    const podcast = await Podcast.findByPk(req.params.podcastId, {
      include: [
        {
          model: Episode,
          as: 'episodes',
          where: { status: 'published' },
          required: false,
          order: [['publishedAt', 'DESC']]
        }
      ]
    });
    
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    
    const feed = new RSS({
      title: podcast.name,
      description: podcast.description || `${podcast.name} Podcast`,
      feed_url: `${process.env.API_URL || 'http://localhost:3000'}/rss/${podcast.id}`,
      site_url: podcast.website || process.env.API_URL || 'http://localhost:3000',
      language: 'en',
      pubDate: new Date(),
      ttl: 60
    });
    
    // Add episodes to feed
    podcast.episodes.forEach(episode => {
      feed.item({
        title: episode.title,
        description: episode.description || episode.title,
        url: `${process.env.API_URL || 'http://localhost:3000'}/episodes/${episode.id}`,
        guid: episode.id.toString(),
        date: episode.publishedAt || episode.createdAt,
        enclosure: episode.audioUrl ? {
          url: episode.audioUrl,
          type: 'audio/mpeg'
        } : undefined
      });
    });
    
    res.set('Content-Type', 'application/rss+xml');
    res.send(feed.xml());
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    res.status(500).json({ error: 'Failed to generate RSS feed' });
  }
});

module.exports = router;

