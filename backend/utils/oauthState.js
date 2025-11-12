const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Generate an encrypted state token for OAuth flow
 * This replaces session-based state storage for better reliability
 * 
 * @param {Object} options - Options for state generation
 * @param {string} options.redirectUrl - Optional redirect URL to include
 * @returns {string} Encrypted state token
 */
function generateStateToken(options = {}) {
  const state = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now();
  
  const payload = {
    state,
    timestamp,
    redirectUrl: options.redirectUrl || null
  };
  
  // Sign with JWT using JWT_SECRET (short expiration for security)
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '10m' // State tokens expire in 10 minutes
  });
  
  return token;
}

/**
 * Verify and extract state from encrypted token
 * 
 * @param {string} token - Encrypted state token
 * @returns {Object|null} Decoded state payload or null if invalid
 */
function verifyStateToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is expired (JWT handles this, but double-check)
    const now = Date.now();
    const tokenAge = now - decoded.timestamp;
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    if (tokenAge > maxAge) {
      console.warn('State token expired:', { tokenAge, maxAge });
      return null;
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.warn('State token expired:', error.message);
    } else if (error.name === 'JsonWebTokenError') {
      console.warn('Invalid state token:', error.message);
    } else {
      console.error('State token verification error:', error);
    }
    return null;
  }
}

/**
 * Generate a simple random state string (for backward compatibility)
 * 
 * @returns {string} Random state string
 */
function generateSimpleState() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  generateStateToken,
  verifyStateToken,
  generateSimpleState
};

