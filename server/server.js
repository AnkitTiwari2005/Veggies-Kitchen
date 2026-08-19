require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');
const apiRoutes = require('./routes/api');
const ActivityLog = require('./models/ActivityLog');

const app = express();
// Render terminates HTTPS at its proxy. Trust the proxy so express-session
// correctly handles secure cookies in production.
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

console.log('--- Startup Config ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('isProduction:', isProduction);
console.log('FRONTEND_URL:', FRONTEND_URL);
console.log('----------------------');

const allowedOrigins = [FRONTEND_URL, 'http://localhost', 'capacitor://localhost'];

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

const { MongoStore } = require('connect-mongo');

// Setup Sessions
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
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Auth Routes
app.get('/auth/google', (req, res, next) => {
  // Pass the returnTo path through OAuth state so we can redirect back after login
  const returnTo = req.query.returnTo || '#/';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: returnTo
  })(req, res, next);
});

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/#/account` }),
  async (req, res) => {
    // Log Activity
    await ActivityLog.create({ action: 'User Logged In', user: req.user._id, details: { name: req.user.name } });
    // Redirect to the page the user was on before login
    const returnTo = req.query.state || '#/';
    res.redirect(`${FRONTEND_URL}/${returnTo}`);
  }
);

// Ignore Chrome DevTools requests
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(200).json({});
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Use API Routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
