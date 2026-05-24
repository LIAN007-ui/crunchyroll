const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const SAMPLE_HLS_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

const animeData = [
  {
    title: 'Phantom Requiem',
    description: 'In a dystopian future where music has been banned, a group of rebel musicians must fight to bring harmony back to the world. Their instruments are weapons, their melodies are revolutions.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime1/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime1b/1920/600',
    genres: JSON.stringify(['Action', 'Sci-Fi', 'Music']),
    year: 2024,
    status: 'Airing',
    rating: 9.1,
    episodes: [
      { s: 1, e: 1, title: 'The Last Symphony' },
      { s: 1, e: 2, title: 'Echoes of Rebellion' },
      { s: 1, e: 3, title: 'Crescendo of War' },
      { s: 1, e: 4, title: 'The Silent City' },
      { s: 1, e: 5, title: 'Harmony Restored' },
      { s: 1, e: 6, title: 'Dissonance' },
      { s: 1, e: 7, title: 'The Conductor\'s Shadow' },
      { s: 1, e: 8, title: 'Fortissimo' },
      { s: 1, e: 9, title: 'Pianissimo' },
      { s: 1, e: 10, title: 'Final Movement' },
      { s: 1, e: 11, title: 'The Orchestra Rises' },
      { s: 1, e: 12, title: 'Requiem' },
    ]
  },
  {
    title: 'Azure Horizon',
    description: 'A young sailor discovers a map to a floating island in the sky. With a crew of misfits, they race against a powerful empire to reach the legendary Azure Horizon before it\'s too late.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime2/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime2b/1920/600',
    genres: JSON.stringify(['Adventure', 'Fantasy', 'Action']),
    year: 2024,
    status: 'Airing',
    rating: 8.9,
    episodes: [
      { s: 1, e: 1, title: 'The Map of Skies' },
      { s: 1, e: 2, title: 'Storm Chasers' },
      { s: 1, e: 3, title: 'The Crew Assembles' },
      { s: 1, e: 4, title: 'Cloud Pirates' },
      { s: 1, e: 5, title: 'The Wind Gate' },
      { s: 1, e: 6, title: 'Sky Fortress' },
      { s: 1, e: 7, title: 'Floating Gardens' },
      { s: 1, e: 8, title: 'The Empire Strikes' },
      { s: 1, e: 9, title: 'Above the Clouds' },
      { s: 1, e: 10, title: 'Azure Dawn' },
    ]
  },
  {
    title: 'Neon Samurai',
    description: 'In Neo-Tokyo 2099, the last samurai protects the digital underworld from corrupted AI. Blending ancient bushido with cyberpunk technology, Kira must find the source of the Glitch.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime3/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime3b/1920/600',
    genres: JSON.stringify(['Action', 'Cyberpunk', 'Sci-Fi']),
    year: 2023,
    status: 'Completed',
    rating: 9.4,
    episodes: [
      { s: 1, e: 1, title: 'Code of Honor' },
      { s: 1, e: 2, title: 'Digital Ronin' },
      { s: 1, e: 3, title: 'The Glitch Awakens' },
      { s: 1, e: 4, title: 'Neon Blade' },
      { s: 1, e: 5, title: 'Ghost in the Wire' },
      { s: 1, e: 6, title: 'Bushido.exe' },
      { s: 2, e: 1, title: 'New Dawn Protocol' },
      { s: 2, e: 2, title: 'The Hacker\'s Blade' },
      { s: 2, e: 3, title: 'Cyber Shogunate' },
      { s: 2, e: 4, title: 'Final Slash' },
    ]
  },
  {
    title: 'Moonlit Academy',
    description: 'At Tsuki Academy, students with supernatural powers learn to control their abilities while navigating the complexities of teenage life, friendships, and a mysterious prophecy.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime4/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime4b/1920/600',
    genres: JSON.stringify(['School', 'Supernatural', 'Romance']),
    year: 2024,
    status: 'Airing',
    rating: 8.2,
    episodes: [
      { s: 1, e: 1, title: 'New Student' },
      { s: 1, e: 2, title: 'The Awakening' },
      { s: 1, e: 3, title: 'Moonlit Dance' },
      { s: 1, e: 4, title: 'Prophecy Revealed' },
      { s: 1, e: 5, title: 'The Rival' },
      { s: 1, e: 6, title: 'Festival Eve' },
      { s: 1, e: 7, title: 'Shadow Test' },
      { s: 1, e: 8, title: 'Heart of the Moon' },
    ]
  },
  {
    title: 'Dragon Chronicle',
    description: 'An ancient war between humans and dragons reignites when a young girl forms an unexpected bond with the last dragon. Together, they must unite two worlds threatening to clash.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime5/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime5b/1920/600',
    genres: JSON.stringify(['Fantasy', 'Adventure', 'Drama']),
    year: 2023,
    status: 'Completed',
    rating: 8.7,
    episodes: [
      { s: 1, e: 1, title: 'The Last Egg' },
      { s: 1, e: 2, title: 'Wings of Fire' },
      { s: 1, e: 3, title: 'The Bond' },
      { s: 1, e: 4, title: 'Dragon Flight' },
      { s: 1, e: 5, title: 'The Ancient War' },
      { s: 1, e: 6, title: 'Flames of Peace' },
      { s: 1, e: 7, title: 'Sky Riders' },
      { s: 1, e: 8, title: 'The Dragon King' },
      { s: 1, e: 9, title: 'United Realms' },
      { s: 1, e: 10, title: 'Chronicle\'s End' },
      { s: 1, e: 11, title: 'New Dawn' },
      { s: 1, e: 12, title: 'Legacy' },
      { s: 1, e: 13, title: 'Epilogue' },
    ]
  },
  {
    title: 'Culinary Wars: Supreme Chef',
    description: 'At the world\'s most prestigious culinary academy, students battle with their signature dishes for the title of Supreme Chef. Every plate is a masterpiece, every meal a challenge.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime6/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime6b/1920/600',
    genres: JSON.stringify(['Comedy', 'School', 'Food']),
    year: 2024,
    status: 'Airing',
    rating: 8.0,
    episodes: [
      { s: 1, e: 1, title: 'The Entrance Exam' },
      { s: 1, e: 2, title: 'First Course' },
      { s: 1, e: 3, title: 'The Secret Ingredient' },
      { s: 1, e: 4, title: 'Dessert Showdown' },
      { s: 1, e: 5, title: 'International Challenge' },
      { s: 1, e: 6, title: 'Master Chef Round' },
    ]
  },
  {
    title: 'Void Walker',
    description: 'After dying in our world, Sora wakes up in the Void — a dimension between realities. With the power to walk between worlds, he must prevent the merging of all dimensions.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime7/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime7b/1920/600',
    genres: JSON.stringify(['Isekai', 'Action', 'Fantasy']),
    year: 2023,
    status: 'Completed',
    rating: 8.5,
    episodes: [
      { s: 1, e: 1, title: 'Between Worlds' },
      { s: 1, e: 2, title: 'The First Rift' },
      { s: 1, e: 3, title: 'Void Powers' },
      { s: 1, e: 4, title: 'Parallel Lives' },
      { s: 1, e: 5, title: 'The Merge Begins' },
      { s: 1, e: 6, title: 'Dimension Collapse' },
      { s: 1, e: 7, title: 'Two Worlds United' },
      { s: 1, e: 8, title: 'The Void King' },
      { s: 1, e: 9, title: 'Final Walk' },
      { s: 1, e: 10, title: 'Home' },
    ]
  },
  {
    title: 'Steel Heart',
    description: 'In a world where everyone is born with a mechanical heart, one girl discovers she has a natural one. Hunted by the government, she seeks the truth about the Steel Heart program.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime8/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime8b/1920/600',
    genres: JSON.stringify(['Sci-Fi', 'Thriller', 'Drama']),
    year: 2025,
    status: 'Upcoming',
    rating: 0,
    episodes: []
  },
  {
    title: 'Spirit Garden',
    description: 'A heartwarming story about a young herbalist who can see forest spirits. She tends a magical garden where supernatural and human worlds coexist in harmony.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime9/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime9b/1920/600',
    genres: JSON.stringify(['Slice of Life', 'Fantasy', 'Healing']),
    year: 2024,
    status: 'Airing',
    rating: 8.3,
    episodes: [
      { s: 1, e: 1, title: 'The First Bloom' },
      { s: 1, e: 2, title: 'Whispering Leaves' },
      { s: 1, e: 3, title: 'Rain Spirit' },
      { s: 1, e: 4, title: 'The Old Tree' },
      { s: 1, e: 5, title: 'Sunlight Medicine' },
      { s: 1, e: 6, title: 'Winter Seeds' },
    ]
  },
  {
    title: 'Crimson Tournament',
    description: 'The greatest martial artists from across the universe gather for the Crimson Tournament — a battle royale where the winner gains the power to reshape reality itself.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime10/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime10b/1920/600',
    genres: JSON.stringify(['Action', 'Martial Arts', 'Tournament']),
    year: 2022,
    status: 'Completed',
    rating: 8.8,
    episodes: [
      { s: 1, e: 1, title: 'The Invitation' },
      { s: 1, e: 2, title: 'Round One' },
      { s: 1, e: 3, title: 'Hidden Techniques' },
      { s: 1, e: 4, title: 'Quarter Finals' },
      { s: 1, e: 5, title: 'The Dragon Fist' },
      { s: 1, e: 6, title: 'Semi Finals' },
      { s: 1, e: 7, title: 'Final Round' },
      { s: 1, e: 8, title: 'Crimson Champion' },
    ]
  },
  {
    title: 'Quantum Detectives',
    description: 'A team of physicists discovers that quantum mechanics can reveal hidden truths about crimes. They solve impossible cases by analyzing the quantum fabric of reality.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime11/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime11b/1920/600',
    genres: JSON.stringify(['Mystery', 'Sci-Fi', 'Thriller']),
    year: 2024,
    status: 'Airing',
    rating: 8.6,
    episodes: [
      { s: 1, e: 1, title: 'The Observation Effect' },
      { s: 1, e: 2, title: 'Entangled Suspects' },
      { s: 1, e: 3, title: 'Schrödinger\'s Alibi' },
      { s: 1, e: 4, title: 'Quantum Leap' },
      { s: 1, e: 5, title: 'The Double Slit' },
      { s: 1, e: 6, title: 'Collapsing the Wave' },
    ]
  },
  {
    title: 'Eternal Melody',
    description: 'Two musicians from different eras — one from medieval Japan, one from modern Tokyo — are connected through a magical flute. Their melodies transcend time and space.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime12/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime12b/1920/600',
    genres: JSON.stringify(['Romance', 'Music', 'Historical']),
    year: 2023,
    status: 'Completed',
    rating: 9.0,
    episodes: [
      { s: 1, e: 1, title: 'Two Worlds, One Song' },
      { s: 1, e: 2, title: 'The Ancient Flute' },
      { s: 1, e: 3, title: 'Echoes in Time' },
      { s: 1, e: 4, title: 'Cherry Blossom Duet' },
      { s: 1, e: 5, title: 'The Time Bridge' },
      { s: 1, e: 6, title: 'Farewell Sonata' },
      { s: 1, e: 7, title: 'Reunion' },
      { s: 1, e: 8, title: 'Eternal Melody' },
    ]
  },
  {
    title: 'Gravity Falls: Reborn',
    description: 'When gravity anomalies start appearing worldwide, a team of scientists race to find the source. What they discover is far more terrifying — the Earth is losing its gravitational pull.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime13/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime13b/1920/600',
    genres: JSON.stringify(['Sci-Fi', 'Horror', 'Thriller']),
    year: 2024,
    status: 'Airing',
    rating: 7.9,
    episodes: [
      { s: 1, e: 1, title: 'Zero G' },
      { s: 1, e: 2, title: 'The Anomaly' },
      { s: 1, e: 3, title: 'Floating Cities' },
      { s: 1, e: 4, title: 'The Core' },
      { s: 1, e: 5, title: 'Falling Up' },
    ]
  },
  {
    title: 'Shadow Guild',
    description: 'In a world of guilds and quests, an underground organization handles the jobs no one else will take. Their newest recruit discovers the guild\'s dark secret missions.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime14/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime14b/1920/600',
    genres: JSON.stringify(['Fantasy', 'Action', 'Dark Fantasy']),
    year: 2023,
    status: 'Completed',
    rating: 8.4,
    episodes: [
      { s: 1, e: 1, title: 'The Recruit' },
      { s: 1, e: 2, title: 'First Mission' },
      { s: 1, e: 3, title: 'Shadows and Light' },
      { s: 1, e: 4, title: 'The Hidden Floor' },
      { s: 1, e: 5, title: 'Guild Master\'s Truth' },
      { s: 1, e: 6, title: 'Dark Quest' },
      { s: 1, e: 7, title: 'The Betrayal' },
      { s: 1, e: 8, title: 'Final Mission' },
    ]
  },
  {
    title: 'Ocean\'s Echo',
    description: 'A marine biologist discovers an ancient underwater civilization that communicates through bioluminescent patterns. But as she dives deeper, she realizes the civilization is dying.',
    type: 'ANIME',
    coverUrl: 'https://picsum.photos/seed/anime15/400/600',
    bannerUrl: 'https://picsum.photos/seed/anime15b/1920/600',
    genres: JSON.stringify(['Adventure', 'Drama', 'Mystery']),
    year: 2024,
    status: 'Airing',
    rating: 8.1,
    episodes: [
      { s: 1, e: 1, title: 'The Deep Signal' },
      { s: 1, e: 2, title: 'Bioluminescence' },
      { s: 1, e: 3, title: 'First Contact' },
      { s: 1, e: 4, title: 'The Abyss' },
      { s: 1, e: 5, title: 'Echoes Below' },
      { s: 1, e: 6, title: 'Rising Tide' },
    ]
  },
];

const mangaData = [
  {
    title: 'Ink & Blood',
    description: 'A manga artist discovers that whatever he draws in his cursed sketchbook comes to life. When villains escape his pages, he must draw heroes fast enough to stop them.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/manga1/400/600',
    bannerUrl: 'https://picsum.photos/seed/manga1b/1920/600',
    genres: JSON.stringify(['Supernatural', 'Action', 'Horror']),
    year: 2024,
    status: 'Airing',
    rating: 9.2,
    chapters: [
      { n: 1, title: 'The Cursed Sketchbook', pages: 32 },
      { n: 2, title: 'First Creation', pages: 28 },
      { n: 3, title: 'The Villain Escapes', pages: 30 },
      { n: 4, title: 'Drawing Heroes', pages: 35 },
      { n: 5, title: 'Ink War', pages: 40 },
      { n: 6, title: 'The Eraser', pages: 28 },
      { n: 7, title: 'Final Illustration', pages: 45 },
    ]
  },
  {
    title: 'Starfall Academy',
    description: 'At a prestigious academy in the stars, students from different planets compete in magical duels. Romance blooms between rivals as an ancient cosmic threat approaches.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/manga2/400/600',
    bannerUrl: 'https://picsum.photos/seed/manga2b/1920/600',
    genres: JSON.stringify(['Romance', 'Fantasy', 'School']),
    year: 2024,
    status: 'Airing',
    rating: 8.5,
    chapters: [
      { n: 1, title: 'Orientation Day', pages: 25 },
      { n: 2, title: 'Star Duel', pages: 30 },
      { n: 3, title: 'The Cosmic Library', pages: 28 },
      { n: 4, title: 'Rival Hearts', pages: 32 },
      { n: 5, title: 'Eclipse Festival', pages: 35 },
      { n: 6, title: 'The Prophecy', pages: 30 },
      { n: 7, title: 'Constellation Bond', pages: 28 },
      { n: 8, title: 'Dark Star Rising', pages: 40 },
    ]
  },
  {
    title: 'Demon Chef',
    description: 'A demon from the underworld opens a restaurant in the human world. His hellfire cooking is dangerously delicious. Each dish tells a story, each customer has a wish.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/manga3/400/600',
    bannerUrl: 'https://picsum.photos/seed/manga3b/1920/600',
    genres: JSON.stringify(['Comedy', 'Supernatural', 'Food']),
    year: 2023,
    status: 'Completed',
    rating: 8.8,
    chapters: [
      { n: 1, title: 'Hell\'s Kitchen', pages: 30 },
      { n: 2, title: 'The Soul Soup', pages: 28 },
      { n: 3, title: 'Heavenly Dessert', pages: 25 },
      { n: 4, title: 'Demon\'s Special', pages: 35 },
      { n: 5, title: 'The Last Supper', pages: 42 },
    ]
  },
  {
    title: 'Clockwork Kingdom',
    description: 'In a steampunk world powered by giant clockwork mechanisms, a young inventor discovers the kingdom\'s clocks are counting down to something catastrophic.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/manga4/400/600',
    bannerUrl: 'https://picsum.photos/seed/manga4b/1920/600',
    genres: JSON.stringify(['Steampunk', 'Adventure', 'Mystery']),
    year: 2023,
    status: 'Completed',
    rating: 8.6,
    chapters: [
      { n: 1, title: 'The Grand Clock', pages: 30 },
      { n: 2, title: 'Gears of Truth', pages: 28 },
      { n: 3, title: 'The Inventor', pages: 32 },
      { n: 4, title: 'Countdown', pages: 35 },
      { n: 5, title: 'Clockwork Heart', pages: 30 },
      { n: 6, title: 'The Final Gear', pages: 40 },
    ]
  },
  {
    title: 'Whisper of the Ancients',
    description: 'An archaeologist discovers ancient runes that grant the reader supernatural abilities. But each rune read brings the reader closer to losing their humanity.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/manga5/400/600',
    bannerUrl: 'https://picsum.photos/seed/manga5b/1920/600',
    genres: JSON.stringify(['Dark Fantasy', 'Horror', 'Adventure']),
    year: 2024,
    status: 'Airing',
    rating: 8.9,
    chapters: [
      { n: 1, title: 'The First Rune', pages: 30 },
      { n: 2, title: 'Power Awakens', pages: 32 },
      { n: 3, title: 'The Price', pages: 28 },
      { n: 4, title: 'Ancient Temple', pages: 35 },
      { n: 5, title: 'Fading Humanity', pages: 30 },
      { n: 6, title: 'The Last Reader', pages: 38 },
      { n: 7, title: 'Whispers', pages: 42 },
    ]
  },
  {
    title: 'Pixel Heroes',
    description: 'When the real world and a retro video game merge, pixelated heroes invade modern cities. A gamer must team up with 8-bit characters to restore the boundary.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/manga6/400/600',
    bannerUrl: 'https://picsum.photos/seed/manga6b/1920/600',
    genres: JSON.stringify(['Comedy', 'Action', 'Sci-Fi']),
    year: 2024,
    status: 'Airing',
    rating: 7.8,
    chapters: [
      { n: 1, title: 'Start Screen', pages: 25 },
      { n: 2, title: 'Level 1', pages: 28 },
      { n: 3, title: 'Boss Fight', pages: 30 },
      { n: 4, title: 'Power Up', pages: 32 },
      { n: 5, title: 'Game Over?', pages: 35 },
    ]
  },
  {
    title: 'Sakura Dreams',
    description: 'A touching story of a grandmother sharing her life memories with her granddaughter under a cherry blossom tree. Each chapter is a different era of her extraordinary life.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/manga7/400/600',
    bannerUrl: 'https://picsum.photos/seed/manga7b/1920/600',
    genres: JSON.stringify(['Slice of Life', 'Drama', 'Historical']),
    year: 2022,
    status: 'Completed',
    rating: 9.3,
    chapters: [
      { n: 1, title: 'Spring 1945', pages: 35 },
      { n: 2, title: 'Summer of Love', pages: 30 },
      { n: 3, title: 'Autumn Farewell', pages: 28 },
      { n: 4, title: 'Winter\'s Promise', pages: 32 },
      { n: 5, title: 'New Spring', pages: 40 },
    ]
  },
  {
    title: 'Mecha Genesis',
    description: 'Giant robots powered by human emotions face off against alien invaders. The stronger the pilot\'s feelings, the more powerful the mecha becomes — but at what cost?',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/manga8/400/600',
    bannerUrl: 'https://picsum.photos/seed/manga8b/1920/600',
    genres: JSON.stringify(['Mecha', 'Action', 'Sci-Fi']),
    year: 2023,
    status: 'Completed',
    rating: 8.4,
    chapters: [
      { n: 1, title: 'First Synchro', pages: 30 },
      { n: 2, title: 'Emotion Drive', pages: 35 },
      { n: 3, title: 'The Invasion', pages: 32 },
      { n: 4, title: 'Genesis Protocol', pages: 40 },
      { n: 5, title: 'Heart of Steel', pages: 38 },
      { n: 6, title: 'Final Form', pages: 45 },
    ]
  },
  {
    title: 'Night Wanderer',
    description: 'A girl who can only exist at night investigates supernatural disappearances in her city. As dawn approaches, she races against time to solve each case before she fades.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/manga9/400/600',
    bannerUrl: 'https://picsum.photos/seed/manga9b/1920/600',
    genres: JSON.stringify(['Mystery', 'Supernatural', 'Drama']),
    year: 2024,
    status: 'Airing',
    rating: 8.7,
    chapters: [
      { n: 1, title: 'After Sunset', pages: 28 },
      { n: 2, title: 'The Missing Child', pages: 32 },
      { n: 3, title: 'Midnight Chase', pages: 30 },
      { n: 4, title: 'Dawn\'s Edge', pages: 35 },
      { n: 5, title: 'The Night People', pages: 30 },
      { n: 6, title: 'Moonlight Detective', pages: 32 },
      { n: 7, title: 'The Longest Night', pages: 38 },
    ]
  },
  {
    title: 'Alchemist\'s Path',
    description: 'In a world where alchemy is the highest science, a young apprentice seeks the legendary Philosopher\'s Stone to save her dying master. Each transmutation costs something precious.',
    type: 'MANGA',
    coverUrl: 'https://picsum.photos/seed/manga10/400/600',
    bannerUrl: 'https://picsum.photos/seed/manga10b/1920/600',
    genres: JSON.stringify(['Fantasy', 'Adventure', 'Drama']),
    year: 2023,
    status: 'Completed',
    rating: 9.0,
    chapters: [
      { n: 1, title: 'Equivalent Exchange', pages: 30 },
      { n: 2, title: 'The Master\'s Illness', pages: 28 },
      { n: 3, title: 'Westward Journey', pages: 35 },
      { n: 4, title: 'The Forbidden Circle', pages: 32 },
      { n: 5, title: 'Gold and Grief', pages: 30 },
      { n: 6, title: 'The Stone\'s Price', pages: 38 },
      { n: 7, title: 'The Final Transmutation', pages: 45 },
    ]
  },
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
