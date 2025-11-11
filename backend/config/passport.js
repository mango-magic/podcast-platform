const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { User } = require('../models');

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CALLBACK_URL || '/auth/linkedin/callback',
  scope: ['r_liteprofile', 'r_emailaddress', 'w_member_social']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { linkedinId: profile.id } });
    
    if (!user) {
      user = await User.create({
        linkedinId: profile.id,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
        name: profile.displayName,
        profilePictureUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        accessToken,
        refreshToken
      });
    } else {
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      if (profile.photos && profile.photos[0]) {
        user.profilePictureUrl = profile.photos[0].value;
      }
      await user.save();
    }
    
    return done(null, user);
  } catch (error) {
    console.error('LinkedIn OAuth Error:', error);
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

