const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { User } = require('../models');
const axios = require('axios');
const jwt = require('jsonwebtoken');

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CALLBACK_URL || '/auth/linkedin/callback',
  // LinkedIn now requires OpenID Connect scopes
  scope: ['openid', 'profile', 'email'],
  state: false, // We handle state manually in the route
  // Force OpenID Connect endpoints
  authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
  profileURL: 'https://api.linkedin.com/v2/userinfo',
  skipUserProfile: true // Skip Passport's profile fetch - it tries to use /me which doesn't work with OpenID Connect
}, async (accessToken, refreshToken, params, done) => {
  try {
    console.log('=== Passport Callback ===');
    console.log('Access token received:', accessToken ? 'present' : 'missing');
    console.log('Refresh token received:', refreshToken ? 'present' : 'missing');
    console.log('Params:', params);
    
    // Since skipUserProfile is true, we need to fetch profile manually
    console.log('Fetching profile from LinkedIn OpenID Connect endpoint...');
    let profile;
    
    try {
      const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Successfully fetched profile:', JSON.stringify(profileResponse.data, null, 2));
      // Format profile to match Passport's expected structure
      profile = {
        ...profileResponse.data,
        id: profileResponse.data.sub, // Passport expects 'id'
        _json: profileResponse.data
      };
    } catch (fetchError) {
      console.error('❌ Failed to fetch profile from LinkedIn:', fetchError.message);
      console.error('Error status:', fetchError.response?.status);
      console.error('Error data:', fetchError.response?.data || fetchError.message);
      
      // If manual fetch fails, return error - we need profile data
      return done(new Error(`Failed to fetch user profile: ${fetchError.response?.data?.message || fetchError.message}`), null);
    }
    
    // Log full profile for debugging
    console.log('LinkedIn profile received:', JSON.stringify(profile, null, 2));
    
    // Handle OpenID Connect profile format (different from old LinkedIn API)
    // OpenID Connect uses: sub, name, email, picture
    // Old API uses: id, displayName, emails[0].value, photos[0].value
    const linkedinId = profile.id || profile.sub || profile._json?.sub;
    if (!linkedinId) {
      console.error('LinkedIn OAuth: No user ID found in profile', JSON.stringify(profile, null, 2));
      return done(new Error('Unable to retrieve user information from LinkedIn'), null);
    }

    // Handle email - OpenID Connect has it directly, old API has it in emails array
    const email = profile.email || 
                  (profile.emails && profile.emails[0] ? profile.emails[0].value : null) ||
                  (profile._json?.email);
    
    // Handle name - OpenID Connect uses 'name', old API uses 'displayName'
    const name = profile.name || 
                 profile.displayName || 
                 profile._json?.name ||
                 `${profile.given_name || ''} ${profile.family_name || ''}`.trim() ||
                 'LinkedIn User';
    
    // Handle profile picture - OpenID Connect uses 'picture', old API uses 'photos[0].value'
    const profilePictureUrl = profile.picture || 
                              (profile.photos && profile.photos[0] ? profile.photos[0].value : null) ||
                              profile._json?.picture;
    
    console.log('Extracted profile data:', {
      linkedinId,
      email: email ? 'present' : 'missing',
      name,
      profilePictureUrl: profilePictureUrl ? 'present' : 'missing'
    });

    // Import AI inference service
    const { inferDemographics } = require('../services/aiInference');
    
    let user = await User.findOne({ where: { linkedinId } });
    
    // Try to infer persona and vertical from LinkedIn profile
    let inferredPersona = null;
    let inferredVertical = null;
    
    try {
      // Extract additional profile fields for AI inference
      const headline = profile.headline || profile._json?.headline || profile._json?.tagline;
      const title = headline || profile.title || profile._json?.title;
      const company = profile.company || profile._json?.company || profile._json?.companyName;
      const industry = profile.industry || profile._json?.industry;
      
      const demographics = await inferDemographics(accessToken, {
        headline,
        title,
        company,
        industry
      });
      
      inferredPersona = demographics.persona;
      inferredVertical = demographics.vertical;
      
      console.log(`AI Inference for ${name}:`, {
        persona: inferredPersona,
        vertical: inferredVertical,
        confidence: demographics.confidence
      });
    } catch (error) {
      console.error('AI inference error (non-blocking):', error.message);
      // Continue without inference - user can set manually
    }
    
    if (!user) {
      user = await User.create({
        linkedinId,
        email,
        name,
        profilePictureUrl,
        accessToken,
        refreshToken,
        persona: inferredPersona,
        vertical: inferredVertical,
        profileCompleted: !!(inferredPersona && inferredVertical) // Auto-complete if both inferred
      });
      console.log(`✅ New user created: ${user.name} (${user.email})`);
      if (inferredPersona && inferredVertical) {
        console.log(`  ✓ Auto-detected: ${inferredPersona} in ${inferredVertical}`);
      }
    } else {
      // Update existing user with fresh tokens
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      if (email && (!user.email || user.email !== email)) {
        user.email = email;
      }
      if (name && (!user.name || user.name !== name)) {
        user.name = name;
      }
      if (profilePictureUrl) {
        user.profilePictureUrl = profilePictureUrl;
      }
      
      // Update persona/vertical if not set and we have inferences
      if (!user.persona && inferredPersona) {
        user.persona = inferredPersona;
      }
      if (!user.vertical && inferredVertical) {
        user.vertical = inferredVertical;
      }
      if (!user.profileCompleted && user.persona && user.vertical) {
        user.profileCompleted = true;
      }
      
      await user.save();
      console.log(`✅ User updated: ${user.name}`);
    }
    
    return done(null, user);
  } catch (error) {
    console.error('❌ LinkedIn OAuth Error:', error);
    console.error('Error stack:', error.stack);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
