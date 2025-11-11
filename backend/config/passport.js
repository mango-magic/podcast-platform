const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { User } = require('../models');

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CALLBACK_URL || '/auth/linkedin/callback',
  // LinkedIn now requires OpenID Connect scopes
  // Using the new scopes that are authorized
  scope: ['openid', 'profile', 'email'],
  state: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Handle profile data with better error checking
    const linkedinId = profile.id;
    if (!linkedinId) {
      console.error('LinkedIn OAuth: No user ID found in profile', JSON.stringify(profile, null, 2));
      return done(new Error('Unable to retrieve user information from LinkedIn'), null);
    }

    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    const name = profile.displayName || 'LinkedIn User';
    const profilePictureUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

    // Import AI inference service
    const { inferDemographics } = require('../services/aiInference');
    
    let user = await User.findOne({ where: { linkedinId } });
    
    // Try to infer persona and vertical from LinkedIn profile
    let inferredPersona = null;
    let inferredVertical = null;
    
    try {
      const demographics = await inferDemographics(accessToken, {
        headline: profile.headline,
        title: profile.headline,
        company: profile.company,
        industry: profile.industry
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
      console.log(`New user created: ${user.name} (${user.email})`);
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
      console.log(`User updated: ${user.name}`);
    }
    
    return done(null, user);
  } catch (error) {
    console.error('LinkedIn OAuth Error:', error);
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

