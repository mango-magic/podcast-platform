const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

require('../config/passport');

// Initiate LinkedIn OAuth - Manual URL construction to ensure OpenID Connect scopes
router.get('/linkedin', async (req, res) => {
  // Check if user already has a valid JWT token (from query param or cookie)
  const tokenFromQuery = req.query.token;
  const authHeader = req.headers.authorization;
  const token = tokenFromQuery || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (user) {
        console.log('✅ User already authenticated:', user.email);
        
        // User already has valid session - redirect to frontend with token
        let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        if (process.env.NODE_ENV === 'production' && !frontendUrl.startsWith('http')) {
          frontendUrl = `https://${frontendUrl}`;
        }
        if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
          frontendUrl = 'https://podcast-platform-frontend.onrender.com';
        }
        
        return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
      }
    } catch (error) {
      // Token invalid or expired - proceed with OAuth
      console.log('Token invalid or expired, proceeding with OAuth:', error.message);
    }
  }
  
  // Check if user has a valid refresh token stored (optional - for future enhancement)
  // For now, proceed with OAuth flow
  
  const clientID = process.env.LINKEDIN_CLIENT_ID;
  const callbackURL = process.env.LINKEDIN_CALLBACK_URL || '/auth/linkedin/callback';
  const state = require('crypto').randomBytes(16).toString('hex');
  
  // Store state in session for verification
  req.session.oauthState = state;
  req.session.stateTimestamp = Date.now(); // Track when state was created
  
  // Log session details before save
  console.log('=== OAuth Initiation ===');
  console.log('Session ID:', req.sessionID);
  console.log('State to store:', state.substring(0, 8) + '...');
  console.log('Session before save:', {
    oauthState: req.session.oauthState ? 'set' : 'not set',
    sessionID: req.sessionID
  });
  
  // Save session before redirect (important for session persistence)
  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
      return res.status(500).json({ error: 'Failed to initialize OAuth' });
    }
    
    // Log that session was saved
    console.log('✅ Session saved successfully, Session ID:', req.sessionID);
    
    // Construct LinkedIn OAuth URL with OpenID Connect scopes
    // LinkedIn will automatically use existing session if user is logged in
    // If they've authorized before, it will auto-approve
    const scope = 'openid profile email';
    const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientID}&redirect_uri=${encodeURIComponent(callbackURL)}&state=${state}&scope=${encodeURIComponent(scope)}`;
    
    console.log('LinkedIn OAuth URL:', authURL);
    console.log('State stored in session:', state.substring(0, 8) + '...');
    console.log('Redirecting to LinkedIn...');
    console.log('ℹ️  Note: If user is already logged into LinkedIn, they will see a consent screen or auto-approve');
    
    res.redirect(authURL);
  });
});

// LinkedIn OAuth callback
router.get('/linkedin/callback',
  (req, res, next) => {
    // Log callback attempt for debugging
    console.log('=== LinkedIn OAuth Callback ===');
    console.log('Query params:', {
      code: req.query.code ? 'present' : 'missing',
      state: req.query.state ? 'present' : 'missing',
      error: req.query.error,
      error_description: req.query.error_description
    });
    console.log('Session state:', req.session.oauthState ? 'present' : 'missing');
    console.log('Session ID:', req.sessionID);
    console.log('Cookies received:', req.headers.cookie ? 'present' : 'missing');
    console.log('Session data:', {
      oauthState: req.session.oauthState ? req.session.oauthState.substring(0, 8) + '...' : 'missing',
      sessionID: req.sessionID
    });
    console.log('Headers:', {
      'user-agent': req.headers['user-agent'],
      'referer': req.headers['referer'],
      'cookie': req.headers.cookie ? 'present' : 'missing'
    });
    
    // Check for OAuth errors from LinkedIn
    if (req.query.error) {
      console.error('LinkedIn OAuth error:', {
        error: req.query.error,
        description: req.query.error_description
      });
      
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      if (process.env.NODE_ENV === 'production' && !frontendUrl.startsWith('http')) {
        frontendUrl = `https://${frontendUrl}`;
      }
      if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
        frontendUrl = 'https://podcast-platform-frontend.onrender.com';
      }
      
      return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(req.query.error_description || req.query.error)}`);
    }
    
    // Verify state parameter (CSRF protection)
    const receivedState = req.query.state;
    const storedState = req.session.oauthState;
    
    if (!receivedState || !storedState) {
      console.error('State verification failed:', {
        received: receivedState ? 'present' : 'missing',
        stored: storedState ? 'present' : 'missing'
      });
      
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      if (process.env.NODE_ENV === 'production' && !frontendUrl.startsWith('http')) {
        frontendUrl = `https://${frontendUrl}`;
      }
      if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
        frontendUrl = 'https://podcast-platform-frontend.onrender.com';
      }
      
      return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Security verification failed. Please try logging in again.')}`);
    }
    
    if (receivedState !== storedState) {
      console.error('State mismatch:', {
        received: receivedState,
        stored: storedState
      });
      
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      if (process.env.NODE_ENV === 'production' && !frontendUrl.startsWith('http')) {
        frontendUrl = `https://${frontendUrl}`;
      }
      if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
        frontendUrl = 'https://podcast-platform-frontend.onrender.com';
      }
      
      return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Security verification failed. Please try logging in again.')}`);
    }
    
    // State verified - clear it from session
    delete req.session.oauthState;
    console.log('✅ State verified successfully');
    
    next();
  },
  (req, res, next) => {
    // Custom Passport authentication with error handling
    passport.authenticate('linkedin', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Passport authentication error:', err);
        let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        if (process.env.NODE_ENV === 'production' && !frontendUrl.startsWith('http')) {
          frontendUrl = `https://${frontendUrl}`;
        }
        if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
          frontendUrl = 'https://podcast-platform-frontend.onrender.com';
        }
        return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(err.message || 'Authentication failed')}`);
      }
      
      if (!user) {
        console.error('Passport authentication failed - no user:', info);
        let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        if (process.env.NODE_ENV === 'production' && !frontendUrl.startsWith('http')) {
          frontendUrl = `https://${frontendUrl}`;
        }
        if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
          frontendUrl = 'https://podcast-platform-frontend.onrender.com';
        }
        return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(info?.message || 'Authentication failed')}`);
      }
      
      // Attach user to request and continue
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    try {
      if (!req.user) {
        throw new Error('User not found after authentication');
      }
      
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
      
      console.log(`✅ OAuth success! Redirecting to frontend: ${frontendUrl}/auth/callback`);
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
      
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }
);

// Error handler for OAuth failures
router.get('/linkedin/error', (req, res) => {
  console.error('OAuth error endpoint hit:', req.query);
  
  let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  if (process.env.NODE_ENV === 'production' && !frontendUrl.startsWith('http')) {
    frontendUrl = `https://${frontendUrl}`;
  }
  if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
    frontendUrl = 'https://podcast-platform-frontend.onrender.com';
  }
  
  const errorMessage = req.query.message || 'Authentication failed';
  res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(errorMessage)}`);
});

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

