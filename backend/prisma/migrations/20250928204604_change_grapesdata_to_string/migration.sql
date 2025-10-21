-- AlterTable
ALTER TABLE "pages" ALTER COLUMN "grapesData" SET DATA TYPE TEXT,
ALTER COLUMN "isPublished" SET DEFAULT true;

-- CreateTable
CREATE TABLE "page_backups" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "grapesData" TEXT,
    "html" TEXT,
    "css" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_backups_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "page_backups" ADD CONSTRAINT "page_backups_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
