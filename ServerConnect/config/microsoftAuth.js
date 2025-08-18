const dotenv = require('dotenv');
const { Strategy: MicrosoftStrategy } = require('passport-azure-ad-oauth2');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

dotenv.config();

module.exports = (passport) => {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: process.env.MICROSOFT_CALLBACK_URL,
      },
      async (accessToken, refreshToken, params, profile, done) => {
        try {
          // `params.id_token` contains the OIDC id token
          const decoded = jwt.decode(params.id_token || '');
          const email =
            decoded?.preferred_username || decoded?.upn || decoded?.email;
          const name = decoded?.name || 'Microsoft User';

          if (!email) {
            return done(new Error('Microsoft token missing email'), null);
          }

          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              name,
              email,
              authProvider: 'microsoft',
            });
          }

          // Important: DO NOT redirect or sign tokens here.
          // Let routes/oauth.js handle JWT + redirect uniformly.
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};