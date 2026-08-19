const passport = require('passport');
const User = require('../models/User');

const clientID     = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL  = process.env.GOOGLE_CALLBACK_URL;

// Only register Google strategy when credentials are present.
// Without this guard, passport-google-oauth20 throws at startup
// and crashes the entire serverless function.
if (clientID && clientSecret && callbackURL) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;

  passport.use(new GoogleStrategy(
    { clientID, clientSecret, callbackURL },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const adminEmails = ['adityajmarch020304@gmail.com', 'shivskukreja@gmail.com'];
        const userEmail   = profile.emails[0].value.toLowerCase();
        const userRole    = adminEmails.includes(userEmail) ? 'admin' : 'user';

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name:     profile.displayName,
            email:    profile.emails[0].value,
            role:     userRole,
          });
        } else if (user.role !== userRole) {
          user.role = userRole;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
} else {
  console.warn('[passport] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_CALLBACK_URL not set — Google OAuth disabled.');
}

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
