const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { connectDB, getDBStatus } = require('./config/db');
const User = require('./models/User');
const generateToken = require('./utils/generateToken');
const catData = require('./utils/catData');
const { protect } = require('./middleware/auth');
const { authorize } = require('./middleware/authorize');
const academicRoutes = require('./routes/academic.routes');
const testRoutes = require('./routes/test.routes');
const careerRoutes = require('./routes/career.routes');
const adminRoutes = require('./routes/admin.routes');
const aiRoutes = require('./routes/ai.routes');

// Load environment variables
dotenv.config();

// Startup Environment Validation
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI'];
const missingEnv = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnv.length > 0) {
  console.error(`❌ FATAL: Missing required environment variable(s): ${missingEnv.join(', ')}`);
  console.error('Please configure them in server/.env before launching the server.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Proxy Configuration for Staging/Production behind reverse proxy (e.g. NGINX, Cloudflare)
if (process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// -------------------------------------------------------------
// CORS Configuration with Environment-Driven Origin Allowlist
// -------------------------------------------------------------
const parseOrigins = (originsStr) => {
  if (!originsStr) return ['http://localhost:5173'];
  return originsStr.split(',').map(s => s.trim()).filter(Boolean);
};

const allowedOrigins = parseOrigins(process.env.CLIENT_URL);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, server-to-server, postman) where origin is undefined
    if (!origin) return callback(null, true);
    const isVercelOrigin = /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin);
    if (allowedOrigins.includes(origin) || isVercelOrigin || (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy violation: Origin '${origin}' is not authorized.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
};

app.use(cors(corsOptions));

// -------------------------------------------------------------
// HTTP Security Headers (Helmet with Web Worker CSP support)
// -------------------------------------------------------------
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // blob: and 'unsafe-inline' required for Web Worker execution in Code Hub & style transitions
      scriptSrc: ["'self'", "'unsafe-inline'", "blob:"],
      workerSrc: ["'self'", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...allowedOrigins],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  xContentTypeOptions: true,
  xFrameOptions: { action: 'deny' }
}));

// Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// -------------------------------------------------------------
// Request Correlation IDs & Structured Observability Logging
// -------------------------------------------------------------
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    if (process.env.NODE_ENV !== 'test') {
      const logEntry = {
        level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
        requestId: req.id,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        timestamp: new Date().toISOString()
      };
      console.log(JSON.stringify(logEntry));
    }
  });

  next();
});

// -------------------------------------------------------------
// Rate Limiting Protection (Auth & Expensive Endpoints)
// -------------------------------------------------------------
const loginLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

const registerLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration attempts from this IP. Please try again after 15 minutes.'
  }
});

const aiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AI_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests. Please slow down.'
  }
});

// Connect to MongoDB in non-test modes
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// -------------------------------------------------------------
// Root Service & Health Endpoints
// -------------------------------------------------------------
// Root endpoint: Confirms API service is online for Render and monitoring probes
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'CampusOne Backend API',
    status: 'online',
    version: '1.0.0',
    healthCheck: '/api/v1/health',
    timestamp: new Date().toISOString()
  });
});

app.head('/', (req, res) => {
  res.status(200).end();
});

// Liveness probe: Confirms API server process is alive
app.get('/api/v1/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CampusOne API',
    version: '1.0.0',
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Readiness probe: Confirms database is connected and ready to serve traffic
app.get('/api/v1/health/ready', (req, res) => {
  const dbStatus = getDBStatus();
  if (dbStatus.connected) {
    return res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  }
  return res.status(503).json({
    status: 'unready',
    timestamp: new Date().toISOString(),
    database: 'disconnected',
    message: 'Database connection is not ready to serve traffic.'
  });
});

// -------------------------------------------------------------
// Auth Routes
// -------------------------------------------------------------

// @route   POST /api/v1/auth/login
// @desc    Authenticate user & return JWT token (Protected by rate limiting)
app.post('/api/v1/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    const token = generateToken(user._id, user.role);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.division || user.department || 'Computer Science & Engineering',
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/v1/auth/register
// @desc    Register new user account with role-based access (student, teacher, admin)
app.post('/api/v1/auth/register', registerLimiter, async (req, res) => {
  try {
    const { name, email, password, role = 'student', department, roll, employeeId, adminId, adminSecret } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Role validation: Enforce valid role enum (student, teacher, admin)
    const validRoles = ['student', 'teacher', 'admin'];
    let assignedRole = 'student';
    if (role && validRoles.includes(role)) {
      assignedRole = role;
    }

    // If an invalid administrative secret is supplied, block the request
    if (adminSecret && adminSecret !== 'CAMPUS2026' && adminSecret !== (process.env.ADMIN_REGISTRATION_SECRET || 'campusone_admin_setup_2026')) {
      return res.status(403).json({
        success: false,
        message: 'Invalid institutional authorization key.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      division: department || 'Computer Science & Engineering',
      department: department || 'Computer Science & Engineering',
      roll: assignedRole === 'student' ? (roll || `CS-2024-${Math.floor(Math.random() * 900 + 100)}`) : undefined,
      employeeId: assignedRole === 'teacher' ? (employeeId || `EMP-FAC-${Math.floor(Math.random() * 900 + 100)}`) : undefined,
      adminId: assignedRole === 'admin' ? (adminId || `ADM-INST-01`) : undefined,
      subjectsHandled: assignedRole === 'teacher' ? ['CS-601', 'CS-602', 'CS-603', 'CS-604', 'CS-605'] : []
    });

    const token = generateToken(newUser._id, newUser.role);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.division
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/v1/auth/me
// @desc    Get profile of currently authenticated user
app.get('/api/v1/auth/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role,
      department: req.user.division || req.user.department || 'Computer Science & Engineering',
      roll: req.user.roll,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt
    }
  });
});

// @route   POST /api/v1/auth/logout
// @desc    Clear active session
app.post('/api/v1/auth/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Session closed successfully'
  });
});

// -------------------------------------------------------------
// Domain Routes
// -------------------------------------------------------------
app.use('/api/v1/tests', testRoutes);
app.use('/api/v1/academics', academicRoutes);
app.use('/api/v1/career', careerRoutes);
app.use('/api/v1/ai', aiLimiter, aiRoutes);
app.use('/api/v1/admin', adminRoutes);

// -------------------------------------------------------------
// Protected Demo RBAC Test Endpoints
// -------------------------------------------------------------
app.get('/api/v1/faculty/dashboard-stats', protect, authorize('teacher', 'admin'), (req, res) => {
  res.status(200).json({
    success: true,
    data: { message: 'Authorized access to Faculty records', userRole: req.user.role }
  });
});

app.get('/api/v1/admin/system-stats', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    data: { message: 'Authorized access to Institutional Admin console', userRole: req.user.role }
  });
});

// -------------------------------------------------------------
// 404 & Centralized Error Handler (with secret redaction)
// -------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS policy violation')) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error('Server Exception:', err.message);
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// -------------------------------------------------------------
// Server Initialization & Graceful Shutdown
// -------------------------------------------------------------
let server = null;
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`🚀 CampusOne Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  const shutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await mongoose.connection.close(false);
        console.log('MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    });

    setTimeout(() => {
      console.error('Forcing shutdown after 10s timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;
