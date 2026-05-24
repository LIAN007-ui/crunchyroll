const express = require('express');
const fetch = global.fetch || require('node-fetch');
const router = express.Router();

const JIKAN_BASE = 'https://api.jikan.moe/v4';
const MANGADEX_BASE = 'https://api.mangadex.org';

// Proxy GET requests to Jikan
router.get('/jikan/*', async (req, res, next) => {
  try {
    const path = req.params[0] || '';
    const qs = req.url.includes('?') ? req.url.split('?')[1] : '';
    const target = `${JIKAN_BASE}/${path}${qs ? `?${qs}` : ''}`;
    const r = await fetch(target);
    const body = await r.text();
    res.status(r.status).set('content-type', r.headers.get('content-type') || 'application/json').send(body);
  } catch (err) {
    next(err);
  }
});

// Proxy GET requests to MangaDex
router.get('/mangadex/*', async (req, res, next) => {
  try {
    const path = req.params[0] || '';
    const qs = req.url.includes('?') ? req.url.split('?')[1] : '';
    const target = `${MANGADEX_BASE}/${path}${qs ? `?${qs}` : ''}`;
    const r = await fetch(target, { headers: { 'Content-Type': 'application/json' } });
    const body = await r.text();
    res.status(r.status).set('content-type', r.headers.get('content-type') || 'application/json').send(body);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
