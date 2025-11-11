const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

require('../config/passport');

// Initiate LinkedIn OAuth
router.get('/linkedin', passport.authenticate('linkedin'));

// LinkedIn OAuth callback
router.get('/linkedin/callback',
  passport.authenticate('linkedin', { session: false }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { userId: req.user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Get frontend URL - ensure it has protocol in production
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      
      // If FRONTEND_URL doesn't have protocol and we're in production, add https://
      if (process.env.NODE_ENV === 'production' && !frontendUrl.startsWith('http')) {
        frontendUrl = `https://${frontendUrl}`;
      }
      
      // Fallback to production URL if FRONTEND_URL is not set
      if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
        frontendUrl = 'https://podcast-platform-frontend.onrender.com';
      }
      
      console.log(`Redirecting to frontend: ${frontendUrl}/auth/callback`);
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Token generation error:', error);
      
      // Same logic for error redirect
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      if (process.env.NODE_ENV === 'production' && !frontendUrl.startsWith('http')) {
        frontendUrl = `https://${frontendUrl}`;
      }
      if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
        frontendUrl = 'https://podcast-platform-frontend.onrender.com';
      }
      
      res.redirect(`${frontendUrl}/auth/error`);
    }
  }
);

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['accessToken', 'refreshToken'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;

