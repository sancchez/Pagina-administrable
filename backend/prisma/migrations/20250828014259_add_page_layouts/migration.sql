-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "invoices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accountNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_accountNumber_key" ON "invoices"("accountNumber");
