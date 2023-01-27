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
    "backgroundColor" TEXT NOT NULL DEFAULT '#000000',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "accentColor" TEXT NOT NULL DEFAULT '#FB118E',
    "headerImageKey" TEXT,
    "footerImageKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Asset" ("createdAt", "createdBy", "description", "footerImageKey", "headerImageKey", "id", "name", "priceInWei", "projectId", "slug", "updatedAt") SELECT "createdAt", "createdBy", "description", "footerImageKey", "headerImageKey", "id", "name", "priceInWei", "projectId", "slug", "updatedAt" FROM "Asset";
DROP TABLE "Asset";
ALTER TABLE "new_Asset" RENAME TO "Asset";
CREATE UNIQUE INDEX "Asset_slug_key" ON "Asset"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
