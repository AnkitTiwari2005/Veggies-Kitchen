// Vercel serverless entry — exports Express app (no app.listen)
require('dotenv').config();

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const session    = require('express-session');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const MongoStore = require('connect-mongo');          // ← default export (v4+)
const passport   = require('../config/passport');
const apiRoutes  = require('../routes/api');
const ActivityLog = require('../models/ActivityLog');

const app = express();

// ── Trust proxy (Vercel + Render both sit behind proxies) ────────────────────
app.set('trust proxy', 1);

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const FRONTEND_URL  = process.env.FRONTEND_URL || 'http://localhost:5173';
const isProduction  = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',
  'https://localhost',
];

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── MongoDB (lazy, reused across serverless warm invocations) ─────────────────
let dbReady = false;
mongoose.connection.once('open', () => { dbReady = true; });

async function connectDB() {
  if (mongoose.connection.readyState === 1) return; // already connected
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.warn('MONGODB_URI not set — skipping DB connect'); return; }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB connected');
}
connectDB().catch(err => console.error('MongoDB error:', err.message));

// ── Sessions ──────────────────────────────────────────────────────────────────
const sessionStore = process.env.MONGODB_URI
  ? MongoStore.create({ mongoUrl: process.env.MONGODB_URI, collectionName: 'sessions', ttl: 60 * 60 * 24 * 7 })
  : undefined; // fallback to in-memory when no DB URI (dev without mongo)

app.use(session({
  secret: process.env.SESSION_SECRET || 'veggies_kitchen_dev_secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure:   isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    httpOnly: true,
    maxAge:   1000 * 60 * 60 * 24 * 7, // 1 week
  },
}));

// ── Passport ──────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/auth/google', (req, res, next) => {
  const returnTo = req.query.returnTo || '#/';
  passport.authenticate('google', { scope: ['profile', 'email'], state: returnTo })(req, res, next);
});

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/#/account` }),
  async (req, res) => {
    try {
      await ActivityLog.create({ action: 'User Logged In', user: req.user._id, details: { name: req.user.name } });
    } catch { /* non-fatal */ }
    const returnTo = req.query.state || '#/';
    res.redirect(`${FRONTEND_URL}/${returnTo}`);
  }
);

app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => res.json({}));

app.get('/', (_req, res) => res.json({
  name: 'Veggies Kitchen API',
  status: 'running',
  version: '1.0.0',
  endpoints: ['/health', '/api', '/auth/google'],
}));

app.get('/health', (_req, res) => res.json({
  status: 'ok',
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  ts: new Date().toISOString(),
}));

app.use('/api', apiRoutes);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Export for Vercel (no app.listen) ────────────────────────────────────────
module.exports = app;
