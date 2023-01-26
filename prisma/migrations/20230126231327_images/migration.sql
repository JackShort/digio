/*
  Warnings:

  - Added the required column `description` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "priceInWei" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "headerImageKey" TEXT,
    "footerImageKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Asset" ("createdAt", "createdBy", "id", "name", "priceInWei", "projectId", "slug", "updatedAt") SELECT "createdAt", "createdBy", "id", "name", "priceInWei", "projectId", "slug", "updatedAt" FROM "Asset";
DROP TABLE "Asset";
ALTER TABLE "new_Asset" RENAME TO "Asset";
CREATE UNIQUE INDEX "Asset_slug_key" ON "Asset"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
