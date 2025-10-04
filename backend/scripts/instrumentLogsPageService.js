const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'src', 'services', 'pageService.ts');
let src = fs.readFileSync(filePath, 'utf8');

function insertAfter(pattern, insertion) {
  const idx = src.indexOf(pattern);
  if (idx === -1) return false;
  const pos = idx + pattern.length;
  src = src.slice(0, pos) + insertion + src.slice(pos);
  return true;
}

// saveGrapesData start log
insertAfter(
  'static async saveGrapesData(\n    id: string, \n    grapesDataString: string, \n    html?: string, \n    css?: string,\n    gjsComponents?: string,\n    gjsStyles?: string\n  ): Promise<Page> {\n    try {\n',
  "      console.log('[PageService.saveGrapesData] start', { id, payloadLen: (grapesDataString || '').length, htmlLen: (html || '').length, cssLen: (css || '').length });\n"
);

// saveGrapesData backup log
src = src.replace(
  'if (page.gjsHtml || page.gjsCss || page.gjsComponents || page.gjsStyles) {\n        await this.createBackup(page);',
  "if (page.gjsHtml || page.gjsCss || page.gjsComponents || page.gjsStyles) {\n        console.log('[PageService.saveGrapesData] creating backup before save', { pageId: page.id, slug: page.slug });\n        await this.createBackup(page);"
);

// saveGrapesData generatePublicContent warn
src = src.replace(
  '      } catch {\n        generatedContent = null;\n      }',
  "      } catch {\n        console.warn('[PageService.saveGrapesData] generatePublicContent failed, continuing');\n        generatedContent = null;\n      }"
);

// saveGrapesData resolved content lengths
src = src.replace(
  '      const htmlToSave = html ?? grapesData[\'gjs-html\'] ?? grapesData.html ?? generatedContent?.html ?? \'';\n      const cssToSave = css ?? grapesData[\'gjs-css\'] ?? grapesData.css ?? generatedContent?.css ?? \'';',
  "      const htmlToSave = html ?? grapesData['gjs-html'] ?? grapesData.html ?? generatedContent?.html ?? '';\n      const cssToSave = css ?? grapesData['gjs-css'] ?? grapesData.css ?? generatedContent?.css ?? '';\n      console.log('[PageService.saveGrapesData] resolved content lengths', { htmlLen: (htmlToSave || '').length, cssLen: (cssToSave || '').length });"
);

// after update
src = src.replace(
  '      const updatedPage = await prisma.page.update({\n        where: { id },\n        data: updateData\n      });',
  "      const updatedPage = await prisma.page.update({\n        where: { id },\n        data: updateData\n      });\n      console.log('[PageService.saveGrapesData] page updated', { id, slug: updatedPage.slug });"
);

// auto publish logs
src = src.replace(
  '      try {\n        const published = await PageService.publishPage(page.slug);\n        return published;\n      } catch (e) {',
  "      try {\n        console.log('[PageService.saveGrapesData] auto publish start', { slug: page.slug });\n        const published = await PageService.publishPage(page.slug);\n        console.log('[PageService.saveGrapesData] auto publish done', { slug: page.slug, htmlLen: (published.publishedHtml || '').length, cssLen: (published.publishedCss || '').length });\n        return published;\n      } catch (e) {"
);

// saveContent start log
src = src.replace(
  '  static async saveContent(id: string, content: string): Promise<Page> {\n    try {',
  "  static async saveContent(id: string, content: string): Promise<Page> {\n    try {\n      console.log('[PageService.saveContent] start', { id, contentLen: (content || '').length });"
);

// saveContent after update
src = src.replace(
  '      const updatedPage = await prisma.page.update({\n        where: { id },\n        data: {\n          content,\n          updatedAt: new Date()\n        }\n      });',
  "      const updatedPage = await prisma.page.update({\n        where: { id },\n        data: {\n          content,\n          updatedAt: new Date()\n        }\n      });\n      console.log('[PageService.saveContent] page updated', { id });"
);

// publishPage start and resolved lengths
src = src.replace(
  '  static async publishPage(slug: string): Promise<any> {\n    const page = await prisma.page.findUnique({ where: { slug } });',
  "  static async publishPage(slug: string): Promise<any> {\n    console.log('[PageService.publishPage] start', { slug });\n    const page = await prisma.page.findUnique({ where: { slug } });"
);
src = src.replace(
  '    const htmlToPublish = page.gjsHtml || \'';\n    const cssToPublish = page.gjsCss || \'';',
  "    const htmlToPublish = page.gjsHtml || '';\n    const cssToPublish = page.gjsCss || '';\n    console.log('[PageService.publishPage] resolved publish lengths', { htmlLen: (htmlToPublish || '').length, cssLen: (cssToPublish || '').length });"
);
src = src.replace(
  '    const published = await prisma.page.update({',
  "    const published = await prisma.page.update({\n      // log publish operation\n    "
);
src = src.replace(
  '      } as any)\n    });\n\n    return published;\n  }',
  "      } as any)\n    });\n    console.log('[PageService.publishPage] done', { id: page.id, slug });\n\n    return published;\n  }"
);

// togglePublishStatus start/done logs
src = src.replace(
  '  static async togglePublishStatus(id: string): Promise<Page> {\n    try {',
  "  static async togglePublishStatus(id: string): Promise<Page> {\n    try {\n      console.log('[PageService.togglePublishStatus] start', { id });"
);
src = src.replace(
  '      const updatedPage = await prisma.page.update({\n        where: { id },\n        data: {\n          isActive: !page.isActive,\n          updatedAt: new Date()\n        }\n      });',
  "      const updatedPage = await prisma.page.update({\n        where: { id },\n        data: {\n          isActive: !page.isActive,\n          updatedAt: new Date()\n        }\n      });\n      console.log('[PageService.togglePublishStatus] done', { id, isActive: updatedPage.isActive });"
);

// createBackup start/done logs
src = src.replace(
  '  static async createBackup(page: Page): Promise<PageBackup> {\n    try {',
  "  static async createBackup(page: Page): Promise<PageBackup> {\n    try {\n      console.log('[PageService.createBackup] start', { pageId: page.id, slug: page.slug });"
);
src = src.replace(
  '      const backup = await prisma.pageBackup.create({',
  "      const backup = await prisma.pageBackup.create({\n        // creating backup"
);
src = src.replace(
  '      return backup;\n    } catch (error: any) {',
  "      console.log('[PageService.createBackup] done', { backupId: backup.id });\n      return backup;\n    } catch (error: any) {"
);

// restoreFromBackup start/done logs
src = src.replace(
  '  static async restoreFromBackup(pageId: string, backupId: string): Promise<Page> {\n    try {',
  "  static async restoreFromBackup(pageId: string, backupId: string): Promise<Page> {\n    try {\n      console.log('[PageService.restoreFromBackup] start', { pageId, backupId });"
);
src = src.replace(
  '      // Restaurar desde el backup\n      const restoredPage = await prisma.page.update({',
  "      // Restaurar desde el backup\n      const restoredPage = await prisma.page.update({"
);
src = src.replace(
  '      return restoredPage;\n    } catch (error: any) {',
  "      console.log('[PageService.restoreFromBackup] done', { pageId });\n      return restoredPage;\n    } catch (error: any) {"
);

fs.writeFileSync(filePath, src, 'utf8');
console.log('Instrumentation applied to', filePath);
