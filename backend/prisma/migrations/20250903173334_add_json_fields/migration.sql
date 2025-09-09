-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_page_versions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pageId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "draftJson" TEXT,
    "publishedJson" TEXT,
    "content" TEXT,
    "description" TEXT NOT NULL DEFAULT 'Versión guardada',
    "isOriginal" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "page_versions_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_page_versions" ("content", "createdAt", "description", "id", "isActive", "isOriginal", "pageId", "title") SELECT "content", "createdAt", "description", "id", "isActive", "isOriginal", "pageId", "title" FROM "page_versions";
DROP TABLE "page_versions";
ALTER TABLE "new_page_versions" RENAME TO "page_versions";
CREATE TABLE "new_pages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "draftJson" TEXT,
    "publishedJson" TEXT,
    "content" TEXT,
    "metaDescription" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "layoutType" TEXT NOT NULL DEFAULT 'default',
    "headerConfig" TEXT,
    "sidebarEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sidebarPosition" TEXT NOT NULL DEFAULT 'left',
    "customCSS" TEXT,
    "backgroundColor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_pages" ("backgroundColor", "content", "createdAt", "customCSS", "headerConfig", "id", "layoutType", "metaDescription", "published", "sidebarEnabled", "sidebarPosition", "slug", "title", "updatedAt") SELECT "backgroundColor", "content", "createdAt", "customCSS", "headerConfig", "id", "layoutType", "metaDescription", "published", "sidebarEnabled", "sidebarPosition", "slug", "title", "updatedAt" FROM "pages";
DROP TABLE "pages";
ALTER TABLE "new_pages" RENAME TO "pages";
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
