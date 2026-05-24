require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const watchlistRoutes = require('./routes/watchlist');
const progressRoutes = require('./routes/progress');
const recommendationsRoutes = require('./routes/recommendations');
const proxyRoutes = require('./routes/proxy');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
// CORS configuration: allow a list from env or fallback to localhost
const allowedFromEnv = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '';
const allowed = allowedFromEnv.split(',').map(s => s.trim()).filter(Boolean);
const defaultAllowed = ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // allow non-browser or server-to-server requests (no origin)
    if (!origin) return callback(null, true);

    // if ALLOWED_ORIGINS/FRONTEND_URL provided, use that allowlist
    if (allowed.length) {
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error('CORS not allowed for origin ' + origin), false);
    }

    // otherwise allow localhost dev origins only
    if (defaultAllowed.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed for origin ' + origin), false);
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/proxy', proxyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 OmniStream API running on http://localhost:${PORT}`);
});
