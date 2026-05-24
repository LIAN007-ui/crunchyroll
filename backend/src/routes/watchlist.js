const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/watchlist — Get user's watchlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      include: {
        content: {
          include: {
            _count: { select: { episodes: true, mangaChapters: true } }
          }
        }
      },
      orderBy: { addedAt: 'desc' }
    });

    const parsed = watchlist.map(w => ({
      ...w,
      content: {
        ...w.content,
        genres: JSON.parse(w.content.genres),
        episodeCount: w.content._count.episodes,
        chapterCount: w.content._count.mangaChapters,
        _count: undefined
      }
    }));

    res.json({ watchlist: parsed });
  } catch (err) {
    console.error('Watchlist error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/watchlist/:contentId — Add to watchlist
router.post('/:contentId', authMiddleware, async (req, res) => {
  try {
    const contentId = parseInt(req.params.contentId);

    const content = await prisma.content.findUnique({ where: { id: contentId } });
    if (!content) {
      return res.status(404).json({ error: 'Content not found.' });
    }

    const entry = await prisma.watchlist.upsert({
      where: {
        userId_contentId: { userId: req.user.id, contentId }
      },
      create: { userId: req.user.id, contentId },
      update: {}
    });

    res.status(201).json({ watchlist: entry, message: 'Added to watchlist.' });
  } catch (err) {
    console.error('Add to watchlist error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/watchlist/:contentId — Remove from watchlist
router.delete('/:contentId', authMiddleware, async (req, res) => {
  try {
    const contentId = parseInt(req.params.contentId);

    await prisma.watchlist.deleteMany({
      where: { userId: req.user.id, contentId }
    });

    res.json({ message: 'Removed from watchlist.' });
  } catch (err) {
    console.error('Remove from watchlist error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
