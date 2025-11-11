const axios = require('axios');

/**
 * Fetch LinkedIn profile with retry mechanism
 * @param {string} accessToken - LinkedIn access token
 * @param {number} maxRetries - Maximum number of retries (default: 2)
 * @param {number} retryDelay - Delay between retries in ms (default: 1000)
 * @returns {Promise<Object>} Profile data
 */
async function fetchLinkedInProfileWithRetry(accessToken, maxRetries = 2, retryDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retrying profile fetch (attempt ${attempt + 1}/${maxRetries + 1})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
      
      const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      });
      
      return profileResponse.data;
    } catch (error) {
      lastError = error;
      
      // Don't retry on 4xx errors (client errors)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        console.error(`Client error (${error.response.status}), not retrying:`, error.response.data);
        throw error;
      }
      
      // Log retry attempt
      if (attempt < maxRetries) {
        console.warn(`Profile fetch failed (attempt ${attempt + 1}), will retry:`, error.message);
      }
    }
  }
  
  // All retries failed
  throw lastError;
}

/**
 * Extract profile from ID token if available
 * @param {Object} params - OAuth params containing id_token
 * @returns {Object|null} Profile data or null
 */
function extractProfileFromIdToken(params) {
  if (!params || !params.id_token) {
    return null;
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(params.id_token, { complete: true });
    
    if (decoded && decoded.payload) {
      const payload = decoded.payload;
      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        given_name: payload.given_name,
        family_name: payload.family_name,
        picture: payload.picture
      };
    }
  } catch (error) {
    console.error('Failed to decode ID token:', error.message);
  }
  
  return null;
}

module.exports = {
  fetchLinkedInProfileWithRetry,
  extractProfileFromIdToken
};

