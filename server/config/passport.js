const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

let clientID = process.env.GOOGLE_CLIENT_ID;
let clientSecret = process.env.GOOGLE_CLIENT_SECRET;
let callbackURL = process.env.GOOGLE_CALLBACK_URL;

if (!clientID || !clientSecret || !callbackURL) {
  try {
    const clientSecretFile = require('../../client_secret_846891190750-7qs2jm2okb5se3mu916913ls7udq1e76.apps.googleusercontent.com.json');
    clientID = clientID || clientSecretFile.web.client_id;
    clientSecret = clientSecret || clientSecretFile.web.client_secret;
    callbackURL = callbackURL || clientSecretFile.web.redirect_uris[0];
  } catch (err) {
    console.warn('Google OAuth credentials not fully configured in environment or local JSON file.');
  }
}

passport.use(new GoogleStrategy({
    clientID,
    clientSecret,
    callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const adminEmails = ['adityajmarch020304@gmail.com', 'shivskukreja@gmail.com'];
      const userEmail = profile.emails[0].value.toLowerCase();
      const userRole = adminEmails.includes(userEmail) ? 'admin' : 'user';

      // Check if user exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // Create new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          role: userRole
        });
      } else {
        // Ensure role is up-to-date
        if (user.role !== userRole) {
          user.role = userRole;
          await user.save();
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
