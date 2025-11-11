const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

require('../config/passport');

// Initiate LinkedIn OAuth - Manual URL construction to ensure OpenID Connect scopes
router.get('/linkedin', (req, res) => {
  const clientID = process.env.LINKEDIN_CLIENT_ID;
  const callbackURL = process.env.LINKEDIN_CALLBACK_URL || '/auth/linkedin/callback';
  const state = require('crypto').randomBytes(16).toString('hex');
  
  // Store state in session for verification
  req.session.oauthState = state;
  
  // Construct LinkedIn OAuth URL with OpenID Connect scopes
  const scope = 'openid profile email';
  const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientID}&redirect_uri=${encodeURIComponent(callbackURL)}&state=${state}&scope=${encodeURIComponent(scope)}`;
  
  console.log('LinkedIn OAuth URL:', authURL);
  res.redirect(authURL);
});

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

// Re-infer demographics from LinkedIn (for optimization)
router.post('/profile/reinfer', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Re-run AI inference
    const { inferDemographics } = require('../services/aiInference');
    const demographics = await inferDemographics(user.accessToken);
    
    // Update user with new inferences (but don't overwrite if user has manually set)
    if (demographics.persona && !user.persona) {
      user.persona = demographics.persona;
    }
    if (demographics.vertical && !user.vertical) {
      user.vertical = demographics.vertical;
    }
    
    await user.save();
    
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['accessToken', 'refreshToken'] }
    });
    
    res.json({ user: updatedUser, demographics });
  } catch (error) {
    console.error('Re-inference error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { persona, vertical } = req.body;
    
    // Validate persona
    const validPersonas = ['CISO', 'CRO', 'CFO', 'CHRO', 'COO', 'CMO', 'CTO', 'VP Supply Chain', 'CSO', 'General Counsel'];
    if (persona && !validPersonas.includes(persona)) {
      return res.status(400).json({ error: 'Invalid persona' });
    }
    
    // Validate vertical
    const validVerticals = ['SaaS', 'Banking', 'Insurance', 'Healthcare Providers', 'Pharma', 'CPG', 'Automotive', 'eCommerce', 'Logistics', 'Renewables'];
    if (vertical && !validVerticals.includes(vertical)) {
      return res.status(400).json({ error: 'Invalid vertical' });
    }
    
    // Update user
    if (persona !== undefined) user.persona = persona;
    if (vertical !== undefined) user.vertical = vertical;
    
    // Mark profile as completed if both persona and vertical are set
    if (persona && vertical) {
      user.profileCompleted = true;
    }
    
    await user.save();
    
    // Return updated user without sensitive data
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['accessToken', 'refreshToken'] }
    });
    
    res.json(updatedUser);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;

