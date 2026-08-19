require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('../config/passport');
const apiRoutes = require('../routes/api');
const ActivityLog = require('../models/ActivityLog');

const app = express();

// Vercel/Render proxy trust
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost',
  'http://localhost:5173',
  'capacitor://localhost',
  'https://localhost',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// ── MongoDB + Sessions ────────────────────────────────────────────────────────
const { MongoStore } = require('connect-mongo');

// Lazy mongoose connection (reused across serverless invocations)
let mongoConnected = false;
async function connectDB() {
  if (mongoConnected || mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
  mongoConnected = true;
  console.log('MongoDB connected');
}
connectDB().catch(err => console.error('MongoDB connection error:', err));

app.use(session({
  secret: process.env.SESSION_SECRET || 'veggies_kitchen_super_secret_session_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/auth/google', (req, res, next) => {
  const returnTo = req.query.returnTo || '#/';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: returnTo
  })(req, res, next);
});

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/#/account` }),
  async (req, res) => {
    await ActivityLog.create({ action: 'User Logged In', user: req.user._id, details: { name: req.user.name } });
    const returnTo = req.query.state || '#/';
    res.redirect(`${FRONTEND_URL}/${returnTo}`);
  }
);

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => res.json({}));
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

app.use('/api', apiRoutes);

// ── Export for Vercel (no app.listen) ────────────────────────────────────────
module.exports = app;
