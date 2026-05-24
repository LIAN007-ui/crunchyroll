-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profilePic" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Content" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "genres" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contentId" INTEGER NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    CONSTRAINT "Episode_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MangaChapter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contentId" INTEGER NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "title" TEXT,
    "pages" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL,
    CONSTRAINT "MangaChapter_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "contentId" INTEGER NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Watchlist_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "contentId" INTEGER NOT NULL,
    "episodeId" INTEGER,
    "chapterId" INTEGER,
    "lastTimestamp" INTEGER,
    "lastPage" INTEGER,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserProgress_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_contentId_key" ON "Watchlist"("userId", "contentId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_contentId_key" ON "UserProgress"("userId", "contentId");
