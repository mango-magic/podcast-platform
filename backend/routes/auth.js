const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { generateStateToken, verifyStateToken, generateSimpleState } = require('../utils/oauthState');
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
  
  // Generate encrypted state token (more reliable than session)
  // This token contains the state and timestamp, encrypted with JWT
  const stateToken = generateStateToken();
  const decodedState = jwt.decode(stateToken);
  const stateString = decodedState.state; // The actual random state string
  
  // Store in session as fallback (for backward compatibility and debugging)
  req.session.oauthState = stateString;
  req.session.stateToken = stateToken;
  req.session.stateTimestamp = Date.now();
  
  // Log OAuth initiation
  console.log('=== OAuth Initiation ===');
  console.log('Session ID:', req.sessionID);
  console.log('State string (first 8 chars):', stateString.substring(0, 8) + '...');
  console.log('State token length:', stateToken.length, 'chars');
  console.log('Session state stored:', req.session.oauthState ? 'yes' : 'no');
  
  // Save session before redirect (fallback mechanism)
  req.session.save((err) => {
    if (err) {
      console.error('⚠️ Session save error (non-critical):', err.message);
      // Continue anyway - we have encrypted state token
    } else {
      console.log('✅ Session saved (fallback), Session ID:', req.sessionID);
    }
    
    // Construct LinkedIn OAuth URL with OpenID Connect scopes
    // Send the encrypted token as state - LinkedIn will return it unchanged
    // LinkedIn supports state up to 500 chars, JWT tokens are typically 200-400 chars
    const scope = 'openid profile email';
    const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientID}&redirect_uri=${encodeURIComponent(callbackURL)}&state=${encodeURIComponent(stateToken)}&scope=${encodeURIComponent(scope)}`;
    
    console.log('🔗 LinkedIn OAuth URL generated');
    console.log('📤 Redirecting to LinkedIn...');
    console.log('ℹ️  State verification: encrypted token (primary) + session (fallback)');
    
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
    console.log('Session ID:', req.sessionID);
    console.log('Cookies received:', req.headers.cookie ? 'present' : 'missing');
    
    // Helper function to get frontend URL
    const getFrontendUrl = () => {
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      if (process.env.NODE_ENV === 'production' && !frontendUrl.startsWith('http')) {
        frontendUrl = `https://${frontendUrl}`;
      }
      if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
        frontendUrl = 'https://podcast-platform-frontend.onrender.com';
      }
      return frontendUrl;
    };
    
    // Check for OAuth errors from LinkedIn
    if (req.query.error) {
      const errorMsg = req.query.error_description || req.query.error || 'Authentication failed';
      console.error('❌ LinkedIn OAuth error:', {
        error: req.query.error,
        description: errorMsg
      });
      
      return res.redirect(`${getFrontendUrl()}/auth/error?message=${encodeURIComponent(errorMsg)}`);
    }
    
    // Verify state parameter (CSRF protection)
    const receivedStateToken = req.query.state;
    
    if (!receivedStateToken) {
      console.error('❌ State verification failed: No state received from LinkedIn');
      return res.redirect(`${getFrontendUrl()}/auth/error?message=${encodeURIComponent('Security verification failed. Please try logging in again.')}`);
    }
    
    // Try to verify encrypted state token first (primary method)
    let stateVerified = false;
    let verifiedState = null;
    
    try {
      const decoded = verifyStateToken(receivedStateToken);
      if (decoded && decoded.state) {
        verifiedState = decoded.state;
        stateVerified = true;
        console.log('✅ State verified via encrypted token');
      }
    } catch (error) {
      console.warn('⚠️ Encrypted state token verification failed:', error.message);
    }
    
    // Fallback: Try session-based verification
    if (!stateVerified) {
      const storedState = req.session.oauthState;
      const storedStateToken = req.session.stateToken;
      
      console.log('🔄 Attempting session fallback verification...');
      console.log('Session state:', storedState ? 'present' : 'missing');
      console.log('Session state token:', storedStateToken ? 'present' : 'missing');
      
      // Try to verify if received token matches stored token
      if (storedStateToken && receivedStateToken === storedStateToken) {
        const decoded = jwt.decode(storedStateToken);
        if (decoded && decoded.state) {
          verifiedState = decoded.state;
          stateVerified = true;
          console.log('✅ State verified via session fallback');
        }
      }
      
      // Last resort: decode received token and compare state strings
      if (!stateVerified && storedState) {
        try {
          // Try to decode the received token to get the state
          const decoded = jwt.decode(receivedStateToken);
          if (decoded && decoded.state && decoded.state === storedState) {
            verifiedState = storedState;
            stateVerified = true;
            console.log('✅ State verified via decoded token state comparison');
          }
        } catch (e) {
          // If receivedStateToken is not a JWT or decode failed, try direct comparison
          // (This handles edge cases where LinkedIn might modify the token)
          if (receivedStateToken === storedState) {
            verifiedState = storedState;
            stateVerified = true;
            console.log('✅ State verified via direct string comparison');
          } else if (receivedStateToken === storedStateToken) {
            // Token matches stored token exactly
            const decoded = jwt.decode(storedStateToken);
            if (decoded && decoded.state) {
              verifiedState = decoded.state;
              stateVerified = true;
              console.log('✅ State verified via stored token match');
            }
          }
        }
      }
    }
    
    if (!stateVerified) {
      console.error('❌ State verification failed: All methods failed');
      console.error('Received state token (first 50 chars):', receivedStateToken.substring(0, 50));
      console.error('Session state:', req.session.oauthState ? req.session.oauthState.substring(0, 8) + '...' : 'missing');
      
      return res.redirect(`${getFrontendUrl()}/auth/error?message=${encodeURIComponent('Security verification failed. Your session may have expired. Please try logging in again.')}`);
    }
    
    // State verified - clear it from session
    delete req.session.oauthState;
    delete req.session.stateToken;
    console.log('✅ State verified successfully, proceeding with authentication');
    
    // Store verified state in request for potential use
    req.verifiedState = verifiedState;
    
    next();
  },
  (req, res, next) => {
    // Helper function to get frontend URL
    const getFrontendUrl = () => {
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      if (process.env.NODE_ENV === 'production' && !frontendUrl.startsWith('http')) {
        frontendUrl = `https://${frontendUrl}`;
      }
      if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
        frontendUrl = 'https://podcast-platform-frontend.onrender.com';
      }
      return frontendUrl;
    };
    
    // Custom Passport authentication with error handling
    passport.authenticate('linkedin', { session: false }, (err, user, info) => {
      if (err) {
        console.error('❌ Passport authentication error:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        
        // Provide user-friendly error messages
        let errorMessage = 'Authentication failed. Please try again.';
        if (err.message) {
          if (err.message.includes('Email is required')) {
            errorMessage = 'Your LinkedIn account email is required. Please ensure your LinkedIn account has an email address and try again.';
          } else if (err.message.includes('Failed to retrieve user information')) {
            errorMessage = 'Unable to retrieve your LinkedIn profile. Please try again in a moment.';
          } else if (err.message.includes('Database connection')) {
            errorMessage = 'Service temporarily unavailable. Please try again in a moment.';
          } else {
            errorMessage = err.message;
          }
        }
        
        return res.redirect(`${getFrontendUrl()}/auth/error?message=${encodeURIComponent(errorMessage)}&code=auth_error`);
      }
      
      if (!user) {
        console.error('❌ Passport authentication failed - no user:', info);
        const errorMessage = info?.message || 'Authentication failed. Please try logging in again.';
        return res.redirect(`${getFrontendUrl()}/auth/error?message=${encodeURIComponent(errorMessage)}&code=no_user`);
      }
      
      console.log('✅ User authenticated successfully:', user.email);
      // Attach user to request and continue
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    // Helper function to get frontend URL
    const getFrontendUrl = () => {
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      if (process.env.NODE_ENV === 'production' && !frontendUrl.startsWith('http')) {
        frontendUrl = `https://${frontendUrl}`;
      }
      if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
        frontendUrl = 'https://podcast-platform-frontend.onrender.com';
      }
      return frontendUrl;
    };
    
    try {
      if (!req.user) {
        console.error('❌ User not found after authentication');
        throw new Error('User not found after authentication');
      }
      
      const token = jwt.sign(
        { userId: req.user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log(`✅ OAuth success! User: ${req.user.email}, Redirecting to frontend`);
      res.redirect(`${getFrontendUrl()}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('❌ Token generation error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      const errorMessage = error.message || 'Failed to complete authentication. Please try again.';
      res.redirect(`${getFrontendUrl()}/auth/error?message=${encodeURIComponent(errorMessage)}&code=token_error`);
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

