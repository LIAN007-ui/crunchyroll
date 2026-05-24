const express = require('express');
const fetch = global.fetch || require('node-fetch');
const router = express.Router();

const JIKAN_BASE = 'https://api.jikan.moe/v4';
const MANGADEX_BASE = 'https://api.mangadex.org';

// Simple in-memory cache with TTL
const cache = new Map();
function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry;
}

function setCache(key, body, headers, status, ttl = 60000) {
  cache.set(key, {
    body,
    headers,
    status,
    expires: Date.now() + ttl
  });
}

async function safeFetchWithRetry(target, opts = {}, retries = 1, retryDelay = 1000) {
  let attempt = 0;
  while (attempt <= retries) {
    const r = await fetch(target, opts);
    if (r.status === 429 && attempt < retries) {
      await new Promise(res => setTimeout(res, retryDelay));
      attempt++;
      continue;
    }
    return r;
  }
}

// Helper to proxy and cache GET requests
async function proxyAndCache(req, res, base) {
  try {
    const path = req.params[0] || '';
    const qs = req.url.includes('?') ? req.url.split('?')[1] : '';
    const target = `${base}/${path}${qs ? `?${qs}` : ''}`;

    const cacheKey = target;
    const cached = getCache(cacheKey);
    if (cached) {
      res.status(cached.status).set(cached.headers).send(cached.body);
      return;
    }

    const r = await safeFetchWithRetry(target, { headers: { 'Accept': 'application/json' } }, 1, 900);
    const body = await r.text();
    const headers = { 'content-type': r.headers.get('content-type') || 'application/json' };

    // Determine TTL heuristically: list endpoints shorter TTL, detail endpoints longer
    let ttl = 60 * 1000; // 1 minute default
    if (/\/anime(\/|\?|$)/i.test(target) || /\/manga(\/|\?|$)/i.test(target)) {
      // if querying a single resource by id
      if (/\/[0-9a-fA-F-]{2,}\/?$/.test(target) || /\/anime\/\d+/.test(target)) ttl = 60 * 60 * 1000; // 1 hour
    }

    // Store in cache
    try { setCache(cacheKey, body, headers, r.status, ttl); } catch (e) { /* ignore cache errors */ }

    res.status(r.status).set(headers).send(body);
  } catch (err) {
    next(err);
  }
}

// Proxy GET requests to Jikan
router.get('/jikan/*', async (req, res, next) => {
  try {
    await proxyAndCache(req, res, JIKAN_BASE);
  } catch (err) {
    next(err);
  }
});

// Proxy GET requests to MangaDex
router.get('/mangadex/*', async (req, res, next) => {
  try {
    await proxyAndCache(req, res, MANGADEX_BASE);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
