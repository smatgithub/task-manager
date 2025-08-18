const dotenv = require('dotenv');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');

dotenv.config();

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value;
          if (!email) return done(new Error('Google profile missing email'), null);

          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              name: profile.displayName || 'Google User',
              email,
              authProvider: 'google',
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};