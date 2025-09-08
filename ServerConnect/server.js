// ServerConnect/server.js
require('dotenv').config();

// Load local development configuration if in development mode
if (process.env.NODE_ENV === 'development' && !process.env.MONGO_URI) {
  const localConfig = require('./config.local.js');
  Object.keys(localConfig).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = localConfig[key];
    }
  });
}

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
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// Routes
const authRoutes = require('./routes/auth');
const oauthRoutes = require('./routes/oauth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');

// Auth middleware (your new robust one)
const verifyToken = require('./middleware/verifyToken');

// Models
const User = require('./models/User');
const ChatMessage = require('./models/ChatMessage');

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
  'http://localhost:5174',                               // vite dev alternative port
  'http://localhost:5175',                               // vite dev alternative port
  'http://localhost:5176',                               // vite dev alternative port
  process.env.FRONTEND_URL_2,                            // optional extra
  process.env.RENDER_EXTERNAL_URL,                       // Render inject
  (process.env.NODE_ENV !== 'production' ? 'http://localhost:8080' : null) // single-container dev
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // allow server-to-server or Postman (no Origin header)
    if (!origin) return cb(null, true);
    
    console.log('CORS check - Origin:', origin);
    console.log('CORS check - Allowed origins:', allowedOrigins);
    
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

// Test endpoint for chat connection
app.get('/api/debug/chat-test', verifyToken, (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Chat connection test successful',
    user: req.user.name,
    userId: req.user.userId
  });
});

// Debug endpoint to check users in database
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email _id').limit(10);
    res.json({ 
      message: 'Users in database',
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected resources
// If every route in these routers requires auth, protect at the router level:
app.use('/api/tasks', verifyToken, taskRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/chat', verifyToken, chatRoutes);

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

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    console.log('Socket connection attempt from origin:', socket.handshake.headers.origin);
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log('No token provided');
      return next(new Error('Authentication error'));
    }

    console.log('Token received, length:', token.length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
    // Try different possible user ID fields (token uses 'id' field)
    const userId = decoded.id || decoded.userId || decoded._id;
    console.log('Looking for user with ID:', userId);
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.log('User not found for token, trying to find by email...');
      // Try finding by email as fallback
      const userByEmail = await User.findOne({ email: decoded.email }).select('-password');
      if (userByEmail) {
        console.log('Found user by email:', userByEmail.name);
        socket.userId = userByEmail._id.toString();
        socket.user = userByEmail;
        return next();
      }
      console.log('User not found for token or email');
      return next(new Error('User not found'));
    }

    console.log('Socket authenticated for user:', user.name);
    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (err) {
    console.log('Socket authentication error:', err.message);
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.user.name} connected with socket ${socket.id}`);

  // Join user to their personal room
  socket.join(socket.userId);

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { receiverId, message, messageType = 'text' } = data;
      
      // Create message in database
      const chatMessage = new ChatMessage({
        sender: socket.userId,
        receiver: receiverId,
        message,
        messageType
      });

      await chatMessage.save();

      // Populate sender info
      await chatMessage.populate('sender', 'name email');

      // Send to receiver
      socket.to(receiverId).emit('receive_message', chatMessage);
      
      // Send confirmation to sender
      socket.emit('message_sent', chatMessage);
      
      // Mark as delivered if receiver is online
      const receiverSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.userId === receiverId);
      
      if (receiverSocket) {
        // Receiver is online, mark as delivered
        chatMessage.delivered = true;
        await chatMessage.save();
        
        // Notify sender that message was delivered
        socket.emit('message_delivered', {
          messageId: chatMessage._id,
          delivered: true
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.receiverId).emit('user_typing', {
      senderId: socket.userId,
      senderName: socket.user.name,
      isTyping: data.isTyping
    });
  });

  // Handle user going online/offline
  socket.on('user_online', () => {
    socket.broadcast.emit('user_status', {
      userId: socket.userId,
      status: 'online'
    });
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.user.name} disconnected`);
    socket.broadcast.emit('user_status', {
      userId: socket.userId,
      status: 'offline'
    });
  });
});

server.listen(PORT, () => {
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