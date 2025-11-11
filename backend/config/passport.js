const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { User } = require('../models');

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CALLBACK_URL || '/auth/linkedin/callback',
  // Note: LinkedIn has deprecated r_liteprofile and r_emailaddress
  // If these don't work, you may need to migrate to OpenID Connect
  // For now, using the scopes that passport-linkedin-oauth2 supports
  scope: ['r_liteprofile', 'r_emailaddress'],
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

    let user = await User.findOne({ where: { linkedinId } });
    
    if (!user) {
      user = await User.create({
        linkedinId,
        email,
        name,
        profilePictureUrl,
        accessToken,
        refreshToken
      });
      console.log(`New user created: ${user.name} (${user.email})`);
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

