// ServerConnect/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const compression = require('compression');
const passport = require('passport');
const fs = require('fs');

// Routes
const authRoutes = require('./routes/auth');
const oauthRoutes = require('./routes/oauth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

// Auth middleware (your new robust one)
const { verifyToken } = require('./middleware/authMiddleware');

const app = express();
// When running behind a proxy/load balancer (Render/Cloudflare),
// trust the first hop so req.ip and rate-limits work correctly
// and to avoid express-rate-limit X-Forwarded-For validation errors.
const TRUST_PROXY = (process.env.TRUST_PROXY ?? 'true').toLowerCase() !== 'false';
if (TRUST_PROXY) {
  // `1` = trust first proxy hop
  app.set('trust proxy', 1);
}
const PORT = process.env.PORT || 3000;

/* =========================
   Security & Core Middleware
========================= */

// Security headers (relax CSP separately if you embed cross-origin)
app.use(helmet());

// CORS (dev + prod)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',   // vite dev default
  process.env.FRONTEND_URL_2,                            // optional extra
  process.env.RENDER_EXTERNAL_URL,                       // Render inject
  (process.env.NODE_ENV !== 'production' ? 'http://localhost:8080' : null) // single-container dev
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // allow server-to-server or Postman (no Origin header)
    if (!origin) return cb(null, true);
    return allowedOrigins.includes(origin)
      ? cb(null, true)
      : cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Body & cookies
app.use(express.json());
app.use(cookieParser());
// Gzip/Brotli compression for faster static & API responses
app.use(compression());

// Passport
require('./config/googleAuth')(passport);
require('./config/microsoftAuth')(passport);
app.use(passport.initialize());

/* =========================
   Database
========================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

/* =========================
   Rate Limits
========================= */

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

/* =========================
   Routes
========================= */

// Health
// app.get('/', (_req, res) => res.send('🚀 Task Manager API is running...'));
app.get('/healthz', (_req, res) => res.send('ok'));

app.get('/__build', (req, res) => {
  res.json({
    version: process.env.BUILD_ID || 'dev',
    time: process.env.BUILD_TIME || new Date().toISOString(),
    node: process.version,
    env: process.env.NODE_ENV || 'development'
  });
});

// Auth (local + OAuth)
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);

// Debug: who am I (quick sanity check for token + verifyToken)
app.get('/api/debug/whoami', verifyToken, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// Protected resources
// If every route in these routers requires auth, protect at the router level:
app.use('/api/tasks', verifyToken, taskRoutes);
app.use('/api/users', verifyToken, userRoutes);

/* =========================
   SPA Static (serve built React)
========================= */
// The Docker image copies ClientConnect/dist to /app/client.
// For local runs without Docker, you can set SPA_DIR via env or keep the default '../ClientConnect/dist'.
const clientDir = process.env.SPA_DIR
  ? path.resolve(process.env.SPA_DIR)
  : (process.env.NODE_ENV === 'production'
      ? path.join(__dirname, 'client')
      : path.resolve(__dirname, '../ClientConnect/dist'));

if (fs.existsSync(clientDir)) {
  // Long-cache only versioned assets
  app.use('/assets', express.static(path.join(clientDir, 'assets'), {
    setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  }));

  // Default static files (index.html will be handled by fallback below)
  app.use(express.static(clientDir));

  // SPA fallback for any non-API route (so deep links work)
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });
} else {
  console.warn(`[spa] clientDir not found: ${clientDir}. Skipping static mounts (dev mode).`);
}

// 404
// app.use('/api/*', (req, res) => res.status(404).json({ message: 'Not found', path: req.originalUrl }));
app.use(/^\/api\/.*/, (req, res) => res.status(404).json({ message: 'Not found', path: req.originalUrl }));

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  // If CORS function above rejects, err.message will have the origin
  const status = err.message?.startsWith('CORS blocked') ? 403 : 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

/* =========================
   Start & Graceful Shutdown
========================= */

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

function shutdown(signal) {
  console.log(`\n${signal} received, closing server...`);
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      console.log('🛑 Closed HTTP server & Mongo connection');
      process.exit(0);
    });
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));