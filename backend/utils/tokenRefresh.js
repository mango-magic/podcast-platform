const axios = require('axios');
const { User } = require('../models');

/**
 * Refresh LinkedIn access token using refresh token
 * @param {string} refreshToken - LinkedIn refresh token
 * @returns {Promise<Object>} New access token and refresh token
 */
async function refreshLinkedInToken(refreshToken) {
  if (!refreshToken) {
    throw new Error('No refresh token provided');
  }
  
  try {
    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000
    });
    
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || refreshToken, // Use new refresh token if provided
      expiresIn: response.data.expires_in
    };
  } catch (error) {
    console.error('Token refresh failed:', error.response?.data || error.message);
    throw new Error(`Failed to refresh LinkedIn token: ${error.response?.data?.error_description || error.message}`);
  }
}

/**
 * Get valid access token for user, refreshing if necessary
 * @param {Object} user - User model instance
 * @returns {Promise<string>} Valid access token
 */
async function getValidAccessToken(user) {
  if (!user || !user.accessToken) {
    throw new Error('User has no access token');
  }
  
  // Try to use existing token first
  // In a real implementation, you'd check token expiration
  // For now, we'll try to use it and refresh if it fails
  
  if (user.refreshToken) {
    try {
      // Test if current token is valid by making a lightweight API call
      await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000,
        validateStatus: (status) => status < 500 // Don't throw on 4xx
      });
      
      return user.accessToken;
    } catch (error) {
      // Token might be expired, try to refresh
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Access token appears invalid, attempting refresh...');
        try {
          const tokens = await refreshLinkedInToken(user.refreshToken);
          
          // Update user with new tokens
          user.accessToken = tokens.accessToken;
          if (tokens.refreshToken) {
            user.refreshToken = tokens.refreshToken;
          }
          await user.save();
          
          console.log('✅ Token refreshed successfully');
          return tokens.accessToken;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError.message);
          throw new Error('Access token expired and refresh failed. Please re-authenticate.');
        }
      }
      
      throw error;
    }
  }
  
  return user.accessToken;
}

module.exports = {
  refreshLinkedInToken,
  getValidAccessToken
};

