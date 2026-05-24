const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const SAMPLE_HLS_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

const animeData = [
  {
    title: 'One Piece',
    description: 'Monkey D. Luffy and his crew search for the ultimate treasure, the One Piece, to become the Pirate King.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/onepiece/400/600',
    bannerUrl: 'https://picsum.photos/seed/onepieceb/1920/600',
    genres: JSON.stringify(['Action', 'Adventure', 'Fantasy']),
    year: 1999,
    status: 'Airing',
    rating: 9.0,
    episodes: Array.from({ length: 12 }).map((_, i) => ({ s: 1, e: i + 1, title: `Episode ${i + 1}` }))
  },
  {
    title: 'Jujutsu Kaisen',
    description: 'Yuji Itadori joins a secret organization fighting curses after ingesting a powerful cursed object.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/jujutsu/400/600',
    bannerUrl: 'https://picsum.photos/seed/jujutsub/1920/600',
    genres: JSON.stringify(['Action', 'Supernatural']),
    year: 2020,
    status: 'Airing',
    rating: 8.8,
    episodes: Array.from({ length: 12 }).map((_, i) => ({ s: 1, e: i + 1, title: `Episode ${i + 1}` }))
  },
  {
    title: 'Attack on Titan',
    description: 'Humanity fights for survival against giant humanoid Titans in a desperate battle for freedom.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/aot/400/600',
    bannerUrl: 'https://picsum.photos/seed/aotb/1920/600',
    genres: JSON.stringify(['Action', 'Drama', 'Fantasy']),
    year: 2013,
    status: 'Completed',
    rating: 9.2,
    episodes: Array.from({ length: 12 }).map((_, i) => ({ s: 1, e: i + 1, title: `Episode ${i + 1}` }))
  },
  {
    title: 'Spy x Family',
    description: 'A spy must build a fake family to execute a mission, not knowing his new wife and daughter have secrets of their own.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/spyxfamily/400/600',
    bannerUrl: 'https://picsum.photos/seed/spyxfamilyb/1920/600',
    genres: JSON.stringify(['Comedy', 'Action', 'Slice of Life']),
    year: 2022,
    status: 'Airing',
    rating: 8.7,
    episodes: Array.from({ length: 10 }).map((_, i) => ({ s: 1, e: i + 1, title: `Episode ${i + 1}` }))
  },
  {
    title: 'Demon Slayer: Kimetsu no Yaiba',
    description: 'Tanjiro Kamado becomes a demon slayer after his family is slaughtered and his sister turned into a demon.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/demonslayer/400/600',
    bannerUrl: 'https://picsum.photos/seed/demonslayerb/1920/600',
    genres: JSON.stringify(['Action', 'Supernatural']),
    year: 2019,
    status: 'Airing',
    rating: 9.1,
    episodes: Array.from({ length: 11 }).map((_, i) => ({ s: 1, e: i + 1, title: `Episode ${i + 1}` }))
  },
  {
    title: 'My Hero Academia',
    description: 'In a world of heroes, Izuku Midoriya trains to become the greatest hero despite being born without powers.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/mha/400/600',
    bannerUrl: 'https://picsum.photos/seed/mhab/1920/600',
    genres: JSON.stringify(['Action', 'Superhero']),
    year: 2016,
    status: 'Airing',
    rating: 8.5,
    episodes: Array.from({ length: 12 }).map((_, i) => ({ s: 1, e: i + 1, title: `Episode ${i + 1}` }))
  },
  {
    title: 'Chainsaw Man',
    description: 'Denji fights devils with his living weapon-turned-body, Chainsaw Man, in a bloody struggle for survival.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/chainsaw/400/600',
    bannerUrl: 'https://picsum.photos/seed/chainsawb/1920/600',
    genres: JSON.stringify(['Action', 'Horror']),
    year: 2022,
    status: 'Airing',
    rating: 8.9,
    episodes: Array.from({ length: 12 }).map((_, i) => ({ s: 1, e: i + 1, title: `Episode ${i + 1}` }))
  },
  {
    title: 'Oshi no Ko',
    description: 'A dramatic story about the entertainment industry, idols and the dark side behind fame.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/oshinoko/400/600',
    bannerUrl: 'https://picsum.photos/seed/oshinokob/1920/600',
    genres: JSON.stringify(['Drama', 'Mystery']),
    year: 2023,
    status: 'Airing',
    rating: 8.8,
    episodes: Array.from({ length: 10 }).map((_, i) => ({ s: 1, e: i + 1, title: `Episode ${i + 1}` }))
  }
];

const mangaData = [
  {
    title: 'Solo Leveling',
    description: 'A weak hunter becomes the strongest after discovering a mysterious leveling system.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/sololeveling/400/600',
    bannerUrl: 'https://picsum.photos/seed/sololevelingb/1920/600',
    genres: JSON.stringify(['Action', 'Fantasy']),
    year: 2018,
    status: 'Completed',
    rating: 9.0,
    chapters: Array.from({ length: 8 }).map((_, i) => ({ n: i + 1, title: `Chapter ${i + 1}`, pages: 25 + i }))
  },
  {
    title: 'Kaiju No. 8',
    description: 'A man dreams of joining the defense force that fights kaiju, but fate has other plans.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/kaiju/400/600',
    bannerUrl: 'https://picsum.photos/seed/kaijub/1920/600',
    genres: JSON.stringify(['Action', 'Sci-Fi']),
    year: 2020,
    status: 'Airing',
    rating: 8.4,
    chapters: Array.from({ length: 6 }).map((_, i) => ({ n: i + 1, title: `Chapter ${i + 1}`, pages: 28 + i }))
  },
  {
    title: 'Tokyo Revengers',
    description: 'A man travels back in time to save his friends and change the fate of Tokyo gangs.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/tokyorev/400/600',
    bannerUrl: 'https://picsum.photos/seed/tokyorevb/1920/600',
    genres: JSON.stringify(['Action', 'Drama']),
    year: 2017,
    status: 'Completed',
    rating: 8.2,
    chapters: Array.from({ length: 7 }).map((_, i) => ({ n: i + 1, title: `Chapter ${i + 1}`, pages: 30 + i }))
  },
  {
    title: 'Berserk',
    description: 'A dark fantasy following Guts, a lone mercenary with a tragic past and a cursed destiny.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/berserk/400/600',
    bannerUrl: 'https://picsum.photos/seed/berserkb/1920/600',
    genres: JSON.stringify(['Dark Fantasy', 'Action']),
    year: 1989,
    status: 'Completed',
    rating: 9.1,
    chapters: Array.from({ length: 6 }).map((_, i) => ({ n: i + 1, title: `Chapter ${i + 1}`, pages: 30 + i }))
  },
  {
    title: 'Chainsaw Man',
    description: 'Denji fights devils with his living weapon-turned-body, Chainsaw Man, in a bloody struggle for survival.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/chainsawmanga/400/600',
    bannerUrl: 'https://picsum.photos/seed/chainsawmangab/1920/600',
    genres: JSON.stringify(['Action', 'Horror']),
    year: 2018,
    status: 'Airing',
    rating: 8.9,
    chapters: Array.from({ length: 8 }).map((_, i) => ({ n: i + 1, title: `Chapter ${i + 1}`, pages: 28 + i }))
  },
  {
    title: 'One Piece',
    description: 'Monkey D. Luffy and his crew search for the ultimate treasure, the One Piece, to become the Pirate King.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/onepiecemanga/400/600',
    bannerUrl: 'https://picsum.photos/seed/onepiecemangab/1920/600',
    genres: JSON.stringify(['Action', 'Adventure']),
    year: 1997,
    status: 'Airing',
    rating: 9.3,
    chapters: Array.from({ length: 10 }).map((_, i) => ({ n: i + 1, title: `Chapter ${i + 1}`, pages: 20 + i }))
  },
  {
    title: 'Jujutsu Kaisen',
    description: 'Yuji Itadori joins a secret organization fighting curses after ingesting a powerful cursed object.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/jujutsumanga/400/600',
    bannerUrl: 'https://picsum.photos/seed/jujutsumangab/1920/600',
    genres: JSON.stringify(['Action', 'Supernatural']),
    year: 2018,
    status: 'Airing',
    rating: 8.8,
    chapters: Array.from({ length: 8 }).map((_, i) => ({ n: i + 1, title: `Chapter ${i + 1}`, pages: 25 + i }))
  }
];

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.userProgress.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.mangaChapter.deleteMany();
  await prisma.content.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);
  const demoUser = await prisma.user.create({
    data: {
      username: 'otaku_demo',
      email: 'demo@omnistream.com',
      password: hashedPassword,
      profilePic: 'https://picsum.photos/seed/avatar1/200/200'
    }
  });
  console.log(`✅ Demo user created: ${demoUser.email} / demo123`);

  // Seed anime
  for (const anime of animeData) {
    const { episodes, ...contentData } = anime;
    const content = await prisma.content.create({ data: contentData });

    if (episodes.length > 0) {
      await prisma.episode.createMany({
        data: episodes.map(ep => ({
          contentId: content.id,
          seasonNumber: ep.s,
          episodeNumber: ep.e,
          title: ep.title,
          videoUrl: SAMPLE_HLS_URL,
          thumbnailUrl: `https://picsum.photos/seed/ep${content.id}_${ep.s}_${ep.e}/320/180`,
          duration: Math.floor(Math.random() * 600) + 1200 // 20-30 min
        }))
      });
    }

    console.log(`  📺 ${content.title} (${episodes.length} episodes)`);
  }

  // Seed manga
  for (const manga of mangaData) {
    const { chapters, ...contentData } = manga;
    const content = await prisma.content.create({ data: contentData });

    if (chapters.length > 0) {
      await prisma.mangaChapter.createMany({
        data: chapters.map(ch => ({
          contentId: content.id,
          chapterNumber: ch.n,
          title: ch.title,
          pageCount: ch.pages,
          pages: JSON.stringify(
            Array.from({ length: ch.pages }, (_, i) =>
              `https://picsum.photos/seed/manga${content.id}_ch${ch.n}_p${i + 1}/800/1200`
            )
          )
        }))
      });
    }

    console.log(`  📖 ${content.title} (${chapters.length} chapters)`);
  }

  // Add some items to demo user's watchlist
  const allContent = await prisma.content.findMany({ take: 5 });
  for (const content of allContent) {
    await prisma.watchlist.create({
      data: { userId: demoUser.id, contentId: content.id }
    });
  }
  console.log(`  📋 Added ${allContent.length} items to demo user's watchlist`);

  // Add some progress for demo user
  const firstAnime = await prisma.content.findFirst({
    where: { type: 'ANIME' },
    include: { episodes: true }
  });
  if (firstAnime && firstAnime.episodes.length > 0) {
    await prisma.userProgress.create({
      data: {
        userId: demoUser.id,
        contentId: firstAnime.id,
        episodeId: firstAnime.episodes[2].id,
        lastTimestamp: 845
      }
    });
    console.log(`  ▶️ Progress set for ${firstAnime.title}`);
  }

  console.log('\n🎉 Seeding complete!');
}

seed()
  .catch(e => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
