const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/progress — Get all user progress
router.get('/', authMiddleware, async (req, res) => {
  try {
    const progress = await prisma.userProgress.findMany({
      where: { userId: req.user.id },
      include: {
        content: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const parsed = progress.map(p => ({
      ...p,
      content: { ...p.content, genres: JSON.parse(p.content.genres) }
    }));

    res.json({ progress: parsed });
  } catch (err) {
    console.error('Progress list error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/progress/:contentId — Get progress for specific content
router.get('/:contentId', authMiddleware, async (req, res) => {
  try {
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_contentId: {
          userId: req.user.id,
          contentId: parseInt(req.params.contentId)
        }
      }
    });

    res.json({ progress });
  } catch (err) {
    console.error('Progress detail error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/progress — Update progress for a content item
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { contentId, episodeId, chapterId, lastTimestamp, lastPage } = req.body;

    if (!contentId) {
      return res.status(400).json({ error: 'contentId is required.' });
    }

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_contentId: {
          userId: req.user.id,
          contentId: parseInt(contentId)
        }
      },
      create: {
        userId: req.user.id,
        contentId: parseInt(contentId),
        episodeId: episodeId ? parseInt(episodeId) : null,
        chapterId: chapterId ? parseInt(chapterId) : null,
        lastTimestamp: lastTimestamp ? parseInt(lastTimestamp) : null,
        lastPage: lastPage ? parseInt(lastPage) : null
      },
      update: {
        episodeId: episodeId ? parseInt(episodeId) : undefined,
        chapterId: chapterId ? parseInt(chapterId) : undefined,
        lastTimestamp: lastTimestamp !== undefined ? parseInt(lastTimestamp) : undefined,
        lastPage: lastPage !== undefined ? parseInt(lastPage) : undefined
      }
    });

    res.json({ progress });
  } catch (err) {
    console.error('Progress update error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
