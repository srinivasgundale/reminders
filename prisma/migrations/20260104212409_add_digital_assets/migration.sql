-- CreateTable
CREATE TABLE "DigitalAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Personal',
    "identifier" TEXT,
    "metadata" TEXT,
    "expiresAt" DATETIME,
    "remindAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "displayOrder" INTEGER NOT NULL DEFAULT 0
);
