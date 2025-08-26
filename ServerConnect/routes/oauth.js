// ServerConnect/routes/oauth.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper: create JWT and build success redirect URL
function buildSuccessRedirect(user) {
  const payload = {
    id: user._id,
    role: user.role,
    empId: user.empId || null,
    email: user.email,
    name: user.name
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });

  const params = new URLSearchParams({
    token, // front-end will read from query string
    name: user.name || '',
    email: user.email || '',
  });

  return `${FRONTEND_URL}/oauth-success?${params.toString()}`;
}

const OAUTH_FAILURE_REDIRECT = `${FRONTEND_URL}/oauth-error`;

/* =====================
   GOOGLE OAUTH
===================== */

// Start Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: OAUTH_FAILURE_REDIRECT }),
  (req, res) => {
    try {
      if (!req.user) throw new Error('Google login failed: req.user missing');
      const redirectUrl = buildSuccessRedirect(req.user);
      return res.redirect(redirectUrl);
    } catch (err) {
      console.error('Google Redirect Error:', err);
      return res.redirect(OAUTH_FAILURE_REDIRECT);
    }
  }
);

/* =====================
   MICROSOFT OAUTH
===================== */

// Start Microsoft OAuth
router.get('/microsoft', passport.authenticate('azure_ad_oauth2', { session: false }));

// Microsoft OAuth callback
router.get(
  '/microsoft/callback',
  passport.authenticate('azure_ad_oauth2', { session: false, failureRedirect: OAUTH_FAILURE_REDIRECT }),
  (req, res) => {
    try {
      if (!req.user) throw new Error('Microsoft login failed: req.user missing');
      const redirectUrl = buildSuccessRedirect(req.user);
      return res.redirect(redirectUrl);
    } catch (err) {
      console.error('Microsoft Redirect Error:', err);
      return res.redirect(OAUTH_FAILURE_REDIRECT);
    }
  }
);

module.exports = router;