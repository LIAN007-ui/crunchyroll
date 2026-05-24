const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/content — List all content with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type, genre, year, status, search, page = 1, limit = 20, sort = 'rating' } = req.query;

    const where = {};

    if (type) where.type = type.toUpperCase();
    if (year) where.year = parseInt(year);
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // For genre filtering on JSON string, we use contains
    if (genre) {
      where.genres = { contains: genre };
    }

    const orderBy = {};
    if (sort === 'rating') orderBy.rating = 'desc';
    else if (sort === 'year') orderBy.year = 'desc';
    else if (sort === 'title') orderBy.title = 'asc';
    else if (sort === 'newest') orderBy.createdAt = 'desc';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: {
          _count: {
            select: { episodes: true, mangaChapters: true }
          }
        }
      }),
      prisma.content.count({ where })
    ]);

    // Parse genres from JSON string
    const parsed = content.map(c => ({
      ...c,
      genres: JSON.parse(c.genres),
      episodeCount: c._count.episodes,
      chapterCount: c._count.mangaChapters,
      _count: undefined
    }));

    res.json({
      content: parsed,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Content list error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/content/featured — Get featured content for hero
router.get('/featured', async (req, res) => {
  try {
    const featured = await prisma.content.findMany({
      where: { rating: { gte: 8.0 } },
      orderBy: { rating: 'desc' },
      take: 5
    });

    res.json({ featured: featured.map(c => ({ ...c, genres: JSON.parse(c.genres) })) });
  } catch (err) {
    console.error('Featured error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/content/:id — Get single content with episodes/chapters
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const content = await prisma.content.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        episodes: { orderBy: [{ seasonNumber: 'asc' }, { episodeNumber: 'asc' }] },
        mangaChapters: { orderBy: { chapterNumber: 'asc' } },
        _count: { select: { watchlist: true } }
      }
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found.' });
    }

    // Check if user has it in watchlist
    let inWatchlist = false;
    let userProgress = null;
    if (req.user) {
      const wl = await prisma.watchlist.findUnique({
        where: { userId_contentId: { userId: req.user.id, contentId: content.id } }
      });
      inWatchlist = !!wl;

      userProgress = await prisma.userProgress.findUnique({
        where: { userId_contentId: { userId: req.user.id, contentId: content.id } }
      });
    }

    const parsed = {
      ...content,
      genres: JSON.parse(content.genres),
      mangaChapters: content.mangaChapters.map(ch => ({
        ...ch,
        pages: JSON.parse(ch.pages)
      })),
      bookmarkCount: content._count.watchlist,
      inWatchlist,
      userProgress,
      _count: undefined
    };

    res.json({ content: parsed });
  } catch (err) {
    console.error('Content detail error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/content/:id/episodes
router.get('/:id/episodes', async (req, res) => {
  try {
    const episodes = await prisma.episode.findMany({
      where: { contentId: parseInt(req.params.id) },
      orderBy: [{ seasonNumber: 'asc' }, { episodeNumber: 'asc' }]
    });

    // Group by season
    const seasons = {};
    episodes.forEach(ep => {
      if (!seasons[ep.seasonNumber]) seasons[ep.seasonNumber] = [];
      seasons[ep.seasonNumber].push(ep);
    });

    res.json({ episodes, seasons });
  } catch (err) {
    console.error('Episodes error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/content/:id/chapters
router.get('/:id/chapters', async (req, res) => {
  try {
    const chapters = await prisma.mangaChapter.findMany({
      where: { contentId: parseInt(req.params.id) },
      orderBy: { chapterNumber: 'asc' }
    });

    const parsed = chapters.map(ch => ({
      ...ch,
      pages: JSON.parse(ch.pages)
    }));

    res.json({ chapters: parsed });
  } catch (err) {
    console.error('Chapters error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
