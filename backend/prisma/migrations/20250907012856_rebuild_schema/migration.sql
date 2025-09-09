/*
  Warnings:

  - You are about to drop the `page_versions` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `pages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `backgroundColor` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `customCSS` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `draftJson` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `headerConfig` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `layoutType` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `metaDescription` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `publishedJson` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `sidebarEnabled` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `sidebarPosition` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "page_versions";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "assets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "user_id" INTEGER,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "draft_json" TEXT,
    "published_json" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    "version" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_pages" ("createdAt", "id", "title", "updatedAt") SELECT "createdAt", "id", "title", "updatedAt" FROM "pages";
DROP TABLE "pages";
ALTER TABLE "new_pages" RENAME TO "pages";
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_users" ("createdAt", "email", "id", "name", "password", "role") SELECT "createdAt", "email", "id", "name", "password", "role" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
