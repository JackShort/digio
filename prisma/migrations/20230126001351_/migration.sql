/*
  Warnings:

  - You are about to drop the column `hash` on the `Asset` table. All the data in the column will be lost.
  - Added the required column `slug` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Asset" ("createdAt", "createdBy", "id", "name", "updatedAt") SELECT "createdAt", "createdBy", "id", "name", "updatedAt" FROM "Asset";
DROP TABLE "Asset";
ALTER TABLE "new_Asset" RENAME TO "Asset";
CREATE UNIQUE INDEX "Asset_slug_key" ON "Asset"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
