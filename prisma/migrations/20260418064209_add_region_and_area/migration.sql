-- CreateTable
CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "budget" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "spentAmount" REAL NOT NULL DEFAULT 0,
    "theme" TEXT NOT NULL,
    "dayStartTime" TEXT NOT NULL DEFAULT '09:00',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "area" TEXT,
    "itineraryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Day_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "costEstimate" REAL NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'other',
    "customized" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "dayId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Day_itineraryId_idx" ON "Day"("itineraryId");

-- CreateIndex
CREATE INDEX "Activity_dayId_idx" ON "Activity"("dayId");
