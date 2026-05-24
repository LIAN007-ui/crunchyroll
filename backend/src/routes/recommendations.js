const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/recommendations — AI-powered recommendations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's watchlist and progress to understand preferences
    const [watchlist, progress] = await Promise.all([
      prisma.watchlist.findMany({
        where: { userId },
        include: { content: true }
      }),
      prisma.userProgress.findMany({
        where: { userId },
        include: { content: true }
      })
    ]);

    // Build genre preference map (weighted by interaction)
    const genreWeights = {};
    const consumedIds = new Set();

    const processContent = (content, weight) => {
      consumedIds.add(content.id);
      const genres = JSON.parse(content.genres);
      genres.forEach(genre => {
        genreWeights[genre] = (genreWeights[genre] || 0) + weight;
      });
    };

    // Content in watchlist gets weight 1
    watchlist.forEach(w => processContent(w.content, 1));
    // Content with progress gets weight 2 (stronger signal)
    progress.forEach(p => processContent(p.content, 2));

    // Sort genres by weight
    const sortedGenres = Object.entries(genreWeights)
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre);

    // If no preferences, return top-rated content
    if (sortedGenres.length === 0) {
      const topRated = await prisma.content.findMany({
        orderBy: { rating: 'desc' },
        take: 20,
        include: { _count: { select: { episodes: true, mangaChapters: true } } }
      });

      return res.json({
        recommendations: topRated.map(c => ({
          ...c,
          genres: JSON.parse(c.genres),
          episodeCount: c._count.episodes,
          chapterCount: c._count.mangaChapters,
          _count: undefined,
          reason: 'Top Rated'
        })),
        preferredGenres: []
      });
    }

    // Get all content not yet consumed
    const allContent = await prisma.content.findMany({
      where: {
        id: { notIn: Array.from(consumedIds) }
      },
      include: { _count: { select: { episodes: true, mangaChapters: true } } }
    });

    // Score each content based on genre overlap
    const scored = allContent.map(content => {
      const genres = JSON.parse(content.genres);
      let score = 0;
      let matchedGenres = [];

      genres.forEach(genre => {
        if (genreWeights[genre]) {
          score += genreWeights[genre];
          matchedGenres.push(genre);
        }
      });

      // Bonus for higher-rated content
      score += content.rating * 0.5;

      return {
        ...content,
        genres,
        episodeCount: content._count.episodes,
        chapterCount: content._count.mangaChapters,
        _count: undefined,
        score,
        reason: matchedGenres.length > 0
          ? `Because you like ${matchedGenres.slice(0, 2).join(', ')}`
          : 'Popular'
      };
    });

    // Sort by score and take top 20
    scored.sort((a, b) => b.score - a.score);

    res.json({
      recommendations: scored.slice(0, 20),
      preferredGenres: sortedGenres.slice(0, 5)
    });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
